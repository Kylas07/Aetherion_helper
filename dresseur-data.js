/* Carte de dresseur — données par défaut, encodage compact, génération du HTML forum.
   window.DRESSEUR */
(function () {
  var RANKS = ['D', 'C', 'B', 'A', 'S'];

  var DEFAULT = {
    firstName: 'Kalei',
    lastName: 'Wu',
    age: '24 ans',
    rank: 'S',
    group: 'Un groupe cool',
    occupation: 'Sugar Baby',
    money: '999999',
    avatar: 'https://2img.net/i.imgur.com/r9W0oZf.png',
    motisma: '',
    bio: "Kalei c'est un gars cool.",
    moves: [
      { name: 'Coupe', kind: 'CS' },
      { name: 'Surf', kind: 'CS' },
      { name: 'Force', kind: 'CS' },
      { name: 'Lance-Flammes', kind: 'CT' },
      { name: 'Vibrobscur', kind: 'CT' }
    ],
    inventory: ['Pokédex régional', 'Vélo de course', 'Carte de la région', 'Master Ball'],
    vestiges: ['Capture Pro', 'Bourgeoisie', 'Fouille', 'Balayage', 'Mutation',
      'Douce Lueur', 'Bel Éclat', 'Excavation', 'Tutorat', 'Mentorat', 'Faux Cils',
      'Prime', 'Bonus', 'Jackpot', 'Archéologie',
      'Prédilection (Eau)', 'Expertise (Eau)', 'Dévotion (Eau)']
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function money(v) {
    var s = String(v == null ? '' : v).replace(/\s/g, '');
    if (!s) return '';
    if (/^\d+$/.test(s)) return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
    return s;
  }

  /* ---------- code compact : DR2|champ|champ|… (URI-encodé, pas de base64) ---------- */
  /* encodeURIComponent laisse passer ' ! ~ * ( ) : on les échappe aussi pour que
     le code reste un bloc sûr dans un attribut HTML et dans une regex. */
  function enc(v) {
    return encodeURIComponent(v == null ? '' : v)
      .replace(/['!~*()]/g, function (c) { return '%' + c.charCodeAt(0).toString(16).toUpperCase(); });
  }

  var TIER_SHORT = { b: 'T1', a: 'T2', o: 'T3' };

  function encode(d) {
    var parts = [
      d.firstName, d.lastName, d.age, d.rank, d.group, d.occupation, d.money, d.avatar, d.bio,
      (d.moves || []).filter(function (m) { return m && m.name; })
        .map(function (m) { return m.name + ':' + (m.kind === 'CS' ? 'CS' : 'CT'); }).join(';'),
      (d.inventory || []).filter(Boolean).join(';'),
      (d.vestiges || []).join(';'),
      d.motisma
    ];
    return 'DR2|' + parts.map(enc).join('|');
  }

  function decode(str) {
    var raw = String(str || '');
    var code = '';
    /* la valeur exacte de l'attribut d'abord, la recherche brute ensuite */
    try {
      var el = new DOMParser().parseFromString(raw, 'text/html').querySelector('[data-dr]');
      if (el) code = el.getAttribute('data-dr') || '';
    } catch (e) {}
    if (code.indexOf('DR2|') !== 0) {
      var m = raw.match(/DR2\|[^"<>\s]*/);
      code = m ? m[0] : raw.trim();
    }
    if (code.indexOf('DR2|') !== 0) throw new Error('format');
    var p = code.slice(4).split('|');
    if (p.length < 12) throw new Error('incomplet');
    p = p.map(function (x) {
      try { return decodeURIComponent(x); } catch (e) { return x; }
    });
    var mv = (p[9] || '').split(';').filter(Boolean).map(function (s) {
      var i = s.lastIndexOf(':');
      return { name: i > 0 ? s.slice(0, i) : s, kind: s.slice(i + 1) === 'CS' ? 'CS' : 'CT' };
    });
    return {
      firstName: p[0] || '', lastName: p[1] || '', age: p[2] || '',
      rank: RANKS.indexOf(p[3]) >= 0 ? p[3] : 'D',
      group: p[4] || '', occupation: p[5] || '', money: p[6] || '',
      avatar: p[7] || '', bio: p[8] || '',
      moves: mv,
      inventory: (p[10] || '').split(';').filter(Boolean),
      vestiges: (p[11] || '').split(';').filter(Boolean),
      motisma: p[12] || ''
    };
  }

  /* ---------- import des anciennes cartes (code DRESS1: en base64) ---------- */
  var TIER_MAP = { 1: 'b', 2: 'a', 3: 'o' };

  function legacy(str) {
    var raw = String(str || '');
    var code = '';
    try {
      var el = new DOMParser().parseFromString(raw, 'text/html').querySelector('[data-dress]');
      if (el) code = el.getAttribute('data-dress') || '';
    } catch (e) {}
    if (code.indexOf('DRESS1:') !== 0) {
      var m = raw.match(/DRESS1:[A-Za-z0-9+/=]+/);
      if (!m) throw new Error('pas une ancienne carte');
      code = m[0];
    }
    var o = JSON.parse(decodeURIComponent(escape(atob(code.slice(7)))));
    if (!o || typeof o !== 'object') throw new Error('format');

    var V = window.VESTIGES;
    var vest = [];
    (o.talents || []).forEach(function (t) {
      if (!t || !t.name) return;
      var tier = TIER_MAP[t.tier] || 'b';
      if (V && V.get(t.name)) {
        vest.push(t.name);
        V.ancestors(t.name).forEach(function (a) { vest.push(a); });
      } else {
        /* nom absent du nouveau catalogue : conservé tel quel, signalé dans l'éditeur */
        vest.push(t.name + '~' + tier);
      }
    });

    var inv = (o.inventory || []).filter(Boolean);
    var money = '';
    inv = inv.filter(function (it) {
      var m2 = String(it).match(/^\s*([\d\s.]+)\s*(₽|P\$|¥)\s*$/);
      if (m2 && !money) { money = m2[1].replace(/[^\d]/g, ''); return false; }
      return true;
    });

    return {
      firstName: o.firstName || '',
      lastName: o.lastName || '',
      age: o.age || '',
      rank: RANKS.indexOf(o.rank) >= 0 ? o.rank : 'D',
      group: o.group || '',
      occupation: o.occupation || '',
      money: money,
      avatar: o.avatar || '',
      bio: (o.bio === '//' ? '' : (o.bio || '')),
      moves: (o.moves || []).filter(function (m3) { return m3 && m3.name; })
        .map(function (m3) { return { name: m3.name, kind: m3.kind === 'CS' ? 'CS' : 'CT' }; }),
      inventory: inv,
      vestiges: vest,
      motisma: o.motisma || ''
    };
  }

  /* Lit une carte postée : d'abord le code data-dr, sinon relit le HTML lui-même
     (utile si la carte a été éditée à la main ou vient d'une version antérieure). */
  function scanCard(html) {
    try { return decode(html); } catch (e) {}
    try { return legacy(html); } catch (e) {}

    var doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    var root = doc.querySelector('.drs');
    if (!root) throw new Error('introuvable');

    var txt = function (el) { return el ? (el.textContent || '').trim() : ''; };
    var full = txt(root.querySelector('.drs-nm')).split(/\s+/);
    var img = root.querySelector('.drs-por img');

    var facts = {};
    root.querySelectorAll('.drs-f').forEach(function (f) {
      var k = txt(f.querySelector('dt')).toLowerCase();
      var v = txt(f.querySelector('dd'));
      facts[k] = (v === '—') ? '' : v;
    });

    var vest = [];
    root.querySelectorAll('.drs-v').forEach(function (li) {
      var badge = li.querySelector('i');
      var name = (li.textContent || '').replace(badge ? badge.textContent : '', '').trim();
      if (!name) return;
      if (window.VESTIGES && window.VESTIGES.get(name)) {
        vest.push(name);
        /* les paliers inférieurs ne sont pas affichés : on les remet par la chaîne */
        window.VESTIGES.ancestors(name).forEach(function (a) { vest.push(a); });
      } else {
        /* hors catalogue : on récupère son palier par la classe, sinon par le badge */
        var tier = li.className.indexOf('drs-v-o') >= 0 ? 'o'
          : li.className.indexOf('drs-v-a') >= 0 ? 'a'
          : li.className.indexOf('drs-v-b') >= 0 ? 'b'
          : ({ 'or': 'o', 'argent': 'a', 'bronze': 'b' }[(badge ? badge.textContent : '').trim().toLowerCase()] || 'b');
        vest.push(name + '~' + tier);
      }
    });

    var moves = [];
    root.querySelectorAll('.drs-mv li').forEach(function (li) {
      var b = li.querySelector('b');
      var kind = txt(b) === 'CS' ? 'CS' : 'CT';
      var name = (li.textContent || '').replace(b ? b.textContent : '', '').trim();
      if (name) moves.push({ name: name, kind: kind });
    });

    var inventory = [];
    root.querySelectorAll('.drs-inv li').forEach(function (li) {
      var v = txt(li);
      if (v) inventory.push(v);
    });

    var rank = txt(root.querySelector('.drs-rk b')) || 'D';
    var mot = root.querySelector('.drs-mot img');

    return {
      firstName: full[0] || '',
      lastName: full.slice(1).join(' '),
      age: facts['âge'] || facts['age'] || '',
      rank: RANKS.indexOf(rank) >= 0 ? rank : 'D',
      group: facts['groupe'] || '',
      occupation: facts['occupation'] || '',
      money: (facts['argent'] || '').replace(/[^\d]/g, ''),
      avatar: img ? img.getAttribute('src') || '' : '',
      motisma: mot ? mot.getAttribute('src') || '' : '',
      bio: txt(root.querySelector('.drs-bio')),
      moves: moves,
      inventory: inventory,
      vestiges: vest
    };
  }

  /* ---------- HTML forum : classes seules, zéro style en ligne ---------- */
  function buildHTML(d) {
    var V = window.VESTIGES;
    var full = ((d.firstName || '') + ' ' + (d.lastName || '')).trim() || 'Dresseur';
    var rank = d.rank || 'D';

    var portrait = d.avatar
      ? '<img src="' + esc(d.avatar) + '" alt="' + esc(full) + '">'
      : '<div class="drs-ph">portrait</div>';
    function fact(label, val) {
      if (!val) return '';
      return '<div class="drs-f"><dt>' + label + '</dt><dd>' + esc(val) + '</dd></div>';
    }

    var factRows = fact('Âge', d.age) + fact('Argent', money(d.money)) +
      fact('Groupe', d.group) + fact('Occupation', d.occupation);
    var facts = factRows ? '<dl class="drs-facts">' + factRows + '</dl>' : '';

    /* vestiges : seul le maillon le plus haut de chaque chaîne s'affiche,
       mais les paliers inférieurs restent possédés et comptés. */
    var sel = (d.vestiges || []).filter(function (n) { return V && V.parse(n); });
    var shown = V ? V.visible(sel) : sel;
    var vHTML = '';
    if (shown.length && V) {
      var order = { o: 0, a: 1, b: 2 };
      vHTML = '<ul class="drs-vs' + (shown.length > 12 ? ' drs-scroll' : '') + '">' + shown.slice().sort(function (a, b) {
        var pa = V.parse(a), pb = V.parse(b);
        return (order[pa.tier] - order[pb.tier]) || pa.name.localeCompare(pb.name);
      }).map(function (n) {
        var p = V.parse(n);
        return '<li class="drs-v drs-v-' + p.tier + '">' + esc(p.name) +
          '<i>' + V.tierLabel(p.tier) + '</i></li>';
      }).join('') + '</ul>';
    }

    var counts = V ? V.counts(sel) : { b: 0, a: 0, o: 0 };
    var vHead = sel.length
      ? '<span>' + counts.o + ' or · ' + counts.a + ' argent · ' + counts.b + ' bronze' +
        (shown.length > 12 ? ' · défiler' : '') + '</span>'
      : '';

    var mv = (d.moves || []).filter(function (m) { return m && m.name; });
    var mvHTML = mv.length
      ? '<ul class="drs-mv' + (mv.length > 8 ? ' drs-scroll' : '') + '">' + mv.map(function (m) {
        var cs = m.kind === 'CS';
        return '<li' + (cs ? ' class="drs-cs"' : '') + '><b>' + (cs ? 'CS' : 'CT') + '</b>' + esc(m.name) + '</li>';
      }).join('') + '</ul>'
      : '<p class="drs-empty">Aucune capacité connue.</p>';
    var mvHead = mv.length ? '<span>' + mv.length + (mv.length > 8 ? ' · défiler' : '') + '</span>' : '';

    var inv = (d.inventory || []).filter(Boolean);
    var invHTML = inv.length
      ? '<ul class="drs-inv">' + inv.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>'
      : '<p class="drs-empty">Sac vide.</p>';

    return '<div class="drs" data-dr="' + esc(encode(d)) + '">' +
      '<div class="drs-hd"><span class="drs-htx">' +
      '<span class="drs-kick">Carte de dresseur</span>' +
      '<b class="drs-nm">' + esc(full) + '</b></span>' +
      '<span class="drs-rk"><span>Rang</span><b>' + esc(rank) + '</b></span></div>' +
      '<div class="drs-body">' +
      '<div class="drs-por">' + portrait +
      '<span class="drs-pill">Rang ' + esc(rank) + '</span></div>' +
      '<div class="drs-main">' + facts +
      '<div class="drs-sec"><h4>Vestiges' + vHead + '</h4>' +
      (vHTML || '<p class="drs-empty">Aucun vestige.</p>') + '</div>' +
      '<div class="drs-sec"><h4>CT / CS connues' + mvHead + '</h4>' + mvHTML + '</div>' +
      '</div>' +
      '<div class="drs-wide"><div class="drs-sec" style="margin-top:0"><h4>Inventaire</h4>' + invHTML + '</div></div>' +
      (d.bio ? '<div class="drs-wide"><div class="drs-sec" style="margin-top:0"><h4>Biographie</h4><p class="drs-bio">' + esc(d.bio) + '</p></div></div>' : '') +
      '</div></div>';
  }

  window.DRESSEUR = {
    RANKS: RANKS, DEFAULT: DEFAULT, clone: clone, esc: esc, money: money,
    encode: encode, decode: decode, legacy: legacy, scanCard: scanCard, buildHTML: buildHTML
  };
})();
