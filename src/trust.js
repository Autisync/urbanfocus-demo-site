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
        // Testimonials, after Rabii Mhamdi's "Testimonials Sections" (SquareUi)
        // on Dribbble: the title on the left, one quote at a time on the
        // right, set large, with the client's name under a thin rule and the
        // arrows beside it. All quotes share one grid cell, so the box is as
        // tall as the longest and nothing jumps. It moves on by itself every
        // 7 seconds while on screen, holds while a mouse rests on it or the
        // keyboard is in it, and has a pause button.
        grid.className = 'tsq-card';
        grid.setAttribute('role', 'region');
        grid.setAttribute('aria-roledescription', 'carrossel');
        grid.setAttribute('aria-label', 'Testemunhos de clientes');
        grid.innerHTML =
          '<div class="tsq-quotes">' + stories.map(function (st, i) {
            return '<figure class="tsq-q" id="tsq-' + i + '" role="group" aria-roledescription="testemunho" aria-label="' + (i + 1) + ' de ' + stories.length + '">' +
              '<blockquote>“' + esc(st.quote || '') + '”</blockquote>' +
              '<figcaption><b>' + esc(st.name || '') + '</b><span>' + esc([st.situation, st.place].filter(Boolean).join(' · ') || 'Cliente UrbanFocus') + '</span></figcaption>' +
            '</figure>';
          }).join('') + '</div>' +
          '<div class="tsq-foot">' +
            '<span class="tsq-count" aria-hidden="true"></span>' +
            '<span class="tsq-bar" aria-hidden="true"><i></i></span>' +
            '<div class="tsq-ctl">' +
              '<button type="button" class="tsq-btn tsq-play" aria-pressed="false" aria-label="Pausar"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path class="i-pause" d="M4 3h3v10H4zM9 3h3v10H9z" fill="currentColor"/><path class="i-play" d="M5 3l8 5-8 5z" fill="currentColor"/></svg></button>' +
              '<button type="button" class="tsq-btn" data-dir="-1" aria-label="Testemunho anterior"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button>' +
              '<button type="button" class="tsq-btn" data-dir="1" aria-label="Testemunho seguinte"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button>' +
            '</div>' +
          '</div>';
        var qs = grid.querySelectorAll('.tsq-q');
        var count = grid.querySelector('.tsq-count');
        var bar = grid.querySelector('.tsq-bar i');
        var n = stories.length, at = 0, DUR = 7000;
        var render = function () {
          Array.prototype.forEach.call(qs, function (q, k) {
            q.classList.toggle('is-on', k === at);
            q.setAttribute('aria-hidden', k === at ? 'false' : 'true');
          });
          count.textContent = String(at + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
          bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
          grid.classList.toggle('is-running', !!timer && !paused);
        };
        var go = function (i) { at = ((i % n) + n) % n; render(); };
        var timer = null, held = false, paused = false;
        var pb = grid.querySelector('.tsq-play');
        var play = function () { if (paused || held || timer) return; timer = setInterval(function () { if (!document.hidden) go(at + 1); }, DUR); render(); };
        var stop = function () { clearInterval(timer); timer = null; grid.classList.remove('is-running'); };
        var restart = function () { stop(); play(); render(); };
        grid.addEventListener('click', function (e) {
          var b = e.target.closest('[data-dir]'); if (b) { go(at + Number(b.getAttribute('data-dir'))); restart(); }
        });
        pb.addEventListener('click', function () {
          paused = !paused; pb.setAttribute('aria-pressed', paused ? 'true' : 'false');
          pb.setAttribute('aria-label', paused ? 'Continuar' : 'Pausar');
          if (paused) stop(); else play();
        });
        grid.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowRight') { e.preventDefault(); go(at + 1); restart(); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); go(at - 1); restart(); }
        });
        // Swipe on a phone.
        var x0 = null;
        grid.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
        grid.addEventListener('touchend', function (e) {
          if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
          if (Math.abs(dx) > 40) { go(at + (dx < 0 ? 1 : -1)); restart(); }
        }, { passive: true });
        // Only a mouse resting on it holds it: a tap on a phone must not.
        grid.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { held = true; stop(); } });
        grid.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { held = false; play(); } });
        grid.addEventListener('focusin', function (e) { if (e.target.matches && e.target.matches(':focus-visible')) { held = true; stop(); } });
        grid.addEventListener('focusout', function () { held = false; play(); });
        render();
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (es) { if (es[0].isIntersecting) play(); else stop(); }, { threshold: 0.25 }).observe(grid);
        } else play();
      }
      sec.hidden = false;
    }
  });
})();
