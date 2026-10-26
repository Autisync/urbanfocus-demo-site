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

// The team, from Luís (26 Oct 2026): photo, name, role, what they do, their words.
window.UF_TEAM_INTRO = {
  title: 'Uma equipa de confiança. Um processo transparente.',
  text: [
    'Na UrbanFocus, compramos imóveis diretamente aos proprietários, oferecendo uma alternativa simples, profissional e livre das complicações da venda tradicional.',
    'Combinamos conhecimento do mercado, análise rigorosa e um acompanhamento próximo para avaliar cada oportunidade e apresentar propostas claras e ajustadas. Cuidamos de cada detalhe para que não tenha de se preocupar com nada.',
  ],
  tagline: 'Compramos diretamente. Simplificamos cada decisão.',
};
window.UF_TEAM = [
  { name: 'Luís Poças', role: 'Gestor de Aquisições Imobiliárias', area: 'Negociação e desenvolvimento de oportunidades', photo: '/img/equipa/luis.jpg',
    line: 'Transformo oportunidades imobiliárias em negócios concretos, combinando visão estratégica, rigor na negociação e total transparência.' },
  { name: 'Martim André', role: 'Comprador Júnior', area: 'Prospeção e acompanhamento de proprietários', photo: '/img/equipa/martim.jpg',
    line: 'Foco-me no contacto próximo e na disponibilidade para apoiar cada proprietário, encontrando a solução certa para cada imóvel com total transparência.' },
  { name: 'Andreia André', role: 'Analista de Investimento Imobiliário', area: 'Avaliação e viabilidade dos investimentos', photo: '/img/equipa/andreia.jpg',
    line: 'Analiso cada oportunidade com rigor e visão de mercado, fundamentando decisões sólidas e propostas ajustadas à realidade de cada imóvel.' },
];

