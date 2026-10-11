// Byggir útgefnu síðuna í docs/.
// Lykilorðið kemur úr umhverfisbreytunni LYKILORD eða skránni lykilord.txt.
// Verkefnatextinn kemur úr verkefni.md. Hvorugt fer á GitHub (sjá .gitignore).
import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { webcrypto as crypto } from 'node:crypto';
import { marked } from 'marked';

const ITERATIONS = 250000;
const OUT = 'docs';

async function exists(p) { try { await access(p); return true; } catch { return false; } }

let password = process.env.LYKILORD;
if (!password && await exists('lykilord.txt')) password = await readFile('lykilord.txt', 'utf8');
password = (password || '').trim().toLocaleLowerCase('is');
if (!password) {
  console.error('Vantar lykilorð: settu það í lykilord.txt eða umhverfisbreytuna LYKILORD.');
  process.exit(1);
}
if (!await exists('verkefni.md')) {
  console.error('Vantar verkefni.md.');
  process.exit(1);
}

const word = password[0].toLocaleUpperCase('is') + password.slice(1);
const markdown = await readFile('verkefni.md', 'utf8');
const html = `<p class="success">Rétt! ${word} bíður eftir ykkur.</p>\n` + marked.parse(markdown);

const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
  baseKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(html)));

const b64 = (u8) => Buffer.from(u8).toString('base64');
// Stafirnir fara í stafrófsröð inn í síðuna, ekki í réttri röð.
const letters = [...password.toLocaleUpperCase('is')].sort((a, b) => a.localeCompare(b, 'is'));
const payload = { iterations: ITERATIONS, salt: b64(salt), iv: b64(iv), data: b64(ct), letters };

await mkdir(OUT, { recursive: true });
const template = await readFile('src/index.html', 'utf8');
await writeFile(`${OUT}/index.html`, template.replace('"__PAYLOAD__"', JSON.stringify(payload)));
for (const f of ['style.css', 'app.js', 'ernesto.jpg', 'ernesto.webp', 'saga.mp3']) {
  await copyFile(`src/${f}`, `${OUT}/${f}`);
}
await writeFile(`${OUT}/.nojekyll`, '');
console.log(`Síðan byggð í ${OUT}/ (${letters.length} stafir, ${ITERATIONS} PBKDF2-ítranir).`);
