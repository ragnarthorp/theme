# Neyðarkall frá Andesfjöllum

Þrautasíða fyrir 8.–10. bekk. Nemendur hlusta á Ernesto, raða stöfum í heiti þorpsins og þá opnast verkefnið.

Útgefna síðan er í `docs/` og birt með GitHub Pages. Verkefnatextinn er dulkóðaður (AES-GCM, lykill leiddur af lausninni með PBKDF2/SHA-256) og lausnin sjálf er hvergi í repóinu.

## Skrefin

1. Nemendur raða stöfunum í heiti þorpsins. Rétt röð opnar texta og kort.
2. Nemendur lita lendingarsvæðið á kortið (aðeins innan reitsins). Ef þau lita a.m.k. 90% af rétta svæðinu og í mesta lagi 5% af því sem þau lita lendir utan þess birtist kóði. Mörkin eru stillt í `build.mjs` (`data-coverage` og `data-max-outside`).
3. Kóðinn opnar næsta skref: mynd, hljóð og stafarugl. Þegar öll stafarugl eru leyst birtast hnappar sem vísa á verkefni (slóðir í `hopar.txt`).

Hvert skref er dulkóðað og næsta skref er geymt dulkóðað inni í því fyrra. Myndir og hljóð skrefanna eru dulkóðaðar `.bin`-skrár í `docs/`.

## Breyta texta, myndum, lykilorðum eða tenglum

Þú þarft Node.js (útgáfu 18 eða nýrri).

1. Sæktu repóið og keyrðu `npm install` einu sinni.
2. Settu möppuna `efni/` í rót repósins. Hún fer **aldrei** á GitHub (sjá `.gitignore`). Í henni eru:
   - `lykilord.txt`: orðið sem nemendur raða, á einni línu. Stafirnir í þrautinni eru búnir til úr því.
   - `verkefni.md`: texti fyrsta verkefnisins í markdown.
   - `kort.jpg` og `kort-svaedi.png`: kortið og svæðakortið fyrir litunina. Svæðakortið er í hálfri upplausn kortsins (750×394), grátóna: svart = utan reits (ekki hægt að lita), dökkgrátt (85) = rangt svæði, ljósgrátt (170) = vikmörk við hæðarlínuna (telst hvorki rétt né rangt), hvítt = rétt svæði.
   - `kodi.txt`: kóðinn sem birtist eftir rétta litun og opnar næsta skref.
   - `verkefni2.md` ásamt myndum og hljóði sem hann vísar í: næsta skref.
   - `hopar.txt`: hnapparnir, ein lína á hnapp: `NAFN | undirfyrirsögn | slóð`.
3. Keyrðu `npm run build`. Það skrifar nýja `docs/`-möppu.
4. Birtu: `git add -A docs && git commit -m "Uppfært verkefni" && git push`. Síðan uppfærist eftir um eina mínútu.

Áður en þú birtir: `git status` á ekki að sýna neitt úr `efni/`.

### Sérstakar línur í verkefnatextunum

| Lína | Hvað hún gerir |
| --- | --- |
| `![Lýsing](mynd.jpg)` | mynd úr `efni/` |
| `<!-- hljod: skra.mp3 -->` | hljóðspilari |
| `<!-- litakort: kort.jpg kort-svaedi.png -->` | litunaræfing sem sýnir kóðann úr `kodi.txt` |
| `<!-- stafarugl: Spurning \| SVAR -->` | stafarugl |
| `<!-- val: hopar.txt -->` | hnappar sem opnast þegar öll stafarugl sama texta eru leyst |

## Skrár

- `src/`: sniðmát síðunnar, stílsnið, JavaScript, mynd af Ernesto og hljóð
- `build.mjs`: byggingarskriftan (`npm run build`)
- `docs/`: útgefna síðan
