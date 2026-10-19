// Byggir útgefnu síðuna í docs/.
//
// Allt leynilegt efni er í möppunni efni/, sem fer aldrei á GitHub (sjá .gitignore):
//   efni/lykilord.txt    orðið sem nemendur raða (opnar 1. skref)
//   efni/verkefni.md     texti 1. skrefs
//   efni/kodi.txt        kóðinn sem opnar 2. skref, má sleppa
//   efni/verkefni2.md    texti 2. skrefs, má sleppa
//   efni/hopar.txt       hnappar sem birtast eftir stafaruglin í 2. skrefi
//   efni/*.jpg|png|mp3   myndir og hljóð sem textarnir vísa í
//   efni/kort-svaedi.png svæðakort fyrir litunaræfinguna (sjá README.md)
//
// Sérstakar línur í verkefnatextunum:
//   ![Lýsing](mynd.jpg)                          mynd
//   <!-- hljod: skra.mp3 -->                     hljóðspilari
//   <!-- litakort: kort.jpg kort-svaedi.png -->  litunaræfing, sýnir kóðann úr kodi.txt
//   <!-- stafarugl: Spurning | SVAR -->          stafarugl
//   <!-- val: hopar.txt -->                      hnappar, opnast þegar öll stafarugl
//                                                textans eru leyst
//
// Hvert skref er dulkóðað (AES-GCM, lykill leiddur með PBKDF2/SHA-256) og næsta
// skref er geymt dulkóðað inni í því fyrra. Myndir og hljóð eru dulkóðuð með
// lykli síns skrefs í sérstakar .bin-skrár. Ekkert af þessu sést í frumkóðanum.
import { readFile, writeFile, mkdir, copyFile, access, readdir, rm } from 'node:fs/promises';
import { webcrypto as crypto, createHash, createHmac, randomBytes } from 'node:crypto';
import { marked } from 'marked';

const ITERATIONS = 250000;
const SRC = 'efni';
const OUT = 'docs';
const MIME = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif',
  mp3: 'audio/mpeg', m4a: 'audio/mp4',
};

async function exists(p) { try { await access(p); return true; } catch { return false; } }
async function readText(p) { return (await exists(p)) ? (await readFile(p, 'utf8')).trim() : ''; }
const normalize = (s) => s.replace(/\s+/g, '').toLocaleLowerCase('is');
const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const b64 = (u8) => Buffer.from(u8).toString('base64');
const enc = new TextEncoder();

function fail(msg) { console.error(msg); process.exit(1); }

function mimeOf(name) {
  const type = MIME[name.split('.').pop().toLowerCase()];
  if (!type) fail(`Óþekkt skráargerð: ${name}`);
  return type;
}

// --- Dulkóðun ---------------------------------------------------------------
// Salt og IV eru leidd með HMAC af leynilykli í efni/.leyndarlykill. Þá verður
// dulkóðunin eins í hverri byggingu ef efnið er óbreytt: skráarheiti haldast
// og vafri sem geymir eldri útgáfu síðunnar í skyndiminni fær ekki villur.
// Mismunandi efni fær alltaf mismunandi IV.

const SECRET_FILE = `${SRC}/.leyndarlykill`;
if (!await exists(SECRET_FILE)) {
  await writeFile(SECRET_FILE, randomBytes(32).toString('hex') + '\n');
  console.log(`Bjó til ${SECRET_FILE}. Geymdu hann með öðru efni í efni/.`);
}
const SECRET = (await readFile(SECRET_FILE, 'utf8')).trim();
function derive(len, ...parts) {
  const h = createHmac('sha256', SECRET);
  for (const p of parts) { h.update(typeof p === 'string' ? enc.encode(p) : p); h.update('\0'); }
  return new Uint8Array(h.digest().subarray(0, len));
}

async function deriveKey(password, salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
}
async function seal(key, bytes, password) {
  const iv = derive(12, 'iv', password, bytes);
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes));
  return { iv, data };
}
// Dulkóðar texta með lykilorði. Skilar því sem vafrinn þarf til að afkóða.
async function encryptText(password, text) {
  const salt = derive(16, 'salt', password);
  const key = await deriveKey(password, salt);
  const { iv, data } = await seal(key, enc.encode(text), password);
  return { key, payload: { iterations: ITERATIONS, salt: b64(salt), iv: b64(iv), data: b64(data) } };
}
// AES-GCM með lykli sem er SHA-256 af tilteknum bætum (notað fyrir litunaræfinguna).
async function encryptWithBytes(bytes, text) {
  const raw = await crypto.subtle.digest('SHA-256', bytes);
  const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt']);
  const { iv, data } = await seal(key, enc.encode(text), b64(new Uint8Array(raw)));
  return { iv: b64(iv), data: b64(data) };
}

