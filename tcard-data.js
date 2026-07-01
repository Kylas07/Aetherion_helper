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
                { name: 'Charge', type: 'Normal', pp: 35 }
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
                moves: [{ name: 'Trempette', type: 'normal', }, { name: 'Pistolet à O', type: 'Eau', }, { name: 'Armure', type: 'Normal', pp: 5 }],
                desc: "Suchi est un Sushi"
            },
            {
                sprite: 'https://i.imgur.com/Y3mHM9W.gif', nickname: 'Niguiri', species: 'Nigirigon', types: ['Dragon', 'Eau'], level: 5, gender: '♂', ballName: 'Soin Ball', talent: 'Lavabo', nature: 'Modeste',
                moves: [{ name: 'Trempette', type: 'normal', }, { name: 'Pistolet à O', type: 'Eau', }, { name: 'Armure', type: 'Normal', pp: 5 }],
                desc: "Niguiri est un Nigiri"
            },
            {
                sprite: 'https://i.imgur.com/idycgn8.gif', nickname: 'Jimbap', species: 'Nigirigon', types: ['Dragon', 'Eau'], level: 5, gender: '♂', ballName: 'Hyper Ball', talent: 'Lavabo', nature: 'Pressé',
                moves: [{ name: 'Trempette', type: 'normal', }, { name: 'Pistolet à O', type: 'Eau', }, { name: 'Armure', type: 'Normal', pp: 5 }],
                desc: "Jimbap est un Kimbap"
            }
        ]
    };

    function clone(o) { return JSON.parse(JSON.stringify(o)); }

    // Pull an encoded save-code out of any pasted text: the bare code, or the
    // full card HTML that carries the code in its data-* attribute.
    function grab(str, prefix) {
        const raw = String(str || '');
        const m = raw.match(new RegExp(prefix + '([A-Za-z0-9+/=]+)'));
        if (m) return m[1];
        return raw.trim().replace(/\s+/g, '').replace(new RegExp('^' + prefix), '');
    }

    function encodeCard(data) {
        const json = JSON.stringify(data);
        return 'TCARD1:' + btoa(unescape(encodeURIComponent(json)));
    }
    function decodeCard(str) {
        const s = grab(str, 'TCARD1:');
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

    /* ===== AETHERION theme (light card + charcoal header + burnt orange) ===== */
    const THEME = {
        card: '#FFFFFF', header: '#211C18',
        headText: '#FFFFFF', headMuted: '#EDE6DD', headInset: 'rgba(255,255,255,.09)', headBorder: 'rgba(255,255,255,.20)',
        inset: '#F5F1EA', insetBorder: '#ECE6DD',
        border: '#E7E2DA',
        head: '#26221D', body: '#4E483F', muted: '#948B7F',
        accent: '#C25C3A', accentBright: '#E07A4E',
        disp: "'Oswald','Arial Narrow','Haettenschweiler',Verdana,sans-serif",
        bodyFont: "'Barlow',Verdana,Geneva,sans-serif",
        shadow: '0 18px 44px -22px rgba(45,38,30,.38)',
        stripe: 'repeating-linear-gradient(45deg,#F0ECE4 0 7px,#E7E1D8 7px 14px)',
        spriteBg: '#FBFAF7'
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

    // One shared stylesheet, scoped under .tc, injected once per card instead of
    // repeating the same declarations inline on every element. Only the truly
    // per-item colours (types, ball, gender, accent) stay inline.
    const TC_CSS =
        '.tc{width:650px;max-width:100%;margin:0 auto;font-family:' + THEME.bodyFont + ';background:' + THEME.card + ';border-radius:16px;overflow:hidden;border:1px solid ' + THEME.border + ';box-shadow:' + THEME.shadow + '}' +
        '.tc details>summary::-webkit-details-marker{display:none}.tc details>summary{list-style:none}' +
        '.tc .hd{background:' + THEME.header + ';padding:16px 20px;display:flex;align-items:center;gap:14px;border-bottom:3px solid var(--acc)}' +
        '.tc .htx{flex:1;min-width:0;line-height:1.04}' +
        '.tc .kick{display:block;font-family:' + THEME.disp + ';font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--acc);font-weight:600}' +
        '.tc .nm{display:block;font-family:' + THEME.disp + ';font-size:25px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:' + THEME.headText + ';margin-top:1px}' +
        '.tc .cnt{font-family:' + THEME.disp + ';background:var(--acc);border:none;border-radius:7px;padding:5px 13px;font-size:14px;font-weight:700;letter-spacing:1px;color:#fff;flex:none}' +
        '.tc .row{border-top:1px solid ' + THEME.border + '}' +
        '.tc .sum{display:flex;align-items:center;gap:14px;padding:12px 16px;cursor:pointer}' +
        '.tc .spw{position:relative;flex:none}' +
        '.tc .sb{border:1px solid ' + THEME.border + ';display:flex;align-items:center;justify-content:center;overflow:hidden;flex:none;width:54px;height:54px;border-radius:12px}' +
        '.tc .sb.lg{width:148px;height:148px;border-radius:16px}' +
        '.tc .sb.ph{background:' + THEME.stripe + '}.tc .sb.im{background:' + THEME.spriteBg + '}' +
        '.tc .sb img{max-width:100%;max-height:100%;object-fit:contain;image-rendering:pixelated}' +
        '.tc .phl{font-family:monospace;font-size:10px;color:' + THEME.muted + '}' +
        '.tc .bov{position:absolute;bottom:-4px;left:-4px}' +
        '.tc .ball{position:relative;width:18px;height:18px;border-radius:50%;border:1.5px solid #0E0C0A;overflow:hidden;display:inline-block;background:#fff;flex:none;box-shadow:0 2px 5px rgba(0,0,0,.5)}' +
        '.tc .ball i{position:absolute;left:0;right:0;display:block;font-style:normal}' +
        '.tc .ball .bt{top:0;height:50%;background:var(--bt)}' +
        '.tc .ball .bb{top:50%;height:2px;transform:translateY(-50%);background:var(--bb)}' +
        '.tc .ball .bc{top:50%;left:50%;right:auto;width:6px;height:6px;transform:translate(-50%,-50%);border-radius:50%;background:#fff;border:1.5px solid #0E0C0A}' +
        '.tc .nw{flex:1;min-width:0}.tc .nr{display:flex;align-items:center;gap:7px}' +
        '.tc .disp{font-family:' + THEME.disp + ';font-weight:700;font-size:18px;letter-spacing:.3px;color:var(--acc)}' +
        '.tc .gd{font-weight:700;font-size:15px}' +
        '.tc .meta{display:block;font-size:12px;color:' + THEME.muted + ';margin-top:1px}' +
        '.tc .tys{display:flex;gap:5px;flex:none}' +
        '.tc .ty{color:#fff;font-size:10.5px;font-weight:700;padding:3px 9px;border-radius:6px;letter-spacing:.3px}' +
        '.tc .ty.big{font-size:11px;padding:4px 11px}' +
        '.tc .bd{padding:2px 16px 20px 16px}.tc .cols{display:flex;gap:18px;flex-wrap:wrap}.tc .lft{flex:none}' +
        '.tc .tyb{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}' +
        '.tc .capx{margin-top:12px;font-size:11.5px;color:' + THEME.muted + ';line-height:1.7}.tc .capx b{color:' + THEME.body + '}' +
        '.tc .rgt{flex:1;min-width:240px}.tc .stats{display:flex;gap:10px;margin-bottom:14px}' +
        '.tc .stat{flex:1;background:' + THEME.inset + ';border:1px solid ' + THEME.insetBorder + ';border-radius:10px;padding:9px 12px}' +
        '.tc .stl{font-size:9.5px;letter-spacing:1.4px;text-transform:uppercase;color:' + THEME.muted + ';font-weight:700}' +
        '.tc .stv{font-size:14px;font-weight:600;color:' + THEME.head + ';margin-top:3px}' +
        '.tc .sh{font-size:9.5px;letter-spacing:1.4px;text-transform:uppercase;color:' + THEME.muted + ';font-weight:700;display:flex;align-items:center;gap:8px;margin-bottom:9px}' +
        '.tc .shln{flex:1;height:2px;border-radius:2px;background:var(--acc);opacity:.9}' +
        '.tc .mv{display:grid;grid-template-columns:1fr 1fr;gap:8px}' +
        '.tc .mvi{display:flex;align-items:center;gap:9px;background:' + THEME.inset + ';border:1px solid ' + THEME.insetBorder + ';border-radius:8px;padding:8px 10px}' +
        '.tc .mvbar{width:4px;align-self:stretch;border-radius:4px}.tc .mvx{flex:1;min-width:0}' +
        '.tc .mvn{font-weight:600;font-size:12.5px;color:' + THEME.head + '}.tc .mvt{font-size:10.5px;color:' + THEME.muted + '}' +
        '.tc .dsc{margin-top:14px;padding-top:12px;border-top:1px dashed ' + THEME.border + '}' +
        '.tc .dscl{font-size:9.5px;letter-spacing:1.4px;text-transform:uppercase;color:' + THEME.muted + ';font-weight:700;margin-bottom:5px}' +
        '.tc .dscp{margin:0;font-size:13px;line-height:1.55;color:' + THEME.body + ';font-style:italic}';

    // inlineCss=false → emit only the classes (host TCARD_CSS on the forum yourself).
    function buildForumHTML(d, openFirst, inlineCss) {
        const accent = THEME.accent;
        const withCss = inlineCss !== false;
        const showNick = d.showNicknames !== false;
        const trainer = esc(d.trainerName || 'Dresseur');

        function spriteBox(p, big) {
            if (p.sprite) return '<div class="sb im' + (big ? ' lg' : '') + '"><img src="' + esc(p.sprite) + '" alt=""></div>';
            return '<div class="sb ph' + (big ? ' lg' : '') + '">' + (big ? '<span class="phl">[ sprite ]</span>' : '') + '</div>';
        }
        function ballEl(p) {
            const bc = ballColors(p.ballName);
            return '<span class="ball" style="--bt:' + bc.top + ';--bb:' + bc.band + '"><i class="bt"></i><i class="bb"></i><i class="bc"></i></span>';
        }
        function typeChip(t, big) {
            return '<span class="ty' + (big ? ' big' : '') + '" style="background:' + typeColor(t) + '">' + esc(t) + '</span>';
        }

        const rows = d.team.map(function (p, _i) {
            const display = esc(showNick ? (p.nickname || p.species) : p.species);
            const sub = showNick ? esc(p.species) : '';
            const meta = (sub ? sub + ' · ' : '') + 'Niv. ' + esc(p.level);
            const gcol = genderColor(p.gender);
            const typesSmall = (p.types || []).map(function (t) { return typeChip(t, false); }).join('');
            const typesBig = (p.types || []).map(function (t) { return typeChip(t, true); }).join('');
            const mvArr = (p.moves || []).filter(function (m) { return m.name; });
            const moves = mvArr.map(function (m) {
                return '<div class="mvi"><span class="mvbar" style="background:' + typeColor(m.type) + '"></span>' +
                    '<div class="mvx"><div class="mvn">' + esc(m.name) + '</div><div class="mvt">' + esc(m.type) + '</div></div></div>';
            }).join('');
            const mvWrap = mvArr.length > 4 ? ' style="max-height:168px;overflow-y:auto;padding-right:4px"' : '';

            return '<details class="row"' + (openFirst && _i === 0 ? ' open' : '') + '>' +
                '<summary class="sum">' +
                '<span class="spw">' + spriteBox(p, false) + '<span class="bov">' + ballEl(p) + '</span></span>' +
                '<span class="nw"><span class="nr"><b class="disp">' + display + '</b>' +
                '<span class="gd" style="color:' + gcol + '">' + esc(p.gender) + '</span></span>' +
                '<span class="meta">' + meta + '</span></span>' +
                '<span class="tys">' + typesSmall + '</span>' +
                '</summary>' +
                '<div class="bd"><div class="cols">' +
                '<div class="lft">' + spriteBox(p, true) +
                '<div class="tyb">' + typesBig + '</div>' +
                '<div class="capx">Capturé en <b>' + esc(p.ballName) + '</b><br>Dresseur : <b>' + trainer + '</b></div></div>' +
                '<div class="rgt">' +
                '<div class="stats">' +
                '<div class="stat"><div class="stl">Talent</div><div class="stv">' + esc(p.talent || '—') + '</div></div>' +
                '<div class="stat"><div class="stl">Nature</div><div class="stv">' + esc(p.nature || '—') + '</div></div></div>' +
                '<div class="sh"><span>Capacités</span><span class="shln"></span></div>' +
                '<div class="mv"' + mvWrap + '>' + moves + '</div>' +
                (p.desc ? '<div class="dsc"><div class="dscl">Résumé</div><p class="dscp">' + esc(p.desc) + '</p></div>' : '') +
                '</div></div></div>' +
                '</details>';
        }).join('');

        return '<div class="tc" data-tcard="' + encodeCard(d) + '" style="--acc:' + accent + '">' +
            (withCss ? '<style>' + TC_CSS + '</style>' : '') +
            '<div class="hd">' + motismaBadge(d.motisma, 46) +
            '<span class="htx"><span class="kick">Équipe Pokémon</span><span class="nm">' + trainer + '</span></span>' +
            '<span class="cnt">' + d.team.length + '</span></div>' +
            (d.team.length > 6 ? '<div style="max-height:600px;overflow-y:auto">' + rows + '</div>' : rows) + '</div>';
    }

    /* ================= PC (storage box) ================= */
    const THEMES = ['#C25C3A', '#E07A4E', '#B0492B', '#8A8F98', '#D98C3F', '#5E6B78'];

    function blankMon() {
        return { sprite: '', nickname: '', species: 'Pokémon', level: 5, types: ['Normal'], ball: 'Poké Ball', gender: '♂' };
    }

    const DEFAULT_PC = (function () {
        const mons = [
            { sprite: 'https://i.imgur.com/6dKxzuE.gif', nickname: '', species: 'Nigirigon', level: 12, types: ['Eau', 'Poison'], ball: 'Poké Ball', gender: '♂' },
            { sprite: 'https://i.imgur.com/Y3mHM9W.gif', nickname: '', species: 'Nigirigon', level: 14, types: ['Eau'], ball: 'Poké Ball', gender: '♂' },
            { sprite: 'https://i.imgur.com/idycgn8.gif', nickname: '', species: 'Nigirigon', level: 13, types: ['Eau'], ball: 'Poké Ball', gender: '♂' }
        ];
        const slots = [];
        for (let i = 0; i < 30; i++) slots.push(mons[i] || null);
        return { owner: 'Kalei', boxName: 'Boîte 1 — Captures', theme: '#C25C3A', motisma: '', mons: slots };
    })();

    function encodePC(d) {
        return 'PCBOX1:' + btoa(unescape(encodeURIComponent(JSON.stringify(d))));
    }
    function decodePC(str) {
        const s = grab(str, 'PCBOX1:');
        const data = JSON.parse(decodeURIComponent(escape(atob(s))));
        if (!data || !Array.isArray(data.mons)) throw new Error('format');
        return data;
    }

    function buildPcForumHTML(d) {
        const theme = THEME.accent;
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
                cells += '<div style="aspect-ratio:1;border:1px dashed ' + THEME.border + ';border-radius:10px;background:rgba(0,0,0,.02);"></div>';
                continue;
            }
            const name = esc(p.nickname || p.species);
            const gcol = genderColor(p.gender);
            const gsym = (p.gender && p.gender !== '⚲') ? '<span style="position:absolute;top:3px;right:4px;font-size:11px;font-weight:700;color:' + gcol + ';">' + esc(p.gender) + '</span>' : '';
            const types = (p.types || []).map(typeChip).join('');
            cells +=
                '<div class="cell" style="position:relative;">' +
                '<details>' +
                '<summary style="display:block;position:relative;aspect-ratio:1;border-radius:10px;border:1px solid ' + THEME.border + ';background:#F5F1EA;overflow:hidden;cursor:pointer;">' +
                '<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:' + (p.sprite ? THEME.spriteBg : stripe) + ';">' + spriteFill(p, false) + '</span>' +
                '<span style="position:absolute;bottom:3px;left:3px;">' + ballEl(p, 15) + '</span>' + gsym +
                '<span class="cap" style="position:absolute;left:0;right:0;bottom:0;padding:9px 4px 4px;background:linear-gradient(to top,rgba(10,8,6,.94),rgba(10,8,6,0));color:#fff;font-size:9px;font-weight:700;line-height:1.2;text-align:center;">' + name + '<br>Niv ' + esc(p.level) + '</span>' +
                '</summary>' +
                '<div style="position:absolute;top:calc(100% + 6px);left:50%;transform:translateX(-50%);width:210px;max-width:64vw;background:' + THEME.card + ';border:1px solid ' + THEME.border + ';border-radius:13px;box-shadow:' + THEME.shadow + ';padding:12px;z-index:30;">' +
                '<div style="display:flex;gap:11px;align-items:center;">' +
                '<div style="width:64px;height:64px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;overflow:hidden;background:' + (p.sprite ? THEME.spriteBg : stripe) + ';border:1px solid ' + THEME.border + ';">' + spriteFill(p, true) + '</div>' +
                '<div style="min-width:0;"><div style="display:flex;align-items:center;gap:6px;"><b style="font-family:' + THEME.disp + ';font-size:16px;font-weight:600;letter-spacing:.3px;color:' + THEME.head + ';">' + name + '</b><span style="font-weight:700;font-size:13px;color:' + gcol + ';">' + esc(p.gender || '') + '</span></div>' +
                '<div style="font-size:11.5px;color:' + THEME.muted + ';margin-top:1px;">' + esc(p.species) + ' · Niv ' + esc(p.level) + '</div>' +
                '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:7px;">' + types + '</div></div>' +
                '</div>' +
                '<div style="margin-top:10px;padding-top:9px;border-top:1px dashed ' + THEME.border + ';display:flex;align-items:center;gap:7px;font-size:11.5px;color:' + THEME.muted + ';">' + ballEl(p, 15) + ' Capturé en <b style="color:' + THEME.body + ';">' + esc(p.ball) + '</b></div>' +
                '</div>' +
                '</details>' +
                '</div>';
        }

        return '<div class="pcbox" data-pc="' + encodePC(d) + '" style="width:650px;max-width:100%;margin:0 auto;font-family:' + THEME.bodyFont + ';background:' + THEME.card + ';border-radius:16px;overflow:visible;border:1px solid ' + THEME.border + ';box-shadow:' + THEME.shadow + ';">' +
            '<style>.pcbox details>summary::-webkit-details-marker{display:none}.pcbox details>summary{list-style:none}.pcbox .cap{opacity:0;transition:opacity .15s}.pcbox .cell:hover .cap{opacity:1}.pcbox details[open] .cap{opacity:0}.pcbox details[open]>summary{box-shadow:0 0 0 2px ' + theme + ';border-radius:10px}</style>' +
            '<div style="background:linear-gradient(120deg,' + theme + '24,' + THEME.header + ' 62%);padding:15px 20px;display:flex;align-items:center;gap:13px;border-bottom:3px solid ' + theme + ';border-radius:16px 16px 0 0;">' +
            motismaBadge(d.motisma, 44) +
            '<span style="flex:1;min-width:0;line-height:1.04;"><span style="display:block;font-family:' + THEME.disp + ';font-size:10.5px;letter-spacing:3px;text-transform:uppercase;color:' + theme + ';font-weight:600;">PC · ' + owner + '</span>' +
            '<span style="display:block;font-family:' + THEME.disp + ';font-size:22px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:' + THEME.headText + ';margin-top:1px;">' + boxName + '</span></span>' +
            '<span style="font-family:' + THEME.disp + ';background:' + theme + ';border:none;border-radius:7px;padding:5px 12px;font-size:13px;font-weight:700;letter-spacing:1px;color:#fff;flex:none;">' + total + ' / 30</span>' +
            '</div>' +
            '<div style="padding:16px;background:linear-gradient(180deg,' + theme + '12,#F8F5F0);border-radius:0 0 16px 16px;">' +
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
        avatar: 'https://2img.net/i.imgur.com/r9W0oZf.png',
        firstName: 'Kalei',
        lastName: 'Wu',
        group: 'Un groupe cool',
        occupation: 'Sugar Baby',
        rank: 'S',
        accent: '#C25C3A',
        motisma: '',
        inventory: ['Pokédex régional', 'Vélo de course', 'Carte de la région', 'Master Ball', '999999 ₽'],
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
        bio: "Kalei c'est un gars cool."
    };

    function encodeTrainer(d) { return 'DRESS1:' + btoa(unescape(encodeURIComponent(JSON.stringify(d)))); }
    function decodeTrainer(str) {
        const s = grab(str, 'DRESS1:');
        const data = JSON.parse(decodeURIComponent(escape(atob(s))));
        if (!data || typeof data !== 'object') throw new Error('format');
        return data;
    }

    function buildTrainerForumHTML(d) {
        const accent = THEME.accent;
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

        return '<div class="dress" data-dress="' + encodeTrainer(d) + '" style="width:650px;max-width:100%;margin:0 auto;font-family:' + THEME.bodyFont + ';background:' + THEME.card + ';border-radius:16px;overflow:hidden;border:1px solid ' + THEME.border + ';box-shadow:' + THEME.shadow + ';">' +
            '<div style="background:' + THEME.header + ';padding:15px 20px;display:flex;align-items:center;gap:13px;border-bottom:3px solid ' + accent + ';">' +
            motismaBadge(d.motisma, 44) +
            '<span style="flex:1;min-width:0;line-height:1.04;"><span style="display:block;font-family:' + THEME.disp + ';font-size:10.5px;letter-spacing:3px;text-transform:uppercase;color:' + accent + ';font-weight:600;">Carte de Dresseur</span>' +
            '<span style="display:block;font-family:' + THEME.disp + ';font-size:23px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:' + THEME.headText + ';margin-top:1px;">' + fullName + '</span></span>' +
            '<span style="display:flex;flex-direction:column;align-items:center;background:' + rc + '24;border:1px solid ' + rc + '66;border-radius:9px;padding:4px 13px;flex:none;line-height:1;"><span style="font-family:' + THEME.disp + ';font-size:8.5px;letter-spacing:1.5px;text-transform:uppercase;color:' + THEME.headMuted + ';font-weight:600;">Rang</span><span style="font-family:' + THEME.disp + ';font-size:23px;font-weight:700;color:' + rc + ';">' + esc(rank) + '</span></span>' +
            '</div>' +
            '<div style="padding:20px;display:flex;gap:20px;flex-wrap:wrap;">' +
            '<div style="flex:none;"><div style="width:250px;max-width:100%;aspect-ratio:250/350;border-radius:12px;overflow:hidden;border:1px solid ' + THEME.border + ';box-shadow:0 12px 28px -16px rgba(45,38,30,.3);">' + avatar + '</div>' +
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
        encodeCard: encodeCard, decodeCard: decodeCard, buildForumHTML: buildForumHTML, TCARD_CSS: TC_CSS,
        blankMon: blankMon, DEFAULT_PC: DEFAULT_PC,
        encodePC: encodePC, decodePC: decodePC, buildPcForumHTML: buildPcForumHTML,
        blankTalent: blankTalent, DEFAULT_TRAINER: DEFAULT_TRAINER,
        encodeTrainer: encodeTrainer, decodeTrainer: decodeTrainer, buildTrainerForumHTML: buildTrainerForumHTML
    };
})();
