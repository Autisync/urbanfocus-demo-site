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

(function () {
  'use strict';
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  ready(function () {
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
        return '<figure class="member">' + (m.photo ? '<img src="' + esc(m.photo) + '" alt="' + esc(m.name) + '" loading="lazy">' : '') +
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