// Slóð á undirsíðu (frá annarri undirsíðu): sida:heiti → ../heiti/#k=lykill
const pageKeys = new Map();
function resolveUrl(url) {
  const m = /^sida:([a-z0-9-]+)$/.exec(url);
  if (!m) return url;
  if (!pageKeys.has(m[1])) fail(`Engin undirsíða heitir ${m[1]} (efni/sidur/${m[1]}/ vantar).`);
  return `../${m[1]}/#k=${Buffer.from(pageKeys.get(m[1])).toString('base64url')}`;
}

// --- Eitt skref ---------------------------------------------------------------
// Skref er búið til úr markdown-skrá. Myndir og hljóð eru sett í "assets" og
// dulkóðuð með lykli skrefsins þegar hann er þekktur.

class Stage {
  constructor(base = SRC, out = OUT) { this.assets = []; this.base = base; this.out = out; }

  async file(name) {
    const path = `${this.base}/${decodeURI(name)}`;
    if (!await exists(path)) fail(`Fannst ekki: ${path}`);
    return path;
  }

  asset(name, type) {
    const id = `a${this.assets.length}`;
    this.assets.push({ id, name, type });
    return `data-asset="${id}"`;
  }

  async render(file, code) {
    let html = marked.parse(await readFile(await this.file(file), 'utf8'));

    // Myndir
    html = html.replace(/<img ([^>]*?)src="([^"]+)"([^>]*)>/g, (m, a, src, b) =>
      /^(https?:|data:)/.test(src) ? m : `<img ${a}${this.asset(src, mimeOf(src))}${b}>`);

    // Hljóð
    html = html.replace(/<!--\s*hljod:\s*(\S+)\s*-->/g, (m, name) =>
      `<audio controls preload="metadata" ${this.asset(name, mimeOf(name))}></audio>`);

    // Litunaræfing
    for (const m of [...html.matchAll(/<!--\s*litakort:\s*(\S+)\s+(\S+)\s*-->/g)]) {
      const [, image, zones] = m;
      if (!code) fail('Litunaræfing þarf kóða í efni/kodi.txt.');
      const zoneBytes = await readFile(await this.file(zones));
      const reveal = await encryptWithBytes(zoneBytes,
        `<p class="paint-code">Lendingarsvæðið er gott! Kóðinn ykkar er <strong>${escapeHtml(code.toLocaleUpperCase('is'))}</strong></p>`);
      html = html.replace(m[0], `
<div class="paint" data-coverage="0.9" data-max-outside="0.05" data-zones="data:image/png;base64,${b64(zoneBytes)}"
     data-reveal="${escapeHtml(JSON.stringify(reveal))}">
  <div class="paint-stage">
    <img ${this.asset(image, mimeOf(image))} width="1500" height="788" alt="Hæðarlínukort af svæðinu: loftmynd með hæðarlínum frá 1232 til 1278 metra yfir sjávarmáli, innan reits sem afmarkaður er með gulri línu.">
    <canvas class="paint-shade" aria-hidden="true"></canvas>
    <canvas class="paint-layer" aria-label="Litaðu lendingarsvæðið á kortið"></canvas>
  </div>
  <div class="paint-tools">
    <div class="tool-group" role="group" aria-label="Verkfæri">
      <button type="button" data-tool="brush" aria-pressed="true">Pensill</button>
      <button type="button" data-tool="eraser" aria-pressed="false">Strokleður</button>
    </div>
    <div class="tool-group" role="group" aria-label="Stærð">
      <button type="button" data-size="5" aria-pressed="false">Mjór</button>
      <button type="button" data-size="12" aria-pressed="true">Miðlungs</button>
      <button type="button" data-size="26" aria-pressed="false">Breiður</button>
    </div>
    <div class="tool-group">
      <button type="button" data-action="clear">Hreinsa allt</button>
      <button type="button" data-action="check" class="primary">Athuga svæðið</button>
    </div>
  </div>
  <p class="paint-status" role="status" aria-live="polite"></p>
  <div class="paint-reveal" hidden></div>
</div>`);
    }

    // Stafarugl: hvert svar er athugað með því að reyna að afkóða smá tákn.
    const answers = [];
    for (const m of [...html.matchAll(/<!--\s*stafarugl:\s*([^|]+?)\s*\|\s*(\S+)\s*-->/g)]) {
      const [, question, answer] = m;
      const word = normalize(answer);
      answers.push(word);
      const { payload } = await encryptText(word, 'ok');
      payload.letters = sortedLetters(word);
      html = html.replace(m[0], `
<div class="word-puzzle" data-payload="${escapeHtml(JSON.stringify(payload))}">
  <h3>${escapeHtml(question)}</h3>
  <div class="slots" role="group" aria-label="Hólf fyrir svarið"></div>
  <div class="bank" role="group" aria-label="Stafir til að raða"></div>
  <div class="actions"><button type="button" class="reset">Byrja aftur</button></div>
  <p class="status" role="status" aria-live="polite"></p>
</div>`);
    }

    // Val: hnappar sem opnast þegar öll stafarugl skrefsins eru leyst.
    for (const m of [...html.matchAll(/<!--\s*val:\s*(\S+)\s*-->/g)]) {
      if (!answers.length) fail('<!-- val --> þarf a.m.k. eitt stafarugl í sama texta.');
      const lines = (await readFile(await this.file(m[1]), 'utf8')).split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
      const buttons = lines.map((line, i) => {
        const [name, sub, url] = line.split('|').map((s) => s.trim());
        if (!name || !url) fail(`Ógild lína í ${m[1]}: ${line}`);
        return `<a class="team team-${i % 3}" href="${escapeHtml(url)}" target="_blank" rel="noopener">` +
          `<span class="team-name">${escapeHtml(name)}</span><span class="team-sub">${escapeHtml(sub || '')}</span></a>`;
      }).join('\n');
      const { payload } = await encryptText(answers.join('|'),
        `<h3 class="choice-title">Veljið ykkar teymi</h3>\n<div class="teams">\n${buttons}\n</div>`);
      html = html.replace(m[0], `<div class="choice" hidden tabindex="-1" data-payload="${escapeHtml(JSON.stringify(payload))}"></div>`);
    }

    // Handrit sem hægt er að opna. [leiðbeiningar] eru sýndar daufar.
    for (const m of [...html.matchAll(/<!--\s*handrit:\s*(\S+)\s*-->/g)]) {
      const text = marked.parse(await readFile(await this.file(m[1]), 'utf8'))
        .replace(/\[([^\]<>]+)\](?!\()/g, '<span class="cue">[$1]</span>');
      html = html.replace(m[0], `<details class="script"><summary>Lesa handritið</summary>\n<div class="script-body">${text}</div></details>`);
    }

    // Tenglar á aðrar undirsíður: href="sida:heiti" fær réttan lykil
    html = html.replace(/href="(sida:[a-z0-9-]+)"/g, (m, url) => `href="${escapeHtml(resolveUrl(url))}"`);

    // Áfram-hnappur
    html = html.replace(/<!--\s*afram:\s*(\S+)\s*-->/g, (m, url) =>
      `<p class="forward"><a class="forward-btn" href="${escapeHtml(resolveUrl(url))}">Áfram</a></p>`);

    // Guðanöfn í bakgrunni: aðeins rétta nafnið opnar slóðina (athugað með afkóðun).
    for (const m of [...html.matchAll(/<!--\s*gudir:\s*(\S+)\s*->\s*(\S+)\s*-->/g)]) {
      const [, name, url] = m;
      const { payload } = await encryptText(name, resolveUrl(url));
      const names = [...GODS, name];
      html = html.replace(m[0], `<div class="gods" aria-hidden="true" data-names="${escapeHtml(names.join(' '))}" data-payload="${escapeHtml(JSON.stringify(payload))}"></div>`);
    }

    // Birta meira: allt á eftir <!-- birta: Texti á hnappi --> er falið þar til smellt er.
    const parts = html.split(/<!--\s*birta:\s*(.+?)\s*-->/);
    let rest = parts[parts.length - 1];
    for (let i = parts.length - 2; i >= 1; i -= 2) {
      rest = parts[i - 1] +
        `<p class="more-row"><button type="button" class="more-btn">${escapeHtml(parts[i])}</button></p>\n` +
        `<div class="more" hidden>\n${rest}\n</div>`;
    }
    html = rest;

    this.html = html;
    return this;
  }

  // Dulkóðar með hráum lykli (undirsíður: lykillinn er í slóðinni á eftir #).
  async sealWithKey(raw) {
    const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt']);
    const label = b64(raw);
    let html = this.html;
    for (const a of this.assets) html = html.split(`data-asset="${a.id}"`).join(await this.writeAsset(key, a, label));
    const { iv, data } = await seal(key, enc.encode(html), label);
    return { iv: b64(iv), data: b64(data) };
  }

  async writeAsset(key, a, label) {
    const { iv, data } = await seal(key, await readFile(await this.file(a.name)), label);
    const file = `${createHash('sha256').update(data).digest('hex').slice(0, 12)}.bin`;
    await writeFile(`${this.out}/${file}`, data);
    return `data-enc="${file}" data-iv="${b64(iv)}" data-type="${a.type}"`;
  }

  // Dulkóðar textann og skrifar myndir og hljóð dulkóðuð í docs/.
  async seal(password) {
    const { key, payload } = await encryptText(password, '');
    let html = this.html;
    for (const a of this.assets) html = html.split(`data-asset="${a.id}"`).join(await this.writeAsset(key, a, password));
    const { iv, data } = await seal(key, enc.encode(html), password);
    payload.iv = b64(iv);
    payload.data = b64(data);
    return payload;
  }
}

