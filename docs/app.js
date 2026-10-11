(function () {
  'use strict';

  var P = window.PUZZLE;
  var slotsEl = document.getElementById('slots');
  var bankEl = document.getElementById('bank');
  var statusEl = document.getElementById('status');
  var taskEl = document.getElementById('task');
  var resetBtn = document.getElementById('reset');

  var tiles = [];   // { letter, el, slot }
  var slots = [];   // { el, tile }
  var busy = false;
  var solved = false;

  function b64(s) {
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  // Leiðir lykil af orðinu og reynir að afkóða. Skilar HTML eða null.
  function tryDecrypt(word, payload) {
    payload = payload || P;
    var subtle = window.crypto && window.crypto.subtle;
    if (!subtle) return Promise.reject(new Error('no-crypto'));
    var enc = new TextEncoder();
    return subtle.importKey('raw', enc.encode(word.replace(/\s+/g, '').toLocaleLowerCase('is')), 'PBKDF2', false, ['deriveKey'])
      .then(function (base) {
        return subtle.deriveKey(
          { name: 'PBKDF2', salt: b64(payload.salt), iterations: payload.iterations, hash: 'SHA-256' },
          base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      })
      .then(function (key) {
        return subtle.decrypt({ name: 'AES-GCM', iv: b64(payload.iv) }, key, b64(payload.data));
      })
      .then(function (buf) { return new TextDecoder().decode(buf); },
            function () { return null; });
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

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

  function build(order) {
    slotsEl.innerHTML = '';
    bankEl.innerHTML = '';
    slots = [];
    tiles = [];
    P.letters.forEach(function (_, i) {
      var el = document.createElement('button');
      el.type = 'button';
      el.className = 'slot';
      var slot = { el: el, tile: null };
      el.addEventListener('click', function () { removeFrom(slot); });
      slotsEl.appendChild(el);
      slots.push(slot);
    });
    order.forEach(function (letter) {
      var el = document.createElement('button');
      el.type = 'button';
      el.className = 'tile';
      el.textContent = letter;
      var tile = { letter: letter, el: el, slot: null };
      el.addEventListener('click', function () { place(tile); });
      bankEl.appendChild(el);
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
    if (slots.every(function (s) { return s.tile; })) check();
  }

  function removeFrom(slot) {
    if (busy || solved || !slot.tile) return;
    slot.tile.slot = null;
    slot.tile = null;
    setStatus('');
    render();
  }

  function check() {
    busy = true;
    setStatus('Athuga…');
    var word = slots.map(function (s) { return s.tile.letter; }).join('');
    tryDecrypt(word).then(function (html) {
      busy = false;
      if (html) {
        solved = true;
        slotsEl.classList.add('solved');
        render();
        setStatus('');
        taskEl.innerHTML = html;
        taskEl.hidden = false;
        taskEl.classList.add('reveal');
        var ok = taskEl.querySelector('.success');
        if (ok) setStatus(ok.textContent, 'good');
        taskEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        taskEl.focus({ preventScroll: true });
        setupCodeForm();
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

  // 2. skref: kóði frá kennara opnar næsta hluta (líka dulkóðaðan)
  function setupCodeForm() {
    var form = taskEl.querySelector('.code-form');
    var payloadEl = taskEl.querySelector('.next-payload');
    if (!form || !payloadEl) return;
    var next = JSON.parse(payloadEl.textContent);
    var input = form.querySelector('input');
    var button = form.querySelector('button');
    var status = form.querySelector('.code-status');
    var target = taskEl.querySelector('.next-stage');
    var length = parseInt(form.getAttribute('data-length'), 10);
    var checking = false;

    function say(text, kind) {
      status.textContent = text;
      status.className = 'code-status' + (kind ? ' ' + kind : '');
    }

    function submit() {
      var value = input.value.replace(/\s+/g, '');
      if (checking) return;
      if (value.length !== length) { say('Kóðinn er ' + length + ' stafir.', 'bad'); return; }
      checking = true;
      button.disabled = true;
      say('Athuga…');
      tryDecrypt(value, next).then(function (html) {
        checking = false;
        if (html) {
          input.disabled = true;
          say('Kóðinn er réttur!', 'good');
          target.innerHTML = html;
          target.hidden = false;
          target.classList.add('reveal');
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          target.focus({ preventScroll: true });
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

  // Stokkar og passar að upphafsröðin sé aldrei rétta orðið
  // (prófað með því að reyna að afkóða, ekkert svar er geymt).
  function newRound() {
    solved = false;
    busy = false;
    slotsEl.classList.remove('solved', 'shake');
    taskEl.hidden = true;
    taskEl.classList.remove('reveal');
    taskEl.innerHTML = '';
    setStatus('');
    var order = shuffle(P.letters);
    build(order);
    var round = order;
    tryDecrypt(order.join('')).then(function (html) {
      if (html && tiles.length && tiles[0].letter === round[0] && tiles.every(function (t) { return t.slot === null; })) {
        newRound();
      }
    }, function () {});
  }

  resetBtn.addEventListener('click', newRound);
  newRound();
})();
