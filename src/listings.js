/*
 * "Imóveis à venda", read live from the CRM (Properties › Website).
 *
 * With LISTINGS_KEY set, every home the team publishes in the CRM shows here,
 * and a new price, a reservation or a sale shows within half a minute. Without
 * the key, or if the CRM can't be reached, the page keeps the T2 written into
 * index.html.
 */
(function () {
  var C = window.SITE_CONFIG || {};
  var box = document.getElementById('listings');
  var fallback = document.getElementById('listing-static');
  if (!box || !C.listingsKey) return;

  var API = (C.api || 'https://api.autisync.com/api') + '/public/listings';
  var WHATSAPP = '351965156475';
  var STATUS = { available: 'Disponível', viewing: 'Disponível', under_offer: 'Com proposta', reserved: 'Reservado', sold: 'Vendido', let: 'Arrendado' };
  var CLOSED = { sold: 1, let: 1 };
  var last = '';

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function num(v, d) {
    return new Intl.NumberFormat('pt-PT', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }).format(v);
  }
  function price(p) {
    if (p.price == null) return 'Preço sob consulta';
    // 219.000 €, as Portuguese property ads write it (Intl would give 219 000 €).
    var s = String(Math.round(p.price)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (p.currency && p.currency !== 'EUR' ? ' ' + p.currency : ' €');
    return p.listingType === 'rent' ? s + ' / mês' : s;
  }
  function where(p) {
    var a = p.address || {};
    var parts = [a.neighbourhood, a.city].filter(Boolean);
    if (parts.length === 2 && parts[0] === parts[1]) parts.pop();
    return parts.join(', ');
  }
  function short(text, n) {
    text = String(text || '').replace(/\s+/g, ' ').trim();
    if (text.length <= n) return text;
    return text.slice(0, n).replace(/\s+\S*$/, '') + '…';
  }

  function card(p) {
    var ph = (p.photos || []).slice(0, 4);
    var cls = ['ph-main', '', '', 'ph-wide'];
    var photos = ph.map(function (f, i) {
      return '<img src="' + esc(f.url) + '" alt="' + esc(f.caption || p.title) + '"' + (cls[i] ? ' class="' + cls[i] + '"' : '') + '>';
    }).join('');
    var facts = [];
    if (p.bedrooms != null) facts.push(['Tipologia', p.bedrooms === 0 ? 'T0' : 'T' + p.bedrooms]);
    if (p.areaSqm) facts.push(['Área', num(p.areaSqm, p.areaSqm % 1 ? 2 : 0) + ' m²']);
    if (p.bathrooms) facts.push(['Casas de banho', String(p.bathrooms)]);
    facts.push(['Estado', STATUS[p.status] || 'Disponível']);
    var closed = CLOSED[p.status];
    var wa = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent('Olá, tenho interesse no imóvel ' + (p.reference || p.title) + '.');
    return '<article class="listing' + (closed ? ' is-closed' : '') + '" data-ref="' + esc(p.reference) + '">' +
      '<div class="listing-photos">' + photos + '</div>' +
      '<div class="listing-info">' +
        '<p class="eyebrow">' + esc(where(p)) + '</p>' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<p class="price">' + (STATUS[p.status] && p.status !== 'available' && p.status !== 'viewing' ? '<span class="tag">' + esc(STATUS[p.status]) + '</span> ' : '') + esc(price(p)) + '</p>' +
        '<dl class="facts">' + facts.map(function (f) { return '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('') + '</dl>' +
        (p.description ? '<p>' + esc(short(p.description, 320)) + '</p>' : '') +
        (closed ? '' :
          '<div class="listing-actions">' +
            // The calendar has a viewing service for the T2 only; other homes go to WhatsApp.
            (p.reference === 'UF-001' ? '<a class="btn btn-dark" href="#avaliacao" data-book="Visita ao T2 da Castanheira">Marcar visita</a>' : '') +
            '<a class="btn ' + (p.reference === 'UF-001' ? 'btn-line' : 'btn-dark') + '" href="' + wa + '" target="_blank" rel="noopener">Pedir informações</a>' +
            '<a class="btn btn-line" href="tel:+351965156475">965 156 475</a>' +
          '</div>') +
        (p.reference ? '<p class="ref">Ref. ' + esc(p.reference) + '</p>' : '') +
      '</div>' +
    '</article>';
  }

  function load() {
    fetch(API + '?type=sale&limit=6', { headers: { 'X-Api-Key': C.listingsKey }, cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        var list = (d.properties || []).filter(Boolean);
        if (!list.length) return; // nothing published: keep the T2 from the page
        var html = list.map(card).join('');
        if (html === last) return;
        last = html;
        box.innerHTML = html;
        box.hidden = false;
        if (fallback) fallback.hidden = true;
      })
      .catch(function () { /* keep whatever is showing */ });
  }

  load();
  setInterval(function () { if (!document.hidden) load(); }, 20000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) load(); });
})();
