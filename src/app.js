(function () {
  'use strict';

  var P = window.PUZZLE;
  var taskEl = document.getElementById('task');

  // --- Dulkóðun ---------------------------------------------------------------

  function b64(s) {
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function subtle() {
    var s = window.crypto && window.crypto.subtle;
    if (!s) throw new Error('no-crypto');
    return s;
  }

  // Leiðir lykil af orðinu og reynir að afkóða.
  // Skilar { html, key } ef orðið er rétt, annars null.
  function tryDecrypt(word, payload) {
    var s;
    try { s = subtle(); } catch (e) { return Promise.reject(e); }
    var enc = new TextEncoder();
    var key;
    return s.importKey('raw', enc.encode(word.replace(/\s+/g, '').toLocaleLowerCase('is')), 'PBKDF2', false, ['deriveKey'])
      .then(function (base) {
        return s.deriveKey(
          { name: 'PBKDF2', salt: b64(payload.salt), iterations: payload.iterations, hash: 'SHA-256' },
          base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      })
      .then(function (k) {
        key = k;
        return s.decrypt({ name: 'AES-GCM', iv: b64(payload.iv) }, key, b64(payload.data));
      })
      .then(function (buf) { return { html: new TextDecoder().decode(buf), key: key }; },
            function () { return null; });
  }

  // Sækir og afkóðar myndir og hljóð skrefsins (data-enc) með lykli þess.
  function loadAssets(container, key) {
    container.querySelectorAll('[data-enc]').forEach(function (el) {
      fetch(el.getAttribute('data-enc'))
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
        .then(function (buf) { return subtle().decrypt({ name: 'AES-GCM', iv: b64(el.getAttribute('data-iv')) }, key, buf); })
        .then(function (plain) {
          el.src = URL.createObjectURL(new Blob([plain], { type: el.getAttribute('data-type') }));
          el.removeAttribute('data-enc');
        })
        .catch(function () { el.insertAdjacentHTML('afterend', '<p class="status bad">Ekki tókst að hlaða skrá. Endurhlaðaðu síðuna.</p>'); });
    });
  }

  function reveal(el) {
    el.hidden = false;
    el.classList.add('reveal');
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.focus({ preventScroll: true });
  }

  // Setur upp allt sem er í nýopnuðu skrefi.
  function initStage(container, key) {
    loadAssets(container, key);
    setupPaint(container);
    setupCodeForm(container);
    setupWordPuzzles(container);
  }

  // --- Stafaþraut ---------------------------------------------------------------
  // root inniheldur .slots, .bank, .reset og .status.
  // check(word) skilar Promise sem leysist með niðurstöðu (eða null ef rangt).

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function createPuzzle(root, letters, check, onSolved) {
    var slotsEl = root.querySelector('.slots');
    var bankEl = root.querySelector('.bank');
    var statusEl = root.querySelector('.status');
    var resetBtn = root.querySelector('.reset');
    var tiles = [], slots = [];
    var busy = false, solved = false, round = 0;

    function setStatus(text, kind) {
      statusEl.textContent = text;
      statusEl.className = 'status' + (kind ? ' ' + kind : '');
    }

    function render() {
      slots.forEach(function (s, i) {
        var letter = s.tile ? s.tile.letter : '';
        s.el.textContent = letter;
        s.el.classList.toggle('filled', !!s.tile);
        s.el.disabled = !s.tile || solved;
        s.el.setAttribute('aria-label', 'Hólf ' + (i + 1) + (letter ? ': ' + letter : ', tómt'));
      });
      tiles.forEach(function (t) {
        var used = t.slot !== null;
        t.el.classList.toggle('used', used);
        t.el.disabled = used || solved;
        t.el.setAttribute('aria-hidden', used ? 'true' : 'false');
      });
    }

    function button(cls, text, onClick, parent) {
      var el = document.createElement('button');
      el.type = 'button';
      el.className = cls;
      el.textContent = text;
      el.addEventListener('click', onClick);
      parent.appendChild(el);
      return el;
    }

    function build(order) {
      slotsEl.innerHTML = '';
      bankEl.innerHTML = '';
      slots = [];
      tiles = [];
      letters.forEach(function () {
        var slot = { tile: null };
        slot.el = button('slot', '', function () { removeFrom(slot); }, slotsEl);
        slots.push(slot);
      });
      order.forEach(function (letter) {
        var tile = { letter: letter, slot: null };
        tile.el = button('tile', letter, function () { place(tile); }, bankEl);
        tiles.push(tile);
      });
      render();
    }

    function place(tile) {
      if (busy || solved || tile.slot !== null) return;
      var slot = slots.find(function (s) { return !s.tile; });
      if (!slot) return;
      slot.tile = tile;
      tile.slot = slot;
      setStatus('');
      render();
      if (slots.every(function (s) { return s.tile; })) submit();
    }

    function removeFrom(slot) {
      if (busy || solved || !slot.tile) return;
      slot.tile.slot = null;
      slot.tile = null;
      setStatus('');
      render();
    }

    function submit() {
      busy = true;
      setStatus('Athuga…');
      var word = slots.map(function (s) { return s.tile.letter; }).join('');
      check(word).then(function (result) {
        busy = false;
        if (result) {
          solved = true;
          slotsEl.classList.add('solved');
          render();
          setStatus(onSolved(result, word) || 'Rétt!', 'good');
        } else {
          setStatus('Ekki alveg. Hlustaðu aftur og reyndu á ný.', 'bad');
          slotsEl.classList.remove('shake');
          void slotsEl.offsetWidth;
          slotsEl.classList.add('shake');
        }
      }, function () {
        busy = false;
        setStatus('Vafrinn styður ekki dulkóðun. Prófaðu nýrri vafra.', 'bad');
      });
    }

    // Stokkar og passar að upphafsröðin sé aldrei rétta orðið
    // (prófað með því að reyna að afkóða, ekkert svar er geymt).
    function newRound() {
      if (solved) return;
      busy = false;
      slotsEl.classList.remove('shake');
      setStatus('');
      var order = shuffle(letters);
      var mine = ++round;
      build(order);
      check(order.join('')).then(function (result) {
        var untouched = tiles.every(function (t) { return t.slot === null; });
        if (result && mine === round && untouched) newRound();
      }, function () {});
    }

    resetBtn.addEventListener('click', newRound);
    newRound();
  }

  // --- 1. skref: heiti þorpsins --------------------------------------------------

  createPuzzle(document.querySelector('.puzzle'), P.letters,
    function (word) { return tryDecrypt(word, P); },
    function (result) {
      taskEl.innerHTML = result.html;
      reveal(taskEl);
      initStage(taskEl, result.key);
      var ok = taskEl.querySelector('.success');
      return ok ? ok.textContent : 'Rétt!';
    });

  // --- Stafarugl í síðari skrefum -------------------------------------------------
  // Hvert svar er rétt ef það afkóðar smá tákn. Þegar öll eru leyst eru svörin
  // saman lykillinn að valinu (.choice).

  function setupWordPuzzles(container) {
    var puzzles = container.querySelectorAll('.word-puzzle');
    var choice = container.querySelector('.choice');
    if (!puzzles.length) return;
    var answers = [];
    var left = puzzles.length;
    puzzles.forEach(function (root, i) {
      var payload = JSON.parse(root.getAttribute('data-payload'));
      createPuzzle(root, payload.letters,
        function (word) { return tryDecrypt(word, payload); },
        function (result, word) {
          answers[i] = word.toLocaleLowerCase('is');
          if (--left === 0 && choice) openChoice();
          return 'Rétt!';
        });
    });

    function openChoice() {
      var payload = JSON.parse(choice.getAttribute('data-payload'));
      tryDecrypt(answers.join('|'), payload).then(function (result) {
        if (!result) return;
        choice.innerHTML = result.html;
        reveal(choice);
      });
    }
  }

  // --- Litunaræfing -----------------------------------------------------------------
  // Nemandinn litar lendingarsvæðið á kortið. Svæðakortið (grátóna PNG) segir
  // hvað hver punktur er: 0 = utan reits, 85 = rangt svæði,
  // 170 = vikmörk við línuna, 255 = rétt svæði.

  function setupPaint(container) {
    var root = container.querySelector('.paint');
    if (!root) return;
    var layer = root.querySelector('.paint-layer');
    var shade = root.querySelector('.paint-shade');
    var status = root.querySelector('.paint-status');
    var revealEl = root.querySelector('.paint-reveal');
    var checkBtn = root.querySelector('[data-action="check"]');
    var minCoverage = parseFloat(root.getAttribute('data-coverage')) || 0.9;
    // Hlutfall þess sem litað er sem má lenda á röngu svæði
    var maxOutside = parseFloat(root.getAttribute('data-max-outside')) || 0;
    var zonesUrl = root.getAttribute('data-zones');
    var secret = JSON.parse(root.getAttribute('data-reveal'));
    var ctx = layer.getContext('2d');
    var zones = null;      // Uint8Array, flokkur hvers punkts
    var allowed = null;    // canvas: ógegnsætt þar sem má lita
    var tool = 'brush';
    var size = 12;
    var drawing = null;
    var done = false;

    function say(text, kind) {
      status.textContent = text;
      status.className = 'paint-status' + (kind ? ' ' + kind : '');
    }

    var img = new Image();
    img.onload = function () {
      var w = img.naturalWidth, h = img.naturalHeight;
      layer.width = shade.width = w;
      layer.height = shade.height = h;
      var tmp = document.createElement('canvas');
      tmp.width = w; tmp.height = h;
      var t = tmp.getContext('2d');
      t.drawImage(img, 0, 0);
      var px = t.getImageData(0, 0, w, h).data;
      zones = new Uint8Array(w * h);
      allowed = document.createElement('canvas');
      allowed.width = w; allowed.height = h;
      var a = allowed.getContext('2d');
      var aData = a.createImageData(w, h);
      var sCtx = shade.getContext('2d');
      var sData = sCtx.createImageData(w, h);
      for (var i = 0; i < w * h; i++) {
        var v = px[i * 4];
        zones[i] = v < 40 ? 0 : v < 128 ? 1 : v < 212 ? 2 : 3;
        if (zones[i] > 0) aData.data[i * 4 + 3] = 255;
        else sData.data[i * 4 + 3] = 110;   // skyggja utan reits
      }
      a.putImageData(aData, 0, 0);
      sCtx.putImageData(sData, 0, 0);
    };
    img.src = zonesUrl;

    function point(e) {
      var r = layer.getBoundingClientRect();
      return { x: (e.clientX - r.left) * layer.width / r.width,
               y: (e.clientY - r.top) * layer.height / r.height };
    }

    function stroke(from, to) {
      ctx.save();
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = '#ff2fd0';
      ctx.lineWidth = size;
      ctx.lineCap = ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x + 0.01, to.y);
      ctx.stroke();
      if (tool === 'brush' && allowed) {
        ctx.globalCompositeOperation = 'destination-in';
        ctx.drawImage(allowed, 0, 0);
      }
      ctx.restore();
    }

    layer.addEventListener('pointerdown', function (e) {
      if (done || !zones) return;
      e.preventDefault();
      layer.setPointerCapture(e.pointerId);
      drawing = point(e);
      stroke(drawing, drawing);
      if (status.textContent) say('');
    });
    layer.addEventListener('pointermove', function (e) {
      if (!drawing) return;
      e.preventDefault();
      var events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      if (!events.length) events = [e];
      events.forEach(function (ev) {
        var p = point(ev);
        stroke(drawing, p);
        drawing = p;
      });
    });
    function end() { drawing = null; }
    layer.addEventListener('pointerup', end);
    layer.addEventListener('pointercancel', end);

    function press(group, btn) {
      root.querySelectorAll(group).forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
    }
    root.querySelectorAll('[data-tool]').forEach(function (b) {
      b.addEventListener('click', function () { tool = b.getAttribute('data-tool'); press('[data-tool]', b); });
    });
    root.querySelectorAll('[data-size]').forEach(function (b) {
      b.addEventListener('click', function () { size = parseInt(b.getAttribute('data-size'), 10); press('[data-size]', b); });
    });
    root.querySelector('[data-action="clear"]').addEventListener('click', function () {
      if (done) return;
      ctx.clearRect(0, 0, layer.width, layer.height);
      say('');
    });

    function unlock() {
      var s = subtle();
      return s.digest('SHA-256', b64(zonesUrl.split(',')[1]))
        .then(function (raw) { return s.importKey('raw', raw, 'AES-GCM', false, ['decrypt']); })
        .then(function (key) { return s.decrypt({ name: 'AES-GCM', iv: b64(secret.iv) }, key, b64(secret.data)); })
        .then(function (buf) { return new TextDecoder().decode(buf); });
    }

    checkBtn.addEventListener('click', function () {
      if (done || !zones) return;
      var px = ctx.getImageData(0, 0, layer.width, layer.height).data;
      var good = 0, total = 0, bad = 0, any = 0;
      for (var i = 0; i < zones.length; i++) {
        var painted = px[i * 4 + 3] >= 128;
        if (zones[i] === 3) { total++; if (painted) good++; }
        else if (zones[i] === 1 && painted) bad++;
        if (painted) any++;
      }
      if (!any) { say('Litaðu fyrst lendingarsvæðið á kortið.', 'bad'); return; }
      if (bad > maxOutside * (good + bad)) { say('Ekki alveg. Eitthvað af því sem þú litaðir hentar ekki til að varpa farminum niður.', 'bad'); return; }
      if (good / total < minCoverage) { say('Ekki alveg. Lendingarsvæðið er stærra en það sem þú hefur litað.', 'bad'); return; }
      done = true;
      root.classList.add('done');
      checkBtn.disabled = true;
      unlock().then(function (html) {
        say('Rétt! Þetta svæði hentar.', 'good');
        revealEl.innerHTML = html;
        revealEl.hidden = false;
        revealEl.classList.add('reveal');
        var input = container.querySelector('.code-form input');
        revealEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (input) input.focus({ preventScroll: true });
      }, function () {
        say('Eitthvað fór úrskeiðis. Endurhlaðaðu síðuna og reyndu aftur.', 'bad');
      });
    });
  }

  // --- Kóði sem opnar næsta skref -------------------------------------------------

  function setupCodeForm(container) {
    var form = container.querySelector('.code-form');
    var payloadEl = container.querySelector('.next-payload');
    if (!form || !payloadEl) return;
    var next = JSON.parse(payloadEl.textContent);
    var input = form.querySelector('input');
    var button = form.querySelector('button');
    var status = form.querySelector('.code-status');
    var target = container.querySelector('.next-stage');
    var length = parseInt(form.getAttribute('data-length'), 10);
    var checking = false;

    function say(text, kind) {
      status.textContent = text;
      status.className = 'code-status' + (kind ? ' ' + kind : '');
    }

    function submit() {
      var value = input.value.replace(/\s+/g, '');
      if (checking || input.disabled) return;
      if (value.length !== length) { say('Kóðinn er ' + length + ' stafir.', 'bad'); return; }
      checking = true;
      button.disabled = true;
      say('Athuga…');
      tryDecrypt(value, next).then(function (result) {
        checking = false;
        if (result) {
          input.disabled = true;
          say('Kóðinn er réttur!', 'good');
          target.innerHTML = result.html;
          reveal(target);
          initStage(target, result.key);
        } else {
          button.disabled = false;
          say('Þessi kóði passar ekki. Athugaðu hann og reyndu aftur.', 'bad');
          form.classList.remove('shake');
          void form.offsetWidth;
          form.classList.add('shake');
          input.select();
        }
      }, function () {
        checking = false;
        button.disabled = false;
        say('Vafrinn styður ekki dulkóðun. Prófaðu nýrri vafra.', 'bad');
      });
    }

    form.addEventListener('submit', function (e) { e.preventDefault(); submit(); });
    input.addEventListener('input', function () {
      input.value = input.value.toLocaleUpperCase('is');
      if (status.textContent && !checking) say('');
    });
  }
})();
