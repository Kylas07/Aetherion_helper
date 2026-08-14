var GUIDE_SOMMAIRE = [

  { categorie: 'Accueil', pages: [
    { id: 'reglement',        label: 'Règlement' },
    { id: 'guide-nouveau',    label: 'Guide du nouveau' },
    { id: 'credits',          label: 'Crédits et staff' }
  ]},

  { categorie: 'Lore', pages: [
    { id: 'contexte',         label: 'Contexte' },
    { id: 'chrono-reelle',    label: 'Chronologie réelle' },
    { id: 'chrono-jeu',       label: 'Chronologie du jeu' },
    { id: 'vivre',            label: 'Vivre à Etherium' },
    { id: 'specificite',      label: 'Spécificité du jeu' },
    { id: 'feat',             label: 'Changement de feat' }
  ]},

  { categorie: 'Cartes', pages: [
    { id: 'boss',             label: 'Les Boss' },
    { id: 'etage00',          label: 'Étage 00 · Elyvern' },
    { id: 'etage01',          label: 'Étage 01 · Nodalis' },
    { id: 'etage02',          label: 'Étage 02 · Pic Nörum' },
    { id: 'etage03',          label: 'Étage 03 · Atoll Lyssandre' }
  ]},

  /* La catégorie Groupes s'affiche en pastilles colorées (styleGroupes: true). */
  { categorie: 'Groupes', styleGroupes: true, pages: [
    { id: 'groupes-general',  label: 'Généralités',            couleur: '#BE5735' },
    { id: 'couronne',         label: 'Couronne de Cendre',     couleur: '#D43535' },
    { id: 'vigie',            label: 'Vigie du Seuil',         couleur: '#6E93B8' },
    { id: 'colporteur',       label: "Colporteur de l'Ombre",  couleur: '#8E7BB0' },
    { id: 'arpenteur',        label: 'Arpenteur du Vide',      couleur: '#4F8A5B' },
    { id: 'heraut',           label: 'Héraut Silencieux',      couleur: '#4A5C8F' }
  ]},

  { categorie: 'Personnages', pages: [
    { id: 'progression',      label: 'Progression' },
    { id: 'argent',           label: 'Argent' },
    { id: 'pvp',              label: 'PVP' }
  ]},

  { categorie: 'Pokémons', pages: [
    { id: 'generalite',       label: 'Généralité' },
    { id: 'aetherions',       label: 'Pokémons Etherium' },
    { id: 'pkmn-progression', label: 'Progression' },
    { id: 'pkmn-talents',     label: 'Talents' },
    { id: 'capture',          label: 'Pokédex' },
    { id: 'obtention',        label: 'Obtention spéciales' },
    { id: 'combat',           label: 'Système de Combat' },
    { id: 'talents',         label: 'Vestiges' }
  ]}
];

/* Titre du menu et bas de menu — modifiables aussi. */
var GUIDE_TITRE      = 'Guide <em>Etherium</em>';
var GUIDE_SOUS_TITRE = 'les annexes du forum';
var GUIDE_PIED       = 'Guide — équipe Etherium';
var GUIDE_LIEN_FORUM = 'https://etherium.forumactif.com';  

