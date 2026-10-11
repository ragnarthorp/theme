# Neyðarkall frá Andesfjöllum

Þrautasíða fyrir 8.–10. bekk. Nemendur hlusta á Ernesto, raða stöfum í heiti þorpsins og þá opnast verkefnið.

Útgefna síðan er í `docs/` og birt með GitHub Pages. Verkefnatextinn er dulkóðaður (AES-GCM, lykill leiddur af lausninni með PBKDF2/SHA-256) og lausnin sjálf er hvergi í repóinu.

## Skrefin

1. Nemendur raða stöfunum í heiti þorpsins. Rétt röð opnar texta og kort.
2. Nemendur lita lendingarsvæðið á kortið (aðeins innan reitsins). Ef þau lita a.m.k. 90% af rétta svæðinu og ekkert utan þess birtist kóði.
3. Kóðinn opnar næsta verkefni.

Hvert skref er dulkóðað og næsta skref er geymt dulkóðað inni í því fyrra.

## Breyta texta, korti, lykilorði eða kóða

Þú þarft Node.js (útgáfu 18 eða nýrri).

1. Sæktu repóið og keyrðu `npm install` einu sinni.
2. Settu möppuna `efni/` í rót repósins. Hún fer **aldrei** á GitHub (sjá `.gitignore`). Í henni eru:
   - `lykilord.txt`: orðið sem nemendur raða, á einni línu. Stafirnir í þrautinni eru búnir til úr því.
   - `verkefni.md`: texti fyrsta verkefnisins í markdown. Línan `<!-- litakort: kort.jpg kort-svaedi.png -->` setur litunaræfinguna inn. Venjuleg mynd er sett inn með `![Lýsing](mynd.jpg)`.
   - `kort.jpg`: kortið sem nemendur lita á.
   - `kort-svaedi.png`: svæðakort í hálfri upplausn kortsins (750×394), grátóna: svart = utan reits (ekki hægt að lita), dökkgrátt (85) = rangt svæði, ljósgrátt (170) = vikmörk við hæðarlínuna (telst hvorki rétt né rangt), hvítt = rétt svæði.
   - `kodi.txt`: kóðinn sem birtist eftir rétta litun og opnar næsta verkefni.
   - `verkefni2.md`: texti næsta verkefnis.
3. Keyrðu `npm run build`. Það skrifar nýja `docs/`-möppu.
4. Birtu: `git add docs && git commit -m "Nýtt verkefni" && git push`. Síðan uppfærist eftir um eina mínútu.

Áður en þú birtir: `git status` á ekki að sýna neitt úr `efni/`.

## Skrár

- `src/`: sniðmát síðunnar, stílsnið, JavaScript, mynd af Ernesto og hljóð
- `build.mjs`: byggingarskriftan (`npm run build`)
- `docs/`: útgefna síðan
