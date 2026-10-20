// Undirsíða: efnið er dulkóðað og lykillinn er í slóðinni á eftir #k=
(function () {
  'use strict';

  var el = document.getElementById('page');

  function bytes(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function fail(text) {
    el.innerHTML = '<p class="status bad"></p>';
    el.firstChild.textContent = text;
  }

  var match = /[#&]k=([A-Za-z0-9_-]+)/.exec(location.hash);
  if (!match) { fail('Þennan hlekk vantar lykil. Fáðu réttan hlekk hjá kennaranum.'); return; }
  if (!window.crypto || !window.crypto.subtle) { fail('Vafrinn styður ekki dulkóðun. Prófaðu nýrri vafra.'); return; }
  var subtle = window.crypto.subtle;

  subtle.importKey('raw', bytes(match[1]), 'AES-GCM', false, ['decrypt'])
    .then(function (key) {
      return subtle.decrypt({ name: 'AES-GCM', iv: bytes(window.PAGE.iv) }, key, bytes(window.PAGE.data))
        .then(function (buf) { return { html: new TextDecoder().decode(buf), key: key }; });
    })
    .then(function (r) {
      el.innerHTML = r.html;
      el.classList.add('reveal');
      setupMore();
      setupGods();
      setupZoom();
      if (window.initWidgets) window.initWidgets(el);
      el.querySelectorAll('[data-enc]').forEach(function (node) {
        fetch(node.getAttribute('data-enc'))
          .then(function (res) { if (!res.ok) throw new Error(res.status); return res.arrayBuffer(); })
          .then(function (buf) { return subtle.decrypt({ name: 'AES-GCM', iv: bytes(node.getAttribute('data-iv')) }, r.key, buf); })
          .then(function (plain) { node.src = URL.createObjectURL(new Blob([plain], { type: node.getAttribute('data-type') })); })
          .catch(function () { node.insertAdjacentHTML('afterend', '<p class="status bad">Ekki tókst að hlaða skrá. Endurhlaðaðu síðuna.</p>'); });
      });
    }, function () {
      fail('Þessi hlekkur er ekki réttur. Fáðu réttan hlekk hjá kennaranum.');
    });

  // Pikk á skjámynd sýnir hana stóra; pikk aftur lokar.
  function setupZoom() {
    el.querySelectorAll('figure img').forEach(function (img) {
      img.addEventListener('click', function () {
        if (!img.src) return;
        var box = document.createElement('div');
        box.className = 'zoom';
        box.setAttribute('role', 'dialog');
        box.setAttribute('aria-label', img.alt);
        var big = document.createElement('img');
        big.src = img.src;
        big.alt = img.alt;
        box.appendChild(big);
        box.addEventListener('click', function () { box.remove(); });
        document.addEventListener('keydown', function esc(e) {
          if (e.key === 'Escape') { box.remove(); document.removeEventListener('keydown', esc); }
        });
        document.body.appendChild(box);
      });
    });
  }

  // „Áfram“ og „Þýða þetta á mannamál“: sýna næsta hluta á sömu síðu.
  function setupMore() {
    el.querySelectorAll('.more-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var row = btn.parentNode, more = row.nextElementSibling;
        row.hidden = true;
        more.hidden = false;
        more.classList.add('reveal');
        var first = more.firstElementChild;
        if (first) { first.setAttribute('tabindex', '-1'); first.focus({ preventScroll: true }); }
        more.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (window.layoutGods) window.layoutGods();
      });
    });
  }

  // Guðanöfn í bakgrunni. Pikk á nafn reynir að afkóða næstu slóð með nafninu,
  // svo ekki sést í kóðanum hvert nafnanna er rétt.
  function setupGods() {
    var src = el.querySelector('.gods');
    if (!src) return;
    var names = src.getAttribute('data-names').split(' ');
    var payload = JSON.parse(src.getAttribute('data-payload'));
    var special = names.pop();      // rétta nafnið er síðast; birtist einu sinni
    var field = document.createElement('div');
    field.className = 'gods-field';
    document.body.insertBefore(field, document.body.firstChild);
    document.body.classList.add('has-gods');
    src.remove();
    var busy = false;

    function tryName(name, node) {
      if (busy) return;
      busy = true;
      node.classList.add('trying');
      var enc = new TextEncoder();
      subtle.importKey('raw', enc.encode(name), 'PBKDF2', false, ['deriveKey'])
        .then(function (base) {
          return subtle.deriveKey({ name: 'PBKDF2', salt: bytes(payload.salt), iterations: payload.iterations, hash: 'SHA-256' },
            base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
        })
        .then(function (key) { return subtle.decrypt({ name: 'AES-GCM', iv: bytes(payload.iv) }, key, bytes(payload.data)); })
        .then(function (buf) { location.href = new TextDecoder().decode(buf); },
              function () {
                busy = false;
                node.classList.remove('trying');
                node.classList.remove('miss'); void node.offsetWidth; node.classList.add('miss');
              });
    }

    function overlaps(r, list) {
      for (var i = 0; i < list.length; i++) {
        var o = list[i];
        if (r.left < o.right + 8 && r.right > o.left - 8 && r.top < o.bottom + 8 && r.bottom > o.top - 8) return true;
      }
      return false;
    }

    var lastW = 0, lastH = 0;
    function layout() {
      var W = document.documentElement.clientWidth;
      var H = Math.max(document.documentElement.scrollHeight, window.innerHeight);
      if (W === lastW && Math.abs(H - lastH) < 4) return;
      lastW = W; lastH = H;
      field.innerHTML = '';
      field.style.height = H + 'px';
      var sy = window.scrollY;
      var rect = function (b) {
        var r = b.getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top + sy, bottom: r.bottom + sy };
      };
      var blocks = [].map.call(document.querySelectorAll('main section, main h1'), rect);
      var title = [].map.call(document.querySelectorAll('main h1'), rect);
      var small = W < 600, cw = small ? 118 : 128, ch = 50;
      var cells = [];
      for (var y = 6; y + ch <= H; y += ch) {
        for (var x = (Math.floor(y / ch) % 2) * (cw / 2) - cw / 2; x < W; x += cw) {
          var cx = x + cw / 2 + (Math.random() - 0.5) * 24, cy = y + ch / 2 + (Math.random() - 0.5) * 12;
          var box = { left: cx - cw / 2 + 6, right: cx + cw / 2 - 6, top: cy - 14, bottom: cy + 14 };
          // Titillinn helst auður. Nöfn á bak við textakortið sjást dauft í gegnum það
          // en ekki er hægt að pikka á þau.
          if (overlaps(box, title)) continue;
          cells.push({ x: cx, y: cy, free: box.left >= 0 && box.right <= W && !overlaps(box, blocks) });
        }
      }
      var free = cells.filter(function (c) { return c.free; });
      // Rétta nafnið lendir á auðum stað, helst innan fyrstu tveggja skjáa
      var near = free.filter(function (c) { return c.y < window.innerHeight * 2; });
      var pool = near.length ? near : free;
      var pick = pool[Math.floor(Math.random() * pool.length)];
      var placed = [];
      cells.sort(function (a, b) { return a === pick ? -1 : b === pick ? 1 : 0; });
      cells.forEach(function (c) {
        var name = c === pick ? special : names[Math.floor(Math.random() * names.length)];
        var b = document.createElement('button');
        b.type = 'button';
        b.tabIndex = -1;
        b.className = 'god';
        b.textContent = name;
        b.style.left = c.x + 'px';
        b.style.top = c.y + 'px';
        b.style.setProperty('--rot', ((Math.random() - 0.5) * 24).toFixed(1) + 'deg');
        b.style.fontSize = ((small ? 0.78 : 0.85) + Math.random() * (small ? 0.3 : 0.45)).toFixed(2) + 'rem';
        b.addEventListener('click', function () { tryName(name, b); });
        field.appendChild(b);
        // Nafn sem fer út fyrir skjáinn er fjarlægt (nema rétta nafnið, sem er fært inn)
        // og nafn sem lendir ofan á öðru víkur.
        var r = b.getBoundingClientRect();
        if (c === pick && (r.left < 0 || r.right > W)) {
          b.style.left = Math.min(Math.max(c.x, r.width / 2 + 4), W - r.width / 2 - 4) + 'px';
          r = b.getBoundingClientRect();
        }
        // (snúin nöfn fá stærri ramma en textinn, svo aðeins raunverulegir árekstrar telja)
        var box = { left: r.left + r.width * 0.12, right: r.right - r.width * 0.12, top: r.top + r.height * 0.3, bottom: r.bottom - r.height * 0.3 };
        var hits = placed.some(function (o) { return box.left < o.right && box.right > o.left && box.top < o.bottom && box.bottom > o.top; });
        if (c !== pick && (r.left < 0 || r.right > W || hits)) { field.removeChild(b); return; }
        placed.push(box);
      });
    }
    window.layoutGods = function () { setTimeout(function () { lastH = 0; layout(); }, 750); };
    layout();
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(layout, 200); });
    // Myndir og letur geta breytt hæð síðunnar eftir á
    window.addEventListener('load', function () { lastH = 0; layout(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { lastH = 0; layout(); });
  }
})();
