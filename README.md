# Neyðarkall frá Andesfjöllum

Þrautasíða fyrir 8.–10. bekk. Nemendur hlusta á Ernesto, raða stöfum í heiti þorpsins og þá opnast verkefnið.

Útgefna síðan er í `docs/` og birt með GitHub Pages. Verkefnatextinn er dulkóðaður (AES-GCM, lykill leiddur af lausninni með PBKDF2/SHA-256) og lausnin sjálf er hvergi í repóinu.

## Tvö skref

1. Nemendur raða stöfunum í heiti þorpsins. Rétt röð opnar 1. skref (texta og kort).
2. Kennarinn samþykkir lendingarsvæðið og gefur nemendum sex stafa kóða. Kóðinn opnar 2. skref.

Hvort skref er dulkóðað með sínu lykilorði og 2. skref er geymt dulkóðað inni í 1. skrefi.

## Breyta texta, korti, lykilorði eða kóða

Þú þarft Node.js (útgáfu 18 eða nýrri).

1. Sæktu repóið og keyrðu `npm install` einu sinni.
2. Búðu til möppuna `efni/` í rót repósins. Hún fer **aldrei** á GitHub (sjá `.gitignore`). Settu í hana:
   - `lykilord.txt`: orðið sem nemendur raða, á einni línu. Stafirnir í þrautinni eru búnir til úr því.
   - `verkefni.md`: texti 1. skrefs í markdown. Mynd er sett inn með `![Lýsing á mynd](kort.jpg)`.
   - `kort.jpg`: myndin sem textinn vísar í (eða aðrar myndir í sömu möppu).
   - `kodi.txt`: kóðinn sem þú gefur nemendum, á einni línu. Ef skráin er ekki til verður ekkert 2. skref.
   - `verkefni2.md`: texti 2. skrefs.
3. Keyrðu `npm run build`. Það skrifar nýja `docs/`-möppu.
4. Birtu: `git add docs && git commit -m "Nýtt verkefni" && git push`. Síðan uppfærist eftir um eina mínútu.

Áður en þú birtir: `git status` á ekki að sýna neitt úr `efni/`.

## Skrár

- `src/`: sniðmát síðunnar, stílsnið, JavaScript, mynd af Ernesto og hljóð
- `build.mjs`: byggingarskriftan (`npm run build`)
- `docs/`: útgefna síðan