// Nöfn grískra guða og gyðja (hástafir án áherslumerkja) fyrir bakgrunn.
const GODS = ['ΗΡΑ', 'ΠΟΣΕΙΔΩΝ', 'ΑΘΗΝΑ', 'ΑΠΟΛΛΩΝ', 'ΑΡΤΕΜΙΣ', 'ΑΡΗΣ', 'ΑΦΡΟΔΙΤΗ', 'ΗΦΑΙΣΤΟΣ',
  'ΕΡΜΗΣ', 'ΔΗΜΗΤΗΡ', 'ΔΙΟΝΥΣΟΣ', 'ΕΣΤΙΑ', 'ΑΔΗΣ', 'ΠΕΡΣΕΦΟΝΗ', 'ΕΡΩΣ', 'ΓΑΙΑ', 'ΚΡΟΝΟΣ', 'ΡΕΑ',
  'ΝΙΚΗ', 'ΗΩΣ', 'ΗΛΙΟΣ', 'ΣΕΛΗΝΗ', 'ΠΑΝ', 'ΗΒΗ', 'ΙΡΙΣ', 'ΟΥΡΑΝΟΣ', 'ΠΡΟΜΗΘΕΥΣ', 'ΑΤΛΑΣ',
  'ΘΕΜΙΣ', 'ΜΝΗΜΟΣΥΝΗ', 'ΝΕΜΕΣΙΣ', 'ΤΥΧΗ', 'ΜΟΡΦΕΥΣ', 'ΥΠΝΟΣ'];

