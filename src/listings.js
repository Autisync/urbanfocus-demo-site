/*
 * The homes, read live from the CRM (Properties › Website, LISTINGS_KEY).
 *
 *   index.html   [data-homes-preview]  the three most viewed, with a quick view
 *   imoveis.html [data-homes-all]      every published home: search, filters, sort
 *   imovel.html  [data-home]           one home: photos, details, ask a question
 *                                      or book a viewing, similar homes
 *
 * "Most viewed" uses the view count the CRM sends with each home (views,
 * viewCount or stats.views). When none is sent, the newest homes come first.
 *
 * A new price, a reservation or a sale in the CRM shows within 30 seconds.
 * Without the key the pages show window.DEMO_LISTINGS (demo-listings.js):
 * the real T2, plus sample homes with ?demo=1.
 */
(function () {
  'use strict';
  var C = window.SITE_CONFIG || {};
  var API = String(C.api || 'https://api.autisync.com/api').replace(/\/+$/, '') + '/public/listings';
  var KEY = C.listingsKey || '';
  var DEMO = !KEY;
  var PHONE = '965 156 475';
  var WHATSAPP = '351965156475';
  var STATUS = { available: 'Disponível', viewing: 'Disponível', under_offer: 'Com proposta', reserved: 'Reservado', sold: 'Vendido', let: 'Arrendado' };
  var CLOSED = { sold: 1, let: 1 };
  var TYPES = { apartment: 'Apartamento', house: 'Moradia', land: 'Terreno', commercial: 'Comercial', studio: 'Estúdio' };
  var NEW_DAYS = 14;

  // ── Helpers ──
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function api(path, opts) {
    opts = opts || {};
    return fetch(API + path, {
      method: opts.method || 'GET', cache: 'no-store',
      headers: Object.assign({ 'X-Api-Key': KEY }, opts.body ? { 'Content-Type': 'application/json' } : {}),
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok) { var e = new Error(d.error || String(r.status)); e.status = r.status; throw e; }
        return d;
      });
    });
  }
  /** Every home for sale: from the CRM, or the demo list without a key. */
  function listAll() {
    if (DEMO) return Promise.resolve({ properties: (window.DEMO_LISTINGS || []).slice() });
    return api('?type=sale&limit=50');
  }
  function getOne(ref) {
    if (!DEMO) return api('/' + encodeURIComponent(ref));
    var p = (window.DEMO_LISTINGS || []).filter(function (x) { return x.reference === ref; })[0];
    return p ? Promise.resolve({ property: p }) : Promise.reject(Object.assign(new Error('404'), { status: 404 }));
  }
  /** 219.000 €, as Portuguese property ads write it. */
  function money(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'; }
  function price(p) {
    if (p.price == null) return 'Preço sob consulta';
    return p.listingType === 'rent' ? money(p.price) + ' / mês' : money(p.price);
  }
  function area(v) { return String(v % 1 ? v.toFixed(2) : v).replace('.', ',') + ' m²'; }
  function typology(p) { return p.bedrooms == null ? '' : (p.propertyType === 'house' ? 'V' : 'T') + p.bedrooms; }
  function baths(p) { return p.bathrooms ? p.bathrooms + (p.bathrooms === 1 ? ' casa de banho' : ' casas de banho') : ''; }
  function where(p) {
    var a = p.address || {};
    var parts = [a.neighbourhood, a.city].filter(Boolean);
    if (parts.length === 2 && parts[0] === parts[1]) parts.pop();
    return parts.join(', ');
  }
  function city(p) { return (p.address || {}).city || ''; }
  function views(p) {
    var v = p.views != null ? p.views : p.viewCount != null ? p.viewCount : (p.stats || {}).views;
    return Number(v) || 0;
  }
  function created(p) { return Date.parse(p.publishedAt || p.createdAt || '') || 0; }
  function isNew(p) { return !CLOSED[p.status] && created(p) && Date.now() - created(p) < NEW_DAYS * 864e5; }
  function badge(p) {
    if (p.status && p.status !== 'available' && p.status !== 'viewing')
      return '<span class="tag' + (CLOSED[p.status] ? ' tag-closed' : '') + '">' + esc(STATUS[p.status] || p.status) + '</span>';
    return isNew(p) ? '<span class="tag tag-new">Novo</span>' : '';
  }
  function specs(p) {
    return [typology(p), p.bathrooms ? p.bathrooms + ' WC' : '', p.areaSqm ? area(p.areaSqm) : '']
      .filter(Boolean).map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('');
  }
  function homeUrl(p) { return '/imovel/' + encodeURIComponent(p.reference); }
  function wa(text) { return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text); }
  function paragraphs(p) { return String(p.description || '').split(/\n{2,}|\r\n\r\n/).map(function (t) { return t.trim(); }).filter(Boolean); }
  /** Most viewed first; homes with the same count (or none) newest first. */
  function byViews(a, b) { return views(b) - views(a) || created(b) - created(a); }

  // ── Cards ──
  // The title link covers the whole card; the quick-view button sits above it.
  function card(p, opts) {
    opts = opts || {};
    var photo = (p.photos || [])[0];
    return '<article class="home-card' + (CLOSED[p.status] ? ' is-closed' : '') + '">' +
      '<div class="home-card-photo">' + (photo ? '<img src="' + esc(photo.url) + '" alt="" loading="lazy">' : '<span class="no-photo">Fotografias em breve</span>') + badge(p) +
        (opts.quick ? '<button type="button" class="qv-open" data-quick="' + esc(p.reference) + '">Vista rápida</button>' : '') +
      '</div>' +
      '<div class="home-card-body">' +
        '<p class="home-card-price">' + esc(price(p)) + '</p>' +
        '<h3><a class="home-card-link" href="' + homeUrl(p) + '">' + esc(p.title) + '</a></h3>' +
        '<p class="home-card-where">' + esc(where(p)) + '</p>' +
        '<p class="home-card-specs">' + specs(p) + '</p>' +
      '</div></article>';
  }

  /** Re-draw only when something changed, so a refresh never jumps the page. */
  function painter(el) {
    var last = '';
    return function (html) { if (html !== last) { last = html; el.innerHTML = html; } };
  }
  function every(ms, fn) {
    fn();
    if (DEMO) return;
    setInterval(function () { if (!document.hidden) fn(); }, ms);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) fn(); });
  }
  function down(el) {
    el.innerHTML = '<div class="homes-empty"><p>Não foi possível carregar os imóveis neste momento.</p>' +
      '<p>Ligue-nos para o <a href="tel:+351965156475">' + PHONE + '</a> ou fale connosco no <a href="' + wa('Olá, procuro um imóvel.') + '" target="_blank" rel="noopener">WhatsApp</a>.</p></div>';
  }

  // ── Photo viewer: the quick view and the full-screen gallery share it ──
  function viewer(root, photos, alt, start) {
    var i = start || 0;
    var img = root.querySelector('[data-v-img]');
    var count = root.querySelector('[data-v-count]');
    function go(n) {
      if (!photos.length) return;
      i = (n + photos.length) % photos.length;
      img.src = photos[i].url; img.alt = photos[i].caption || alt;
      if (count) count.textContent = (i + 1) + ' / ' + photos.length;
    }
    root.querySelectorAll('[data-v-step]').forEach(function (b) {
      b.addEventListener('click', function () { go(i + Number(b.getAttribute('data-v-step'))); });
    });
    var x0 = null;
    img.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    img.addEventListener('touchend', function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); x0 = null; });
    root.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); });
    go(i);
  }
  function stage(photos, alt) {
    return '<div class="v-stage">' +
      (photos.length ? '<img data-v-img alt="' + esc(alt) + '">' : '<span class="no-photo">Fotografias em breve</span>') +
      (photos.length > 1 ? '<button type="button" class="gal-btn gal-prev" data-v-step="-1" aria-label="Fotografia anterior">‹</button>' +
        '<button type="button" class="gal-btn gal-next" data-v-step="1" aria-label="Fotografia seguinte">›</button>' +
        '<span class="gal-count" data-v-count></span>' : '') +
    '</div>';
  }
  function openDialog(cls, html, label) {
    var d = document.createElement('dialog');
    d.className = cls;
    d.setAttribute('aria-label', label);
    d.innerHTML = '<button type="button" class="dlg-close" data-close aria-label="Fechar">×</button>' + html;
    document.body.appendChild(d);
    d.addEventListener('close', function () { d.remove(); });
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-close]')) d.close(); });
    d.showModal();
    return d;
  }
  function lightbox(p, start) {
    var photos = p.photos || [];
    var d = openDialog('lightbox', stage(photos, p.title), 'Fotografias de ' + p.title);
    if (photos.length) viewer(d, photos, p.title, start);
  }
  function quickView(p) {
    var photos = p.photos || [];
    var closed = CLOSED[p.status];
    var first = paragraphs(p)[0] || '';
    var chips = [typology(p), baths(p), p.areaSqm ? area(p.areaSqm) : '', p.energyRating ? 'Energia ' + p.energyRating : '']
      .filter(Boolean).map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('');
    var d = openDialog('qv',
      '<div class="qv-in">' + stage(photos, p.title) +
        '<div class="qv-info">' +
          '<p class="eyebrow">' + esc(where(p)) + '</p>' +
          '<h2>' + esc(p.title) + '</h2>' +
          '<p class="qv-price">' + badge(p) + esc(price(p)) + '</p>' +
          (chips ? '<ul class="chips">' + chips + '</ul>' : '') +
          (first ? '<p class="qv-text">' + esc(first) + '</p>' : '') +
          '<div class="qv-actions">' +
            '<a class="btn btn-dark" href="' + homeUrl(p) + '">Ver imóvel completo</a>' +
            (closed ? '' : '<a class="btn btn-line" href="' + homeUrl(p) + '#contacto" data-tab-link="visita">Marcar visita</a>' +
              '<a class="btn btn-line" href="' + wa('Olá, tenho interesse no imóvel ' + p.reference + ' (' + p.title + ').') + '" target="_blank" rel="noopener">WhatsApp</a>') +
          '</div>' +
          '<p class="ref">Ref. ' + esc(p.reference) + '</p>' +
        '</div>' +
      '</div>', 'Vista rápida: ' + p.title);
    if (photos.length) viewer(d, photos, p.title, 0);
  }

  // ── Home page: the three most viewed, with a quick view ──
  function preview(el) {
    var grid = el.querySelector('[data-homes-grid]');
    var more = el.querySelector('[data-homes-more]');
    var fallback = el.querySelector('[data-homes-fallback]');
    if (!grid) return;
    var paint = painter(grid);
    var list = [];
    grid.addEventListener('click', function (e) {
      var b = e.target.closest('[data-quick]');
      if (!b) return;
      var p = list.filter(function (x) { return x.reference === b.getAttribute('data-quick'); })[0];
      if (p) quickView(p);
    });
    every(30000, function () {
      listAll().then(function (d) {
        var all = (d.properties || []).filter(Boolean);
        list = all.filter(function (p) { return !CLOSED[p.status]; }).sort(byViews);
        if (!list.length) return;
        paint(list.slice(0, 3).map(function (p) { return card(p, { quick: true }); }).join(''));
        grid.hidden = false;
        if (fallback) fallback.hidden = true;
        if (more) { var n = more.querySelector('[data-count]'); if (n) n.textContent = d.total || all.length; }
      }).catch(function () { /* keep what is showing */ });
    });
  }

  // ── /imoveis: search, filters and sort, kept in the address ──
  function all(el) {
    var grid = el.querySelector('[data-homes-grid]');
    var count = el.querySelector('[data-homes-count]');
    var form = el.querySelector('[data-search]');
    var sortEl = el.querySelector('[data-sort]');
    var zones = el.querySelector('[data-zones]');
    var live = el.querySelector('[data-live-text]');
    var paint = painter(grid);
    var homes = null;

    var q = new URLSearchParams(location.search);
    function setForm() {
      ['zona', 'quartos', 'max'].forEach(function (k) { if (form.elements[k]) form.elements[k].value = q.get(k) || ''; });
      form.querySelectorAll('[name="tipo"]').forEach(function (r) { r.checked = r.value === (q.get('tipo') || ''); });
      sortEl.value = q.get('ordem') || 'recent';
    }
    function readForm() {
      var f = new FormData(form);
      q = new URLSearchParams();
      ['tipo', 'zona', 'quartos', 'max'].forEach(function (k) { var v = f.get(k); if (v) q.set(k, v); });
      if (sortEl.value !== 'recent') q.set('ordem', sortEl.value);
      var s = q.toString();
      history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
      render();
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); readForm(); document.getElementById('resultados').scrollIntoView({ behavior: 'smooth' }); });
    form.addEventListener('change', readForm);
    sortEl.addEventListener('change', readForm);
    grid.addEventListener('click', function (e) {
      if (!e.target.closest('[data-clear]')) return;
      q = new URLSearchParams(); setForm(); readForm();
    });

    function render() {
      if (!homes) return;
      var tipo = q.get('tipo'), zona = q.get('zona'), max = Number(q.get('max')) || 0;
      var beds = q.get('quartos') === null || q.get('quartos') === '' ? null : Number(q.get('quartos'));
      var hits = homes.filter(function (p) {
        if (tipo && p.propertyType !== tipo) return false;
        if (zona && city(p) !== zona) return false;
        if (beds != null && !(p.bedrooms >= beds)) return false;
        if (max && !(p.price != null && p.price <= max)) return false;
        return true;
      });
      var order = q.get('ordem') || 'recent';
      var sorts = {
        recent: function (a, b) { return created(b) - created(a); },
        views: byViews,
        'price-asc': function (a, b) { return (a.price == null ? Infinity : a.price) - (b.price == null ? Infinity : b.price); },
        'price-desc': function (a, b) { return (b.price || 0) - (a.price || 0); },
        area: function (a, b) { return (b.areaSqm || 0) - (a.areaSqm || 0); },
      };
      // Sold homes always last: they show what we do, but are not for sale.
      hits.sort(function (a, b) { return (CLOSED[a.status] ? 1 : 0) - (CLOSED[b.status] ? 1 : 0) || sorts[order](a, b); });
      count.textContent = hits.length === 1 ? '1 imóvel' : hits.length + ' imóveis';
      if (hits.length) return paint(hits.map(function (p) { return card(p); }).join(''));
      paint(homes.length
        ? '<div class="homes-empty"><p>Nenhum imóvel corresponde a esta pesquisa.</p><p><button type="button" class="btn btn-line" data-clear>Limpar filtros</button> <a class="btn btn-dark" href="/contactos?assunto=alerta">Avisem-me quando houver</a></p></div>'
        : '<div class="homes-empty"><p>Neste momento não temos imóveis à venda. Volte em breve, ou <a href="/contactos?assunto=alerta">peça-nos para o avisarmos</a>.</p></div>');
    }

    setForm();
    every(30000, function () {
      listAll().then(function (d) {
        homes = (d.properties || []).filter(Boolean);
        var cities = homes.map(city).filter(Boolean).filter(function (c, i, a) { return a.indexOf(c) === i; }).sort(function (a, b) { return a.localeCompare(b, 'pt'); });
        var keep = q.get('zona') || '';
        zones.innerHTML = '<option value="">Todas as zonas</option>' + cities.map(function (c) { return '<option' + (c === keep ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('');
        if (live) live.textContent = DEMO ? (window.DEMO_MODE ? 'Imóveis de demonstração' : 'Imóveis à venda agora')
          : 'Ao vivo do nosso CRM · atualizado às ' + new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date());
        render();
      }).catch(function () {
        if (!homes) { down(grid); count.textContent = ''; if (live) live.textContent = 'Sem ligação'; }
      });
    });
  }

  // ── /imovel/REF: one home ──
  function detail(el) {
    var m = location.pathname.match(/\/imovel\/([^/?#]+)/);
    var ref = m ? decodeURIComponent(m[1]) : new URLSearchParams(location.search).get('ref');
    if (!ref) { location.replace('/imoveis'); return; }
    var first = true;
    var current = null;
    var mainIndex = 0;

    every(30000, function () {
      getOne(ref).then(function (d) {
        var p = d.property;
        if (!p) throw Object.assign(new Error('404'), { status: 404 });
        var sig = JSON.stringify([p.price, p.status, p.title, p.description, (p.photos || []).map(function (f) { return f.url; })]);
        if (current === sig) return;
        var wasClosed = current && JSON.parse(current)[1];
        current = sig;
        draw(p, first || CLOSED[p.status] !== CLOSED[wasClosed]);
        if (first) {
          first = false;
          document.title = p.title + ' · Urban Focus';
          var meta = document.querySelector('meta[name="description"]');
          if (meta) meta.setAttribute('content', [p.title, where(p), price(p)].filter(Boolean).join(' · '));
          if (!CLOSED[p.status]) loadSlots(p);
          similar(p);
          if (location.hash === '#contacto') { var c = el.querySelector('#contacto'); if (c) c.scrollIntoView(); }
        }
      }).catch(function (e) {
        if (e.status === 404) {
          el.innerHTML = '<div class="homes-empty"><h1 class="section-title">Este imóvel já não está disponível</h1>' +
            '<p>Pode ter sido vendido ou retirado. Veja <a href="/imoveis">os imóveis à venda</a> ou ligue-nos para o <a href="tel:+351965156475">' + PHONE + '</a>.</p></div>';
        } else if (first) { down(el); }
      });
    });

    function mosaic(p) {
      var photos = p.photos || [];
      if (mainIndex >= photos.length) mainIndex = 0;
      if (!photos.length) return '<div class="mosaic mosaic-1"><div class="mosaic-main"><span class="no-photo">Fotografias em breve</span></div></div>';
      var side = photos.length >= 3 ? [1, 2] : [];
      return '<div class="mosaic' + (side.length ? '' : ' mosaic-1') + '">' +
          '<button type="button" class="mosaic-main" data-open="' + mainIndex + '" aria-label="Ver fotografias em ecrã inteiro">' +
            '<img src="' + esc(photos[mainIndex].url) + '" alt="' + esc(photos[mainIndex].caption || p.title) + '" data-main>' + badge(p) +
          '</button>' +
          side.map(function (i) { return '<button type="button" class="mosaic-side" data-open="' + i + '" aria-label="Fotografia ' + (i + 1) + '"><img src="' + esc(photos[i].url) + '" alt="" loading="lazy"></button>'; }).join('') +
          (photos.length > 1 ? '<button type="button" class="mosaic-all" data-open="0">Ver as ' + photos.length + ' fotografias</button>' : '') +
        '</div>' +
        (photos.length > 1 ? '<div class="gallery-thumbs">' + photos.map(function (f, i) {
          return '<button type="button" data-photo="' + i + '"' + (i === mainIndex ? ' aria-current="true"' : '') + ' aria-label="Fotografia ' + (i + 1) + '"><img src="' + esc(f.url) + '" alt="" loading="lazy"></button>';
        }).join('') + '</div>' : '');
    }

    function info(p) {
      var chips = [];
      if (typology(p)) chips.push(typology(p));
      if (p.bedrooms) chips.push(p.bedrooms + (p.bedrooms === 1 ? ' quarto' : ' quartos'));
      if (baths(p)) chips.push(baths(p));
      if (p.areaSqm) chips.push(area(p.areaSqm));
      if (p.plotSqm) chips.push(area(p.plotSqm) + ' de terreno');
      if (p.yearBuilt) chips.push('Construção ' + p.yearBuilt);
      if (p.propertyType && TYPES[p.propertyType]) chips.push(TYPES[p.propertyType]);
      var paras = paragraphs(p);
      return '<p class="eyebrow">À venda · ' + esc(where(p)) + '</p>' +
        '<h1>' + esc(p.title) + '</h1>' +
        '<p class="home-price">' + esc(price(p)) + (p.status && STATUS[p.status] && p.status !== 'available' ? ' <span class="status-pill' + (CLOSED[p.status] ? ' is-closed' : '') + '">' + esc(STATUS[p.status]) + '</span>' : '') + '</p>' +
        '<ul class="chips">' + chips.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') +
          (p.energyRating ? '<li class="energy">Energia <b class="energy-' + esc(String(p.energyRating).charAt(0).toUpperCase()) + '">' + esc(p.energyRating) + '</b></li>' : '') +
        '</ul>' +
        (paras.length ? paras.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('') : '<p>Peça-nos mais informações.</p>') +
        ((p.features || []).length ? '<h2>Destaques</h2><ul class="features">' + p.features.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' : '') +
        '<p class="ref">Ref. ' + esc(p.reference) + ' · Urban Focus · Rua Joaquim Luís Chico, n.º 3, Vila Franca de Xira</p>';
    }

    function contact(p) {
      if (CLOSED[p.status]) return '<aside class="contact-card card"><p class="home-closed">Este imóvel já foi vendido. Temos outros parecidos: <a href="/imoveis">ver imóveis à venda</a>.</p></aside>';
      var canSend = !DEMO || window.DEMO_MODE;
      var head = '<div class="agent"><span class="agent-mark"><img src="/img/monograma-claro.svg" alt="" width="28" height="28"></span>' +
        '<div><b>Urban Focus</b><a href="tel:+351965156475">' + PHONE + '</a></div></div>';
      if (!canSend) {
        return '<aside class="contact-card card" id="contacto">' + head +
          '<p class="small">Para visitar ou pedir informações sobre este imóvel, fale connosco:</p>' +
          '<div class="home-actions"><a class="btn btn-dark" href="tel:+351965156475">Ligar ' + PHONE + '</a>' +
          '<a class="btn btn-line" href="' + wa('Olá, tenho interesse no imóvel ' + p.reference + ' (' + p.title + ').') + '" target="_blank" rel="noopener">WhatsApp</a></div></aside>';
      }
      var fields = function (msg) {
        return '<input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
          '<label class="field full">O seu nome<input name="name" autocomplete="name" required></label>' +
          '<label class="field full">Email<input name="email" type="email" autocomplete="email" required></label>' +
          '<label class="field full"><span>Telemóvel <span class="opt">(opcional)</span></span><input name="phone" type="tel" autocomplete="tel"></label>' +
          (msg ? '<label class="field full">Mensagem<textarea name="message" rows="4">' + esc(msg) + '</textarea></label>' : '');
      };
      return '<aside class="contact-card card" id="contacto">' + head +
        '<div class="tabs" role="tablist" aria-label="Contacto">' +
          '<button type="button" role="tab" id="tab-info" aria-controls="pane-info" aria-selected="true" data-tab="info">Pedir informações</button>' +
          '<button type="button" role="tab" id="tab-visita" aria-controls="pane-visita" aria-selected="false" tabindex="-1" data-tab="visita">Marcar visita</button>' +
        '</div>' +
        '<div role="tabpanel" id="pane-info" aria-labelledby="tab-info">' +
          '<form class="visit-form" data-send="enquiry" novalidate>' + fields('Tenho interesse no imóvel ' + p.title + ' (' + p.reference + '). Gostava de saber mais.') +
            '<button class="btn btn-dark btn-block" type="submit">Enviar pedido</button><p class="status" data-status role="status"></p></form>' +
        '</div>' +
        '<div role="tabpanel" id="pane-visita" aria-labelledby="tab-visita" hidden>' +
          '<p class="small">Escolha o dia e a hora. Recebe a confirmação por email.</p>' +
          '<div class="visit-days" data-days><p class="small">A carregar as horas livres…</p></div>' +
          '<div class="visit-slots" data-slots></div>' +
          '<form class="visit-form" data-send="viewing" novalidate>' + fields('') +
            '<button class="btn btn-dark btn-block" type="submit" data-submit>Escolha uma hora</button><p class="status" data-status role="status"></p></form>' +
        '</div>' +
        '<a class="contact-wa" href="' + wa('Olá, tenho interesse no imóvel ' + p.reference + ' (' + p.title + ').') + '" target="_blank" rel="noopener">Prefere WhatsApp? Fale connosco</a>' +
      '</aside>';
    }

    function draw(p, whole) {
      var a = (p.address || {});
      if (whole) {
        el.innerHTML =
          '<nav class="crumbs" aria-label="Caminho"><a href="/">Início</a> / <a href="/imoveis">Imóveis à venda</a>' +
            (a.city ? ' / <a href="/imoveis?zona=' + encodeURIComponent(a.city) + '">' + esc(a.city) + '</a>' : '') + ' / <span>' + esc(p.reference) + '</span></nav>' +
          '<div data-gallery>' + mosaic(p) + '</div>' +
          '<div class="home-cols"><div class="home-text" data-info>' + info(p) + '</div>' + contact(p) + '</div>';
        wireContact(p);
      } else {
        // A new price or photos refresh the top and the text only, so a
        // half-filled form is never wiped.
        el.querySelector('[data-gallery]').innerHTML = mosaic(p);
        el.querySelector('[data-info]').innerHTML = info(p);
      }
      wireGallery(p);
    }

    function wireGallery(p) {
      var photos = p.photos || [];
      el.querySelectorAll('[data-open]').forEach(function (b) {
        b.addEventListener('click', function () { lightbox(p, Number(b.getAttribute('data-open'))); });
      });
      el.querySelectorAll('[data-photo]').forEach(function (b) {
        b.addEventListener('click', function () {
          mainIndex = Number(b.getAttribute('data-photo'));
          var main = el.querySelector('[data-main]');
          main.src = photos[mainIndex].url; main.alt = photos[mainIndex].caption || p.title;
          main.closest('[data-open]').setAttribute('data-open', mainIndex);
          el.querySelectorAll('[data-photo]').forEach(function (x) { x.toggleAttribute('aria-current', x === b); });
        });
      });
    }

    function wireContact(p) {
      var tabs = el.querySelectorAll('[data-tab]');
      function show(name) {
        tabs.forEach(function (t) {
          var on = t.getAttribute('data-tab') === name;
          t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
          document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
        });
      }
      tabs.forEach(function (t) {
        t.addEventListener('click', function () { show(t.getAttribute('data-tab')); });
        t.addEventListener('keydown', function (e) {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
          var next = t.getAttribute('data-tab') === 'info' ? 'visita' : 'info';
          show(next); el.querySelector('[data-tab="' + next + '"]').focus();
        });
      });
      // From a quick view's "Marcar visita".
      try { if (sessionStorage.getItem('uf-tab') === 'visita') { show('visita'); sessionStorage.removeItem('uf-tab'); } } catch (e) { /* fine */ }
      el.querySelectorAll('[data-send]').forEach(function (f) {
        f.addEventListener('submit', function (e) { e.preventDefault(); send(p, f, f.getAttribute('data-send')); });
      });
      if (slotsCache) paintSlots(slotsCache);
    }

    function similar(p) {
      var box = document.querySelector('[data-similar]');
      if (!box) return;
      listAll().then(function (d) {
        var others = (d.properties || []).filter(function (x) { return x && x.reference !== p.reference && !CLOSED[x.status]; });
        others.sort(function (a, b) { return (city(b) === city(p)) - (city(a) === city(p)) || byViews(a, b); });
        if (!others.length) return;
        box.querySelector('[data-similar-grid]').innerHTML = others.slice(0, 3).map(function (x) { return card(x); }).join('');
        box.hidden = false;
      }).catch(function () { /* nothing to suggest */ });
    }

    // Viewing times from the agent's diary (made up in demo mode).
    var slotsCache = null;
    var picked = null;
    var dayPicked = null;
    function demoSlots() {
      var days = [];
      for (var i = 1; days.length < 6; i++) {
        var d = new Date(Date.now() + i * 864e5);
        if (d.getDay() === 0) continue;
        var iso = d.toISOString().slice(0, 10);
        days.push({ date: iso, slots: [10, 11, 14, 15, 16, 17].map(function (h) { return iso + 'T' + String(h - 1).padStart(2, '0') + ':00:00Z'; }) });
      }
      return { days: days, timezone: 'Europe/Lisbon' };
    }
    function loadSlots(p) {
      if (DEMO) { slotsCache = demoSlots(); paintSlots(slotsCache); return; }
      api('/' + encodeURIComponent(p.reference) + '/viewing-slots').then(function (d) {
        slotsCache = d; paintSlots(d);
      }).catch(function () {
        slotsCache = { days: [] }; paintSlots(slotsCache);
      });
    }
    function paintSlots(d) {
      var daysEl = el.querySelector('[data-days]');
      var slotsEl = el.querySelector('[data-slots]');
      if (!daysEl) return;
      var days = (d.days || []).filter(function (x) { return x.slots && x.slots.length; }).slice(0, 7);
      var tz = d.timezone || 'Europe/Lisbon';
      if (!days.length) {
        daysEl.innerHTML = '<p class="small">Sem horas livres na agenda. Use "Pedir informações" e diga-nos quando lhe dá jeito: ligamos a combinar.</p>';
        slotsEl.innerHTML = '';
        return;
      }
      if (!dayPicked || !days.some(function (x) { return x.date === dayPicked; })) dayPicked = days[0].date;
      var fmtDay = new Intl.DateTimeFormat('pt-PT', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
      var fmtTime = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit', timeZone: tz });
      daysEl.innerHTML = days.map(function (x) {
        return '<button type="button" data-day="' + x.date + '" aria-pressed="' + (x.date === dayPicked) + '">' + esc(fmtDay.format(new Date(x.date + 'T12:00:00Z'))) + '</button>';
      }).join('');
      var today = days.filter(function (x) { return x.date === dayPicked; })[0];
      slotsEl.innerHTML = today.slots.map(function (s) {
        return '<button type="button" data-slot="' + s + '" aria-pressed="' + (s === picked) + '">' + esc(fmtTime.format(new Date(s))) + '</button>';
      }).join('');
      daysEl.querySelectorAll('[data-day]').forEach(function (b) { b.addEventListener('click', function () { dayPicked = b.getAttribute('data-day'); picked = null; paintSlots(d); setSubmit(); }); });
      slotsEl.querySelectorAll('[data-slot]').forEach(function (b) { b.addEventListener('click', function () { picked = picked === b.getAttribute('data-slot') ? null : b.getAttribute('data-slot'); paintSlots(d); setSubmit(); }); });
      setSubmit();
    }
    function setSubmit() {
      var b = el.querySelector('[data-submit]');
      if (!b) return;
      if (picked) {
        var tz = (slotsCache && slotsCache.timezone) || 'Europe/Lisbon';
        b.textContent = 'Marcar visita: ' + new Intl.DateTimeFormat('pt-PT', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: tz }).format(new Date(picked));
      } else b.textContent = 'Escolha uma hora';
    }
    function send(p, form, type) {
      var st = form.querySelector('[data-status]');
      var f = new FormData(form);
      var name = String(f.get('name') || '').trim();
      var email = String(f.get('email') || '').trim();
      function say(kind, text) { st.setAttribute('data-kind', kind); st.textContent = text; }
      if (type === 'viewing' && !picked) return say('error', 'Escolha primeiro o dia e a hora da visita.');
      if (!name) return say('error', 'Indique o seu nome, por favor.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return say('error', 'Esse email não parece estar correto.');
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; say('', type === 'viewing' ? 'A marcar…' : 'A enviar…');
      var body = {
        name: name, email: email, phone: String(f.get('phone') || '').trim(), message: String(f.get('message') || '').trim(),
        website: String(f.get('website') || ''), type: type, startsAt: type === 'viewing' ? picked : undefined, language: 'pt',
      };
      var req = DEMO
        ? new Promise(function (ok) { setTimeout(function () { ok(type === 'viewing' ? { viewing: { startsAt: picked, timezone: 'Europe/Lisbon' } } : {}); }, 600); })
        : api('/' + encodeURIComponent(p.reference) + '/enquiries', { method: 'POST', body: body });
      req.then(function (d) {
        var note = DEMO ? ' <span class="opt">(Demonstração: nada foi enviado.)</span>' : '';
        if (d.viewing) {
          var tz = d.viewing.timezone || 'Europe/Lisbon';
          var when = new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: tz }).format(new Date(d.viewing.startsAt));
          form.outerHTML = '<div class="visit-done"><h3>Visita marcada</h3><p>' + esc(when) + '. Enviámos a confirmação para ' + esc(email) + '.' + note + '</p></div>';
          var days = el.querySelector('[data-days]'); var slots = el.querySelector('[data-slots]');
          if (days) days.remove(); if (slots) slots.remove();
        } else {
          form.outerHTML = '<div class="visit-done"><h3>Obrigado</h3><p>Recebemos o seu pedido. Respondemos hoje, por email ou telefone.' + note + '</p></div>';
        }
      }).catch(function (e) {
        btn.disabled = false; setSubmit();
        say('error', e.status === 409 ? 'Essa hora acabou de ser ocupada. Escolha outra, por favor.' : 'Não foi possível enviar. Tente de novo ou ligue-nos para o ' + PHONE + '.');
        if (e.status === 409) { picked = null; loadSlots(p); }
      });
    }
  }

  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  ready(function () {
    // "Marcar visita" in a quick view opens the detail page on that tab.
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-tab-link]');
      if (a) try { sessionStorage.setItem('uf-tab', a.getAttribute('data-tab-link')); } catch (err) { /* fine */ }
    });
    var a = document.querySelector('[data-homes-preview]'); if (a) preview(a);
    var b = document.querySelector('[data-homes-all]'); if (b) all(b);
    var c = document.querySelector('[data-home]'); if (c) detail(c);
  });
})();
