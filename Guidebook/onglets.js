document.addEventListener('click', function (e) {
  var bouton = e.target.closest ? e.target.closest('.dexa-onglet') : null;
  if (!bouton) return;

  var groupe = bouton.closest('.guide-section') || bouton.closest('.guide-page') || document;
  var nom = bouton.getAttribute('data-onglet');

  var boutons = groupe.querySelectorAll('.dexa-onglet');
  for (var i = 0; i < boutons.length; i++) boutons[i].classList.remove('actif');
  var panneaux = groupe.querySelectorAll('.dexa-panneau');
  for (var j = 0; j < panneaux.length; j++) panneaux[j].classList.remove('actif');

  bouton.classList.add('actif');

  var cible = groupe.querySelector('#onglet-' + nom)
           || groupe.querySelector('.dexa-panneau[data-onglet="' + nom + '"]');
  if (cible) cible.classList.add('actif');
});

document.addEventListener('DOMContentLoaded', reveillerOnglets);
setTimeout(reveillerOnglets, 300);
function reveillerOnglets() {
  var sections = document.querySelectorAll('.guide-section, .guide-page');
  for (var i = 0; i < sections.length; i++) {
    var s = sections[i];
    if (!s.querySelector('.dexa-onglet')) continue;
    if (s.querySelector('.dexa-panneau.actif')) continue;
    var premier = s.querySelector('.dexa-onglet');
    if (premier) premier.click();
  }
}
