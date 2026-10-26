/*!
 * UrbanFocus — the seller funnel's form (vender/a and vender/b).
 *
 * The form is a set of <fieldset class="step"> shown one at a time. Each step
 * lists what it needs in data-need ("zona tipologia"); the contact step is
 * checked here (name, a Portuguese phone, optional email, consent).
 *
 * The request goes to UrbanFocus's seller form in the CRM
 * (/api/public/lead-forms/<key>), which files the contact and a "Vender casa"
 * deal and tells the team. The page path (/vender/a or /vender/b) is sent as
 * "pagina", so every request says which page it came from.
 *
 * Visitors (CRM): the tracker (/t.js) counts the visit; each step reached is a
 * click event "Vender A · passo 2" (or B), the request sent is a conversion
 * "Vender A · pedido enviado". A funnel in Visitors per page compares A and B.
 */
(function () {
  'use strict';
  var C = window.SITE_CONFIG || {};
  var API = String(C.api || 'https://api.autisync.com/api').replace(/\/+$/, '');
  var APP = String(C.app || 'https://app.autisync.com').replace(/\/+$/, '');
  var FORM_KEY = 'E9CLk_Qx7cE3cOUwRkt967m8'; // UrbanFocus · "Pedido de proposta" (sell_home)

  if (C.trackKey) {
    var s = document.createElement('script');
    s.src = APP + '/t.js'; s.defer = true;
    s.setAttribute('data-site', C.trackKey); s.setAttribute('data-api', API);
    document.head.appendChild(s);
  }

  var form = document.getElementById('f');
  if (!form) return;
  var V = (form.getAttribute('data-variant') || 'a').toUpperCase();
  var steps = Array.prototype.slice.call(form.querySelectorAll('.step'));
  var bars = Array.prototype.slice.call(form.querySelectorAll('.progress i'));
  var next = document.getElementById('next');
  var back = document.getElementById('back');
  var count = document.getElementById('count');
  var at = 0;

  function track(type, label) { try { window.autisyncTrack && window.autisyncTrack(type, label); } catch (e) { /* never in the way */ } }

  var qs = new URLSearchParams(location.search);
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(function (k) {
    if (form.elements[k]) form.elements[k].value = (qs.get(k) || '').slice(0, 100);
  });
  form.elements.pagina.value = location.pathname.replace(/\.html$/, '');

  function val(n) { var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; }
  function say(m) { var e = steps[at].querySelector('.err'); if (e) e.textContent = m || ''; }
  function pt(s) { return String(s || '').replace(/[\s.()-]/g, '').replace(/^(\+351|00351)/, ''); }

  var MSG = {
    zona: 'Escolha a zona da casa.', tipo: 'Escolha o tipo de imóvel.', tipologia: 'Escolha a tipologia.',
    estado: 'Diga-nos o estado da casa.', prazo: 'Diga-nos quando quer vender.',
  };
  function check(i) {
    var st = steps[i];
    var need = (st.getAttribute('data-need') || '').split(/\s+/).filter(Boolean);
    for (var k = 0; k < need.length; k++) if (!val(need[k])) return MSG[need[k]] || 'Falta responder a esta pergunta.';
    if (val('codigo_postal') && st.contains(form.elements.codigo_postal) && !/^\d{4}-?\d{3}$/.test(val('codigo_postal'))) return 'O código postal tem a forma 2600-000.';
    if (st.hasAttribute('data-contact')) {
      if (val('nome').length < 2) return 'Escreva o seu nome.';
      if (!/^(9[1236]\d{7}|2\d{8})$/.test(pt(val('telefone')))) return 'Escreva um telemóvel ou telefone português com 9 algarismos.';
      if (val('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val('email'))) return 'Esse email não parece completo.';
      if (!form.elements.consentimento.checked) return 'Para lhe ligarmos, precisamos que aceite o contacto.';
    }
    return '';
  }

  function show(i) {
    steps.forEach(function (s, k) { s.hidden = k !== i; });
    bars.forEach(function (b, k) { b.classList.toggle('on', k <= i); });
    if (count) count.textContent = 'Passo ' + (i + 1) + ' de ' + steps.length;
    back.hidden = i === 0;
    next.textContent = i === steps.length - 1 ? (form.getAttribute('data-send') || 'Pedir proposta') : 'Continuar';
    if (i > 0) track('click', 'Vender ' + V + ' · passo ' + (i + 1));
  }

  function go() {
    var m = check(at);
    if (m) { say(m); return; }
    say('');
    if (at < steps.length - 1) {
      at += 1; show(at);
      var f = steps[at].querySelector('input:not([type=hidden]), select');
      if (f) f.focus({ preventScroll: true });
      var card = document.getElementById('pedido');
      if (card && card.getBoundingClientRect().top < 0) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    send();
  }

  function send() {
    next.disabled = true; next.textContent = 'A enviar…';
    var data = {};
    Array.prototype.forEach.call(form.elements, function (f) {
      if (!f.name) return;
      if ((f.type === 'radio' || f.type === 'checkbox') && !f.checked) return;
      data[f.name] = String(f.value || '').trim();
    });
    data.telefone = pt(data.telefone);
    data.consentimento = form.elements.consentimento.checked ? 'sim' : 'nao';
    data.novidades = form.elements.novidades && form.elements.novidades.checked ? 'sim' : 'nao';
    var done = function () {
      track('convert', 'Vender ' + V + ' · pedido enviado');
      form.hidden = true;
      var n = document.getElementById('dname'); if (n) n.textContent = (data.nome || '').split(' ')[0] || '';
      var d = document.getElementById('done'); d.hidden = false; d.focus();
    };
    // ?teste=1 checks the page without sending anything to the CRM.
    if (qs.get('teste') === '1') { done(); return; }
    fetch(API + '/public/lead-forms/' + FORM_KEY, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) return r.json().catch(function () { return {}; }).then(function (j) { throw new Error(j && j.error || 'send'); }); done(); })
      .catch(function () {
        next.disabled = false; next.textContent = form.getAttribute('data-send') || 'Pedir proposta';
        say('Não conseguimos enviar agora. Tente de novo ou ligue-nos: 965 156 475.');
      });
  }

  form.addEventListener('change', function (e) {
    say('');
    // A step whose questions are all answered with cards moves on by itself.
    var st = steps[at];
    if (e.target.type === 'radio' && st.hasAttribute('data-auto') && !check(at)) setTimeout(go, 220);
  });
  form.addEventListener('input', function () { say(''); });
  next.addEventListener('click', go);
  back.addEventListener('click', function () { if (at > 0) { at -= 1; show(at); } });
  form.addEventListener('submit', function (e) { e.preventDefault(); go(); });
  form.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'checkbox') { e.preventDefault(); go(); } });
  // Any "Pedir proposta" button lower on the page brings the form back into view.
  Array.prototype.forEach.call(document.querySelectorAll('[data-to-form]'), function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); document.getElementById('pedido').scrollIntoView({ behavior: 'smooth', block: 'start' }); var f = steps[at].querySelector('input:not([type=hidden]), select'); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 400); });
  });
  show(0);
})();
