/*
 * "Quem somos" and "Casos reais": the team and the stories of people Urban
 * Focus has bought from. Fill the two lists below; a section with an empty
 * list stays hidden, so nothing half-done ever shows on the site.
 *
 * Team photos go in img/equipa/ (square, at least 600 × 600).
 * Only publish a story with the person's permission. First name and town are
 * enough; a photo is optional.
 */
// Real numbers only, shown under the hero, e.g. as on homebuyers.pt.
window.UF_STATS = [
  // { value: '40+', label: 'Imóveis comprados' },
  // { value: '5', label: 'Anos de experiência' },
  // { value: '24 h', label: 'Para a proposta escrita' },
];

window.UF_TEAM = [
  // { name: 'Luís', role: 'Fundador · Aquisições', photo: '/img/equipa/luis.jpg', line: 'Visito cada imóvel e faço a proposta.' },
];

window.UF_STORIES = [
  // {
  //   situation: 'Herança com três herdeiros',
  //   place: 'Alhandra',
  //   quote: 'O que a pessoa disse, nas palavras dela.',
  //   name: 'Maria',
  //   solved: 'O que fizemos: falámos com os três irmãos, tratámos da habilitação e fizemos a escritura em 5 semanas.',
  //   photo: '',  // optional, e.g. '/img/casos/alhandra.jpg'
  //   video: '',  // optional, a vertical video testimonial, e.g. '/videos/maria.mp4' (with photo as its poster)
  // },
];

/*
 * Preview: /?preview fills the three lists with clearly labelled EXAMPLES, so
 * Luís can see how the sections will look before sending the real ones.
 * Visitors without ?preview never see them.
 */
if (/[?&]preview\b/.test(location.search)) {
  window.UF_PREVIEW = true;
  if (!window.UF_STATS.length) window.UF_STATS = [
    { value: 'XX+', label: 'Imóveis comprados (exemplo)' },
    { value: 'X', label: 'Anos de experiência (exemplo)' },
    { value: '24 h', label: 'Para a proposta escrita' },
  ];
  if (!window.UF_TEAM.length) window.UF_TEAM = [
    { name: 'Nome', role: 'Fundador · Aquisições', line: 'Exemplo: a fotografia e a frase de cada pessoa da equipa.' },
    { name: 'Nome', role: 'Avaliações e obras', line: 'Exemplo: quem visita as casas e prepara a proposta.' },
    { name: 'Nome', role: 'Processos e escrituras', line: 'Exemplo: quem trata da papelada até à escritura.' },
  ];
  if (!window.UF_STORIES.length) window.UF_STORIES = [
    { situation: 'Herança', place: 'Localidade', quote: 'Exemplo: aqui entra o testemunho real, nas palavras do cliente.', name: 'Nome do cliente', solved: 'O que fizemos: um resumo de como resolvemos o caso.' },
    { situation: 'Casa com obras', place: 'Localidade', quote: 'Exemplo: o segundo testemunho real. Pode ser texto ou um vídeo vertical.', name: 'Nome do cliente', solved: 'O que fizemos: um resumo de como resolvemos o caso.' },
    { situation: 'Venda rápida', place: 'Localidade', quote: 'Exemplo: o terceiro testemunho real.', name: 'Nome do cliente', solved: 'O que fizemos: um resumo de como resolvemos o caso.' },
  ];
}

(function () {
  'use strict';
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  ready(function () {
    if (window.UF_PREVIEW) {
      document.documentElement.classList.add('is-preview');
      var bar = document.createElement('div');
      bar.className = 'preview-bar';
      bar.textContent = 'Pré-visualização: os números, a equipa e os testemunhos marcados como exemplo são substituídos pelos reais.';
      document.body.insertBefore(bar, document.body.firstChild);
    }
    var stats = (window.UF_STATS || []).filter(function (x) { return x && x.value; });
    var st = document.querySelector('[data-stats]');
    if (st && stats.length) {
      st.innerHTML = stats.map(function (x) { return '<div><dt>' + esc(x.label) + '</dt><dd>' + esc(x.value) + '</dd></div>'; }).join('');
      st.hidden = false;
    }
    var team = (window.UF_TEAM || []).filter(function (m) { return m && m.name; });
    var t = document.querySelector('[data-team]');
    if (t && team.length) {
      t.innerHTML = '<h3>A equipa</h3><div class="team-grid">' + team.map(function (m) {
        return '<figure class="member">' + (m.photo ? '<img src="' + esc(m.photo) + '" alt="' + esc(m.name) + '" loading="lazy">' : '<span class="member-ph">Fotografia</span>') +
          '<figcaption><b>' + esc(m.name) + '</b><span>' + esc(m.role || '') + '</span>' + (m.line ? '<p>' + esc(m.line) + '</p>' : '') + '</figcaption></figure>';
      }).join('') + '</div>';
      t.hidden = false;
    }
    var stories = (window.UF_STORIES || []).filter(function (s) { return s && (s.quote || s.video); });
    var sec = document.querySelector('[data-stories]');
    var grid = document.querySelector('[data-story-grid]');
    if (sec && grid && stories.length) {
      grid.innerHTML = stories.map(function (s) {
        var media = s.video
          ? '<video class="story-video" src="' + esc(s.video) + '"' + (s.photo ? ' poster="' + esc(s.photo) + '"' : '') + ' controls playsinline preload="none"></video>'
          : (s.photo ? '<img src="' + esc(s.photo) + '" alt="" loading="lazy">' : '');
        return '<article class="story' + (s.video ? ' has-video' : '') + '">' + media +
          '<p class="story-sit">' + esc(s.situation || '') + (s.place ? ' · ' + esc(s.place) : '') + '</p>' +
          (s.quote ? '<blockquote>' + esc(s.quote) + '</blockquote>' : '') +
          '<p class="story-name">' + esc(s.name || '') + '</p>' +
          (s.solved ? '<p class="story-solved">' + esc(s.solved) + '</p>' : '') + '</article>';
      }).join('');
      sec.hidden = false;
    }
  });
})();
