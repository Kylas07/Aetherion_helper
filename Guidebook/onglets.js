document.querySelectorAll('.dexa-onglet').forEach(function (bouton) {
  bouton.addEventListener('click', function () {
    document.querySelectorAll('.dexa-onglet').forEach(function (b) { b.classList.remove('actif'); });
    document.querySelectorAll('.dexa-panneau').forEach(function (p) { p.classList.remove('actif'); });
    bouton.classList.add('actif');
    var cible = document.getElementById('onglet-' + bouton.dataset.onglet);
    if (cible) cible.classList.add('actif');
  });
});
