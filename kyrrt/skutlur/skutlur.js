(function () {
  const D = window.SKUTLUR;
  const R = [...D.skyrslur].sort((a, b) => !!a.ofullgerd - !!b.ofullgerd);
  const V = R.filter(r => !r.ofullgerd); // skýrslur með efni; óútfylltar eru ekki taldar með í niðurstöðum
  const view = document.getElementById("view");

  const GERD = { hefdbundin: "Hefðbundin", hringlaga: "Hringlaga" };
  const MAT = { gott: "Vel gert", "bæta": "Má bæta", vantar: "Vantar" };
  const KASTAD = { svalir: "Af svölum", "gólf": "Eftir gangi/sal" };

  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const tala = (n, d = 2) => n == null ? "–" : String(+Number(n).toFixed(d)).replace(".", ",");
  const finna = nr => R.find(r => r.nr === nr);
  const nafn = r => r.merki || `Skýrsla ${r.nr}`;
  const stutt = r => r.stutt || r.nr;

  const gerdMerki = g => g
    ? `<span class="badge b-none"><i class="dot sw-${g === "hefdbundin" ? "hef" : "hri"}" style="width:9px;height:9px;margin-right:5px"></i>${GERD[g]}</span>`
    : `<span class="badge b-none">–</span>`;
  const matMerki = m => `<span class="badge b-${m}">${MAT[m] || m}</span>`;
  const jaNei = v => {
    const k = v === "já" ? "gott" : v === "nei" ? "vantar" : "bæta";
    return `<span class="badge b-${k}">${esc(v)}</span>`;
  };

  // ---------- Yfirlit ----------
  function sulur(maeling, eining, skali) {
    const max = skali || Math.max(...V.filter(r => r.maelingar[maeling]).flatMap(r => [r.maelingar[maeling].hefdbundin, r.maelingar[maeling].hringlaga]).filter(Boolean).map(v => v.tala));
    const rows = V.map(r => {
      const m = r.maelingar[maeling];
      if (!m) {
        const e = (r.eigindlegt || {})[maeling];
        return `<div class="lab"><a href="#skyrsla/${r.nr}">${nafn(r)}</a></div>
          <div class="bargroup"><span class="small muted">${e ? esc(e) : "Ekki mælt"}</span></div>`;
      }
      const mx = skali ? max : Math.max(...[m.hefdbundin, m.hringlaga].filter(Boolean).map(v => v.tala));
      const bar = (g, cls) => {
        const v = m[g];
        if (!v) return `<div class="bar ${cls}"><span class="small muted">${GERD[g]}: ekki mæld</span></div>`;
        const w = Math.max(1, (v.tala / mx) * 70);
        return `<div class="bar ${cls}" title="${GERD[g]}: ${tala(v.tala, 3)} ${esc(m.eining)} – ${esc(v.lysing)}">
          <span class="fill" style="width:${w}%"></span><span>${tala(v.tala, 3)} ${esc(m.eining)}</span></div>`;
      };
      return `<div class="lab"><a href="#skyrsla/${r.nr}">${nafn(r)}</a></div>
        <div class="bargroup">${bar("hefdbundin", "hef")}${bar("hringlaga", "hri")}</div>`;
    }).join("");
    return `<div class="bars">${rows}</div>`;
  }

  function yfirlit() {
    const timi = V.filter(r => r.sigurvegari.timi);
    const veg = V.filter(r => r.sigurvegari.vegalengd);
    const autt = R.filter(r => r.ofullgerd);
    const hriTimi = timi.filter(r => r.sigurvegari.timi === "hringlaga").length;
    const hefVeg = veg.filter(r => r.sigurvegari.vegalengd === "hefdbundin").length;
    const stodst = V.filter(r => r.tilgataStodst.gogn === "já").length;
    const stadir = Object.keys(KASTAD).map(k => {
      const h = V.filter(r => r.kastad === k && r.sigurvegari.timi);
      const hri = h.filter(r => r.sigurvegari.timi === "hringlaga");
      return `<tr><td>${KASTAD[k]}</td><td class="num">${h.length}</td><td class="num"><b>${hri.length}</b> af ${h.length}</td>
        <td>${h.map(r => `<a href="#skyrsla/${r.nr}">${esc(stutt(r))}</a> ${gerdMerki(r.sigurvegari.timi)}`).join(" ")}</td></tr>`;
    }).join("");
    const legend = `<div class="legend"><span><i class="sw-hef"></i>Hefðbundin</span><span><i class="sw-hri"></i>Hringlaga</span></div>`;

    const lidaTafla = D.kaflar.map(k => {
      const c = { gott: 0, "bæta": 0, vantar: 0 };
      R.forEach(r => { const m = (r.kaflar[k.lykill] || {}).mat || "vantar"; c[m]++; });
      return `<tr class="click" data-href="#lidur/${k.lykill}"><td><a href="#lidur/${k.lykill}">${esc(k.heiti)}</a></td>
        <td class="num">${c.gott}</td><td class="num">${c["bæta"]}</td><td class="num">${c.vantar}</td></tr>`;
    }).join("");

    const skyrsluTafla = R.map(r => r.ofullgerd ? `<tr class="click" data-href="#skyrsla/${r.nr}">
        <td><a href="#skyrsla/${r.nr}"><b>${esc(stutt(r))}</b></a></td><td colspan="7" class="muted">${esc(r.lysing)}</td></tr>` : `<tr class="click" data-href="#skyrsla/${r.nr}">
        <td><a href="#skyrsla/${r.nr}"><b>${esc(stutt(r))}</b></a></td>
        <td>${KASTAD[r.kastad] || "–"}</td>
        <td>${r.maelt.map(esc).join(", ")}</td>
        <td>${esc(r.kost)}</td>
        <td>${gerdMerki(r.sigurvegari.timi)}</td>
        <td>${gerdMerki(r.sigurvegari.vegalengd)}</td>
        <td>${jaNei(r.tilgataStodst.segja)}</td>
        <td>${jaNei(r.tilgataStodst.gogn)}</td></tr>`).join("");

    view.innerHTML = `
      <div class="intro"><p class="eyebrow">${esc(D.dagsetning)}</p><h1>${esc(D.verkefni)}</h1>
        <p>Samantekt á ${R.length} skýrslum${autt.length ? ` (${autt.length} óútfylltar, ekki taldar með í niðurstöðum)` : ""}. Smelltu á skýrslu til að sjá hana alla, eða á lið til að bera hann saman milli hópa.</p></div>
      <div class="stats">
        <div class="stat"><div class="v">${V.length}${autt.length ? ` <small>+ ${autt.length} óútfylltar</small>` : ""}</div><div class="l">skýrslur með niðurstöðum</div></div>
        <div class="stat"><div class="v">${hriTimi} <small>af ${timi.length}</small></div><div class="l">hópar: hringlaga lengur á lofti</div></div>
        <div class="stat"><div class="v">${hefVeg} <small>af ${veg.length}</small></div><div class="l">hópar: hefðbundin fór lengra</div></div>
        <div class="stat"><div class="v">${stodst} <small>af ${V.length}</small></div><div class="l">tilgáta studd af eigin gögnum</div></div>
      </div>
      <div class="grid2">
        <section class="panel"><h2>Tími á lofti</h2>${legend}${sulur("timi", "s", null)}
          <p class="chartnote">Sameiginlegur kvarði (sekúndur). Skýrslur ${V.filter(r => r.kastad === "svalir").map(stutt).join(", ")} köstuðu af svölum, sem skýrir lengri tíma; 234 skráði lengsta kastið af tveimur.</p></section>
        <section class="panel"><h2>Vegalengd</h2>${legend}${sulur("vegalengd", "", null)}
          <p class="chartnote">Hóparnir mældu í ólíkum einingum (skref, hænuskref, metrar), svo hver hópur hefur sinn kvarða. Berðu saman innan hóps, ekki milli hópa.</p></section>
      </div>
      <section class="panel"><h2>Skiptir máli hvar var kastað?</h2>
        <p class="small muted">Hvor skutlan var lengur á lofti, eftir því hvort kastað var niður af svölum eða lárétt eftir gangi eða sal.</p>
        <div class="tablewrap"><table><thead><tr><th>Kastað</th><th>Hópar</th><th>Hringlaga lengur á lofti</th><th>Skýrslur</th></tr></thead><tbody>${stadir}</tbody></table></div>
        <p class="chartnote">Niðurstöðurnar eru ekki einhlítar: hringlaga skutlan virðist frekar haldast á lofti þegar hún svífur niður, en hópar á sama stað fengu ólíkar niðurstöður. Hóparnir eru fáir og köstin fá – gott umræðuefni um hvers vegna niðurstöður hópa stangast á.</p></section>
      <section class="panel"><h2>Skýrslurnar</h2><div class="tablewrap"><table>
        <thead><tr><th>Skýrsla</th><th>Kastað</th><th>Mælt</th><th>Köst</th><th>Lengur á lofti</th><th>Fór lengra</th><th>Tilgáta stóðst – að sögn hóps</th><th>– samkvæmt gögnum</th></tr></thead>
        <tbody>${skyrsluTafla}</tbody></table></div></section>
      <section class="panel"><h2>Liðir skýrslunnar</h2><p class="small muted">Fjöldi skýrslna eftir mati á hverjum lið.</p><div class="tablewrap"><table>
        <thead><tr><th>Liður</th><th>${matMerki("gott")}</th><th>${matMerki("bæta")}</th><th>${matMerki("vantar")}</th></tr></thead>
        <tbody>${lidaTafla}</tbody></table></div></section>`;
  }

  // ---------- Stök skýrsla ----------
  function maelingTafla(r) {
    const linur = ["timi", "vegalengd"].map(k => {
      const m = r.maelingar[k];
      const heiti = k === "timi" ? "Tími á lofti" : "Vegalengd";
      if (!m) {
        const e = (r.eigindlegt || {})[k];
        return `<tr><td>${heiti}</td><td colspan="2" class="muted">${e ? esc(e) : "Ekki mælt"}</td></tr>`;
      }
      const cell = v => !v ? `<span class="muted">Ekki mæld</span>` : `<b>${tala(v.tala, 3)} ${esc(m.eining)}</b><div class="raw">${esc(v.lysing)}${v.gildi.length ? `<br>Köst: ${v.gildi.map(x => tala(x)).join(" · ")}` : ""}</div>`;
      return `<tr><td>${heiti}</td><td>${cell(m.hefdbundin)}</td><td>${cell(m.hringlaga)}</td></tr>`;
    }).join("");
    return `<div class="tablewrap"><table><thead><tr><th></th><th>Hefðbundin</th><th>Hringlaga</th></tr></thead><tbody>${linur}</tbody></table></div>`;
  }

  function skyrsla(nr) {
    const r = finna(nr) || R[0];
    const side = R.map(x => `<a href="#skyrsla/${x.nr}" aria-current="${x === r}">${nafn(x)}<small>${esc(x.titill)}${x.fjoldi ? ` · ${x.fjoldi} nemendur` : ""}${x.ofullgerd ? " · óútfyllt" : ""}${x.einnig ? ` · einnig skilað sem ${x.einnig.join(", ")}` : ""}</small></a>`).join("");
    const kaflar = D.kaflar.map(k => {
      const c = r.kaflar[k.lykill] || { mat: "vantar", texti: "" };
      return `<div class="section"><div class="head"><h3><a href="#lidur/${k.lykill}" style="color:inherit">${esc(k.heiti)}</a></h3>${matMerki(c.mat)}</div>
        ${c.texti ? `<blockquote>${esc(c.texti)}</blockquote>` : ""}
        ${c.athugasemd ? `<p class="note"><b>Athugasemd:</b> ${esc(c.athugasemd)}</p>` : ""}</div>`;
    }).join("");

    view.innerHTML = `<div class="layout"><nav class="side" aria-label="Skýrslur">${side}</nav><div>
      <div class="intro"><p class="eyebrow">${nafn(r)}</p><h1>${esc(r.titill)}</h1></div>
      ${r.ofullgerd ? `<section class="panel"><h2>Óútfyllt skýrsla</h2><p>${esc(r.lysing)}</p></section>` : `<section class="panel"><dl class="facts">
        <div><dt>Hópur</dt><dd>${r.fjoldi ? `${r.fjoldi} nemendur` : "Óþekkt"}</dd></div>
        <div><dt>„Að fljúga betur“</dt><dd>${esc(r.betur)}</dd></div>
        <div><dt>Köst</dt><dd>${esc(r.kost)}</dd></div>
        <div><dt>Staður</dt><dd>${esc(r.stadur)}</dd></div>
        ${r.einnig ? `<div><dt>Einnig skilað sem</dt><dd>Skýrsla ${r.einnig.map(esc).join(", ")}</dd></div>` : ""}
        <div><dt>Lengur á lofti</dt><dd>${gerdMerki(r.sigurvegari.timi)}</dd></div>
        <div><dt>Fór lengra</dt><dd>${gerdMerki(r.sigurvegari.vegalengd)}</dd></div>
        <div><dt>Tilgáta stóðst – að sögn hóps</dt><dd>${jaNei(r.tilgataStodst.segja)}</dd></div>
        <div><dt>Tilgáta stóðst – samkvæmt gögnum</dt><dd>${jaNei(r.tilgataStodst.gogn)}</dd></div>
      </dl></section>
      <section class="panel"><h2>Mælingar</h2>${maelingTafla(r)}</section>`}
      ${r.athugasemdir.length ? `<section class="panel"><h2>Helstu athugasemdir</h2><ul class="notes">${r.athugasemdir.map(a => `<li>${esc(a)}</li>`).join("")}</ul></section>` : ""}
      <section class="panel"><h2>Liðir</h2>${kaflar}</section>
    </div></div>`;
  }

  // ---------- Liðir ----------
  function lidir(lykill) {
    const head = R.map(r => `<th><a href="#skyrsla/${r.nr}">${esc(stutt(r))}</a></th>`).join("");
    const rows = D.kaflar.map(k => `<tr><td><a href="#lidur/${k.lykill}">${esc(k.heiti)}</a></td>${R.map(r => {
      const m = (r.kaflar[k.lykill] || {}).mat || "vantar";
      return `<td><span class="dot ${m}" title="${nafn(r)}: ${MAT[m]}" role="img" aria-label="${MAT[m]}"></span></td>`;
    }).join("")}</tr>`).join("");
    const legend = `<div class="legend">${Object.keys(MAT).map(m => `<span><span class="dot ${m}" style="vertical-align:-2px;margin-right:6px"></span>${MAT[m]}</span>`).join("")}</div>`;

    let detail = "";
    const k = D.kaflar.find(x => x.lykill === lykill);
    if (k) {
      const chips = D.kaflar.map(x => `<a href="#lidur/${x.lykill}" aria-current="${x === k}">${esc(x.heiti)}</a>`).join("");
      const cards = R.map(r => {
        const c = r.kaflar[k.lykill] || { mat: "vantar", texti: "" };
        return `<section class="panel"><h3><a href="#skyrsla/${r.nr}">${nafn(r)}</a>${matMerki(c.mat)}</h3>
          ${c.texti ? `<blockquote>${esc(c.texti)}</blockquote>` : `<p class="muted">Ekkert skrifað.</p>`}
          ${c.athugasemd ? `<p class="note"><b>Athugasemd:</b> ${esc(c.athugasemd)}</p>` : ""}</section>`;
      }).join("");
      detail = `<h2 id="lidur">${esc(k.heiti)}</h2><div class="chips">${chips}</div><div class="cards">${cards}</div>`;
    }

    view.innerHTML = `<div class="intro"><p class="eyebrow">Liðir</p><h1>Samanburður eftir liðum</h1>
        <p>Hver liður skýrslunnar metinn í öllum skýrslum. Smelltu á lið til að lesa svör allra hópa hlið við hlið.</p></div>
      <section class="panel">${legend}<div class="tablewrap"><table class="matrix"><thead><tr><th>Liður</th>${head}</tr></thead><tbody>${rows}</tbody></table></div></section>
      ${detail}`;
  }

  // ---------- Leiðsögn ----------
  function route() {
    const [hluti, arg] = (location.hash.slice(1) || "yfirlit").split("/");
    const tab = hluti === "skyrsla" ? "skyrslur" : hluti === "lidur" ? "lidir" : hluti;
    document.querySelectorAll("#tabs a").forEach(a => {
      if (a.dataset.tab === tab) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    if (tab === "skyrslur") skyrsla(arg || R[0].nr);
    else if (tab === "lidir") lidir(arg || D.kaflar[0].lykill);
    else yfirlit();
    window.scrollTo(0, 0);
  }

  view.addEventListener("click", e => {
    const tr = e.target.closest("tr[data-href]");
    if (tr && !e.target.closest("a")) location.hash = tr.dataset.href;
  });
  window.addEventListener("hashchange", route);
  route();
})();
