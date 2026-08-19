/* Catalogue + moteur de règles des vestiges — window.VESTIGES */
(function () {
  var CATS = ['Création', 'Fortune', 'Existence', 'Nature', 'Profondeurs', 'Guerre'];

  var TIER_LABEL = { b: 'Bronze', a: 'Argent', o: 'Or' };
  var TIER_ORDER = { b: 1, a: 2, o: 3 };

  var RANKS = ['D', 'C', 'B', 'A', 'S'];
  var RANK_ORDER = { D: 1, C: 2, B: 3, A: 4, S: 5 };
  /* quotas cumulables : rang D = 5 bronze + 3 argent + 1 or = 9 vestiges */
  var QUOTAS = {
    D: { b: 5, a: 3, o: 1 },
    C: { b: 7, a: 5, o: 2 },
    B: { b: 9, a: 7, o: 3 },
    A: { b: 11, a: 9, o: 5 },
    S: { b: 15, a: 12, o: 8 }
  };

  var TYPES_BY_CAT = {
    'Création': ['Feu', 'Roche', 'Sol'],
    'Fortune': ['Fée', 'Psy', 'Vol'],
    'Existence': ['Électrik', 'Normal', 'Spectre'],
    'Nature': ['Insecte', 'Plante', 'Poison'],
    'Profondeurs': ['Eau', 'Glace', 'Ténèbres'],
    'Guerre': ['Acier', 'Combat', 'Dragon']
  };

  /* [nom, tier, description, remplace, prérequis] */
  var RAW = {
    'Création': [
      ['Fabrication', 'b', '1/mois : 15 Pokéballs, 4 Superballs ou 2 Hyperballs'],
      ['Extraction', 'b', '1/mois : 2 Pierres évolutives'],
      ['Élaboration', 'b', '1/mois : 2 Objets évolutifs'],
      ['Affinité', 'b', '1/mois : 2 Grelot Zen, 2 Fil de Liaison ou 1 de chaque'],
      ['Confection', 'a', '1/mois : 8 Superballs, 4 Hyperballs ou 2 Typeballs', 'Fabrication'],
      ['Façonnage', 'a', '1/mois : 4 Pierres évolutives', 'Extraction'],
      ['Assemblage', 'a', '1/mois : 4 Objets évolutifs', 'Élaboration'],
      ['Connexion', 'a', '1/mois : 4 Grelot Zen, 4 Fil de Liaison ou 2 de chaque', 'Affinité'],
      ['Matérialisation', 'o', '1/mois : 8 Hyperballs, 5 Typeballs ou 1 Masterball', 'Confection'],
      ['Transmutation', 'o', '1/mois : 6 pierres évo + 2 objets évo', 'Façonnage'],
      ['Innovation', 'o', '1/mois : 6 objets évo + 2 pierres évo', 'Assemblage'],
      ['Communion', 'o', '1/mois : 6 Grelot Zen ou 6 Fil de Liaison + 2 pierres/objets évo', 'Connexion'],
      ['Double-Win', 'o', '1/mois : double un vestige bronze/argent créateur d’objet']
    ],
    'Fortune': [
      ['Prime', 'b', '1/mois : 350 P$'],
      ['Douce Lueur', 'b', '+20% chromatiques'],
      ['Capture Pro', 'b', '+10% de capture sur tous les Pokémon'],
      ['Jeux de Hasard', 'b', '2 Bon Mystère par mois au lieu d’1'],
      ['Bourgeoisie', 'b', 'Accès à la Boutique de luxe'],
      ['Bonus', 'a', '1/mois : 700 P$', 'Prime'],
      ['Bel Éclat', 'a', '+40% chromatiques', 'Douce Lueur'],
      ['Encore', 'a', 'x2 les chances de capture sur un Pokémon déjà possédé'],
      ['Chance Insolente', 'a', 'Valeur maximale du Bon Mystère à chaque fois'],
      ['Économe', 'a', '-20% sur la Boutique générale'],
      ['Jackpot', 'o', '1/mois : 1200 P$', 'Bonus'],
      ['Porteur Scintillant', 'o', '1/mois : crée un Charme Chroma'],
      ['Client Fidèle', 'o', '-20% sur la Boutique de luxe', null, { needs: ['Bourgeoisie'] }],
      ['Marge Commerciale', 'o', '+20% du total sur ses ventes'],
      ['Rémunération', 'o', '+50% d’argent via primes, missions et Boss']
    ],
    'Existence': [
      ['Pension', 'b', '1/mois : 2 œufs, incubation 2 semaines IRL'],
      ['Mutation', 'b', '1/mois : change le talent de base d’un Pokémon'],
      ['Second Starter', 'b', 'Permet d’obtenir un second starter'],
      ['Couvaison', 'a', '1 œuf de plus, incubation réduite à 1 semaine', 'Pension', { needs: ['Pension'] }],
      ['Adaptation', 'a', '1/mois : débloque le talent caché d’un Pokémon', 'Mutation'],
      ['Héréditaire X', 'a', '1/mois : apprend 2 capacités de reproduction'],
      ['Faux Cils', 'a', '1/mois : 1 fossile au choix'],
      ['Paradoxal', 'a', '1 Pokémon Paradoxe au choix — une seule fois par joueur', null, { rank: 'B' }],
      ['Éclosion', 'o', '1 œuf de plus, incubation immédiate', 'Couvaison', { needs: ['Couvaison'] }],
      ['Gène Prodige', 'o', 'À l’éclosion, apprend l’attaque d’un parent au choix'],
      ['Évolution X', 'o', '1/mois : donne 2 talents à un Pokémon', 'Adaptation'],
      ['ADN Parfait X', 'o', '1/mois : apprend 5 capacités de reproduction', 'Héréditaire X'],
      ['Renaissance', 'o', '1/combat : à 0 PV, revient avec 25% PV']
    ],
    'Nature': [
      ['Infusion', 'b', '1/mois : 2 Encens (type au choix)'],
      ['Miel Pops', 'b', '1/mois : 2 Miels basiques'],
      ['Concoction', 'b', '1/mois : 17 Potions, 5 Super Potions ou 2 Hyper Potions'],
      ['Purification', 'b', '1/mois : 3 Baumes contre les Altérations d’État'],
      ['Fragrance', 'a', '1/mois : 4 Encens (type au choix)', 'Infusion'],
      ['Miel aux Merveilles', 'a', '1/mois : 2 Miels de luxe', 'Miel Pops'],
      ['Médication', 'a', '1/mois : 10 Super Potions, 4 Hyper Potions ou 1 Potion Max', 'Concoction'],
      ['Neutralisation', 'a', '1/mois : 1 Baume de chaque Altération d’État', 'Purification'],
      ['Effluves', 'o', '1/mois : 6 Encens + 2 Encens Ultra', 'Fragrance'],
      ['Floraison', 'o', '1/mois : 1 Fleur Nectar', 'Miel aux Merveilles'],
      ['Élixir', 'o', '1/mois : 8 Hyper Potions, 2 Potions Max ou 1 Rappel', 'Médication'],
      ['Panacée', 'o', '1/mois : 2 Baumes de chaque Altération + 2 Total Soin', 'Neutralisation'],
      ['Corruption', 'o', '1/mois : 1 toxine de chaque Altération et Pseudo-Altération']
    ],
    'Profondeurs': [
      ['Fouille', 'b', 'Accès gratuit au Site de Fouilles (4 objets/mois)'],
      ['Balayage', 'b', '4/mois : 20% de faire apparaître le Pokémon de son choix dans la zone'],
      ['Fuyard', 'b', '1/mois : assure 2 fuites lors de ses captures'],
      ['Indiana Jones', 'b', '1/mois : jet de Fouille en sortant d’un Donjon'],
      ['Excavation', 'a', '2 RP de Fouille par mois (site à 8 objets/mois) — se cumule avec Fouille'],
      ['Détection', 'a', '1/mois : fait apparaître le Pokémon de son choix dans la zone'],
      ['Prestidigitateur', 'a', '1/mois : assure 5 fuites', 'Fuyard'],
      ['Another One', 'a', 'Apparition supplémentaire lors des captures'],
      ['Unique', 'a', 'Empêche les doublons lors d’une même capture'],
      ['Archéologie', 'o', 'Accès aux dés de Fouille Mythique — se cumule avec Fouille et Excavation'],
      ['Verrouillage', 'o', '1/mois : fait apparaître le Pokémon voulu, même absent de la zone', null, { rank: 'B', needs: ['Balayage', 'Détection'] }],
      ['Cartographe de l’Ombre', 'o', '1/mois par Donjon : révèle un passage secret ou une salle cachée'],
      ['Tomb Raider', 'o', 'Limite de captures en Donjon portée à 3'],
      ['Maître de l’Évasion', 'o', '1/mois : assure 8 fuites', 'Prestidigitateur']
    ],
    'Guerre': [
      ['Tutorat', 'b', '1/mois : 5 CT (EV), permanentes'],
      ['Charge', 'b', '1/tour pour 2 Actions : 40 dégâts, précision 70%'],
      ['Sang-Froid', 'b', '3/combat : ignore une altération de statut pendant 1 tour'],
      ['Mentorat', 'a', '1/mois : 10 CT (EV)', 'Tutorat'],
      ['Tranche', 'a', '1/tour pour 2 Actions : 70 dégâts, précision 80%', 'Charge'],
      ['Méga-Accessoire', 'a', 'Accès à la Méga-Évolution sans créer de Méga-Gemme', null, { rank: 'B' }],
      ['Synergie-Accessoire', 'a', 'Accès à la Synergie sans créer d’Objet de synergie', null, { rank: 'B' }],
      ['Avatar', 'o', '1/mois : 1 CT de chaque type (EV)', 'Mentorat'],
      ['Damoclès', 'o', '1/tour pour 2 Actions : 120 dégâts, précision 90%', 'Tranche'],
      ['Méga-Évolution', 'o', '1/mois : crée une Méga-Gemme, plein potentiel', null, { rank: 'A', needs: ['Méga-Accessoire'] }],
      ['Giga-Synergie-Z', 'o', '1/mois : crée un Objet de synergie, plein potentiel', null, { rank: 'A', needs: ['Synergie-Accessoire'] }],
      ['Bouclier Absolu', 'o', '1/combat : annule entièrement les dégâts d’une attaque']
    ]
  };

  var ALL = [];
  var BY_NAME = {};

  function push(v) { ALL.push(v); BY_NAME[v.name] = v; }

  CATS.forEach(function (cat) {
    RAW[cat].forEach(function (r) {
      push({ name: r[0], tier: r[1], desc: r[2] || '', replaces: r[3] || null, req: r[4] || null, cat: cat, isType: false });
    });
    TYPES_BY_CAT[cat].forEach(function (t) {
      push({ name: 'Prédilection (' + t + ')', tier: 'b', desc: '40% de chances de tomber sur le type ' + t, replaces: null, req: null, cat: cat, isType: true, ptype: t });
      push({ name: 'Capture (' + t + ')', tier: 'b', desc: '+20% de capture sur le type ' + t, replaces: null, req: null, cat: cat, isType: true, ptype: t });
      push({ name: 'Expertise (' + t + ')', tier: 'a', desc: '+60% d’apparition et +10% de capture sur le type ' + t, replaces: 'Prédilection (' + t + ')', req: null, cat: cat, isType: true, ptype: t });
      push({ name: 'Dévotion (' + t + ')', tier: 'o', desc: 'Fait apparaître le type ' + t + ', +20% de capture', replaces: 'Expertise (' + t + ')', req: null, cat: cat, isType: true, ptype: t });
    });
  });

  /* remplaçant inverse */
  ALL.forEach(function (v) {
    if (v.replaces && BY_NAME[v.replaces]) BY_NAME[v.replaces].replacedBy = v.name;
  });

  function get(name) { return BY_NAME[name] || null; }
  function tierLabel(t) { return TIER_LABEL[t] || t; }
  function quotas(rank) { return QUOTAS[rank] || QUOTAS.D; }

  /* toute la chaîne en amont (Jackpot → Bonus → Prime) */
  function ancestors(name) {
    var out = [], v = get(name), guard = 0;
    while (v && v.replaces && guard++ < 12) {
      out.push(v.replaces);
      v = get(v.replaces);
    }
    return out;
  }

  /* toute la chaîne en aval (Prime → Bonus → Jackpot) */
  function descendants(name) {
    var out = [], v = get(name), guard = 0;
    while (v && v.replacedBy && guard++ < 12) {
      out.push(v.replacedBy);
      v = get(v.replacedBy);
    }
    return out;
  }

  /* Une entrée de sélection est soit un nom du catalogue, soit un vestige
     hors catalogue écrit "Nom~b|a|o" (import d'une ancienne carte). */
  function parse(entry) {
    var s = String(entry || '');
    var i = s.lastIndexOf('~');
    if (i > 0 && ['b', 'a', 'o'].indexOf(s.slice(i + 1)) >= 0) {
      return { entry: s, name: s.slice(0, i), tier: s.slice(i + 1), custom: true };
    }
    var v = get(s);
    return v ? { entry: s, name: v.name, tier: v.tier, custom: false } : null;
  }

  function counts(sel) {
    var c = { b: 0, a: 0, o: 0 };
    (sel || []).forEach(function (n) { var p = parse(n); if (p) c[p.tier]++; });
    return c;
  }

  /* état de chaque vestige pour un rang + une sélection donnés */
  function evaluate(sel, rank) {
    sel = sel || [];
    var has = {};
    sel.forEach(function (n) { has[n] = true; });
    var c = counts(sel);
    var q = quotas(rank);
    var ro = RANK_ORDER[rank] || 1;
    var out = {};

    ALL.forEach(function (v) {
      var on = !!has[v.name];
      var reasons = [];
      if (!on) {
        if (v.req && v.req.rank && ro < RANK_ORDER[v.req.rank]) reasons.push('Rang ' + v.req.rank + ' requis');
        if (v.req && v.req.needs) {
          var chain = ancestors(v.name);
          v.req.needs.forEach(function (n) {
            /* un prérequis qui est aussi un maillon amont sera ajouté
               automatiquement (et compté) : il ne bloque pas. */
            if (!has[n] && chain.indexOf(n) < 0) reasons.push('Nécessite ' + n);
          });
        }
        /* le vestige et toute sa chaîne amont manquante doivent tenir dans les quotas */
        var need = ancestors(v.name).filter(function (n) { return !has[n]; }).concat([v.name]);
        var add = { b: 0, a: 0, o: 0 };
        need.forEach(function (n) { var x = get(n); if (x) add[x.tier]++; });
        ['b', 'a', 'o'].forEach(function (t) {
          if (add[t] && c[t] + add[t] > q[t]) {
            reasons.push('Quota ' + tierLabel(t) + ' insuffisant (' + q[t] + ')');
          }
        });
      }
      out[v.name] = { on: on, blocked: reasons.length > 0, reason: reasons[0] || '' };
    });
    return { states: out, counts: c, quotas: q };
  }

  /* ajout : la chaîne amont reste possédée (et compte dans les quotas),
     seul le maillon le plus haut s'affiche sur la carte.
     retrait : emporte les maillons supérieurs, qui en dépendent. */
  function toggle(sel, name, rank) {
    sel = (sel || []).slice();
    var i = sel.indexOf(name);
    if (i >= 0) {
      var drop = [name].concat(descendants(name));
      return {
        sel: sel.filter(function (n) { return drop.indexOf(n) < 0; }),
        msg: drop.length > 1 ? drop.slice(1).join(', ') + ' retiré aussi (dépend de ' + name + ')' : ''
      };
    }
    var ev = evaluate(sel, rank);
    var st = ev.states[name];
    if (st && st.blocked) return { sel: sel, error: st.reason };
    var added = ancestors(name).filter(function (n) { return sel.indexOf(n) < 0; }).reverse();
    added.forEach(function (n) { sel.push(n); });
    sel.push(name);
    return {
      sel: sel,
      msg: added.length ? added.join(', ') + ' ajouté automatiquement (prérequis de ' + name + ')' : ''
    };
  }

  /* ce qui s'affiche sur la carte : uniquement le maillon le plus haut */
  function visible(sel) {
    var seen = {}, custom = [];
    (sel || []).forEach(function (n) {
      var p = parse(n);
      if (!p) return;
      if (p.custom) { if (custom.indexOf(n) < 0) custom.push(n); }
      else seen[n] = true;
    });
    return Object.keys(seen).filter(function (n) {
      return !descendants(n).some(function (x) { return seen[x]; });
    }).concat(custom);
  }

  /* nettoie une sélection chargée : doublons, chaînes amont manquantes, ordre.
     Les vestiges hors catalogue sont conservés tels quels, à la fin. */
  function sanitize(sel) {
    var seen = {}, out = [], custom = [];
    (sel || []).forEach(function (n) {
      var p = parse(n);
      if (!p) return;
      if (p.custom) { if (custom.indexOf(n) < 0) custom.push(n); return; }
      if (seen[n]) return;
      seen[n] = true; out.push(n);
    });
    out.slice().forEach(function (n) {
      ancestors(n).forEach(function (a) {
        if (!seen[a]) { seen[a] = true; out.push(a); }
      });
    });
    return out.sort(function (a, b) {
      var va = get(a), vb = get(b);
      var ca = CATS.indexOf(va.cat) - CATS.indexOf(vb.cat);
      if (ca) return ca;
      var t = TIER_ORDER[vb.tier] - TIER_ORDER[va.tier];
      if (t) return t;
      return va.name.localeCompare(vb.name);
    }).concat(custom);
  }

  window.VESTIGES = {
    CATS: CATS, RANKS: RANKS, RANK_ORDER: RANK_ORDER, QUOTAS: QUOTAS,
    TIER_LABEL: TIER_LABEL, TIER_ORDER: TIER_ORDER, TYPES_BY_CAT: TYPES_BY_CAT,
    ALL: ALL, get: get, parse: parse, tierLabel: tierLabel, quotas: quotas,
    ancestors: ancestors, descendants: descendants,
    counts: counts, evaluate: evaluate, toggle: toggle, sanitize: sanitize, visible: visible,
    byCat: function (cat) { return ALL.filter(function (v) { return v.cat === cat; }); }
  };
})();
