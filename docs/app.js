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
  function tryDecrypt(word) {
    var subtle = window.crypto && window.crypto.subtle;
    if (!subtle) return Promise.reject(new Error('no-crypto'));
    var enc = new TextEncoder();
    return subtle.importKey('raw', enc.encode(word.toLocaleLowerCase('is')), 'PBKDF2', false, ['deriveKey'])
      .then(function (base) {
        return subtle.deriveKey(
          { name: 'PBKDF2', salt: b64(P.salt), iterations: P.iterations, hash: 'SHA-256' },
          base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      })
      .then(function (key) {
        return subtle.decrypt({ name: 'AES-GCM', iv: b64(P.iv) }, key, b64(P.data));
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
