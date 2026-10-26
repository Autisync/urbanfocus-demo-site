/*
 * Gentle motion: sections and cards fade up a little the first time they
 * come into view, one after the other within a group. Nothing moves for
 * visitors who ask for less motion, and without this script everything is
 * simply there (the hiding class is only added here).
 */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var SEL = [
    '.hero-copy > *', '.form-card', '.assure-in > p',
    '.section-title', '.section-sub', '.time-chart', '.cmp-table-wrap', '.cmp-cta',
    '.how-photos img', '.steps li', '.footnote', '.case-grid article',
    '.about-copy > *', '.values li', '.about-facts', '.team-intro > *', '.member',
    '.story-carousel', '.book-copy > *', '.book-steps li', '.faq details',
    '.partner-logo', '.partner-copy > *', '.final-in > *',
  ].join(',');
  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  ready(function () {
    var els = Array.prototype.slice.call(document.querySelectorAll(SEL)).filter(function (el) { return !el.closest('[hidden]'); });
    if (!els.length) return;
    document.documentElement.classList.add('anim');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) {
      // Siblings arrive one after another (at most 0.4 s apart in total).
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.matches(SEL); });
      var k = sibs.indexOf(el);
      el.style.setProperty('--d', Math.min(k, 5) * 70 + 'ms');
      el.classList.add('reveal');
      io.observe(el);
    });
    // A jump (a menu link, a fast fling) can pass a section without it ever
    // touching the screen; anything already above the bottom edge shows.
    var pending = els.slice(), tick = false;
    function sweep() {
      tick = false;
      var h = window.innerHeight;
      pending = pending.filter(function (el) {
        if (el.classList.contains('is-in')) return false;
        if (el.getBoundingClientRect().top < h) { el.classList.add('is-in'); io.unobserve(el); return false; }
        return true;
      });
      if (!pending.length) window.removeEventListener('scroll', onScroll);
    }
    function onScroll() { if (!tick) { tick = true; requestAnimationFrame(sweep); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', onScroll);
  });
})();
