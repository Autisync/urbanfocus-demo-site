/*
 * The homes, read live from the CRM (Properties › Website, LISTINGS_KEY).
 *
 *   index.html   [data-homes-preview]  the latest three, as cards
 *   imoveis.html [data-homes-all]      every published home, as cards
 *   imovel.html  [data-home]           one home: photos, details, book a
 *                                      viewing or ask a question
 *
 * A new price, a reservation or a sale in the CRM shows within 30 seconds.
 * Without the key the home page keeps the card written into it, and the other
 * two pages say how to reach the team.
 */
(function () {
  'use strict';
  var C = window.SITE_CONFIG || {};
  var API = String(C.api || 'https://api.autisync.com/api').replace(/\/+$/, '') + '/public/listings';
  var KEY = C.listingsKey || '';
  var PHONE = '965 156 475';
  var WHATSAPP = '351965156475';
  var STATUS = { available: 'Disponível', viewing: 'Disponível', under_offer: 'Com proposta', reserved: 'Reservado', sold: 'Vendido', let: 'Arrendado' };
  var CLOSED = { sold: 1, let: 1 };
  var TYPES = { apartment: 'Apartamento', house: 'Moradia', land: 'Terreno', commercial: 'Comercial', studio: 'Estúdio' };

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
  /** 219.000 €, as Portuguese property ads write it. */
  function price(p) {
    if (p.price == null) return 'Preço sob consulta';
    var s = String(Math.round(p.price)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €';
    return p.listingType === 'rent' ? s + ' / mês' : s;
  }
  function area(v) { return String(v % 1 ? v.toFixed(2) : v).replace('.', ',') + ' m²'; }
  function typology(p) { return p.bedrooms == null ? '' : (p.propertyType === 'house' ? 'V' : 'T') + p.bedrooms; }
  function where(p) {
    var a = p.address || {};
    var parts = [a.neighbourhood, a.city].filter(Boolean);
    if (parts.length === 2 && parts[0] === parts[1]) parts.pop();
    return parts.join(', ');
  }
  function meta(p) {
    return [typology(p), p.areaSqm ? area(p.areaSqm) : '', p.bathrooms ? p.bathrooms + (p.bathrooms === 1 ? ' casa de banho' : ' casas de banho') : '']
      .filter(Boolean).join(' · ');
  }
  function badge(p) {
    return p.status && p.status !== 'available' && p.status !== 'viewing'
      ? '<span class="tag' + (CLOSED[p.status] ? ' tag-closed' : '') + '">' + esc(STATUS[p.status] || p.status) + '</span>' : '';
  }
  function homeUrl(p) { return '/imovel/' + encodeURIComponent(p.reference); }
  function wa(text) { return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text); }

  function card(p) {
    var photo = (p.photos || [])[0];
    return '<a class="home-card' + (CLOSED[p.status] ? ' is-closed' : '') + '" href="' + homeUrl(p) + '">' +
      '<div class="home-card-photo">' + (photo ? '<img src="' + esc(photo.url) + '" alt="" loading="lazy">' : '<span class="no-photo">Fotografias em breve</span>') + badge(p) + '</div>' +
      '<div class="home-card-body">' +
        '<p class="home-card-where">' + esc(where(p)) + '</p>' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<p class="home-card-meta">' + esc(meta(p)) + '</p>' +
        '<p class="home-card-price">' + esc(price(p)) + '</p>' +
      '</div></a>';
  }

  /** Re-draw only when something changed, so a refresh never jumps the page. */
  function painter(el) {
    var last = '';
    return function (html) { if (html !== last) { last = html; el.innerHTML = html; } };
  }
  function every(ms, fn) {
    fn();
    setInterval(function () { if (!document.hidden) fn(); }, ms);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) fn(); });
  }
  function noKey(el) {
    el.innerHTML = '<div class="homes-empty"><p>Os imóveis aparecem aqui assim que o site estiver ligado ao CRM.</p>' +
      '<p>Entretanto, ligue-nos para o <a href="tel:+351965156475">' + PHONE + '</a>.</p></div>';
  }

  // ── Home page: the latest three ──
  function preview(el) {
    var grid = el.querySelector('[data-homes-grid]');
    var more = el.querySelector('[data-homes-more]');
    var fallback = el.querySelector('[data-homes-fallback]');
    if (!KEY || !grid) return;
    var paint = painter(grid);
    every(30000, function () {
      api('?type=sale&limit=24').then(function (d) {
        var list = (d.properties || []).filter(Boolean);
        if (!list.length) return;
        paint(list.slice(0, 3).map(card).join(''));
        grid.hidden = false;
        if (fallback) fallback.hidden = true;
        if (more) { more.hidden = list.length <= 3 && !d.total; var n = more.querySelector('[data-count]'); if (n) n.textContent = d.total || list.length; }
      }).catch(function () { /* keep what is showing */ });
    });
  }

  // ── /imoveis: all of them ──
  function all(el) {
    var grid = el.querySelector('[data-homes-grid]');
    var count = el.querySelector('[data-homes-count]');
    if (!KEY) { noKey(grid); return; }
    var paint = painter(grid);
    every(30000, function () {
      api('?type=sale&limit=50').then(function (d) {
        var list = (d.properties || []).filter(Boolean);
        if (count) count.textContent = list.length === 1 ? '1 imóvel' : list.length + ' imóveis';
        paint(list.length ? list.map(card).join('')
          : '<div class="homes-empty"><p>Neste momento não temos imóveis à venda. Volte em breve, ou peça-nos para o avisarmos.</p></div>');
      }).catch(function () {
        if (!grid.innerHTML.trim() || grid.querySelector('.skel')) noKey(grid);
      });
    });
  }

  // ── /imovel/REF: one home ──
  function detail(el) {
    var m = location.pathname.match(/\/imovel\/([^/?#]+)/);
    var ref = m ? decodeURIComponent(m[1]) : new URLSearchParams(location.search).get('ref');
    if (!KEY || !ref) { noKey(el); return; }
    var first = true;
    var photoIndex = 0;
    var current = null;

    every(30000, function () {
      api('/' + encodeURIComponent(ref)).then(function (d) {
        var p = d.property;
        if (!p) throw Object.assign(new Error('404'), { status: 404 });
        var sig = JSON.stringify([p.price, p.status, p.title, p.description, (p.photos || []).map(function (f) { return f.url; })]);
        if (current === sig) return;
        current = sig;
        draw(p);
        if (first) { first = false; document.title = p.title + ' · Urban Focus'; if (!CLOSED[p.status]) loadSlots(p); }
      }).catch(function (e) {
        if (e.status === 404) {
          el.innerHTML = '<div class="homes-empty"><h1 class="section-title">Este imóvel já não está disponível</h1>' +
            '<p>Pode ter sido vendido ou retirado. Veja <a href="/imoveis">os imóveis à venda</a> ou ligue-nos para o <a href="tel:+351965156475">' + PHONE + '</a>.</p></div>';
        } else if (first) { noKey(el); }
      });
    });

    function draw(p) {
      var photos = p.photos || [];
      if (photoIndex >= photos.length) photoIndex = 0;
      var facts = [];
      if (typology(p)) facts.push(['Tipologia', typology(p)]);
      if (p.areaSqm) facts.push(['Área', area(p.areaSqm)]);
      if (p.plotSqm) facts.push(['Terreno', area(p.plotSqm)]);
      if (p.bathrooms) facts.push(['Casas de banho', String(p.bathrooms)]);
      if (p.propertyType && TYPES[p.propertyType]) facts.push(['Tipo', TYPES[p.propertyType]]);
      if (p.yearBuilt) facts.push(['Ano', String(p.yearBuilt)]);
      if (p.energyRating) facts.push(['Certificado energético', p.energyRating]);
      facts.push(['Estado', STATUS[p.status] || 'Disponível']);
      var closed = CLOSED[p.status];
      var paras = String(p.description || '').split(/\n{2,}|\r\n\r\n/).map(function (t) { return t.trim(); }).filter(Boolean);

      var html =
        '<nav class="crumbs" aria-label="Caminho"><a href="/">Início</a> / <a href="/imoveis">Imóveis à venda</a> / <span>' + esc(p.reference) + '</span></nav>' +
        '<div class="home-top">' +
          '<div class="gallery">' +
            '<div class="gallery-main">' + (photos.length ? '<img src="' + esc(photos[photoIndex].url) + '" alt="' + esc(photos[photoIndex].caption || p.title) + '" data-main>' : '<span class="no-photo">Fotografias em breve</span>') +
              (photos.length > 1 ? '<button type="button" class="gal-btn gal-prev" data-step="-1" aria-label="Fotografia anterior">‹</button><button type="button" class="gal-btn gal-next" data-step="1" aria-label="Fotografia seguinte">›</button>' +
                '<span class="gal-count" data-count>' + (photoIndex + 1) + ' / ' + photos.length + '</span>' : '') +
            '</div>' +
            (photos.length > 1 ? '<div class="gallery-thumbs">' + photos.map(function (f, i) {
              return '<button type="button" data-photo="' + i + '"' + (i === photoIndex ? ' aria-current="true"' : '') + ' aria-label="Fotografia ' + (i + 1) + '"><img src="' + esc(f.url) + '" alt="" loading="lazy"></button>';
            }).join('') + '</div>' : '') +
          '</div>' +
          '<aside class="home-panel">' +
            '<p class="eyebrow">' + esc(where(p)) + '</p>' +
            '<h1>' + esc(p.title) + '</h1>' +
            '<p class="home-price">' + badge(p) + esc(price(p)) + '</p>' +
            '<dl class="facts">' + facts.map(function (f) { return '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('') + '</dl>' +
            (closed ? '<p class="home-closed">Este imóvel já foi vendido. Temos outros parecidos: <a href="/imoveis">ver imóveis à venda</a>.</p>' :
              '<div class="home-actions">' +
                '<a class="btn btn-dark" href="#visita">Marcar visita</a>' +
                '<a class="btn btn-line" href="' + wa('Olá, tenho interesse no imóvel ' + p.reference + ' (' + p.title + ').') + '" target="_blank" rel="noopener">WhatsApp</a>' +
                '<a class="btn btn-line" href="tel:+351965156475">' + PHONE + '</a>' +
              '</div>') +
            '<p class="ref">Ref. ' + esc(p.reference) + '</p>' +
          '</aside>' +
        '</div>' +
        '<div class="home-bottom">' +
          '<div class="home-text">' +
            '<h2>Sobre este imóvel</h2>' + (paras.length ? paras.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('') : '<p>Peça-nos mais informações.</p>') +
            ((p.features || []).length ? '<h2>Destaques</h2><ul class="features">' + p.features.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' : '') +
          '</div>' +
          (closed ? '' : '<section class="visit card" id="visita" aria-labelledby="visita-h">' +
            '<h2 id="visita-h">Marcar visita</h2>' +
            '<p class="small">Escolha o dia e a hora. Recebe a confirmação por email.</p>' +
            '<div class="visit-days" data-days><p class="small">A carregar as horas livres…</p></div>' +
            '<div class="visit-slots" data-slots></div>' +
            '<form class="visit-form" data-visit novalidate>' +
              '<input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
              '<label class="field">Nome<input name="name" autocomplete="name" required></label>' +
              '<label class="field">Telemóvel<input name="phone" type="tel" autocomplete="tel"></label>' +
              '<label class="field full">Email<input name="email" type="email" autocomplete="email" required></label>' +
              '<label class="field full">Mensagem <span class="opt">(opcional)</span><textarea name="message" rows="3"></textarea></label>' +
              '<button class="btn btn-dark btn-block" type="submit" data-submit>Pedir informações</button>' +
              '<p class="status" data-status role="status"></p>' +
            '</form>' +
          '</section>') +
        '</div>';
      // Later refreshes (a new price, reserved, sold) replace the top only, so a
      // half-filled form below is never wiped. A home that sells is drawn again.
      var top = el.querySelector('.home-top');
      if (top && !closed) {
        var tmp = document.createElement('div'); tmp.innerHTML = html;
        top.replaceWith(tmp.querySelector('.home-top'));
        wire(p, true);
      } else { el.innerHTML = html; wire(p, false); }
    }

    function wire(p, topOnly) {
      var photos = p.photos || [];
      function go(i) {
        photoIndex = (i + photos.length) % photos.length;
        var main = el.querySelector('[data-main]');
        if (main) { main.src = photos[photoIndex].url; main.alt = photos[photoIndex].caption || p.title; }
        var c = el.querySelector('[data-count]'); if (c) c.textContent = (photoIndex + 1) + ' / ' + photos.length;
        el.querySelectorAll('[data-photo]').forEach(function (b) { b.toggleAttribute('aria-current', Number(b.getAttribute('data-photo')) === photoIndex); });
      }
      el.querySelectorAll('[data-photo]').forEach(function (b) { b.addEventListener('click', function () { go(Number(b.getAttribute('data-photo'))); }); });
      el.querySelectorAll('[data-step]').forEach(function (b) { b.addEventListener('click', function () { go(photoIndex + Number(b.getAttribute('data-step'))); }); });
      var main = el.querySelector('.gallery-main');
      if (main && photos.length > 1) {
        var x0 = null;
        main.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
        main.addEventListener('touchend', function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(photoIndex + (dx < 0 ? 1 : -1)); x0 = null; });
      }
      if (topOnly) return;
      var form = el.querySelector('[data-visit]');
      if (form) form.addEventListener('submit', function (e) { e.preventDefault(); send(p, form); });
      if (slotsCache) paintSlots(slotsCache);
    }

    // Viewing times from the agent's diary.
    var slotsCache = null;
    var picked = null;
    var dayPicked = null;
    function loadSlots(p) {
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
        daysEl.innerHTML = '<p class="small">Diga-nos quando lhe dá jeito e ligamos a combinar.</p>';
        slotsEl.innerHTML = '';
        return;
      }
      if (!dayPicked || !days.some(function (x) { return x.date === dayPicked; })) dayPicked = days[0].date;
      var fmtDay = new Intl.DateTimeFormat('pt-PT', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
      var fmtTime = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit', timeZone: tz });
      daysEl.innerHTML = days.map(function (x) {
        return '<button type="button" data-day="' + x.date + '"' + (x.date === dayPicked ? ' aria-pressed="true"' : ' aria-pressed="false"') + '>' + esc(fmtDay.format(new Date(x.date + 'T12:00:00Z'))) + '</button>';
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
      } else b.textContent = 'Pedir informações';
    }
    function send(p, form) {
      var st = form.querySelector('[data-status]');
      var f = new FormData(form);
      var name = String(f.get('name') || '').trim();
      var email = String(f.get('email') || '').trim();
      function say(kind, text) { st.setAttribute('data-kind', kind); st.textContent = text; }
      if (!name) return say('error', 'Indique o seu nome, por favor.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return say('error', 'Esse email não parece estar correto.');
      var btn = form.querySelector('[data-submit]');
      btn.disabled = true; say('', picked ? 'A marcar…' : 'A enviar…');
      api('/' + encodeURIComponent(p.reference) + '/enquiries', { method: 'POST', body: {
        name: name, email: email, phone: String(f.get('phone') || '').trim(), message: String(f.get('message') || '').trim(),
        website: String(f.get('website') || ''), type: picked ? 'viewing' : 'enquiry', startsAt: picked || undefined, language: 'pt',
      } }).then(function (d) {
        if (d.viewing) {
          var tz = d.viewing.timezone || 'Europe/Lisbon';
          var when = new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: tz }).format(new Date(d.viewing.startsAt));
          form.outerHTML = '<div class="visit-done"><h3>Visita marcada</h3><p>' + esc(when) + '. Enviámos a confirmação para ' + esc(email) + '.</p></div>';
        } else {
          form.outerHTML = '<div class="visit-done"><h3>Obrigado</h3><p>Recebemos o seu pedido. Respondemos hoje, por email ou telefone.</p></div>';
        }
        var days = el.querySelector('[data-days]'); var slots = el.querySelector('[data-slots]');
        if (days) days.remove(); if (slots) slots.remove();
      }).catch(function (e) {
        btn.disabled = false; setSubmit();
        say('error', e.status === 409 ? 'Essa hora acabou de ser ocupada. Escolha outra, por favor.' : 'Não foi possível enviar. Tente de novo ou ligue-nos para o ' + PHONE + '.');
        if (e.status === 409) { picked = null; loadSlots(p); }
      });
    }
  }

  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  ready(function () {
    var a = document.querySelector('[data-homes-preview]'); if (a) preview(a);
    var b = document.querySelector('[data-homes-all]'); if (b) all(b);
    var c = document.querySelector('[data-home]'); if (c) detail(c);
  });
})();
