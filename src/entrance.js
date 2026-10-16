/*
 * The entrance: two doors open as the visitor scrolls, and the camera walks
 * into the room behind them (the "step inside" effect, without video).
 * Progress p goes 0 → 1 over the entrance's scroll length.
 *   0.00–0.55  the doors swing open, the words on them fade
 *   0.15–1.00  the room comes closer (a walk forward)
 *   0.55–0.90  the room's words appear
 * Reduced motion: the entrance is removed and the page starts at the hero.
 */
(function () {
  'use strict';
  var el = document.querySelector('[data-entrance]');
  if (!el) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { el.remove(); return; }
  var L = el.querySelector('.door-l'), R = el.querySelector('.door-r');
  var room = el.querySelector('.room-photo'), roomText = el.querySelector('.room-text');
  var copy = el.querySelector('.door-copy'), skip = el.querySelector('.entrance-skip');
  var clamp = function (x) { return Math.max(0, Math.min(1, x)); };
  var ease = function (x) { x = clamp(x); return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
  var ticking = false;

  function frame() {
    ticking = false;
    var r = el.getBoundingClientRect();
    var p = clamp(-r.top / Math.max(1, r.height - innerHeight));
    var open = ease(p / 0.55);
    L.style.transform = 'rotateY(' + (-104 * open) + 'deg)';
    R.style.transform = 'rotateY(' + (104 * open) + 'deg)';
    var shade = String(0.55 * open);
    L.style.setProperty('--shade', shade); R.style.setProperty('--shade', shade);
    copy.style.opacity = String(1 - clamp(p / 0.18));
    copy.style.transform = 'translateY(' + (-30 * clamp(p / 0.18)) + 'px)';
    var walk = ease((p - 0.15) / 0.85);
    room.style.transform = 'scale(' + (1.28 - 0.2 * walk) + ')';
    room.style.filter = 'brightness(' + (0.55 + 0.45 * open) + ')';
    var t = ease((p - 0.55) / 0.35);
    roomText.style.opacity = String(t);
    roomText.style.transform = 'translateY(' + (24 * (1 - t)) + 'px)';
    skip.style.opacity = String(1 - clamp((p - 0.6) / 0.2));
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  frame();
})();
