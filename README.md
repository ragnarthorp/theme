# Neyðarkall frá Andesfjöllum

Þrautasíða fyrir 8.–10. bekk. Nemendur hlusta á Ernesto, raða stöfum í heiti þorpsins og þá opnast verkefnið.

Útgefna síðan er í `docs/` og birt með GitHub Pages. Verkefnatextinn er dulkóðaður (AES-GCM, lykill leiddur af lausninni með PBKDF2/SHA-256) og lausnin sjálf er hvergi í repóinu.

## Breyta verkefnatexta eða lykilorði

Þú þarft Node.js (útgáfu 18 eða nýrri).

1. Sæktu repóið og keyrðu `npm install` einu sinni.
2. Búðu til (eða breyttu) tveimur skrám í rót möppunnar. Þær fara **aldrei** á GitHub (sjá `.gitignore`):
   - `verkefni.md`: verkefnatextinn í markdown.
   - `lykilord.txt`: lausnarorðið, eitt orð á einni línu. Stafirnir í þrautinni eru búnir til úr því.
3. Keyrðu `npm run build`. Það skrifar nýja `docs/`-möppu.
4. Birtu: `git add docs && git commit -m "Nýtt verkefni" && git push`. Síðan uppfærist eftir um eina mínútu.

Áður en þú birtir er gott að athuga að hvorugt hafi slæðst inn: `git status` á hvorki að sýna `verkefni.md` né `lykilord.txt`.

## Skrár

- `src/`: sniðmát síðunnar, stílsnið, JavaScript, mynd og hljóð
- `build.mjs`: byggingarskriftan (`npm run build`)
- `docs/`: útgefna síðan