(function () {
  var guide = document.querySelector('.guide');
  if (!guide) return;

  /* — construction du menu — */
  function construireMenu(courante) {
    var html = '<div class="guide-sommaire">' +
      '<div class="guide-logo"><b>' + GUIDE_TITRE + '</b><span>' + GUIDE_SOUS_TITRE + '</span></div>';
    GUIDE_SOMMAIRE.forEach(function (cat, i) {
      var num = (i + 1 < 10 ? '0' : '') + (i + 1);
      html += '<span class="guide-cat">' + num + '. ' + cat.categorie + '</span>';
      if (cat.styleGroupes) html += '<div class="guide-groupes">';
      cat.pages.forEach(function (p) {
        html += '<a href="' + p.id + '.html"' +
          (p.id === courante ? ' class="actif"' : '') +
          (p.couleur ? ' style="--g:' + p.couleur + '"' : '') +
          '>' + p.label + '</a>';
      });
      if (cat.styleGroupes) html += '</div>';
    });
    html += '<div class="guide-pied"><span>' + GUIDE_PIED + '</span></div></div>';
    return html;
  }

  guide.insertAdjacentHTML('afterbegin', construireMenu(guide.getAttribute('data-page') || ''));

  function marquerActif(id) {
    guide.querySelectorAll('.guide-sommaire a').forEach(function (a) {
      a.classList.toggle('actif', a.getAttribute('href') === id + '.html');
    });
  }

  /* — bouton « revenir sur le forum » — */
  function ajouterRetour() {
    var corps = guide.querySelector('.guide-corps');
    if (corps && !corps.querySelector('.guide-retour')) {
      corps.insertAdjacentHTML('afterbegin',
        '<div class="guide-retour"><a href="' + GUIDE_LIEN_FORUM + '">Revenir sur le forum</a></div>');
    }
  }

  /* — interactions internes d'une page (ronds PNJ, tour du Pokédex) — */
  function activerPage() {
    document.querySelectorAll('.grp-figures-nav').forEach(function (nav) {
      var btns = nav.querySelectorAll('[data-figure]');
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          var section = nav.parentElement;
          btns.forEach(function (x) { x.classList.toggle('actif', x === b); });
          section.querySelectorAll('.grp-figure-panneau').forEach(function (p) {
            p.classList.toggle('actif', p.id === b.getAttribute('data-figure'));
          });
        });
      });
    });

    var zones = document.querySelectorAll('.dex-zone');
    if (zones.length) {
      var boutons = document.querySelectorAll('[data-zone]');
      var tour = document.querySelector('.dex-tour');
      boutons.forEach(function (b) {
        b.addEventListener('click', function () {
          if (b.disabled) return;
          var id = b.getAttribute('data-zone');
          zones.forEach(function (z) { z.classList.toggle('actif', z.id === id); });
          boutons.forEach(function (x) { x.classList.toggle('actif', x.getAttribute('data-zone') === id); });
          if (tour && b.classList.contains('dex-etage')) {
            tour.scrollTo({ top: b.offsetTop - (tour.clientHeight - b.offsetHeight) / 2, behavior: 'smooth' });
          }
        });
      });
    }
  }

  /* — changement de page sans rechargement — */
  var pagesConnues = [];
  GUIDE_SOMMAIRE.forEach(function (c) { c.pages.forEach(function (p) { pagesConnues.push(p.id + '.html'); }); });
  var cache = {};

  function charger(fichier, ajouterHistorique) {
    var id = fichier.replace('.html', '');
    guide.classList.add('chargement');

    var recupere = cache[fichier]
      ? Promise.resolve(cache[fichier])
      : fetch(fichier).then(function (r) { return r.text(); }).then(function (t) { cache[fichier] = t; return t; });

    Promise.all([recupere, new Promise(function (r) { setTimeout(r, 190); })]).then(function (res) {
      var doc = new DOMParser().parseFromString(res[0], 'text/html');
      var nouveau = doc.querySelector('.guide-corps');
      var ancien = guide.querySelector('.guide-corps');
      if (!nouveau || !ancien) { location.href = fichier; return; }

      ancien.innerHTML = nouveau.innerHTML;
      /* couleur de groupe et titre de la page */
      var couleur = doc.body.getAttribute('style');
      document.body.setAttribute('style', couleur || '');
      if (doc.title) document.title = doc.title;
      guide.setAttribute('data-page', id);

      marquerActif(id);
      ajouterRetour();
      activerPage();
      if (ajouterHistorique) history.pushState({ page: fichier }, '', fichier);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      guide.classList.remove('chargement');
    }).catch(function () { location.href = fichier; });
  }

  document.addEventListener('click', function (e) {
    var lien = e.target.closest ? e.target.closest('a') : null;
    if (!lien) return;
    var href = lien.getAttribute('href');
    if (!href || pagesConnues.indexOf(href) === -1) return;   /* liens externes : comportement normal */
    if (e.metaKey || e.ctrlKey || e.shiftKey || lien.target === '_blank') return;
    e.preventDefault();
    if (href === guide.getAttribute('data-page') + '.html') return;
    charger(href, true);
  });

  window.addEventListener('popstate', function () {
    var fichier = location.pathname.split('/').pop() || 'index.html';
    if (pagesConnues.indexOf(fichier) !== -1) charger(fichier, false);
  });

  ajouterRetour();
  activerPage();
})();
