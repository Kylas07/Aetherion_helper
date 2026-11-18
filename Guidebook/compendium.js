/* Moteur du Compendium des objets */
(function installerCompendium() {
  var sourceLabels = {
    boutique: "Boutique",
    luxe: "Boutique de luxe",
    vestiges: "Vestiges",
    fouilles: "Fouilles"
  };
  var catLabels = {
    medecine: "Médecine",
    capture: "Capture",
    progression: "Progression",
    exploration: "Exploration",
    argent: "Argent"
  };

  function sansAccent(texte) {
    return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function mettreEnValeur(texte) {
    var regles = [
      /Restaure (?:tous les PV|\d+ PV)/gi,
      /(?:Son )?taux de réussite (?:est|de fuite à) (?:de )?\d+\/\d+/gi,
      /assure automatiquement la réussite de la capture[^.]*[.]?/gi,
      /garantir que l’apparition soit du type choisi[^.]*[.]?/gi,
      /l’apparition (?:d’un|de deux|de quatres) Pokémons? supplémentaires?/gi,
      /faire apparaître un Pokémon évolué au (?:second|troisième) stade/gi,
      /faire évoluer (?:son|un) Pokémon[^.]*[.]?/gi,
      /apprendre à un Pokémon une attaque (?:non-offensive|offensive) de son choix/gi,
      /une capacité normalement inaccessible avant ou après son évolution/gi,
      /ancienne CT indisponible dans Écarlate\/Violet[^.]*[.]?/gi,
      /faire connaître le talent caché[^.]*[.]?/gi,
      /réduire le temps d’éclosion[^.]*[.]?/gi,
      /changer le sexe d’un Pokémon/gi,
      /rendre un pokémon instantanément chromatique/gi,
      /changer un Vestige de dresseur, tiers (?:bronze|argent|or) uniquement/gi,
      /accéder au donjon “[^”]+”/gi,
      /accéder une fois par mois à la catégorie spéciale “Sites de Fouilles”/gi,
      /tirer une somme entre 10P\$ et 300P\$/gi
    ];
    regles.forEach(function (regle) {
      texte = texte.replace(regle, function (passage) {
        return "<strong>" + passage + "</strong>";
      });
    });
    return texte;
  }

  function initialiser() {
    var racine = document.querySelector("[data-compendium]");
    if (!racine || racine.getAttribute("data-compendium-pret") === "oui") return;

    var page = racine.closest(".guide-page");
    var donneesObjets = page && page.querySelector("[data-comp-objets]");
    var donneesSprites = page && page.querySelector("[data-comp-sprites]");
    if (!donneesObjets || !donneesSprites) return;

    var objets, sprites;
    try {
      objets = JSON.parse(donneesObjets.textContent);
      sprites = JSON.parse(donneesSprites.textContent);
    } catch (erreur) {
      console.error("Compendium : données illisibles.", erreur);
      return;
    }

    racine.setAttribute("data-compendium-pret", "oui");
    var source = "tous";
    var categorie = "tous";
    var recherche = racine.querySelector("#comp-recherche");
    var tri = racine.querySelector("#comp-tri");
    var grille = racine.querySelector("[data-comp-grille]");
    var compteur = racine.querySelector("[data-comp-compteur]");
    var vide = racine.querySelector("[data-comp-vide]");

    function image(objet) {
      var url = sprites[objet.n];
      if (!url) return '<span class="comp-sprite-vide">?</span>';
      return '<img src="' + url + '" alt="Sprite de ' + objet.n.replace(/"/g, "&quot;") +
        '" loading="lazy" onerror="this.outerHTML=\'<span class=&quot;comp-sprite-vide&quot;>?</span>\'">';
    }

    function carte(objet) {
      var badges = objet.s.map(function (item) {
        return '<span class="comp-badge comp-badge-source">' + sourceLabels[item] + '</span>';
      }).join("");
      badges += '<span class="comp-badge">' + catLabels[objet.c] + '</span>';
      var prix = objet.p !== null
        ? '<span class="comp-prix">' + objet.p.toLocaleString("fr-FR") + ' P$</span>'
        : '<span class="comp-prix comp-prix-indefini">' + (objet.pa || "") + '</span>';

      return '<article class="comp-objet">' +
        '<div class="comp-objet-haut"><span class="comp-sprite">' + image(objet) +
        '</span><h3 class="comp-nom">' + objet.n + '</h3></div>' +
        '<div class="comp-badges">' + badges + '</div>' +
        '<p class="comp-description">' + mettreEnValeur(objet.d) + '</p>' +
        '<div class="comp-pied"><span class="comp-usage">' + objet.u + '</span>' + prix + '</div>' +
        '</article>';
    }

    function afficher() {
      var requete = sansAccent(recherche.value.trim());
      var liste = objets.filter(function (objet) {
        return (source === "tous" || objet.s.indexOf(source) !== -1) &&
          (categorie === "tous" || objet.c === categorie) &&
          (!requete || sansAccent(objet.n + " " + objet.d).indexOf(requete) !== -1);
      });

      liste.sort(function (a, b) {
        if (tri.value === "prix-asc") {
          return (a.p === null ? Infinity : a.p) - (b.p === null ? Infinity : b.p) ||
            a.n.localeCompare(b.n, "fr");
        }
        if (tri.value === "prix-desc") {
          return (b.p === null ? -Infinity : b.p) - (a.p === null ? -Infinity : a.p) ||
            a.n.localeCompare(b.n, "fr");
        }
        return a.n.localeCompare(b.n, "fr");
      });

      grille.innerHTML = liste.map(carte).join("");
      compteur.textContent = liste.length + " objet" + (liste.length > 1 ? "s" : "") +
        " affiché" + (liste.length > 1 ? "s" : "");
      vide.style.display = liste.length ? "none" : "block";
    }

    racine.querySelectorAll("[data-comp-filtres]").forEach(function (groupe) {
      groupe.addEventListener("click", function (e) {
        var bouton = e.target.closest("button");
        if (!bouton) return;
        groupe.querySelectorAll("button").forEach(function (item) {
          item.classList.toggle("actif", item === bouton);
        });
        if (groupe.getAttribute("data-comp-filtres") === "source") source = bouton.dataset.valeur;
        else categorie = bouton.dataset.valeur;
        afficher();
      });
    });

    recherche.addEventListener("input", afficher);
    tri.addEventListener("change", afficher);
    racine.querySelector("[data-comp-reset]").addEventListener("click", function () {
      source = categorie = "tous";
      recherche.value = "";
      tri.value = "nom";
      racine.querySelectorAll("[data-comp-filtres] button").forEach(function (bouton) {
        bouton.classList.toggle("actif", bouton.dataset.valeur === "tous");
      });
      afficher();
    });
    afficher();
  }

  initialiser();
  new MutationObserver(initialiser).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
