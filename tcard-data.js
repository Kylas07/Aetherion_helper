/* Shared data + helpers for the Pokémon T-card editor.
   Exposes everything on window.TCARD (loaded as a plain <script> in each DC's helmet). */
(function () {
  const TYPE = {
    'Normal': '#9FA39B', 'Feu': '#E84C3D', 'Eau': '#3C8FE0', 'Plante': '#4BAE4F',
    'Électrik': '#F2C94C', 'Glace': '#56CCE0', 'Combat': '#E0762B', 'Poison': '#A052C8',
    'Sol': '#C08A3E', 'Vol': '#88AEE8', 'Psy': '#EC5C8E', 'Insecte': '#9AAB2A',
    'Roche': '#BBA968', 'Spectre': '#6E5A9B', 'Dragon': '#5763E0', 'Ténèbres': '#4E4A57',
    'Acier': '#6BA7B8', 'Fée': '#EE8FCB'
  };
  const TYPE_LIST = Object.keys(TYPE);

  const BALLS = {
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
    'Honneur Ball': { top: '#8C6239', band: '#D4AF37' }
  };
  const BALL_LIST = Object.keys(BALLS);

  const GENDERS = ['♂', '♀', '⚲'];

  const NATURES = ['Hardi', 'Solo', 'Rigide', 'Mauvais', 'Brave', 'Assuré', 'Docile',
    'Malin', 'Lâche', 'Relax', 'Foufou', 'Modeste', 'Doux', 'Discret', 'Bizarre',
    'Calme', 'Gentil', 'Prudent', 'Pressé', 'Timide', 'Jovial', 'Naïf', 'Sérieux'];

  const ACCENTS = ['#C25C3A', '#E07A4E', '#B0492B', '#8A8F98', '#D98C3F', '#5E6B78'];

  function typeColor(t) { return TYPE[t] || '#9AA2B0'; }
  function ballColors(name) { return BALLS[name] || { top: '#EE1515', band: '#1A1A1A' }; }
  function genderColor(g) { return g === '♂' ? '#2F7BE6' : g === '♀' ? '#E84B96' : '#9AA2B0'; }

  function blankMember() {
    return {
      sprite: '', nickname: '', species: 'Nouveau Pokémon', types: ['Normal'],
      level: 5, gender: '♂', ballName: 'Poké Ball', talent: '', nature: 'Sérieux',
      moves: [
        { name: 'Charge', type: 'Normal', pp: 35 },
        { name: '', type: 'Normal', pp: 0 },
        { name: '', type: 'Normal', pp: 0 },
        { name: '', type: 'Normal', pp: 0 }
      ],
      desc: ''
    };
  }

  const DEFAULT_DATA = {
    trainerName: 'Kalei',
    accent: '#C25C3A',
    motisma: '',
    showNicknames: true,
    team: [
        {
            sprite: 'https://i.imgur.com/6dKxzuE.gif', nickname: 'Suchi', species: 'Nigirigon', types: ['Dragon', 'Eau'], level: 5, gender: '♂', ballName: 'Luxe Ball', talent: 'Commandant', nature: 'Assuré',
        moves: [{ name: 'Trempette', type: 'normal',}, { name: 'Pistolet à O', type: 'Eau',}, { name: 'Armure', type: 'Normal', pp: 5 }],
        desc: "Suchi est un Sushi" },
        {
            sprite: 'https://i.imgur.com/Y3mHM9W.gif', nickname: 'Niguiri', species: 'Nigirigon', types: ['Dragon', 'Eau'], level: 5, gender: '♂', ballName: 'Soin Ball', talent: 'Lavabo', nature: 'Modeste',
        moves: [{ name: 'Trempette', type: 'normal', }, { name: 'Pistolet à O', type: 'Eau', }, { name: 'Armure', type: 'Normal', pp: 5 }],
        desc: "Niguiri est un Nigiri" },
        {
            sprite: 'https://i.imgur.com/idycgn8.gif', nickname: 'Jimbap', species: 'Nigirigon', types: ['Dragon', 'Eau'], level: 5, gender: '♂', ballName: 'Hyper Ball', talent: 'Lavabo', nature: 'Pressé',
        moves: [{ name: 'Trempette', type: 'normal', }, { name: 'Pistolet à O', type: 'Eau', }, { name: 'Armure', type: 'Normal', pp: 5 }],
        desc: "Jimbap est un Kimbap" }
    ]
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function encodeCard(data) {
    const json = JSON.stringify(data);
    return 'TCARD1:' + btoa(unescape(encodeURIComponent(json)));
  }
  function decodeCard(str) {
    let s = (str || '').trim().replace(/\s+/g, '');
    s = s.replace(/^TCARD1:/, '');
    const json = decodeURIComponent(escape(atob(s)));
    const data = JSON.parse(json);
    if (!data || !Array.isArray(data.team)) throw new Error('format');
    return data;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ===== AETHERION theme (dark charcoal + burnt orange) ===== */
  const THEME = {
    card: '#211D1A', header: '#15110E',
    inset: 'rgba(255,255,255,.045)', insetBorder: 'rgba(232,210,190,.10)',
    border: 'rgba(232,210,190,.13)',
    head: '#ECE5DC', body: '#B4ABA0', muted: '#857C70',
    accent: '#C25C3A', accentBright: '#E07A4E',
    disp: "'Oswald','Arial Narrow','Haettenschweiler',Verdana,sans-serif",
    bodyFont: "'Barlow',Verdana,Geneva,sans-serif",
    shadow: '0 26px 60px -26px rgba(0,0,0,.78)',
    stripe: 'repeating-linear-gradient(45deg,#2A2521 0 7px,#302A25 7px 14px)'
  };
  function motismaBadge(url, size) {
    size = size || 44;
    const inner = url
      ? '<img src="' + esc(url) + '" alt="" style="width:100%;height:100%;object-fit:contain;image-rendering:pixelated;">'
      : '<span style="font-family:' + THEME.disp + ';font-size:' + Math.round(size * 0.19) + 'px;letter-spacing:.5px;text-transform:uppercase;color:' + THEME.accent + ';font-weight:600;line-height:.95;text-align:center;">Motisma</span>';
    return '<span style="position:relative;width:' + size + 'px;height:' + size + 'px;flex:none;display:inline-flex;align-items:center;justify-content:center;">' +
      '<span style="position:absolute;inset:0;border-radius:50%;border:1.5px dashed ' + THEME.accent + ';opacity:.8;"></span>' +
      '<span style="position:absolute;inset:4px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.32);">' + inner + '</span></span>';
  }

  function buildForumHTML(d, openFirst) {
    const accent = d.accent || THEME.accent;
    const showNick = d.showNicknames !== false;
    const trainer = esc(d.trainerName || 'Dresseur');

    const stripe = THEME.stripe;

    function spriteBox(p, size, label) {
      if (p.sprite) {
        return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:' + (size > 80 ? 16 : 12) + 'px;background:#15110E;border:1px solid ' + THEME.border + ';display:flex;align-items:center;justify-content:center;overflow:hidden;flex:none;">' +
          '<img src="' + esc(p.sprite) + '" alt="" style="max-width:100%;max-height:100%;object-fit:contain;image-rendering:pixelated;"></div>';
      }
      return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:' + (size > 80 ? 16 : 12) + 'px;background:' + stripe + ';border:1px solid ' + THEME.border + ';display:flex;align-items:center;justify-content:center;flex:none;">' +
        (label ? '<span style="font-family:monospace;font-size:10px;color:' + THEME.muted + ';">[ sprite ]</span>' : '') + '</div>';
    }

    function ballEl(p) {
      const bc = ballColors(p.ballName);
      return '<span style="position:relative;width:18px;height:18px;border-radius:50%;border:1.5px solid #0E0C0A;overflow:hidden;display:inline-block;background:#fff;flex:none;box-shadow:0 2px 5px rgba(0,0,0,.5);">' +
        '<span style="position:absolute;top:0;left:0;right:0;height:50%;background:' + bc.top + ';"></span>' +
        '<span style="position:absolute;top:50%;left:0;right:0;height:2px;transform:translateY(-50%);background:' + bc.band + ';"></span>' +
        '<span style="position:absolute;top:50%;left:50%;width:6px;height:6px;transform:translate(-50%,-50%);border-radius:50%;background:#fff;border:1.5px solid #0E0C0A;"></span></span>';
    }

    function typeChip(t, big) {
      return '<span style="background:' + typeColor(t) + ';color:#fff;font-size:' + (big ? 11 : 10.5) + 'px;font-weight:700;padding:' + (big ? '4px 11px' : '3px 9px') + ';border-radius:6px;letter-spacing:.3px;">' + esc(t) + '</span>';
    }

    const rows = d.team.map(function (p, _i) {
      const display = esc(showNick ? (p.nickname || p.species) : p.species);
      const sub = showNick ? esc(p.species) : '';
      const meta = (sub ? sub + ' · ' : '') + 'Niv. ' + esc(p.level);
      const gcol = genderColor(p.gender);
      const typesSmall = (p.types || []).map(function (t) { return typeChip(t, false); }).join('');
      const typesBig = (p.types || []).map(function (t) { return typeChip(t, true); }).join('');
      const moves = (p.moves || []).filter(function (m) { return m.name; }).map(function (m) {
        return '<div style="display:flex;align-items:center;gap:9px;background:' + THEME.inset + ';border:1px solid ' + THEME.insetBorder + ';border-radius:8px;padding:8px 10px;">' +
          '<span style="width:4px;align-self:stretch;border-radius:4px;background:' + typeColor(m.type) + ';"></span>' +
          '<div style="flex:1;min-width:0;"><div style="font-weight:600;font-size:12.5px;color:' + THEME.head + ';">' + esc(m.name) + '</div>' +
          '<div style="font-size:10.5px;color:' + THEME.muted + ';">' + esc(m.type) + '</div></div></div>';
      }).join('');

      return '<details' + (openFirst && _i === 0 ? ' open' : '') + ' style="border-top:1px solid ' + THEME.border + ';">' +
        '<summary style="list-style:none;display:flex;align-items:center;gap:14px;padding:12px 16px;cursor:pointer;">' +
          '<span style="position:relative;flex:none;">' + spriteBox(p, 54, false) +
            '<span style="position:absolute;bottom:-4px;left:-4px;">' + ballEl(p) + '</span></span>' +
          '<span style="flex:1;min-width:0;"><span style="display:flex;align-items:center;gap:7px;">' +
            '<b style="font-family:' + THEME.disp + ';font-weight:600;font-size:18px;letter-spacing:.3px;color:' + THEME.head + ';">' + display + '</b>' +
            '<span style="font-weight:700;font-size:15px;color:' + gcol + ';">' + esc(p.gender) + '</span></span>' +
            '<span style="display:block;font-size:12px;color:' + THEME.muted + ';margin-top:1px;">' + meta + '</span></span>' +
          '<span style="display:flex;gap:5px;flex:none;">' + typesSmall + '</span>' +
        '</summary>' +
        '<div style="padding:2px 16px 20px 16px;">' +
          '<div style="display:flex;gap:18px;flex-wrap:wrap;">' +
            '<div style="flex:none;">' + spriteBox(p, 148, true) +
              '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;">' + typesBig + '</div>' +
              '<div style="margin-top:12px;font-size:11.5px;color:' + THEME.muted + ';line-height:1.7;">' +
                'Capturé en <b style="color:' + THEME.body + ';">' + esc(p.ballName) + '</b><br>Dresseur : <b style="color:' + THEME.body + ';">' + trainer + '</b></div></div>' +
            '<div style="flex:1;min-width:240px;">' +
              '<div style="display:flex;gap:10px;margin-bottom:14px;">' +
                '<div style="flex:1;background:' + THEME.inset + ';border:1px solid ' + THEME.insetBorder + ';border-radius:10px;padding:9px 12px;"><div style="font-size:9.5px;letter-spacing:1.4px;text-transform:uppercase;color:' + THEME.muted + ';font-weight:700;">Talent</div><div style="font-size:14px;font-weight:600;color:' + THEME.head + ';margin-top:3px;">' + esc(p.talent || '—') + '</div></div>' +
                '<div style="flex:1;background:' + THEME.inset + ';border:1px solid ' + THEME.insetBorder + ';border-radius:10px;padding:9px 12px;"><div style="font-size:9.5px;letter-spacing:1.4px;text-transform:uppercase;color:' + THEME.muted + ';font-weight:700;">Nature</div><div style="font-size:14px;font-weight:600;color:' + THEME.head + ';margin-top:3px;">' + esc(p.nature || '—') + '</div></div></div>' +
              '<div style="font-size:9.5px;letter-spacing:1.4px;text-transform:uppercase;color:' + THEME.muted + ';font-weight:700;display:flex;align-items:center;gap:8px;margin-bottom:9px;"><span>Capacités</span><span style="flex:1;height:1px;background:' + accent + ';opacity:.6;"></span></div>' +
              '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' + moves + '</div>' +
              (p.desc ? '<div style="margin-top:14px;padding-top:12px;border-top:1px dashed ' + THEME.border + ';"><div style="font-size:9.5px;letter-spacing:1.4px;text-transform:uppercase;color:' + THEME.muted + ';font-weight:700;margin-bottom:5px;">Résumé</div><p style="margin:0;font-size:13px;line-height:1.55;color:' + THEME.body + ';font-style:italic;">' + esc(p.desc) + '</p></div>' : '') +
            '</div></div></div>' +
        '</details>';
    }).join('');

    return '<div class="tcard" style="width:650px;max-width:100%;margin:0 auto;font-family:' + THEME.bodyFont + ';background:' + THEME.card + ';border-radius:16px;overflow:hidden;border:1px solid ' + THEME.border + ';box-shadow:' + THEME.shadow + ';">' +
      '<style>.tcard details>summary::-webkit-details-marker{display:none}.tcard details>summary{list-style:none}</style>' +
      '<div style="background:' + THEME.header + ';padding:16px 20px;display:flex;align-items:center;gap:14px;border-bottom:1px solid ' + THEME.border + ';">' +
        motismaBadge(d.motisma, 46) +
        '<span style="flex:1;min-width:0;line-height:1.04;"><span style="display:block;font-family:' + THEME.disp + ';font-size:11px;letter-spacing:3px;text-transform:uppercase;color:' + accent + ';font-weight:600;">Équipe Pokémon</span>' +
        '<span style="display:block;font-family:' + THEME.disp + ';font-size:25px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:' + THEME.head + ';margin-top:1px;">' + trainer + '</span></span>' +
        '<span style="font-family:' + THEME.disp + ';background:rgba(255,255,255,.06);border:1px solid ' + THEME.border + ';border-radius:7px;padding:5px 13px;font-size:14px;font-weight:600;letter-spacing:1px;color:' + THEME.body + ';flex:none;">' + d.team.length + ' / 6</span>' +
      '</div>' + rows + '</div>';
  }

  /* ================= PC (storage box) ================= */
  const THEMES = ['#C25C3A', '#E07A4E', '#B0492B', '#8A8F98', '#D98C3F', '#5E6B78'];

  function blankMon() {
    return { sprite: '', nickname: '', species: 'Pokémon', level: 5, types: ['Normal'], ball: 'Poké Ball', gender: '♂' };
  }

  const DEFAULT_PC = (function () {
    const mons = [
      { sprite: '', nickname: '', species: 'Bulbizarre', level: 12, types: ['Plante', 'Poison'], ball: 'Poké Ball', gender: '♂' },
      { sprite: '', nickname: '', species: 'Salamèche', level: 14, types: ['Feu'], ball: 'Poké Ball', gender: '♂' },
      { sprite: '', nickname: '', species: 'Carapuce', level: 13, types: ['Eau'], ball: 'Poké Ball', gender: '♂' },
      { sprite: '', nickname: 'Sparky', species: 'Pikachu', level: 16, types: ['Électrik'], ball: 'Faiblo Ball', gender: '♀' },
      { sprite: '', nickname: '', species: 'Rondoudou', level: 11, types: ['Normal', 'Fée'], ball: 'Soin Ball', gender: '♀' },
      { sprite: '', nickname: '', species: 'Évoli', level: 15, types: ['Normal'], ball: 'Super Ball', gender: '♂' },
      { sprite: '', nickname: '', species: 'Magicarpe', level: 8, types: ['Eau'], ball: 'Filet Ball', gender: '♂' },
      { sprite: '', nickname: '', species: 'Chenipan', level: 6, types: ['Insecte'], ball: 'Poké Ball', gender: '♂' },
      { sprite: '', nickname: '', species: 'Roucool', level: 13, types: ['Normal', 'Vol'], ball: 'Super Ball', gender: '♀' },
      { sprite: '', nickname: '', species: 'Nidoran', level: 12, types: ['Poison'], ball: 'Hyper Ball', gender: '♀' }
    ];
    const slots = [];
    for (let i = 0; i < 30; i++) slots.push(mons[i] || null);
    return { owner: 'Sacha', boxName: 'Boîte 1 — Captures', theme: '#C25C3A', motisma: '', mons: slots };
  })();

  function encodePC(d) {
    return 'PCBOX1:' + btoa(unescape(encodeURIComponent(JSON.stringify(d))));
  }
  function decodePC(str) {
    let s = (str || '').trim().replace(/\s+/g, '').replace(/^PCBOX1:/, '');
    const data = JSON.parse(decodeURIComponent(escape(atob(s))));
    if (!data || !Array.isArray(data.mons)) throw new Error('format');
    return data;
  }

  function buildPcForumHTML(d) {
    const theme = d.theme || THEME.accent;
    const owner = esc(d.owner || 'Dresseur');
    const boxName = esc(d.boxName || 'Boîte 1');
    const mons = d.mons || [];
    const total = mons.filter(Boolean).length;
    const stripe = THEME.stripe;

    function ballEl(p, size) {
      const bc = ballColors(p.ball);
      const s = size || 15;
      return '<span style="position:relative;width:' + s + 'px;height:' + s + 'px;border-radius:50%;border:1.5px solid #0E0C0A;overflow:hidden;display:inline-block;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.6);">' +
        '<span style="position:absolute;top:0;left:0;right:0;height:50%;background:' + bc.top + ';"></span>' +
        '<span style="position:absolute;top:50%;left:0;right:0;height:1.5px;transform:translateY(-50%);background:' + bc.band + ';"></span>' +
        '<span style="position:absolute;top:50%;left:50%;width:' + (s * 0.3) + 'px;height:' + (s * 0.3) + 'px;transform:translate(-50%,-50%);border-radius:50%;background:#fff;border:1px solid #0E0C0A;"></span></span>';
    }
    function spriteFill(p, big) {
      if (p.sprite) return '<img src="' + esc(p.sprite) + '" alt="" style="max-width:100%;max-height:100%;object-fit:contain;image-rendering:pixelated;">';
      const init = esc((p.species || '?').charAt(0));
      return '<span style="font-family:' + THEME.disp + ';font-weight:600;font-size:' + (big ? 30 : 18) + 'px;color:' + THEME.muted + ';">' + init + '</span>';
    }
    function typeChip(t) {
      return '<span style="background:' + typeColor(t) + ';color:#fff;font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;">' + esc(t) + '</span>';
    }

    let cells = '';
    for (let i = 0; i < 30; i++) {
      const p = mons[i];
      if (!p) {
        cells += '<div style="aspect-ratio:1;border:1px dashed ' + THEME.border + ';border-radius:10px;background:rgba(255,255,255,.02);"></div>';
        continue;
      }
      const name = esc(p.nickname || p.species);
      const gcol = genderColor(p.gender);
      const gsym = (p.gender && p.gender !== '⚲') ? '<span style="position:absolute;top:3px;right:4px;font-size:11px;font-weight:700;color:' + gcol + ';">' + esc(p.gender) + '</span>' : '';
      const types = (p.types || []).map(typeChip).join('');
      cells +=
        '<div class="cell" style="position:relative;">' +
          '<details>' +
            '<summary style="display:block;position:relative;aspect-ratio:1;border-radius:10px;border:1px solid ' + THEME.border + ';background:#1A1613;overflow:hidden;cursor:pointer;">' +
              '<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:' + (p.sprite ? '#15110E' : stripe) + ';">' + spriteFill(p, false) + '</span>' +
              '<span style="position:absolute;bottom:3px;left:3px;">' + ballEl(p, 15) + '</span>' + gsym +
              '<span class="cap" style="position:absolute;left:0;right:0;bottom:0;padding:9px 4px 4px;background:linear-gradient(to top,rgba(10,8,6,.94),rgba(10,8,6,0));color:' + THEME.head + ';font-size:9px;font-weight:700;line-height:1.2;text-align:center;">' + name + '<br>Niv ' + esc(p.level) + '</span>' +
            '</summary>' +
            '<div style="position:absolute;top:calc(100% + 6px);left:50%;transform:translateX(-50%);width:210px;max-width:64vw;background:' + THEME.card + ';border:1px solid ' + THEME.border + ';border-radius:13px;box-shadow:' + THEME.shadow + ';padding:12px;z-index:30;">' +
              '<div style="display:flex;gap:11px;align-items:center;">' +
                '<div style="width:64px;height:64px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;overflow:hidden;background:' + (p.sprite ? '#15110E' : stripe) + ';border:1px solid ' + THEME.border + ';">' + spriteFill(p, true) + '</div>' +
                '<div style="min-width:0;"><div style="display:flex;align-items:center;gap:6px;"><b style="font-family:' + THEME.disp + ';font-size:16px;font-weight:600;letter-spacing:.3px;color:' + THEME.head + ';">' + name + '</b><span style="font-weight:700;font-size:13px;color:' + gcol + ';">' + esc(p.gender || '') + '</span></div>' +
                '<div style="font-size:11.5px;color:' + THEME.muted + ';margin-top:1px;">' + esc(p.species) + ' · Niv ' + esc(p.level) + '</div>' +
                '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:7px;">' + types + '</div></div>' +
              '</div>' +
              '<div style="margin-top:10px;padding-top:9px;border-top:1px dashed ' + THEME.border + ';display:flex;align-items:center;gap:7px;font-size:11.5px;color:' + THEME.muted + ';">' + ballEl(p, 15) + ' Capturé en <b style="color:' + THEME.body + ';">' + esc(p.ball) + '</b></div>' +
            '</div>' +
          '</details>' +
        '</div>';
    }

    return '<div class="pcbox" style="width:650px;max-width:100%;margin:0 auto;font-family:' + THEME.bodyFont + ';background:' + THEME.card + ';border-radius:16px;overflow:visible;border:1px solid ' + THEME.border + ';box-shadow:' + THEME.shadow + ';">' +
      '<style>.pcbox details>summary::-webkit-details-marker{display:none}.pcbox details>summary{list-style:none}.pcbox .cap{opacity:0;transition:opacity .15s}.pcbox .cell:hover .cap{opacity:1}.pcbox details[open] .cap{opacity:0}.pcbox details[open]>summary{box-shadow:0 0 0 2px ' + theme + ';border-radius:10px}</style>' +
      '<div style="background:' + THEME.header + ';padding:15px 20px;display:flex;align-items:center;gap:13px;border-bottom:1px solid ' + THEME.border + ';border-radius:16px 16px 0 0;">' +
        motismaBadge(d.motisma, 44) +
        '<span style="flex:1;min-width:0;line-height:1.04;"><span style="display:block;font-family:' + THEME.disp + ';font-size:10.5px;letter-spacing:3px;text-transform:uppercase;color:' + theme + ';font-weight:600;">PC · ' + owner + '</span>' +
        '<span style="display:block;font-family:' + THEME.disp + ';font-size:22px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:' + THEME.head + ';margin-top:1px;">' + boxName + '</span></span>' +
        '<span style="font-family:' + THEME.disp + ';background:rgba(255,255,255,.06);border:1px solid ' + THEME.border + ';border-radius:7px;padding:5px 12px;font-size:13px;font-weight:600;letter-spacing:1px;color:' + THEME.body + ';flex:none;">' + total + ' / 30</span>' +
      '</div>' +
      '<div style="padding:16px;background:rgba(0,0,0,.18);border-radius:0 0 16px 16px;">' +
        '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;">' + cells + '</div>' +
        '<div style="margin-top:11px;font-size:11px;color:' + THEME.muted + ';text-align:center;letter-spacing:.3px;">Clique un Pokémon pour voir sa fiche</div>' +
      '</div></div>';
  }

  /* ================= TRAINER CARD ================= */
  const RANKS = ['D', 'C', 'B', 'A', 'S'];
  const RANK_COLOR = { D: '#9AA2B0', C: '#4BAE4F', B: '#3C8FE0', A: '#A052C8', S: '#E0A92B' };
  function rankColor(r) { return RANK_COLOR[r] || '#9AA2B0'; }
  const TIER_COLOR = { 1: '#C58B4E', 2: '#8C97A6', 3: '#E0A92B' };
  function tierColor(t) { return TIER_COLOR[t] || '#8C97A6'; }

  function blankTalent() { return { name: '', tier: 1 }; }

  const DEFAULT_TRAINER = {
    avatar: '',
    firstName: 'Élise',
    lastName: 'Veren',
    group: 'Team Aurore',
    occupation: 'Dresseuse · Chercheuse de terrain',
    rank: 'B',
    accent: '#C25C3A',
    motisma: '',
    inventory: ['Pokédex régional', 'Vélo de course', 'Carte de la région', 'Set de Potions', '5 000 ₽'],
    moves: [
      { name: 'Coupe', kind: 'CS' },
      { name: 'Surf', kind: 'CS' },
      { name: 'Force', kind: 'CS' },
      { name: 'Lance-Flammes', kind: 'CT' },
      { name: 'Vibrobscur', kind: 'CT' }
    ],
    talents: [
      { name: 'Botanique', tier: 3 },
      { name: 'Survie en forêt', tier: 2 },
      { name: 'Premiers soins', tier: 2 },
      { name: 'Escalade', tier: 1 },
      { name: 'Cuisine', tier: 1 },
      { name: 'Négociation', tier: 2 }
    ],
    bio: "Partie de Bourg-Palette pour cartographier la flore Pokémon, Élise note tout dans son carnet. Curieuse et tenace, elle préfère observer avant d'attraper."
  };

  function encodeTrainer(d) { return 'DRESS1:' + btoa(unescape(encodeURIComponent(JSON.stringify(d)))); }
  function decodeTrainer(str) {
    let s = (str || '').trim().replace(/\s+/g, '').replace(/^DRESS1:/, '');
    const data = JSON.parse(decodeURIComponent(escape(atob(s))));
    if (!data || typeof data !== 'object') throw new Error('format');
    return data;
  }

  function buildTrainerForumHTML(d) {
    const accent = d.accent || THEME.accent;
    const fullName = esc(((d.firstName || '') + ' ' + (d.lastName || '')).trim() || 'Dresseur');
    const rank = d.rank || 'D';
    const rc = rankColor(rank);
    const stripe = THEME.stripe;

    const avatar = d.avatar
      ? '<img src="' + esc(d.avatar) + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block;">'
      : '<div style="width:100%;height:100%;background:' + stripe + ';display:flex;align-items:center;justify-content:center;"><span style="font-family:monospace;font-size:11px;color:' + THEME.muted + ';">250 × 350</span></div>';

    function fieldRow(label, val) {
      return '<div style="display:flex;flex-direction:column;gap:2px;"><span style="font-size:9.5px;letter-spacing:1.4px;text-transform:uppercase;color:' + THEME.muted + ';font-weight:700;">' + label + '</span>' +
        '<span style="font-size:14px;font-weight:600;color:' + THEME.head + ';">' + esc(val || '—') + '</span></div>';
    }

    const talents = (d.talents || []).filter(function (t) { return t && t.name; }).map(function (t) {
      const tc = tierColor(t.tier);
      return '<span style="display:inline-flex;align-items:center;gap:6px;background:' + THEME.inset + ';border:1px solid ' + THEME.insetBorder + ';border-radius:7px;padding:4px 6px 4px 11px;font-size:12px;font-weight:600;color:' + THEME.body + ';">' +
        esc(t.name) +
        '<span style="background:' + tc + ';color:#15110E;font-size:10px;font-weight:800;padding:2px 7px;border-radius:5px;letter-spacing:.3px;">T' + esc(t.tier) + '</span></span>';
    }).join('');

    const inv = (d.inventory || []).filter(Boolean).map(function (it) {
      return '<li style="display:flex;align-items:center;gap:8px;font-size:13px;color:' + THEME.body + ';padding:4px 0;">' +
        '<span style="width:5px;height:5px;border-radius:50%;background:' + accent + ';flex:none;"></span>' + esc(it) + '</li>';
    }).join('');

    const moves = (d.moves || []).filter(function (m) { return m && m.name; }).map(function (m) {
      const isCS = (m.kind === 'CS');
      const col = isCS ? '#A052C8' : '#3C8FE0';
      return '<span style="display:inline-flex;align-items:center;gap:6px;background:' + THEME.inset + ';border:1px solid ' + THEME.insetBorder + ';border-radius:7px;padding:5px 10px;font-size:12.5px;font-weight:600;color:' + THEME.body + ';">' +
        '<span style="background:' + col + ';color:#fff;font-size:9.5px;font-weight:800;padding:2px 6px;border-radius:4px;">' + esc(m.kind || 'CT') + '</span>' + esc(m.name) + '</span>';
    }).join('');

    const bio = d.bio ? '<div style="margin-top:14px;padding-top:13px;border-top:1px dashed ' + THEME.border + ';"><div style="font-size:9.5px;letter-spacing:1.4px;text-transform:uppercase;color:' + THEME.muted + ';font-weight:700;margin-bottom:5px;">Biographie</div><p style="margin:0;font-size:13px;line-height:1.55;color:' + THEME.body + ';font-style:italic;">' + esc(d.bio) + '</p></div>' : '';

    return '<div style="width:650px;max-width:100%;margin:0 auto;font-family:' + THEME.bodyFont + ';background:' + THEME.card + ';border-radius:16px;overflow:hidden;border:1px solid ' + THEME.border + ';box-shadow:' + THEME.shadow + ';">' +
      '<div style="background:' + THEME.header + ';padding:15px 20px;display:flex;align-items:center;gap:13px;border-bottom:1px solid ' + THEME.border + ';">' +
        motismaBadge(d.motisma, 44) +
        '<span style="flex:1;min-width:0;line-height:1.04;"><span style="display:block;font-family:' + THEME.disp + ';font-size:10.5px;letter-spacing:3px;text-transform:uppercase;color:' + accent + ';font-weight:600;">Carte de Dresseur</span>' +
        '<span style="display:block;font-family:' + THEME.disp + ';font-size:23px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:' + THEME.head + ';margin-top:1px;">' + fullName + '</span></span>' +
        '<span style="display:flex;flex-direction:column;align-items:center;background:' + rc + '24;border:1px solid ' + rc + '66;border-radius:9px;padding:4px 13px;flex:none;line-height:1;"><span style="font-family:' + THEME.disp + ';font-size:8.5px;letter-spacing:1.5px;text-transform:uppercase;color:' + THEME.muted + ';font-weight:600;">Rang</span><span style="font-family:' + THEME.disp + ';font-size:23px;font-weight:700;color:' + rc + ';">' + esc(rank) + '</span></span>' +
      '</div>' +
      '<div style="padding:20px;display:flex;gap:20px;flex-wrap:wrap;">' +
        '<div style="flex:none;"><div style="width:250px;max-width:100%;aspect-ratio:250/350;border-radius:12px;overflow:hidden;border:1px solid ' + THEME.border + ';box-shadow:0 12px 28px -16px rgba(0,0,0,.7);">' + avatar + '</div>' +
          '<div style="margin-top:10px;display:inline-flex;align-items:center;gap:7px;background:' + rc + '1F;border:1px solid ' + rc + '55;border-radius:7px;padding:5px 12px;"><span style="width:9px;height:9px;border-radius:50%;background:' + rc + ';"></span><span style="font-size:12px;font-weight:700;color:' + rc + ';">Rang ' + esc(rank) + '</span></div></div>' +
        '<div style="flex:1;min-width:240px;display:flex;flex-direction:column;gap:13px;">' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:13px;">' + fieldRow('Groupe', d.group) + fieldRow('Occupation', d.occupation) + '</div>' +
          '<div><div style="font-size:9.5px;letter-spacing:1.4px;text-transform:uppercase;color:' + THEME.muted + ';font-weight:700;display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span>Talents</span><span style="flex:1;height:1px;background:' + accent + ';opacity:.6;"></span></div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;">' + (talents || '<span style="font-size:12px;color:' + THEME.muted + ';">Aucun talent</span>') + '</div></div>' +
          '<div><div style="font-size:9.5px;letter-spacing:1.4px;text-transform:uppercase;color:' + THEME.muted + ';font-weight:700;margin-bottom:8px;">CT / CS connues</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;">' + (moves || '<span style="font-size:12px;color:' + THEME.muted + ';">Aucune</span>') + '</div></div>' +
        '</div>' +
        '<div style="flex:1 1 100%;display:grid;grid-template-columns:1fr;gap:0;">' +
          '<div><div style="font-size:9.5px;letter-spacing:1.4px;text-transform:uppercase;color:' + THEME.muted + ';font-weight:700;margin-bottom:4px;">Inventaire</div>' +
            '<ul style="list-style:none;margin:0;padding:0;columns:2;column-gap:24px;">' + (inv || '<li style="font-size:12px;color:' + THEME.muted + ';">Vide</li>') + '</ul></div>' +
          bio +
        '</div>' +
      '</div></div>';
  }

  window.TCARD = {
    TYPE: TYPE, TYPE_LIST: TYPE_LIST, BALLS: BALLS, BALL_LIST: BALL_LIST,
    GENDERS: GENDERS, NATURES: NATURES, ACCENTS: ACCENTS, THEMES: THEMES,
    RANKS: RANKS, rankColor: rankColor, tierColor: tierColor,
    typeColor: typeColor, ballColors: ballColors, genderColor: genderColor,
    blankMember: blankMember, DEFAULT_DATA: DEFAULT_DATA, clone: clone,
    encodeCard: encodeCard, decodeCard: decodeCard, buildForumHTML: buildForumHTML,
    blankMon: blankMon, DEFAULT_PC: DEFAULT_PC,
    encodePC: encodePC, decodePC: decodePC, buildPcForumHTML: buildPcForumHTML,
    blankTalent: blankTalent, DEFAULT_TRAINER: DEFAULT_TRAINER,
    encodeTrainer: encodeTrainer, decodeTrainer: decodeTrainer, buildTrainerForumHTML: buildTrainerForumHTML
  };
})();
