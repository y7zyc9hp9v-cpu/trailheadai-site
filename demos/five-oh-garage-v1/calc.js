/* Five-Oh price calculator (safe version). Plain lookup, no libraries. Paste-safe for a Squarespace Code Block. */
(function () {
  'use strict';
  var BASE = { ir: 150, tr: 200 };
  var ADD = { std: 0, mid: 25, big: 50 };
  var PKG_NAME = { ir: 'Interior Refresh', tr: 'Total Reset' };
  var SIZE_NAME = { std: 'Standard', mid: 'Mid-size SUV', big: 'Truck or full-size SUV' };
  var pkg = document.getElementById('fo-calc-pkg');
  var size = document.getElementById('fo-calc-size');
  if (!pkg || !size) return;
  function update() {
    document.getElementById('fo-calc-total').textContent = '$' + (BASE[pkg.value] + ADD[size.value]);
    document.getElementById('fo-calc-breakdown').textContent =
      PKG_NAME[pkg.value] + ' $' + BASE[pkg.value] + ' · ' + SIZE_NAME[size.value] + ' +$' + ADD[size.value];
  }
  pkg.addEventListener('change', update);
  size.addEventListener('change', update);
  document.getElementById('fo-calc-book').addEventListener('click', function () {
    // The page's booking form (if any) listens for this and prefills itself.
    document.dispatchEvent(new CustomEvent('fo-calc-book', { detail: { pkg: pkg.value, size: size.value } }));
  });
  update();
})();