window.UF_STORIES = [
  // From the onboarding form (25 Oct 2026), in the clients' own words; Luís
  // has their permission to publish them (oral; written confirmation to come).
  { quote: "O processo de venda de um apartamento à Urban Focus decorreu da melhor forma. O que mais valorizei na relação com a empresa foi a confiança e a honestidade. Tudo decorreu com a máxima rapidez, no que dependeu dos responsáveis da empresa, e sempre com transparência. Numa altura em que o mercado da habitação está tão exuberante, é importante poder confiar nos parceiros com quem negociamos.", name: "Susana Santos" },
  { quote: "Obrigado por tudo: pela simpatia, transparência, profissionalismo e competência. A venda do nosso apartamento foi uma experiência perfeita graças ao acompanhamento do Luís Poças que dominava todos os detalhes do processo transmitindo-nos deste sempre confiança e tranquilidade. Recomendo vivamente a UrbanFocus.", name: "Carlos Domingos" },
  { quote: "Demonstra um real conhecimento do mercado imobiliário, quer na comercialização, quer nas questões técnicas inerentes ao imóvel. Linguagem simples e assertiva, transmitindo confiança em todo o processo. Apresenta soluções, elevada literacia financeira. Faz acontecer 💪 Recomendo.", name: "Ermelinda Pinto" },
  { quote: "Excelente escolha para a venda de imóveis. Equipa muito profissional, competente e conhecedor do mercado. Bom trato, simpatia e responsabilidade.", name: "Carlos Marques" },
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
      var intro = window.UF_TEAM_INTRO || null;
      t.innerHTML = (intro
        ? '<div class="team-intro"><h3>' + esc(intro.title) + '</h3>' + (intro.text || []).map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') +
          (intro.tagline ? '<p class="team-tagline"><b>UrbanFocus</b> — ' + esc(intro.tagline) + '</p>' : '') + '</div>'
        : '<h3>A equipa</h3>') +
        '<div class="team-grid">' + team.map(function (m) {
        return '<figure class="member">' + (m.photo ? '<img src="' + esc(m.photo) + '" alt="' + esc(m.name) + ', ' + esc(m.role || '') + '" loading="lazy" width="720" height="960">' : '<span class="member-ph">Fotografia</span>') +
          '<figcaption><b>' + esc(m.name) + '</b><span>' + esc(m.role || '') + '</span>' + (m.area ? '<small>' + esc(m.area) + '</small>' : '') +
          (m.line ? '<p>' + esc(m.line) + '</p>' : '') + '</figcaption></figure>';
      }).join('') + '</div>';
      t.hidden = false;
    }
    var stories = (window.UF_STORIES || []).filter(function (s) { return s && (s.quote || s.video); });
    var sec = document.querySelector('[data-stories]');
    var grid = document.querySelector('[data-story-grid]');
    if (sec && grid && stories.length) {
      var slide = function (s, i) {
        var media = s.video
          ? '<video class="story-video" src="' + esc(s.video) + '"' + (s.photo ? ' poster="' + esc(s.photo) + '"' : '') + ' controls playsinline preload="none"></video>'
          : (s.photo ? '<img src="' + esc(s.photo) + '" alt="" loading="lazy">' : '');
        return '<article class="story' + (s.video ? ' has-video' : '') + '" role="group" aria-roledescription="testemunho" aria-label="' + (i + 1) + ' de ' + stories.length + '">' + media +
          (s.situation || s.place ? '<p class="story-sit">' + esc(s.situation || '') + (s.situation && s.place ? ' · ' : '') + esc(s.place || '') + '</p>' : '') +
          (s.quote ? '<blockquote>' + esc(s.quote) + '</blockquote>' : '') +
          '<p class="story-name">' + esc(s.name || '') + '</p>' +
          (s.solved ? '<p class="story-solved">' + esc(s.solved) + '</p>' : '') + '</article>';
      };
      if (stories.length < 2) {
        grid.innerHTML = stories.map(slide).join('');
      } else {
        // The testimonials wheel (after Binu Paul's "Testimonials" concept on
        // Dribbble): the clients on a curved line on the left, the one being
        // read in the middle and larger; their words on the right, with a
        // drop cap. It turns by itself every 7 seconds while on screen, holds
        // while the visitor points at it or uses the keyboard in it, and has a
        // pause button. No photos or star ratings: only what clients gave us.
        var initials = function (n) { return String(n || '').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join(''); };
        grid.className = 'tst';
        grid.setAttribute('role', 'region');
        grid.setAttribute('aria-roledescription', 'carrossel');
        grid.setAttribute('aria-label', 'Testemunhos de clientes');
        grid.innerHTML =
          '<div class="tst-wheel">' +
            '<svg class="tst-arc" viewBox="0 0 120 400" preserveAspectRatio="none" aria-hidden="true"><path d="M70 0 C 10 120, 10 280, 70 400" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>' +
            '<div class="tst-people" role="tablist" aria-label="Escolher testemunho">' +
              stories.map(function (st, i) {
                return '<button type="button" class="tst-person" role="tab" id="tst-p' + i + '" aria-controls="tst-quote" data-i="' + i + '">' +
                  '<span class="tst-avatar" aria-hidden="true">' + esc(initials(st.name)) + '</span>' +
                  '<span class="tst-who"><b>' + esc(st.name || '') + '</b>' + (st.situation || st.place ? '<small>' + esc([st.situation, st.place].filter(Boolean).join(' · ')) + '</small>' : '<small>Cliente UrbanFocus</small>') + '</span>' +
                '</button>';
              }).join('') +
            '</div>' +
          '</div>' +
          '<div class="tst-main">' +
            '<span class="tst-mark" aria-hidden="true">“</span>' +
            '<div id="tst-quote" class="tst-quote" role="tabpanel" aria-live="polite"></div>' +
            '<div class="tst-nav">' +
              '<button type="button" class="story-btn" data-dir="-1" aria-label="Testemunho anterior">‹</button>' +
              '<span class="tst-count" aria-hidden="true"></span>' +
              '<button type="button" class="story-btn" data-dir="1" aria-label="Testemunho seguinte">›</button>' +
              '<button type="button" class="story-play" aria-pressed="false">Pausar</button>' +
            '</div>' +
          '</div>';
        var people = grid.querySelectorAll('.tst-person');
        var quoteBox = grid.querySelector('.tst-quote');
        var count = grid.querySelector('.tst-count');
        var n = stories.length, at = 0;
        var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
        var render = function () {
          Array.prototype.forEach.call(people, function (el, k) {
            var d = ((k - at) % n + n) % n; if (d > n / 2) d -= n;   // -2 … 2
            el.setAttribute('data-pos', Math.abs(d) > 1 ? (d < 0 ? 'far-up' : 'far-down') : String(d));
            el.setAttribute('aria-selected', d === 0 ? 'true' : 'false');
            el.tabIndex = d === 0 ? 0 : -1;
          });
          var st = stories[at];
          quoteBox.classList.remove('is-in');
          var paint = function () {
            quoteBox.innerHTML = '<blockquote>' + esc(st.quote || '') + '</blockquote>' +
              '<p class="tst-by"><b>' + esc(st.name || '') + '</b>' + (st.solved ? '<span>' + esc(st.solved) + '</span>' : '') + '</p>';
            quoteBox.setAttribute('aria-labelledby', 'tst-p' + at);
            void quoteBox.offsetWidth; quoteBox.classList.add('is-in');
          };
          if (calm) paint(); else setTimeout(paint, quoteBox.innerHTML ? 180 : 0);
          count.textContent = (at + 1) + ' / ' + n;
        };
        var go = function (i) { at = ((i % n) + n) % n; render(); };
        var timer = null, held = false, paused = false;
        var pb = grid.querySelector('.story-play');
        var play = function () { if (paused || timer) return; timer = setInterval(function () { if (!held && !document.hidden) go(at + 1); }, 7000); };
        var stop = function () { clearInterval(timer); timer = null; };
        var restart = function () { stop(); play(); };
        grid.addEventListener('click', function (e) {
          var b = e.target.closest('.story-btn'); if (b) { go(at + Number(b.getAttribute('data-dir'))); restart(); return; }
          var p = e.target.closest('.tst-person'); if (p) { go(Number(p.getAttribute('data-i'))); restart(); }
        });
        pb.addEventListener('click', function () {
          paused = !paused; pb.setAttribute('aria-pressed', paused ? 'true' : 'false');
          pb.textContent = paused ? 'Continuar' : 'Pausar';
          if (paused) stop(); else play();
        });
        grid.querySelector('.tst-people').addEventListener('keydown', function (e) {
          var k = e.key;
          if (k === 'ArrowDown' || k === 'ArrowRight') { e.preventDefault(); go(at + 1); restart(); people[at].focus(); }
          if (k === 'ArrowUp' || k === 'ArrowLeft') { e.preventDefault(); go(at - 1); restart(); people[at].focus(); }
        });
        // Only a mouse resting on it holds it: a tap on a phone must not.
        grid.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') held = true; });
        grid.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') held = false; });
        grid.addEventListener('focusin', function (e) { if (e.target.matches && e.target.matches(':focus-visible')) held = true; });
        grid.addEventListener('focusout', function () { held = false; });
        render();
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (es) { if (es[0].isIntersecting) play(); else stop(); }, { threshold: 0.25 }).observe(grid);
        } else play();
      }
      sec.hidden = false;
    }
  });
})();
