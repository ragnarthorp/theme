// Gagnvirkir hlutar á undirsíðum (data-widget="…"). sida.js kallar á
// window.initWidgets(container) eftir að efni síðunnar hefur verið afkóðað.
(function () {
  'use strict';

  var SVG = 'http://www.w3.org/2000/svg';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function h(tag, attrs, parent, text) {
    var el = tag.indexOf('svg:') === 0 ? document.createElementNS(SVG, tag.slice(4)) : document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    if (text != null) el.textContent = text;
    if (parent) parent.appendChild(el);
    return el;
  }

  // Geymsla í tækinu. Getur brugðist (einkagluggi o.fl.), og þá virkar síðan samt.
  function load(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ekkert */ }
  }

  // Hreyfing: kallar á step(t) með t frá 0 til 1.
  function animate(ms, step, done) {
    if (reduceMotion) { step(1); if (done) done(); return function () {}; }
    var start = null, stopped = false;
    function frame(now) {
      if (stopped) return;
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / ms);
      step(t);
      if (t < 1) requestAnimationFrame(frame); else if (done) done();
    }
    requestAnimationFrame(frame);
    return function () { stopped = true; };
  }
  var ease = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

  function demoShell(root, label) {
    var svgWrap = h('div', { class: 'demo-stage' }, root);
    var svg = h('svg:svg', { viewBox: '0 0 600 280', role: 'img', 'aria-label': label }, svgWrap);
    var controls = h('div', { class: 'demo-controls' }, root);
    var status = h('p', { class: 'demo-status', role: 'status', 'aria-live': 'polite' }, root);
    return { svg: svg, controls: controls, status: status };
  }
  function btn(parent, text, cls) {
    var b = h('button', { type: 'button', class: 'demo-btn' + (cls ? ' ' + cls : '') }, parent, text);
    return b;
  }
  function say(status, text, kind) { status.textContent = text; status.className = 'demo-status' + (kind ? ' ' + kind : ''); }

  // --- 01 Siglt með farm -------------------------------------------------------
  function boat(root) {
    var d = demoShell(root, 'Skýringarmynd: bátur siglir með farm yfir ána Bugðu og band liggur til baka að bakkanum.');
    var s = d.svg;
    h('svg:rect', { x: 0, y: 0, width: 600, height: 280, class: 'sky' }, s);
    h('svg:path', { d: 'M0 60 H150 C160 140 150 220 140 280 H0 Z', class: 'bank' }, s);
    h('svg:path', { d: 'M600 60 H450 C440 140 450 220 460 280 H600 Z', class: 'bank' }, s);
    h('svg:path', { d: 'M150 60 H450 C440 140 450 220 460 280 H140 C150 220 160 140 150 60 Z', class: 'water' }, s);
    for (var i = 0; i < 6; i++) {
      h('svg:path', { d: 'M' + (190 + (i % 3) * 80) + ' ' + (95 + Math.floor(i / 3) * 95) + ' q12 -8 24 0 t24 0', class: 'wave' }, s);
    }
    h('svg:text', { x: 300, y: 262, class: 'label', 'text-anchor': 'middle' }, s, 'Bugða');
    h('svg:rect', { x: 92, y: 118, width: 8, height: 46, class: 'post' }, s);
    var rope = h('svg:path', { class: 'rope', d: '' }, s);
    var g = h('svg:g', {}, s);
    h('svg:path', { d: 'M-46 0 H46 L34 22 H-34 Z', class: 'hull' }, g);
    h('svg:rect', { x: -18, y: -26, width: 36, height: 26, rx: 4, class: 'cargo' }, g);
    h('svg:text', { x: 0, y: -8, class: 'cargo-text', 'text-anchor': 'middle' }, g, '500 g');
    var x0 = 170, x1 = 420, y = 150, stop = null, pos = x0;
    function place(x) {
      pos = x;
      g.setAttribute('transform', 'translate(' + x + ',' + y + ')');
      var sag = 18 * Math.sin(Math.PI * Math.min(1, (x - x0 + 40) / 300));
      rope.setAttribute('d', 'M100 130 Q' + ((100 + x - 46) / 2) + ' ' + (150 + sag) + ' ' + (x - 46) + ' ' + (y + 6));
    }
    place(x0);
    var go = btn(d.controls, 'Sýna', 'primary');
    var back = btn(d.controls, 'Draga til baka');
    back.disabled = true;
    say(d.status, 'Báturinn bíður við bakkann með 500 g farm og band.');
    go.addEventListener('click', function () {
      if (stop) stop();
      go.disabled = true; back.disabled = true;
      say(d.status, 'Teygjan eða blaðran knýr bátinn yfir ána…');
      var from = pos;
      stop = animate(2600, function (t) { place(from + (x1 - from) * ease(t)); }, function () {
        say(d.status, '✓ Farmurinn er kominn yfir Bugðu. Bandið gerir ykkur kleift að ná tækinu til baka.', 'good');
        back.disabled = false;
      });
    });
    back.addEventListener('click', function () {
      if (stop) stop();
      back.disabled = true;
      var from = pos;
      stop = animate(1800, function (t) { place(from + (x0 - from) * ease(t)); }, function () {
        say(d.status, 'Tækið er komið til baka með bandinu. Tilbúið í næstu tilraun.');
        go.disabled = false;
      });
    });
  }

  // --- 02 Flug og lending ---------------------------------------------------------
  // Fyrirfram ákveðnar „tilraunir“ svo sýnidæmið sýni alltaf það sama.
  var LANDINGS = [[455, 120], [500, 160], [470, 150], [400, 90], [462, 136], [530, 110], [380, 190], [478, 128], [430, 215], [520, 205]];
  var CROSSINGS = [0.9, 1.25, 0.75, 1.2, 0.6, 1.3, 0.95, 0.5, 1.22, 0.85]; // > 1 = alla leið yfir
  function flight(root) {
    var d = demoShell(root, 'Skýringarmynd: pappírsflugvél flýgur og lendir. Tíu tilraunir sýna hvað telst ná markmiðinu.');
    var s = d.svg;
    var mode = 'land';
    var modes = h('div', { class: 'seg', role: 'group', 'aria-label': 'Leið' }, d.controls);
    var mLand = h('button', { type: 'button', 'aria-pressed': 'true' }, modes, 'Lending á sama stað');
    var mSun = h('button', { type: 'button', 'aria-pressed': 'false' }, modes, 'Yfir Sólina');
    var go = btn(d.controls, 'Sýna 10 tilraunir', 'primary');
    var stop = null;

    function scene() {
      s.innerHTML = '';
      h('svg:rect', { x: 0, y: 0, width: 600, height: 280, class: 'ground' }, s);
      h('svg:circle', { cx: 70, cy: 150, r: 16, class: 'start' }, s);
      h('svg:text', { x: 70, y: 190, class: 'label', 'text-anchor': 'middle' }, s, 'Kast');
      if (mode === 'land') {
        h('svg:line', { x1: 70, y1: 248, x2: 370, y2: 248, class: 'scale' }, s);
        h('svg:text', { x: 220, y: 270, class: 'label small', 'text-anchor': 'middle' }, s, '5 m eða lengra');
        h('svg:circle', { cx: 465, cy: 135, r: 46, class: 'target' }, s);
        h('svg:circle', { cx: 465, cy: 135, r: 24, class: 'target inner' }, s);
        h('svg:text', { x: 465, y: 30, class: 'label', 'text-anchor': 'middle' }, s, 'Sami staður');
      } else {
        h('svg:circle', { cx: 330, cy: 150, r: 110, class: 'sun' }, s);
        for (var i = 0; i < 12; i++) {
          var a = i * Math.PI / 6;
          h('svg:line', { x1: 330 + Math.cos(a) * 118, y1: 150 + Math.sin(a) * 118, x2: 330 + Math.cos(a) * 132, y2: 150 + Math.sin(a) * 132, class: 'ray' }, s);
        }
        h('svg:text', { x: 330, y: 156, class: 'label', 'text-anchor': 'middle' }, s, 'Sólin');
        h('svg:line', { x1: 440, y1: 40, x2: 440, y2: 260, class: 'finish' }, s);
        h('svg:text', { x: 452, y: 34, class: 'label small' }, s, 'alla leið yfir');
      }
      say(d.status, mode === 'land'
        ? 'Tækið þarf að lenda innan hringsins í a.m.k. 3 af 10 tilraunum.'
        : 'Tækið þarf að fljúga alla leið yfir Sólina í a.m.k. 3 af 10 tilraunum.');
    }

    function plane() {
      var g = h('svg:g', { class: 'plane' }, s);
      h('svg:path', { d: 'M14 0 L-12 -9 L-6 0 L-12 9 Z' }, g);
      return g;
    }

    function run() {
      if (stop) stop();
      scene();
      go.disabled = true;
      var hits = 0, i = 0;
      var tally = h('svg:text', { x: 590, y: 270, class: 'label tally', 'text-anchor': 'end' }, s, '');
      function next() {
        if (i >= 10) {
          go.disabled = false;
          say(d.status, hits >= 3
            ? '✓ ' + hits + ' af 10 tilraunum tókust. Markmiðinu er náð!'
            : '✗ Aðeins ' + hits + ' af 10. Bætið tækið og reynið aftur.', hits >= 3 ? 'good' : 'bad');
          return;
        }
        var p = plane(), tx, ty, ok;
        if (mode === 'land') {
          tx = LANDINGS[i][0]; ty = LANDINGS[i][1];
          ok = Math.hypot(tx - 465, ty - 135) <= 46;
        } else {
          var f = CROSSINGS[i];
          tx = 220 + 220 * f; ty = 150 + (i % 2 ? -1 : 1) * (10 + i * 3);
          ok = tx >= 440;
          if (tx > 585) tx = 585;
        }
        var sx = 70, sy = 150, peak = Math.min(sy, ty) - 60;
        stop = animate(700, function (t) {
          var x = sx + (tx - sx) * t;
          var yy = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * peak + t * t * ty;
          var dx = tx - sx, dy = 2 * (1 - t) * (peak - sy) + 2 * t * (ty - peak);
          p.setAttribute('transform', 'translate(' + x + ',' + yy + ') rotate(' + (Math.atan2(dy, dx) * 180 / Math.PI) + ')');
        }, function () {
          p.remove();
          h('svg:circle', { cx: tx, cy: ty, r: 7, class: ok ? 'dot ok' : 'dot fail' }, s);
          if (ok) hits++;
          tally.textContent = (i + 1) + ' / 10 · ' + hits + ' tókust';
          i++;
          setTimeout(next, reduceMotion ? 0 : 120);
        });
      }
      next();
    }

    function setMode(m) {
      if (stop) stop();
      mode = m;
      mLand.setAttribute('aria-pressed', m === 'land');
      mSun.setAttribute('aria-pressed', m === 'sun');
      go.disabled = false;
      scene();
    }
    mLand.addEventListener('click', function () { setMode('land'); });
    mSun.addEventListener('click', function () { setMode('sun'); });
    go.addEventListener('click', run);
    scene();
  }

  // --- 03 Ferð niður stiga -----------------------------------------------------------
  function stairs(root) {
    var d = demoShell(root, 'Skýringarmynd: stigi með margföldunartöflu. Tækinu er ýtt fram af efstu tröppu, það fer yfir næstu tröppu og stoppar á þeirri þar fyrir neðan.');
    var s = d.svg;
    var STEP_W = 120, STEP_H = 50, X0 = 30, Y0 = 70;
    var facts = ['3 · 4 = 12', '6 · 7 = 42', '8 · 9 = 72', '7 · 8 = 56', '9 · 9 = 81'];
    // tröppur: n = 0 (byrjun), 1, 2, 3, 4
    function top(n) { return Y0 + n * STEP_H; }
    function left(n) { return X0 + n * STEP_W; }
    function draw() {
      s.innerHTML = '';
      h('svg:rect', { x: 0, y: 0, width: 600, height: 280, class: 'wall' }, s);
      var dPath = 'M0 ' + top(0);
      for (var n = 0; n < 5; n++) dPath += ' H' + (left(n) + STEP_W) + ' V' + top(n + 1);
      dPath += ' V280 H0 Z';
      h('svg:path', { d: dPath, class: 'steps' }, s);
      h('svg:text', { x: left(0) + 30, y: top(0) + 22, class: 'fact', 'text-anchor': 'middle' }, s, facts[0]);
      for (var k = 1; k < 5; k++) {
        h('svg:text', { x: left(k) + 60, y: top(k) + 22, class: 'fact', 'text-anchor': 'middle' }, s, facts[k]);
      }
      h('svg:text', { x: left(0) + 40, y: top(0) - 40, class: 'label small', 'text-anchor': 'middle' }, s, 'Ýtt hér');
      h('svg:text', { x: left(1) + 60, y: top(1) + 44, class: 'label small', 'text-anchor': 'middle' }, s, 'yfir þessa');
      h('svg:text', { x: left(2) + 60, y: top(2) + 44, class: 'label small goal', 'text-anchor': 'middle' }, s, '✓ stoppa hér');
    }
    var device;
    function placeDevice(x, y, rot) {
      device.setAttribute('transform', 'translate(' + x + ',' + y + ') rotate(' + (rot || 0) + ')');
    }
    function newDevice() {
      device = h('svg:g', { class: 'cart' }, s);
      h('svg:rect', { x: -20, y: -22, width: 40, height: 20, rx: 4 }, device);
      h('svg:circle', { cx: -11, cy: -2, r: 5, class: 'wheel' }, device);
      h('svg:circle', { cx: 11, cy: -2, r: 5, class: 'wheel' }, device);
      placeDevice(left(0) + 40, top(0));
    }
    draw(); newDevice();

    var variants = [
      { label: 'Of stutt', land: 1, text: '✗ Tækið lenti á næstu tröppu. Það þarf að fara yfir hana.' },
      { label: 'Rétt', land: 2, text: '✓ Tækið fór yfir næstu tröppu og stoppaði á tröppunni þar fyrir neðan.' },
      { label: 'Of langt', land: 3, text: '✗ Tækið fór of langt og stoppaði ekki á réttri tröppu.' }
    ];
    var stop = null;
    var buttons = variants.map(function (v, i) {
      var b = btn(d.controls, v.label, i === 1 ? 'primary' : '');
      b.addEventListener('click', function () { run(v); });
      return b;
    });
    say(d.status, 'Veljið hvað gerist til að sjá muninn á réttri og rangri ferð.');

    function run(v) {
      if (stop) stop();
      draw(); newDevice();
      buttons.forEach(function (b) { b.disabled = true; });
      var sx = left(0) + 40, sy = top(0);
      var lx = left(v.land) + 40, ly = top(v.land);
      var ex = lx + 36;
      // 1) ýtt fram að brún, 2) bogi niður, 3) rennur og stoppar
      stop = animate(500, function (t) { placeDevice(sx + (left(1) - sx) * t, sy); }, function () {
        var bx = left(1), peak = sy - 10;
        stop = animate(700, function (t) {
          var x = bx + (lx - bx) * t;
          var y = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * peak + t * t * ly;
          placeDevice(x, y, 14 * Math.sin(Math.PI * t));
        }, function () {
          stop = animate(500, function (t) { placeDevice(lx + (ex - lx) * (1 - Math.pow(1 - t, 3)), ly); }, function () {
            say(d.status, v.text, v.land === 2 ? 'good' : 'bad');
            buttons.forEach(function (b) { b.disabled = false; });
          });
        });
      });
    }
  }

  // --- Tímalína -------------------------------------------------------------------------
  function timeline(root) {
    function minutes(t) { var p = t.split(':'); return +p[0] * 60 + +p[1]; }
    function mark() {
      var now = new Date(), m = now.getHours() * 60 + now.getMinutes();
      root.querySelectorAll('li').forEach(function (li) {
        var on = m >= minutes(li.getAttribute('data-from')) && m < minutes(li.getAttribute('data-to'));
        li.classList.toggle('now', on);
        var tag = li.querySelector('.tl-now');
        if (on && !tag) h('span', { class: 'tl-now' }, li, 'Núna');
        if (!on && tag) tag.remove();
      });
    }
    mark();
    setInterval(mark, 60000);
  }

  // --- Tilraunateljari ---------------------------------------------------------------------
  var GOALS = { '01': 'Siglt með farm', '02': 'Flug og lending', '03': 'Ferð niður stiga' };
  function trials(root) {
    var KEY = 'smidja-tilraunir';
    var state = load(KEY, null) || { goal: '01', rounds: [{ tries: [], notes: [] }], current: 0 };
    function round() { return state.rounds[state.current]; }
    function persist() { save(KEY, state); }

    var goals = h('div', { class: 'seg', role: 'group', 'aria-label': 'Markmið' }, root);
    var goalBtns = Object.keys(GOALS).map(function (k) {
      var b = h('button', { type: 'button' }, goals, k + ' ' + GOALS[k]);
      b.addEventListener('click', function () { state.goal = k; persist(); render(); });
      return { k: k, b: b };
    });
    var rounds = h('div', { class: 'rounds', role: 'group', 'aria-label': 'Tilraunaraðir' }, root);
    var grid = h('div', { class: 'tries' }, root);
    var summary = h('div', { class: 'trial-summary', role: 'status', 'aria-live': 'polite' }, root);
    var actions = h('div', { class: 'demo-controls' }, root);
    var add = btn(actions, '+ Ný tilraunaröð');
    var copy = btn(actions, 'Afrita niðurstöður', 'primary');
    var reset = btn(actions, 'Hreinsa allt', 'quiet');
    var copied = h('p', { class: 'demo-status', role: 'status', 'aria-live': 'polite' }, root);

    var cells = [];
    for (var i = 0; i < 10; i++) {
      (function (i) {
        var cell = h('div', { class: 'try' }, grid);
        var b = h('button', { type: 'button', class: 'try-btn' }, cell);
        var note = h('input', { type: 'text', class: 'try-note', inputmode: 'decimal', placeholder: 'mæling', 'aria-label': 'Mæling í tilraun ' + (i + 1) }, cell);
        b.addEventListener('click', function () {
          var r = round(), v = r.tries[i];
          r.tries[i] = v === 'ok' ? 'fail' : v === 'fail' ? null : 'ok';
          persist(); render();
        });
        note.addEventListener('input', function () { round().notes[i] = note.value; persist(); });
        cells.push({ b: b, note: note });
      })(i);
    }

    function counts(r) {
      var ok = 0, done = 0;
      for (var i = 0; i < 10; i++) { if (r.tries[i]) done++; if (r.tries[i] === 'ok') ok++; }
      return { ok: ok, done: done };
    }

    function render() {
      goalBtns.forEach(function (g) { g.b.setAttribute('aria-pressed', g.k === state.goal); });
      rounds.innerHTML = '';
      state.rounds.forEach(function (r, n) {
        var c = counts(r);
        var b = h('button', { type: 'button', 'aria-pressed': n === state.current }, rounds, 'Röð ' + (n + 1) + ' · ' + c.ok + '/10');
        b.addEventListener('click', function () { state.current = n; persist(); render(); });
      });
      var r = round();
      cells.forEach(function (c, i) {
        var v = r.tries[i];
        c.b.className = 'try-btn' + (v ? ' ' + v : '');
        c.b.textContent = v === 'ok' ? '✓' : v === 'fail' ? '✗' : String(i + 1);
        c.b.setAttribute('aria-label', 'Tilraun ' + (i + 1) + ': ' + (v === 'ok' ? 'tókst' : v === 'fail' ? 'mistókst' : 'ekki gerð'));
        if (document.activeElement !== c.note) c.note.value = r.notes[i] || '';
      });
      var k = counts(r);
      summary.innerHTML = '';
      var bar = h('div', { class: 'goal-bar' }, summary);
      for (var j = 0; j < 3; j++) h('span', { class: j < k.ok ? 'on' : '' }, bar);
      h('p', { class: k.ok >= 3 ? 'good' : '' }, summary, k.ok >= 3
        ? '✓ ' + k.ok + ' af ' + k.done + ' tilraunum tókust. Markmiðinu er náð í þessari röð!'
        : k.ok + ' af ' + k.done + ' tilraunum hafa tekist. ' + (3 - k.ok) + ' í viðbót til að ná markmiðinu.');
      add.disabled = state.rounds.length >= 6;
    }

    add.addEventListener('click', function () {
      state.rounds.push({ tries: [], notes: [] });
      state.current = state.rounds.length - 1;
      persist(); render();
    });
    reset.addEventListener('click', function () {
      if (!window.confirm('Eyða öllum tilraunum í þessu tæki?')) return;
      state = { goal: state.goal, rounds: [{ tries: [], notes: [] }], current: 0 };
      persist(); render();
      copied.textContent = '';
    });
    copy.addEventListener('click', function () {
      var lines = ['Tilraunir – ' + state.goal + ' ' + GOALS[state.goal], ''];
      state.rounds.forEach(function (r, n) {
        var c = counts(r);
        lines.push('Tilraunaröð ' + (n + 1) + ': ' + c.ok + ' af ' + c.done + ' tókust' + (c.ok >= 3 ? ' (markmiði náð)' : ''));
        for (var i = 0; i < 10; i++) {
          if (!r.tries[i] && !r.notes[i]) continue;
          lines.push('  ' + (i + 1) + '. ' + (r.tries[i] === 'ok' ? 'Tókst' : r.tries[i] === 'fail' ? 'Mistókst' : '–') + (r.notes[i] ? ' · ' + r.notes[i] : ''));
        }
        lines.push('');
      });
      copyText(lines.join('\n').trim(), copied);
    });
    render();
  }

  function copyText(text, status) {
    function ok() { status.textContent = 'Afritað! Límið inn í skýrsluna.'; status.className = 'demo-status good'; }
    function fallback() {
      var t = h('textarea', { class: 'copy-buffer', readonly: '' }, document.body, text);
      t.select();
      try { document.execCommand('copy'); ok(); } catch (e) { status.textContent = 'Ekki tókst að afrita. Merkið textann og afritið handvirkt.'; }
      t.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback);
    else fallback();
  }

  // --- Stigaspá -------------------------------------------------------------------------------
  function score(root, container) {
    var dataEl = container.querySelector('.rubric-data');
    if (!dataEl) return;
    var rubric = JSON.parse(dataEl.textContent);
    var KEY = 'smidja-stigaspa';
    var values = load(KEY, {});
    rubric.forEach(function (r) { if (r.min == null) r.min = 1; });
    var total = 0, maxTotal = rubric.reduce(function (s, r) { return s + r.max; }, 0);

    var meter = h('div', { class: 'meter', role: 'status', 'aria-live': 'polite' }, root);
    var meterHead = h('div', { class: 'meter-head' }, meter);
    var meterNum = h('span', { class: 'meter-num' }, meterHead);
    var meterGrade = h('span', { class: 'meter-grade' }, meterHead);
    var track = h('div', { class: 'meter-track' }, meter);
    var fill = h('div', { class: 'meter-fill' }, track);
    h('span', { class: 'meter-mark', 'data-l': 'B+', style: 'left:' + (15 / maxTotal * 100) + '%' }, track);
    h('span', { class: 'meter-mark', 'data-l': 'A', style: 'left:' + (20 / maxTotal * 100) + '%' }, track);
    var hint = h('p', { class: 'meter-hint' }, meter);

    var list = h('div', { class: 'rubric' }, root);
    var rows = rubric.map(function (r) {
      var card = h('div', { class: 'crit' }, list);
      var head = h('div', { class: 'crit-head' }, card);
      var id = 'crit-' + r.id;
      h('label', { for: id }, head, r.name);
      var val = h('span', { class: 'crit-val' }, head);
      var input = h('input', { type: 'range', id: id, min: r.min, max: r.max, step: 1 }, card);
      input.value = Math.min(r.max, Math.max(r.min, values[r.id] == null ? r.min : values[r.id]));
      var ticks = h('div', { class: 'crit-ticks', 'aria-hidden': 'true' }, card);
      for (var i = r.min; i <= r.max; i++) h('span', {}, ticks, String(i));
      var desc = h('p', { class: 'crit-desc' }, card);
      var next = h('p', { class: 'crit-next' }, card);
      input.addEventListener('input', update);
      return { r: r, input: input, val: val, desc: desc, next: next };
    });

    h('p', { class: 'draft-note' }, root, 'Þetta er sjálfsmat til að átta sig á matskvarðanum. Kennarinn gefur stigin.');
    var resetBtn = btn(h('div', { class: 'demo-controls' }, root), 'Byrja upp á nýtt', 'quiet');
    resetBtn.addEventListener('click', function () { rows.forEach(function (x) { x.input.value = x.r.min; }); update(); });

    function update() {
      total = 0;
      rows.forEach(function (x) {
        var v = +x.input.value;
        values[x.r.id] = v;
        total += v;
        x.val.textContent = v + ' / ' + x.r.max;
        x.desc.textContent = x.r.levels[v - x.r.min];
        x.next.textContent = v < x.r.max ? 'Til að fá ' + (v + 1) + ': ' + x.r.levels[v + 1 - x.r.min] : 'Fullt hús!';
        x.input.setAttribute('aria-valuetext', v + ' af ' + x.r.max + ': ' + x.r.levels[v - x.r.min]);
      });
      save(KEY, values);
      meterNum.textContent = total + ' / ' + maxTotal + ' stig';
      var grade = total >= 20 ? 'A' : total >= 15 ? 'B+' : '';
      meterGrade.textContent = grade ? 'Einkunn: ' + grade : (15 - total) + ' stig í B+';
      meterGrade.className = 'meter-grade' + (grade ? ' on' : '');
      fill.style.width = (total / maxTotal * 100) + '%';
      var arangur = rows.filter(function (x) { return x.r.id === 'arangur'; })[0];
      var withoutSuccess = maxTotal - (arangur ? arangur.r.max - arangur.r.min : 0);
      hint.textContent = 'Jafnvel þótt farartækið klikki getið þið fengið allt að ' + withoutSuccess + ' stig af ' + maxTotal + '.';
    }
    update();
  }

  // --- Flipar og tenglar innan síðunnar ---------------------------------------------------------
  function tabs(container) {
    container.querySelectorAll('[role="tablist"]').forEach(function (list) {
      var tabs = [].slice.call(list.querySelectorAll('[role="tab"]'));
      function select(tab) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', on);
          t.tabIndex = on ? 0 : -1;
          document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
        });
      }
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { select(t); });
        t.addEventListener('keydown', function (e) {
          var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!d) return;
          var n = tabs[(i + d + tabs.length) % tabs.length];
          select(n); n.focus();
        });
      });
    });
    // #-tenglar mega ekki breyta slóðinni, því lykill síðunnar er á eftir #
    container.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = container.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }

  var WIDGETS = { boat: boat, flight: flight, stairs: stairs, timeline: timeline, trials: trials, score: score };

  window.initWidgets = function (container) {
    tabs(container);
    container.querySelectorAll('[data-widget]').forEach(function (el) {
      var fn = WIDGETS[el.getAttribute('data-widget')];
      if (fn) fn(el, container);
    });
  };
})();