function sortedLetters(word) {
  return [...word.toLocaleUpperCase('is')].sort((a, b) => a.localeCompare(b, 'is'));
}

// --- Bygging --------------------------------------------------------------------

const password = normalize(process.env.LYKILORD || await readText(`${SRC}/lykilord.txt`));
if (!password) fail(`Vantar lykilorð: settu það í ${SRC}/lykilord.txt.`);
if (!await exists(`${SRC}/verkefni.md`)) fail(`Vantar ${SRC}/verkefni.md.`);
const code = normalize(await readText(`${SRC}/kodi.txt`));

await mkdir(OUT, { recursive: true });
for (const f of await readdir(OUT)) if (f.endsWith('.bin')) await rm(`${OUT}/${f}`);

const stage1 = await new Stage().render('verkefni.md', code);
const word = password[0].toLocaleUpperCase('is') + password.slice(1);
stage1.html = `<p class="success">Rétt! ${escapeHtml(word)} bíður eftir ykkur.</p>\n` + stage1.html;

if (code) {
  if (!await exists(`${SRC}/verkefni2.md`)) fail(`Vantar ${SRC}/verkefni2.md (kodi.txt er til).`);
  const stage2 = await (await new Stage().render('verkefni2.md')).seal(code);
  const len = [...code].length;
  stage1.html += `
<form class="code-form" novalidate data-length="${len}">
  <label for="code">Kóði</label>
  <div class="code-row">
    <input id="code" name="code" type="text" maxlength="${len}" autocomplete="off"
           autocapitalize="characters" autocorrect="off" spellcheck="false" enterkeyhint="go">
    <button type="submit">Opna</button>
  </div>
  <p class="code-status" role="status" aria-live="polite"></p>
</form>
<div class="next-stage" hidden tabindex="-1"></div>
<script type="application/json" class="next-payload">${JSON.stringify(stage2)}</script>
`;
}

