document.addEventListener('click', function (e) {
  var bouton = e.target.closest('.dexa-onglet');
  if (!bouton) return;

  var groupe = bouton.closest('.guide-section') || document;

  groupe.querySelectorAll('.dexa-onglet').forEach(function (b) { b.classList.remove('actif'); });
  groupe.querySelectorAll('.dexa-panneau').forEach(function (p) { p.classList.remove('actif'); });

  bouton.classList.add('actif');
  var cible = document.getElementById('onglet-' + bouton.dataset.onglet);
  if (cible) cible.classList.add('actif');
});
