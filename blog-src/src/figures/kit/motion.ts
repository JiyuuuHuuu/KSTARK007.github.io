// Small replacements for the two framer-motion hooks the figures used.
import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react';

/**
 * True while (or, with `once`, after) at least `amount` of the element is in
 * the viewport. Always false on the server, so SSR renders the pre-animation
 * state and the animation plays once the island hydrates and scrolls into view.
 */
export function useInView(
  ref: RefObject<Element | null>,
  { amount = 0, once = false }: { amount?: number; once?: boolean } = {},
): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || (once && inView)) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: amount },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, amount, once, inView]);
  return inView;
}

const QUERY = '(prefers-reduced-motion: reduce)';
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};

/** The reader asked for less motion. False on the server. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