const payload = await stage1.seal(password);
// Stafirnir fara í stafrófsröð inn í síðuna, ekki í réttri röð.
payload.letters = sortedLetters(password);

// Útgáfunúmer á app.js og style.css svo vafri noti ekki gamla útgáfu með nýrri síðu.
const version = async (f) => createHash('sha256').update(await readFile(`src/${f}`)).digest('hex').slice(0, 10);
const template = await readFile('src/index.html', 'utf8');
await writeFile(`${OUT}/index.html`, template
  .replace('"__PAYLOAD__"', JSON.stringify(payload))
  .replace('href="style.css"', `href="style.css?v=${await version('style.css')}"`)
  .replace('src="app.js"', `src="app.js?v=${await version('app.js')}"`));
for (const f of ['style.css', 'app.js', 'sida.js', 'ernesto.jpg', 'ernesto.webp', 'saga.mp3']) {
  await copyFile(`src/${f}`, `${OUT}/${f}`);
}

// --- Undirsíður -------------------------------------------------------------------
// Hver mappa í efni/sidur/ verður að síðu í docs/<mappa>/. Efnið er dulkóðað með
// slembilykli úr lykill.txt (búinn til sjálfkrafa), og lykillinn er aðeins í
// hlekknum sjálfum á eftir #: hann fer hvorki á netþjóninn né á GitHub.
const links = [];
const pagesDir = `${SRC}/sidur`;
const pageTemplate = await readFile('src/sida.html', 'utf8');
const slugs = (await exists(pagesDir)) ? (await readdir(pagesDir, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name) : [];
for (const slug of await readdir(OUT, { withFileTypes: true })) {
  if (slug.isDirectory() && !slugs.includes(slug.name)) await rm(`${OUT}/${slug.name}`, { recursive: true });
}
// Lyklar allra undirsíðna fyrst, svo síður geti vísað hver á aðra með sida:<heiti>.
for (const slug of slugs) {
  if (!/^[a-z0-9-]+$/.test(slug)) fail(`Heiti undirsíðu má aðeins innihalda a–z, 0–9 og -: ${slug}`);
  const file = `${pagesDir}/${slug}/lykill.txt`;
  if (!await exists(file)) await writeFile(file, Buffer.from(randomBytes(16)).toString('base64url') + '\n');
  const raw = new Uint8Array(Buffer.from((await readFile(file, 'utf8')).trim(), 'base64url'));
  if (raw.length !== 16 && raw.length !== 32) fail(`Ógildur lykill í ${file}`);
  pageKeys.set(slug, raw);
}
for (const slug of slugs) {
  const dir = `${pagesDir}/${slug}`, out = `${OUT}/${slug}`;
  const raw = pageKeys.get(slug);
  await mkdir(out, { recursive: true });
  for (const f of await readdir(out)) if (f.endsWith('.bin')) await rm(`${out}/${f}`);
  const page = await (await new Stage(dir, out).render('sida.md')).sealWithKey(raw);
  await writeFile(`${out}/index.html`, pageTemplate
    .replace('"__PAYLOAD__"', JSON.stringify(page))
    .replace('href="../style.css"', `href="../style.css?v=${await version('style.css')}"`)
    .replace('src="../sida.js"', `src="../sida.js?v=${await version('sida.js')}"`));
  links.push(`docs/${slug}/  →  https://ragnarthorp.github.io/theme/${slug}/#k=${Buffer.from(raw).toString('base64url')}`);
}
if (links.length) {
  await writeFile(`${SRC}/hlekkir.txt`, links.join('\n') + '\n');
  console.log(`Undirsíður (hlekkirnir eru líka í ${SRC}/hlekkir.txt):\n  ` + links.join('\n  '));
}
await writeFile(`${OUT}/.nojekyll`, '');
console.log(`Síðan byggð í ${OUT}/: ${payload.letters.length} stafir í þrautinni` +
  (code ? `, ${[...code].length} stafa kóði fyrir 2. skref.` : ', ekkert 2. skref.'));
