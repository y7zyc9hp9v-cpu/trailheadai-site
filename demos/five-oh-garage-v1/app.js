/* Five-Oh Garage v1 practice site. Local script only: no network calls, no storage, no eval. */
(function () {
  'use strict';

  var PACKAGES = { ir: { name: 'Interior Refresh', price: 150 }, tr: { name: 'Total Reset', price: 200 } };
  var SIZES = { car: { name: 'Car', add: 0 }, mid: { name: 'Mid-size SUV', add: 25 }, big: { name: 'Truck or full-size SUV', add: 50 } };
  var DAYS_AHEAD = 28; // how far ahead the day list reaches

  function $(id) { return document.getElementById(id); }
  function money(n) { return '$' + n; }
  function quote(pkg, size) {
    var p = PACKAGES[pkg] || PACKAGES.ir, z = SIZES[size] || SIZES.car;
    return { total: p.price + z.add, text: p.name + ' ' + money(p.price) + ' · ' + z.name + ' +' + money(z.add) };
  }
  function checked(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }

  /* ---- Packages price calculator ---- */
  function updateCalc() {
    var q = quote(checked('calc-pkg'), checked('calc-size'));
    $('calc-total').textContent = money(q.total);
    $('calc-breakdown').textContent = q.text;
  }
  document.querySelectorAll('input[name="calc-pkg"], input[name="calc-size"]').forEach(function (el) {
    el.addEventListener('change', updateCalc);
  });
  $('calc-book').addEventListener('click', function () {
    if ($('thanks').classList.contains('show')) resetForm(); // leave the thank-you screen first
    $('pkg').value = checked('calc-pkg');
    $('size').value = checked('calc-size');
    updateForm();
    $('book').scrollIntoView();
    $('pkg').focus({ preventScroll: true });
  });

  /* ---- Booking form: running total ---- */
  function updateForm() {
    var q = quote($('pkg').value, $('size').value);
    $('form-total').textContent = money(q.total);
    $('form-breakdown').textContent = q.text;
  }
  $('pkg').addEventListener('change', updateForm);
  $('size').addEventListener('change', updateForm);

  /* ---- Day list: Monday to Saturday only, starting tomorrow, never a past date ---- */
  // PLACEHOLDER: day capacity (1 job on day-job days, up to 2 on days off) and start times wait on
  // Anthony's answer about his day-job days and start times. Filter or label days here once known.
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fillDays() {
    var sel = $('day');
    var d = new Date();
    d.setHours(12, 0, 0, 0);
    for (var i = 1; i <= DAYS_AHEAD; i++) {
      var day = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i, 12);
      if (day.getDay() === 0) continue; // no Sundays
      var opt = document.createElement('option');
      opt.value = day.getFullYear() + '-' + pad(day.getMonth() + 1) + '-' + pad(day.getDate());
      opt.textContent = DOW[day.getDay()] + ', ' + MON[day.getMonth()] + ' ' + day.getDate();
      sel.appendChild(opt);
    }
  }
  fillDays();

  /* ---- Validation ---- */
  function phoneDigits(v) {
    var d = String(v || '').replace(/\D/g, '');
    if (d.length === 11 && d.charAt(0) === '1') d = d.slice(1);
    return d;
  }
  function validPhone(v) {
    var d = phoneDigits(v);
    // US number: 10 digits, area code and exchange can't start with 0 or 1
    return /^[2-9]\d{2}[2-9]\d{6}$/.test(d);
  }
  function prettyPhone(v) {
    var d = phoneDigits(v);
    return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
  }
  function validDay(v) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
    var p = v.split('-');
    var day = new Date(+p[0], +p[1] - 1, +p[2], 12);
    var today = new Date(); today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + 1); // earliest bookable day is tomorrow
    var last = new Date(today.getFullYear(), today.getMonth(), today.getDate() + DAYS_AHEAD - 1, 12); // = today + DAYS_AHEAD
    if (!(day >= today) || day > last || day.getDay() === 0) return false;
    // Upper limit: must be one of the generated options (Mon–Sat, within DAYS_AHEAD)
    var opts = $('day').options;
    for (var i = 0; i < opts.length; i++) { if (opts[i].value && opts[i].value === v) return true; }
    return false;
  }
  function mark(fieldId, ok) {
    $(fieldId).classList.toggle('invalid', !ok);
    var input = $(fieldId).querySelector('input, select');
    if (input) input.setAttribute('aria-invalid', ok ? 'false' : 'true');
    return ok;
  }
  function validate() {
    var results = [
      ['f-day', mark('f-day', validDay($('day').value))],
      ['f-name', mark('f-name', $('name').value.trim().length > 0)],
      ['f-phone', mark('f-phone', validPhone($('phone').value))],
      ['f-addr', mark('f-addr', $('addr').value.trim().length > 0)]
    ];
    for (var i = 0; i < results.length; i++) {
      if (!results[i][1]) { $(results[i][0]).querySelector('input, select').focus(); return false; }
    }
    return true;
  }
  ['day', 'name', 'phone', 'addr'].forEach(function (id) {
    var ev = id === 'day' ? 'change' : 'input';
    $(id).addEventListener(ev, function () {
      $('f-' + id).classList.remove('invalid');
      $(id).setAttribute('aria-invalid', 'false');
    });
  });

  /* ---- Submit: NOTHING is sent ---- */
  function addRow(dl, label, value) {
    var dt = document.createElement('dt'); dt.textContent = label;
    var dd = document.createElement('dd'); dd.textContent = value;
    dl.appendChild(dt); dl.appendChild(dd);
  }
  $('booking').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;

    var req = {
      pkg: PACKAGES[$('pkg').value].name,
      size: SIZES[$('size').value].name,
      total: quote($('pkg').value, $('size').value).total,
      vehicle: $('veh').value.trim(),
      day: $('day').options[$('day').selectedIndex].textContent,
      name: $('name').value.trim(),
      phone: prettyPhone($('phone').value),
      address: $('addr').value.trim(),
      notes: $('notes').value.trim()
    };

    // ===== DELIVERY GOES HERE =====
    // Not wired yet on purpose. Waiting on Anthony's answer: text, email, or both.
    // When he picks, send `req` to realfiveohgarage@gmail.com and/or his phone (920) 677-2508
    // through the chosen service, then update the Content-Security-Policy in index.html
    // (connect-src / form-action) to allow ONLY that service. Until then, nothing leaves the page.
    // ===============================

    var dl = $('summary');
    while (dl.firstChild) dl.removeChild(dl.firstChild);
    addRow(dl, 'Package', req.pkg);
    addRow(dl, 'Vehicle size', req.size);
    if (req.vehicle) addRow(dl, 'Vehicle', req.vehicle);
    addRow(dl, 'Estimated total', money(req.total));
    addRow(dl, 'Preferred day', req.day);
    addRow(dl, 'Name', req.name);
    addRow(dl, 'Phone', req.phone);
    addRow(dl, 'Address', req.address);
    if (req.notes) addRow(dl, 'Notes', req.notes);

    $('booking').hidden = true;
    $('thanks').classList.add('show');
    $('thanks').focus();
  });

  function resetForm() {
    $('booking').reset();
    ['day', 'name', 'phone', 'addr'].forEach(function (id) { mark('f-' + id, true); });
    updateForm();
    $('thanks').classList.remove('show');
    $('booking').hidden = false;
  }
  $('again').addEventListener('click', function () {
    resetForm();
    $('pkg').focus();
  });

  updateCalc();
  updateForm();
})();
