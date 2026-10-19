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
})();
