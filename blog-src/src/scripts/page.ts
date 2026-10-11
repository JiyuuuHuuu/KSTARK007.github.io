// Page-wide behaviour that is not tied to one component.
import { track } from '@/lib/analytics';

// Reveal: [data-reveal] blocks fade up the first time they scroll into view.
// The hidden state is CSS that only applies under html.js (see global.css).
function setupReveal() {
  const blocks = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  const showAll = () => blocks.forEach((el) => el.classList.add('is-revealed'));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) return showAll();

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-revealed');
        io.unobserve(e.target);
      }
    },
    // A block counts as in view once its top clears the bottom eighth of the
    // viewport. (A fraction-of-the-block threshold would never fire for prose
    // blocks taller than the screen.)
    { threshold: 0, rootMargin: '0px 0px -12% 0px' },
  );
  blocks.forEach((el) => io.observe(el));
}

// Analytics for links: <a data-track="name"> reports a cta_click.
function setupLinkTracking() {
  document.addEventListener('click', (ev) => {
    const a = (ev.target as Element | null)?.closest?.<HTMLAnchorElement>('a[data-track]');
    if (!a) return;
    track(a.dataset.trackEvent ?? 'cta_click', { link_name: a.dataset.track, link_url: a.getAttribute('href') ?? '' });
  });
}

setupReveal();
setupLinkTracking();
