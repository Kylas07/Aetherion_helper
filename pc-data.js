/* Boîte de PC Pokémon — données, encodage compact, génération du HTML forum.
   window.PC */
(function () {
  var E = window.EQUIPE || {};
  var TYPE = E.TYPE || { 'Normal': '#9FA39B' };
  var TYPE_LIST = E.TYPE_LIST || Object.keys(TYPE);
  var BALLS = E.BALLS || { 'Poké Ball': { top: '#EE1515', band: '#1A1A1A' } };
  var BALL_LIST = E.BALL_LIST || Object.keys(BALLS);
  var GENDERS = E.GENDERS || [
    { v: '♂', label: '♂ Mâle', cls: 'm' },
    { v: '♀', label: '♀ Femelle', cls: 'f' },
    { v: '⚲', label: '⚲ Inconnu', cls: 'x' }
  ];
  var SIZE = 30;

  function typeColor(t) { return TYPE[t] || '#9AA3AE'; }
  function ballColors(n) { return BALLS[n] || BALLS['Poké Ball']; }
  function genderClass(g) { return g === '♀' ? 'f' : g === '⚲' ? 'x' : 'm'; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function blankMon() {
    return {
      sprite: '', nickname: '', species: 'Nouveau Pokémon', types: ['Normal'],
      level: 5, gender: '♂', ball: 'Poké Ball'
    };
  }

  var DEFAULT = {
    owner: 'Kalei',
    boxName: 'Boîte 1 — Captures',
    motisma: '',
    mons: [
      { sprite: 'https://i.imgur.com/6dKxzuE.gif', nickname: 'Suchi', species: 'Nigirigon', types: ['Eau', 'Poison'], level: 12, gender: '♂', ball: 'Poké Ball' },
      { sprite: '', nickname: '', species: 'Pikachu', types: ['Électrik'], level: 9, gender: '♂', ball: 'Rapide Ball' },
      { sprite: 'https://i.imgur.com/Y3mHM9W.gif', nickname: 'Niguiri', species: 'Nigirigon', types: ['Dragon', 'Eau'], level: 19, gender: '♂', ball: 'Soin Ball' }
    ]
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function enc(v) {
    return encodeURIComponent(v == null ? '' : v)
      .replace(/[;,:|'!~*()]/g, function (c) { return '%' + c.charCodeAt(0).toString(16).toUpperCase(); });
  }
  function dec(v) { try { return decodeURIComponent(v); } catch (e) { return v; } }

  /* ---------- code compact ---------- */
  function encode(d) {
    var slots = [];
    (d.mons || []).forEach(function (p, i) {
      if (!p) return;
      slots.push(i + ':' + [
        p.sprite, p.nickname, p.species, (p.types || [])[0] || 'Normal', (p.types || [])[1] || '',
        p.level, p.gender, p.ball
      ].map(enc).join(','));
    });
    return 'PC1|' + [d.owner, d.boxName, d.motisma].map(enc).join('|') + '|' + slots.join(';');
  }

  function decode(str) {
    var raw = String(str || '');
    var code = '';
    try {
      var el = new DOMParser().parseFromString(raw, 'text/html').querySelector('[data-pc]');
      if (el) code = el.getAttribute('data-pc') || '';
    } catch (e) {}
    if (code.indexOf('PC1|') !== 0) {
      var m = raw.match(/PC1\|[^"'<>]+/);
      if (!m) throw new Error('pas un code de PC');
      code = m[0];
    }
    var p = code.slice(4).split('|');
    var mons = [];
    for (var i = 0; i < SIZE; i++) mons.push(null);
    (p[3] || '').split(';').filter(Boolean).forEach(function (s) {
      var c = s.indexOf(':');
      var idx = parseInt(s.slice(0, c), 10);
      var f = s.slice(c + 1).split(',');
      if (isNaN(idx) || idx < 0 || idx >= SIZE) return;
      var types = [dec(f[3]) || 'Normal'];
      if (dec(f[4])) types.push(dec(f[4]));
      mons[idx] = {
        sprite: dec(f[0]), nickname: dec(f[1]), species: dec(f[2]), types: types,
        level: dec(f[5]), gender: dec(f[6]) || '♂', ball: dec(f[7]) || 'Poké Ball'
      };
    });
    return { owner: dec(p[0]), boxName: dec(p[1]), motisma: dec(p[2]), mons: mons };
  }

  /* ---------- import des anciennes boîtes (code PCBOX1: en base64) ---------- */
  var TYPE_BY_KEY = {};
  TYPE_LIST.forEach(function (t) {
    TYPE_BY_KEY[t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')] = t;
  });
  function normType(t) {
    var k = String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    return TYPE_BY_KEY[k] || 'Normal';
  }

  function legacy(str) {
    var raw = String(str || '');
    var code = '';
    try {
      var el = new DOMParser().parseFromString(raw, 'text/html').querySelector('[data-pc]');
      if (el) code = el.getAttribute('data-pc') || '';
    } catch (e) {}
    if (code.indexOf('PCBOX1:') !== 0) {
      var m = raw.match(/PCBOX1:[A-Za-z0-9+/=]+/);
      if (!m) throw new Error('pas une ancienne boîte');
      code = m[0];
    }
    var o = JSON.parse(decodeURIComponent(escape(atob(code.slice(7)))));
    if (!o || !Array.isArray(o.mons)) throw new Error('format');

    var mons = [];
    for (var i = 0; i < SIZE; i++) {
      var p = o.mons[i];
      if (!p) { mons.push(null); continue; }
      var types = (Array.isArray(p.types) ? p.types : ['Normal']).filter(Boolean).slice(0, 2).map(normType);
      mons.push({
        sprite: p.sprite || '',
        nickname: p.nickname || '',
        species: p.species || '',
        types: types.length ? types : ['Normal'],
        level: p.level == null ? '' : String(p.level),
        gender: p.gender || '♂',
        ball: p.ballName || p.ball || 'Poké Ball'
      });
    }
    return {
      owner: o.owner || 'Dresseur',
      boxName: o.boxName || 'Boîte 1',
      motisma: o.motisma || '',
      mons: mons
    };
  }

  /* ---------- ancien modèle : code PCBOX1: en base64 ---------- */
  var TYPE_BY_KEY = {};
  TYPE_LIST.forEach(function (t) {
    TYPE_BY_KEY[t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')] = t;
  });
  function normType(t) {
    var k = String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    return TYPE_BY_KEY[k] || 'Normal';
  }

  function legacy(str) {
    var raw = String(str || '');
    var code = '';
    try {
      var el = new DOMParser().parseFromString(raw, 'text/html').querySelector('[data-pc]');
      if (el) code = el.getAttribute('data-pc') || '';
    } catch (e) {}
    if (code.indexOf('PCBOX1:') !== 0) {
      var m = raw.match(/PCBOX1:[A-Za-z0-9+/=]+/);
      if (!m) throw new Error('pas une ancienne boîte');
      code = m[0];
    }
    var o = JSON.parse(decodeURIComponent(escape(atob(code.slice(7)))));
    if (!o || !Array.isArray(o.mons)) throw new Error('format');

    var mons = [];
    for (var i = 0; i < SIZE; i++) {
      var p = o.mons[i];
      if (!p) { mons.push(null); continue; }
      var types = (Array.isArray(p.types) ? p.types : ['Normal']).filter(Boolean).slice(0, 2).map(normType);
      mons.push({
        sprite: p.sprite || '',
        nickname: p.nickname || '',
        species: p.species || '',
        types: types.length ? types : ['Normal'],
        level: p.level == null ? '' : String(p.level),
        gender: p.gender || '♂',
        ball: p.ballName || p.ball || 'Poké Ball'
      });
    }
    return {
      owner: o.owner || o.trainerName || 'Dresseur',
      boxName: o.boxName || 'Boîte 1',
      motisma: o.motisma || '',
      mons: mons
    };
  }

  /* ---------- relecture du HTML si le code a disparu ---------- */
  function scanPC(html) {
    try { return decode(html); } catch (e) {}
    try { return legacy(html); } catch (e) {}
    try { return legacy(html); } catch (e) {}
    var doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    var root = doc.querySelector('.pc');
    if (!root) throw new Error('aucune boîte trouvée');
    function txt(el) { return el ? (el.textContent || '').trim() : ''; }
    var mons = [];
    for (var i = 0; i < SIZE; i++) mons.push(null);
    root.querySelectorAll('.pc-s').forEach(function (s, i) {
      if (i >= SIZE || !s.querySelector('.pc-pop')) return;
      var img = s.querySelector('.pc-sp img');
      var meta = txt(s.querySelector('.pc-meta')).split('·');
      mons[i] = {
        sprite: img ? img.getAttribute('src') || '' : '',
        nickname: txt(s.querySelector('.pc-nick')),
        species: (meta[0] || '').trim(),
        types: Array.prototype.map.call(s.querySelectorAll('.pc-t'), function (t) { return txt(t); }),
        level: (meta[1] || '').replace(/[^\d]/g, ''),
        gender: txt(s.querySelector('.pc-g')) || '♂',
        ball: txt(s.querySelector('.pc-cap b')) || 'Poké Ball'
      };
      if (!mons[i].types.length) mons[i].types = ['Normal'];
    });
    var head = txt(root.querySelector('.pc-kick')).split('·');
    return {
      owner: (head[1] || '').trim(),
      boxName: txt(root.querySelector('.pc-nm')),
      motisma: (function () { var m = root.querySelector('.pc-mot img'); return m ? m.getAttribute('src') || '' : ''; })(),
      mons: mons
    };
  }

  /* ---------- HTML forum : classes seules ---------- */
  function buildHTML(d) {
    var mons = d.mons || [];
    var filled = mons.filter(Boolean).length;

    function ball(name) {
      var b = ballColors(name);
      return '<span class="pc-ball"><i class="t" style="background:' + b.top + '"></i>' +
        '<i class="b" style="background:' + b.band + '"></i><i class="c"></i></span>';
    }

    var cells = [];
    for (var i = 0; i < SIZE; i++) {
      var p = mons[i];
      if (!p) { cells.push('<li class="pc-s pc-e"></li>'); continue; }
      var sprite = p.sprite
        ? '<img src="' + esc(p.sprite) + '" alt="' + esc(p.species) + '">'
        : '<span>' + esc((p.species || '?').charAt(0)) + '</span>';
      var types = (p.types || []).filter(Boolean).map(function (t) {
        return '<span class="pc-t" style="background:' + typeColor(t) + '">' + esc(t) + '</span>';
      }).join('');
      cells.push(
        '<li class="pc-s" tabindex="0">' +
        '<span class="pc-sp">' + sprite + '</span>' +
        ball(p.ball) +
        '<span class="pc-g pc-g-' + genderClass(p.gender) + '">' + esc(p.gender || '♂') + '</span>' +
        '<span class="pc-pop">' +
        '<span class="pc-pop-h"><span class="pc-pop-sp">' + sprite + '</span>' +
        '<span class="pc-pop-tx"><b class="pc-nick">' + esc(p.nickname || p.species || '—') + '</b>' +
        '<span class="pc-meta">' + esc(p.species || '—') + ' · Niv ' + esc(p.level || '—') + '</span>' +
        '<span class="pc-ts">' + types + '</span></span></span>' +
        '<span class="pc-cap">' + ball(p.ball) + 'Capturé en <b>' + esc(p.ball || 'Poké Ball') + '</b></span>' +
        '</span></li>'
      );
    }

    var mot = '';

    return '<div class="pc" data-pc="' + esc(encode(d)) + '">' +
      '<div class="pc-hd">' + mot +
      '<span class="pc-htx"><span class="pc-kick">PC · ' + esc(d.owner || 'Dresseur') + '</span>' +
      '<b class="pc-nm">' + esc(d.boxName || 'Boîte 1') + '</b></span>' +
      '<span class="pc-count">' + filled + ' / ' + SIZE + '</span></div>' +
      '<ul class="pc-grid">' + cells.join('') + '</ul>' +
      '<div class="pc-foot">Clique un Pokémon pour voir sa fiche</div>' +
      '</div>';
  }

  window.PC = {
    SIZE: SIZE, TYPE: TYPE, TYPE_LIST: TYPE_LIST, BALLS: BALLS, BALL_LIST: BALL_LIST, GENDERS: GENDERS,
    typeColor: typeColor, ballColors: ballColors, genderClass: genderClass,
    blankMon: blankMon, DEFAULT: DEFAULT, clone: clone,
    encode: encode, decode: decode, legacy: legacy, scanPC: scanPC, buildHTML: buildHTML
  };
})();
