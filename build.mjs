// Byggir útgefnu síðuna í docs/.
//
// Allt leynilegt efni er í möppunni efni/, sem fer aldrei á GitHub (sjá .gitignore):
//   efni/lykilord.txt   orðið sem nemendur raða (opnar 1. skref)
//   efni/verkefni.md    texti 1. skrefs
//   efni/kodi.txt       kóðinn sem opnar 2. skref, má sleppa
//   efni/verkefni2.md   texti 2. skrefs, má sleppa
//   efni/*.jpg|png|webp myndir sem verkefnatextarnir vísa í, t.d. ![Kort](kort.jpg)
//   efni/kort-svaedi.png svæðakort fyrir litunaræfinguna (sjá README.md)
//
// Litunaræfing er sett inn í verkefni.md með línunni
//   <!-- litakort: kort.jpg kort-svaedi.png -->
// Þegar nemandi hefur litað rétt svæði birtist kóðinn úr kodi.txt.
//
// Hvert skref er dulkóðað (AES-GCM, lykill leiddur með PBKDF2/SHA-256) og
// 2. skref er geymt dulkóðað inni í 1. skrefi. Myndir eru felldar inn í
// dulkóðaða textann, svo ekkert af þessu sést í frumkóða síðunnar.
import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { webcrypto as crypto } from 'node:crypto';
import { marked } from 'marked';

const ITERATIONS = 250000;
const SRC = 'efni';
const OUT = 'docs';
const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };

async function exists(p) { try { await access(p); return true; } catch { return false; } }
async function readText(p) { return (await exists(p)) ? (await readFile(p, 'utf8')).trim() : ''; }
const normalize = (s) => s.replace(/\s+/g, '').toLocaleLowerCase('is');
const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const b64 = (u8) => Buffer.from(u8).toString('base64');

function fail(msg) { console.error(msg); process.exit(1); }

// Breytir markdown í HTML og fellir inn myndir úr efni/ sem data-slóðir.
async function renderMarkdown(file) {
  let html = marked.parse(await readFile(file, 'utf8'));
  const srcs = [...html.matchAll(/<img [^>]*src="([^"]+)"/g)].map((m) => m[1]);
  for (const src of new Set(srcs)) {
    const path = `${SRC}/${decodeURI(src)}`;
    const ext = src.split('.').pop().toLowerCase();
    if (/^(https?:|data:)/.test(src)) continue;
    if (!MIME[ext] || !await exists(path)) fail(`Mynd fannst ekki: ${path}`);
    const data = `data:${MIME[ext]};base64,${b64(await readFile(path))}`;
    html = html.split(`src="${src}"`).join(`src="${data}"`);
  }
  return html;
}

// AES-GCM með lykli sem er SHA-256 af tilteknum bætum (notað fyrir litunaræfinguna).
async function encryptWithBytes(bytes, text) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const raw = await crypto.subtle.digest('SHA-256', bytes);
  const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt']);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text)));
  return { iv: b64(iv), data: b64(ct) };
}

// Breytir <!-- litakort: mynd svæðakort --> í litunaræfingu.
async function renderPaint(html, code) {
  const re = /<!--\s*litakort:\s*(\S+)\s+(\S+)\s*-->/g;
  for (const m of [...html.matchAll(re)]) {
    const [, image, zones] = m;
    for (const f of [image, zones]) if (!await exists(`${SRC}/${f}`)) fail(`Fannst ekki: ${SRC}/${f}`);
    if (!code) fail('Litunaræfing þarf kóða í efni/kodi.txt.');
    const ext = image.split('.').pop().toLowerCase();
    const imgData = `data:${MIME[ext]};base64,${b64(await readFile(`${SRC}/${image}`))}`;
    const zoneBytes = await readFile(`${SRC}/${zones}`);
    const reveal = await encryptWithBytes(zoneBytes,
      `<p class="paint-code">Lendingarsvæðið er gott! Kóðinn ykkar er <strong>${escapeHtml(code.toLocaleUpperCase('is'))}</strong></p>`);
    const widget = `
<div class="paint" data-coverage="0.9" data-max-outside="0.05" data-zones="data:image/png;base64,${b64(zoneBytes)}"
     data-reveal="${escapeHtml(JSON.stringify(reveal))}">
  <div class="paint-stage">
    <img src="${imgData}" alt="Hæðarlínukort af svæðinu: loftmynd með hæðarlínum frá 1232 til 1278 metra yfir sjávarmáli, innan reits sem afmarkaður er með gulri línu.">
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
</div>
`;
    html = html.replace(m[0], widget);
  }
  return html;
}

async function encrypt(password, html) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    baseKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(html)));
  return { iterations: ITERATIONS, salt: b64(salt), iv: b64(iv), data: b64(ct) };
}

// 1. skref: lykilorð og verkefni
const password = normalize(process.env.LYKILORD || await readText(`${SRC}/lykilord.txt`));
if (!password) fail(`Vantar lykilorð: settu það í ${SRC}/lykilord.txt.`);
if (!await exists(`${SRC}/verkefni.md`)) fail(`Vantar ${SRC}/verkefni.md.`);

const word = password[0].toLocaleUpperCase('is') + password.slice(1);
const code = normalize(await readText(`${SRC}/kodi.txt`));
let stage1 = `<p class="success">Rétt! ${escapeHtml(word)} bíður eftir ykkur.</p>\n` +
  await renderPaint(await renderMarkdown(`${SRC}/verkefni.md`), code);

// 2. skref: kóðinn opnar næsta verkefni (valkvætt)
if (code) {
  if (!await exists(`${SRC}/verkefni2.md`)) fail(`Vantar ${SRC}/verkefni2.md (kodi.txt er til).`);
  const stage2 = await encrypt(code, await renderMarkdown(`${SRC}/verkefni2.md`));
  stage1 += `
<form class="code-form" novalidate data-length="${[...code].length}">
  <label for="code">Kóði</label>
  <div class="code-row">
    <input id="code" name="code" type="text" maxlength="${[...code].length}" autocomplete="off"
           autocapitalize="characters" autocorrect="off" spellcheck="false" enterkeyhint="go">
    <button type="submit">Opna</button>
  </div>
  <p class="code-status" role="status" aria-live="polite"></p>
</form>
<div class="next-stage" hidden tabindex="-1"></div>
<script type="application/json" class="next-payload">${JSON.stringify(stage2)}</script>
`;
}

const payload = await encrypt(password, stage1);
// Stafirnir fara í stafrófsröð inn í síðuna, ekki í réttri röð.
payload.letters = [...password.toLocaleUpperCase('is')].sort((a, b) => a.localeCompare(b, 'is'));

await mkdir(OUT, { recursive: true });
const template = await readFile('src/index.html', 'utf8');
await writeFile(`${OUT}/index.html`, template.replace('"__PAYLOAD__"', JSON.stringify(payload)));
for (const f of ['style.css', 'app.js', 'ernesto.jpg', 'ernesto.webp', 'saga.mp3']) {
  await copyFile(`src/${f}`, `${OUT}/${f}`);
}
await writeFile(`${OUT}/.nojekyll`, '');
console.log(`Síðan byggð í ${OUT}/: ${payload.letters.length} stafir í þrautinni` +
  (code ? `, ${[...code].length} stafa kóði fyrir 2. skref.` : ', ekkert 2. skref.'));
