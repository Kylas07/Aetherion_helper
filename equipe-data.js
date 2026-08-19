/* Carte d'équipe Pokémon — données, encodage compact, génération du HTML forum.
   window.EQUIPE */
(function () {
  var TYPE = {
    'Normal': '#9FA39B', 'Feu': '#E84C3D', 'Eau': '#3C8FE0', 'Plante': '#4BAE4F',
    'Électrik': '#E0B32B', 'Glace': '#56CCE0', 'Combat': '#E0762B', 'Poison': '#A052C8',
    'Sol': '#C08A3E', 'Vol': '#88AEE8', 'Psy': '#EC5C8E', 'Insecte': '#9AAB2A',
    'Roche': '#BBA968', 'Spectre': '#6E5A9B', 'Dragon': '#5763E0', 'Ténèbres': '#4E4A57',
    'Acier': '#6BA7B8', 'Fée': '#EE8FCB'
  };
  var TYPE_LIST = Object.keys(TYPE);

  var BALLS = {
    'Poké Ball': { top: '#EE1515', band: '#1A1A1A' },
    'Super Ball': { top: '#3B82F6', band: '#1A1A1A' },
    'Hyper Ball': { top: '#F2B600', band: '#1A1A1A' },
    'Luxe Ball': { top: '#23272F', band: '#D4AF37' },
    'Faiblo Ball': { top: '#F4F4F4', band: '#D11A1A' },
    'Filet Ball': { top: '#0EA5A5', band: '#1A1A1A' },
    'Scuba Ball': { top: '#3FA9F5', band: '#1A1A1A' },
    'Soin Ball': { top: '#F472B6', band: '#1A1A1A' },
    'Rapide Ball': { top: '#F7C600', band: '#2360A8' },
    'Sombre Ball': { top: '#2E5339', band: '#1A1A1A' },
    'Chrono Ball': { top: '#E25822', band: '#1A1A1A' },
    'Honneur Ball': { top: '#8C6239', band: '#D4AF37' },
    'Masse Ball': { top: '#B15FA8', band: '#1A1A1A' },
    'Appât Ball': { top: '#E2643B', band: '#1A1A1A' }
  };
  var BALL_LIST = Object.keys(BALLS);

  var NATURES = ['Hardi', 'Solo', 'Rigide', 'Mauvais', 'Brave', 'Assuré', 'Docile',
    'Malin', 'Lâche', 'Relax', 'Foufou', 'Modeste', 'Doux', 'Discret', 'Bizarre',
    'Calme', 'Gentil', 'Prudent', 'Pressé', 'Timide', 'Jovial', 'Naïf', 'Sérieux'];

  /* origine d'une capacité */
  var SOURCES = [
    { v: 'n', label: 'Niveau', short: 'Niv.' },
    { v: 'r', label: 'Reproduction', short: 'Repro' },
    { v: 't', label: 'CT', short: 'CT' },
    { v: 's', label: 'CS', short: 'CS' },
    { v: 'u', label: 'Tuteur', short: 'Tuteur' }
  ];
  var SOURCE_MAP = {};
  SOURCES.forEach(function (s) { SOURCE_MAP[s.v] = s; });

  var GENDERS = [
    { v: '♂', label: '♂ Mâle', cls: 'm' },
    { v: '♀', label: '♀ Femelle', cls: 'f' },
    { v: '⚲', label: '⚲ Inconnu', cls: 'x' }
  ];

  function typeColor(t) { return TYPE[t] || '#9AA3AE'; }
  function ballColors(n) { return BALLS[n] || BALLS['Poké Ball']; }
  function genderClass(g) { return g === '♀' ? 'f' : g === '⚲' ? 'x' : 'm'; }
  function sourceOf(v) { return SOURCE_MAP[v] || SOURCE_MAP.n; }

  function blankMon() {
    return {
      sprite: '', nickname: '', species: 'Nouveau Pokémon', types: ['Normal'],
      level: 5, gender: '♂', ball: 'Poké Ball', talent: '', hidden: false,
      nature: 'Sérieux', desc: '',
      moves: [{ name: 'Charge', type: 'Normal', src: 'n' }]
    };
  }

  var DEFAULT = {
    trainer: 'Kalei Wu',
    showNick: true,
    team: [
      {
        sprite: 'https://i.imgur.com/6dKxzuE.gif', nickname: 'Suchi', species: 'Nigirigon',
        types: ['Dragon', 'Eau'], level: 24, gender: '♂', ball: 'Luxe Ball',
        talent: 'Commandant', hidden: true, nature: 'Assuré',
        moves: [
          { name: 'Pistolet à O', type: 'Eau', src: 'n' },
          { name: 'Draco-Griffe', type: 'Dragon', src: 'n' },
          { name: 'Danse Draco', type: 'Dragon', src: 'r' },
          { name: 'Surf', type: 'Eau', src: 's' },
          { name: 'Lance-Flammes', type: 'Feu', src: 't' }
        ],
        desc: "Premier compagnon de Kalei, pêché dans les eaux basses du troisième étage."
      },
      {
        sprite: 'https://i.imgur.com/Y3mHM9W.gif', nickname: 'Niguiri', species: 'Nigirigon',
        types: ['Dragon', 'Eau'], level: 19, gender: '♂', ball: 'Soin Ball',
        talent: 'Lavabo', hidden: false, nature: 'Modeste',
        moves: [
          { name: 'Trempette', type: 'Eau', src: 'n' },
          { name: 'Armure', type: 'Normal', src: 'n' },
          { name: 'Cascade', type: 'Eau', src: 's' }
        ],
        desc: "Placide, refuse obstinément de sortir de l'eau."
      }
    ]
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* tous les séparateurs sont échappés : le code reste un bloc sûr */
  function enc(v) {
    return encodeURIComponent(v == null ? '' : v)
      .replace(/[;,:|'!~*()]/g, function (c) { return '%' + c.charCodeAt(0).toString(16).toUpperCase(); });
  }
  function dec(v) { try { return decodeURIComponent(v); } catch (e) { return v; } }

  function encode(d) {
    var members = (d.team || []).map(function (p) {
      var f = [
        p.sprite, p.nickname, p.species, (p.types || [])[0] || 'Normal', (p.types || [])[1] || '',
        p.level, p.gender, p.ball, p.talent, p.hidden ? '1' : '0', p.nature, p.desc
      ].map(enc);
      f.push((p.moves || []).filter(function (m) { return m && m.name; })
        .map(function (m) { return [m.name, m.type || 'Normal', m.src || 'n'].map(enc).join(':'); })
        .join(','));
      return f.join(';');
    });
    return 'TEAM1|' + enc(d.trainer) + '|' + (d.showNick === false ? '0' : '1') +
      (members.length ? '|' + members.join('|') : '');
  }

  function decode(str) {
    var raw = String(str || '');
    var code = '';
    try {
      var el = new DOMParser().parseFromString(raw, 'text/html').querySelector('[data-tc]');
      if (el) code = el.getAttribute('data-tc') || '';
    } catch (e) {}
    if (code.indexOf('TEAM1|') !== 0) {
      var m = raw.match(/TEAM1\|[^"<>\s]*/);
      code = m ? m[0] : raw.trim();
    }
    if (code.indexOf('TEAM1|') !== 0) throw new Error('format');

    var parts = code.slice(6).split('|');
    var team = parts.slice(2).map(function (seg) {
      var f = seg.split(';');
      if (f.length !== 13) throw new Error('incomplet');
      var types = [dec(f[3]) || 'Normal'];
      if (dec(f[4])) types.push(dec(f[4]));
      return {
        sprite: dec(f[0]), nickname: dec(f[1]), species: dec(f[2]), types: types,
        level: dec(f[5]), gender: dec(f[6]) || '♂', ball: dec(f[7]) || 'Poké Ball',
        talent: dec(f[8]), hidden: f[9] === '1', nature: dec(f[10]), desc: dec(f[11]),
        moves: (f[12] || '').split(',').filter(Boolean).map(function (s) {
          var x = s.split(':');
          return { name: dec(x[0]), type: dec(x[1]) || 'Normal', src: SOURCE_MAP[dec(x[2])] ? dec(x[2]) : 'n' };
        })
      };
    });
    return { trainer: dec(parts[0]), showNick: parts[1] !== '0', team: team };
  }

  /* ---------- import des anciennes cartes (code TCARD1: en base64) ---------- */
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
      var el = new DOMParser().parseFromString(raw, 'text/html').querySelector('[data-tcard]');
      if (el) code = el.getAttribute('data-tcard') || '';
    } catch (e) {}
    if (code.indexOf('TCARD1:') !== 0) {
      var m = raw.match(/TCARD1:[A-Za-z0-9+/=]+/);
      if (!m) throw new Error('pas une ancienne carte');
      code = m[0];
    }
    var o = JSON.parse(decodeURIComponent(escape(atob(code.slice(7)))));
    if (!o || !Array.isArray(o.team)) throw new Error('format');

    return {
      trainer: o.trainerName || 'Dresseur',
      showNick: o.showNicknames !== false,
      team: o.team.map(function (p) {
        var types = (Array.isArray(p.types) ? p.types : ['Normal']).filter(Boolean).slice(0, 2).map(normType);
        return {
          sprite: p.sprite || '',
          nickname: p.nickname || '',
          species: p.species || '',
          types: types.length ? types : ['Normal'],
          level: p.level == null ? '' : String(p.level),
          gender: p.gender || '♂',
          ball: p.ballName || p.ball || 'Poké Ball',
          talent: p.talent || '',
          hidden: p.hidden === true,
          nature: p.nature || 'Sérieux',
          desc: p.desc || '',
          /* l'ancien format ne connaissait pas l'origine : tout passe en "Niveau" */
          moves: (p.moves || []).filter(function (m2) { return m2 && m2.name; }).map(function (m2) {
            return { name: m2.name, type: normType(m2.type), src: 'n' };
          })
        };
      })
    };
  }

  /* relit le HTML d'une carte dont le code aurait disparu */
  function scanTeam(html) {
    try { return decode(html); } catch (e) {}
    try { return legacy(html); } catch (e) {}

    var doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    var root = doc.querySelector('.tcd');
    if (!root) throw new Error('introuvable');
    var txt = function (el) { return el ? (el.textContent || '').trim() : ''; };

    var team = [];
    root.querySelectorAll('.tcd-row').forEach(function (row) {
      var meta = txt(row.querySelector('.tcd-meta')).split('·');
      var big = row.querySelector('.tcd-sp.tcd-lg img');
      var small = row.querySelector('.tcd-sum .tcd-sp img');
      var stats = {};
      row.querySelectorAll('.tcd-stat').forEach(function (s) {
        stats[txt(s.querySelector('dt')).toLowerCase()] = s;
      });
      var talentEl = stats['talent'];
      var moves = [];
      row.querySelectorAll('.tcd-mv li').forEach(function (li) {
        var srcEl = li.querySelector('.tcd-src');
        var src = 'n';
        if (srcEl) {
          ['r', 't', 's', 'u'].forEach(function (k) {
            if (srcEl.className.indexOf('tcd-src-' + k) >= 0) src = k;
          });
        }
        var type = (txt(li.querySelector('.tcd-mt')) || '').split('·')[0].trim();
        moves.push({ name: txt(li.querySelector('.tcd-mn')), type: type || 'Normal', src: src });
      });
      team.push({
        sprite: (big && big.getAttribute('src')) || (small && small.getAttribute('src')) || '',
        nickname: txt(row.querySelector('.tcd-dn')),
        species: (meta[0] || '').trim(),
        types: Array.prototype.map.call(row.querySelectorAll('.tcd-tys .tcd-ty'), txt).filter(Boolean),
        level: (meta[1] || '').replace(/[^\d]/g, ''),
        gender: txt(row.querySelector('.tcd-g')) || '♂',
        ball: txt(stats['ball'] ? stats['ball'].querySelector('dd') : null),
        talent: talentEl ? txt(talentEl.querySelector('dd')).replace(/caché$/i, '').trim() : '',
        hidden: !!(talentEl && talentEl.querySelector('.tcd-hid')),
        nature: txt(stats['nature'] ? stats['nature'].querySelector('dd') : null),
        desc: txt(row.querySelector('.tcd-dscp')),
        moves: moves
      });
    });
    if (!team.length) throw new Error('vide');
    return { trainer: txt(root.querySelector('.tcd-nm')), showNick: true, team: team };
  }

  /* ---------- HTML forum : classes seules ---------- */
  function buildHTML(d, openFirst) {
    var showNick = d.showNick !== false;
    var team = d.team || [];

    function ball(name) {
      var b = ballColors(name);
      return '<span class="tcd-ball"><i class="t" style="background:' + b.top + '"></i>' +
        '<i class="b" style="background:' + b.band + '"></i><i class="c"></i></span>';
    }
    function sprite(p, big) {
      var cls = 'tcd-sp' + (big ? ' tcd-lg' : '');
      if (p.sprite) return '<span class="' + cls + '"><img src="' + esc(p.sprite) + '" alt=""></span>';
      return '<span class="' + cls + ' tcd-ph">' + (big ? 'sprite' : '') + '</span>';
    }
    function chip(t) {
      return '<span class="tcd-ty" style="background:' + typeColor(t) + '">' + esc(t) + '</span>';
    }

    var rows = team.map(function (p, i) {
      var display = showNick ? (p.nickname || p.species) : p.species;
      var sub = (showNick && p.nickname ? p.species + ' · ' : '') + 'Niv. ' + esc(p.level || '?');
      var types = (p.types || []).map(chip).join('');
      var mv = (p.moves || []).filter(function (m) { return m && m.name; });
      var moves = mv.length
        ? '<ul class="tcd-mv' + (mv.length > 6 ? ' tcd-scroll' : '') + '">' + mv.map(function (m) {
          var s = sourceOf(m.src);
          return '<li><span class="tcd-bar" style="background:' + typeColor(m.type) + '"></span>' +
            '<span class="tcd-mx"><span class="tcd-mn">' + esc(m.name) + '</span>' +
            '<span class="tcd-mt">' + esc(m.type) + ' · <span class="tcd-src tcd-src-' + s.v + '">' +
            esc(s.short) + '</span></span></span></li>';
        }).join('') + '</ul>'
        : '<p class="tcd-empty">Aucune capacité.</p>';

      return '<details class="tcd-row"' + (openFirst && i === 0 ? ' open' : '') + '>' +
        '<summary class="tcd-sum">' + sprite(p, false) +
        '<span class="tcd-id"><span class="tcd-nr"><span class="tcd-dn">' + esc(display) + '</span>' +
        '<span class="tcd-g tcd-g-' + genderClass(p.gender) + '">' + esc(p.gender || '') + '</span></span>' +
        '<span class="tcd-meta">' + sub + '</span></span>' +
        '<span class="tcd-tys">' + types + '</span></summary>' +
        '<div class="tcd-bd">' +
        '<div class="tcd-left">' + sprite(p, true) +
        '<div class="tcd-cap">' + ball(p.ball) + esc(p.ball || 'Poké Ball') + '</div></div>' +
        '<div class="tcd-right">' +
        '<dl class="tcd-stats">' +
        '<div class="tcd-stat"><dt>Talent</dt><dd>' + esc(p.talent || '—') +
        (p.hidden ? '<span class="tcd-hid">Caché</span>' : '') + '</dd></div>' +
        '<div class="tcd-stat"><dt>Nature</dt><dd>' + esc(p.nature || '—') + '</dd></div>' +
        '<div class="tcd-stat"><dt>Ball</dt><dd>' + esc(p.ball || '—') + '</dd></div>' +
        '</dl>' +
        '<div class="tcd-sh"><span style="color:inherit">Capacités</span>' +
        (mv.length ? '<span>' + mv.length + (mv.length > 6 ? ' · défiler' : '') + '</span>' : '') + '</div>' +
        moves +
        (p.desc ? '<div class="tcd-dsc"><div class="tcd-dscl">Résumé</div><p class="tcd-dscp">' + esc(p.desc) + '</p></div>' : '') +
        '</div></div></details>';
    }).join('');

    return '<div class="tcd" data-tc="' + esc(encode(d)) + '">' +
      '<div class="tcd-hd"><span class="tcd-htx"><span class="tcd-kick">Équipe Pokémon</span>' +
      '<span class="tcd-nm">' + esc(d.trainer || 'Dresseur') + '</span></span>' +
      '<span class="tcd-cnt">' + team.length + ' / 6</span></div>' +
      (rows || '<p class="tcd-empty" style="padding:18px">Aucun Pokémon.</p>') +
      '<div class="tcd-foot">Clique un Pokémon pour ouvrir sa fiche</div></div>';
  }

  window.EQUIPE = {
    TYPE: TYPE, TYPE_LIST: TYPE_LIST, BALLS: BALLS, BALL_LIST: BALL_LIST,
    NATURES: NATURES, SOURCES: SOURCES, GENDERS: GENDERS,
    typeColor: typeColor, ballColors: ballColors, genderClass: genderClass, sourceOf: sourceOf,
    blankMon: blankMon, DEFAULT: DEFAULT, clone: clone,
    encode: encode, decode: decode, legacy: legacy, scanTeam: scanTeam, buildHTML: buildHTML
  };
})();
