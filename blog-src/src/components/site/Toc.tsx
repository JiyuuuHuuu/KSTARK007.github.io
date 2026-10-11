// Section navigation: a reading-progress bar, a numbered rail on wide screens
// and a floating section list on narrower ones.
//
// The entries are read from the page at mount: every element with a
// data-toc="Label" attribute (set by <Section toc="…"> and <About>), so a
// section's label lives in one place, next to the section itself.
import { useEffect, useRef, useState } from 'react';
import { CaretUpIcon } from '@phosphor-icons/react/dist/csr/CaretUp';
import { ListIcon } from '@phosphor-icons/react/dist/csr/List';
import { XIcon } from '@phosphor-icons/react/dist/csr/X';
import { track } from '@/lib/analytics';

interface Item {
  id: string;
  label: string;
}

const pad = (i: number) => String(i + 1).padStart(2, '0');

/** Scroll progress through the page, eased with a spring like the original. */
function useScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let value = 0;
    let velocity = 0;
    let target = 0;
    let raf = 0;
    let last = 0;
    const measure = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      target = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0;
    };
    const step = (t: number) => {
      const dt = Math.min(0.064, last ? (t - last) / 1000 : 0.016);
      last = t;
      // stiffness 120, damping 30, mass 1
      const force = 120 * (target - value) - 30 * velocity;
      velocity += force * dt;
      value += velocity * dt;
      if (Math.abs(target - value) < 0.001 && Math.abs(velocity) < 0.01) {
        value = target;
        velocity = 0;
        raf = 0;
        last = 0;
      } else {
        raf = requestAnimationFrame(step);
      }
      if (bar.current) bar.current.style.transform = `scaleX(${value})`;
    };
    const onScroll = () => {
      measure();
      if (!raf) raf = requestAnimationFrame(step);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return bar;
}

export default function Toc() {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const seen = useRef(new Set<string>());
  const bar = useScrollProgress();

  useEffect(() => {
    const found = Array.from(document.querySelectorAll<HTMLElement>('[data-toc]'))
      .filter((el) => el.id)
      .map((el) => ({ id: el.id, label: el.dataset.toc ?? el.id }));
    setItems(found);
    setActive(found[0]?.id ?? '');
  }, []);

  // The active section is whichever one shows the most of itself.
  useEffect(() => {
    if (!items.length) return;
    const ratios = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) ratios.set(e.target.id, e.intersectionRatio);
        let best = '';
        let max = 0;
        for (const [id, r] of ratios) if (r > max) [max, best] = [r, id];
        setActive(max > 0 ? best : '');
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], rootMargin: '-72px 0px -45% 0px' },
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [items]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const index = items.findIndex((it) => it.id === active);

  useEffect(() => {
    if (index < 0 || seen.current.has(active)) return;
    seen.current.add(active);
    track('section_view', {
      section_id: active,
      section_name: items[index].label,
      section_position: index + 1,
      section_count: items.length,
    });
  }, [active, index, items]);

  return (
    <>
      <div
        ref={bar}
        aria-hidden="true"
        style={{ transform: 'scaleX(0)' }}
        className="fixed inset-x-0 top-0 z-40 h-[3px] origin-left bg-accent"
      />
      <nav aria-label="Sections" className="fixed top-1/2 left-3 z-30 hidden -translate-y-1/2 2xl:block">
        <ol className="flex flex-col border-l-2 border-rule">
          {items.map((it, i) => {
            const on = it.id === active;
            return (
              <li key={it.id} className="relative">
                <a
                  href={`#${it.id}`}
                  aria-current={on ? 'location' : undefined}
                  className={`group flex items-center gap-2.5 py-[7px] pr-3 pl-3 transition-colors duration-200 ${on ? 'bg-accent-soft/70' : 'hover:bg-paper-raised'}`}
                >
                  <span
                    className={`absolute top-0 bottom-0 -left-[2px] w-[2px] transition-colors duration-200 ${on ? 'bg-accent' : 'bg-transparent group-hover:bg-rule-strong'}`}
                  />
                  <span
                    className={`w-4 shrink-0 font-mono text-[11.5px] tabular-nums transition-colors duration-200 ${on ? 'text-accent' : 'text-ink-faint group-hover:text-ink-muted'}`}
                  >
                    {pad(i)}
                  </span>
                  <span
                    className={`text-[13.5px] whitespace-nowrap transition-colors duration-200 ${on ? 'font-semibold text-accent' : 'text-ink-muted group-hover:text-ink'}`}
                  >
                    {it.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="fixed right-3 bottom-3 z-40 flex flex-col-reverse items-end 2xl:hidden">
        <button
          type="button"
          ref={button}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="section-list"
          aria-label={open ? 'Close section list' : 'Open section list'}
          className="flex items-center gap-2 border border-rule-strong bg-paper-raised/95 px-3 py-2.5 shadow-lg backdrop-blur-sm transition-colors duration-200 hover:border-ink active:translate-y-px"
        >
          {index < 0 ? null : <span className="font-mono text-[11.5px] tabular-nums text-accent">{pad(index)}</span>}
          <span className="hidden max-w-[9rem] truncate text-[13.5px] font-medium text-ink sm:inline">
            {index < 0 ? 'Sections' : items[index]?.label}
          </span>
          {open ? (
            <XIcon size={16} weight="bold" className="text-ink-faint" />
          ) : (
            <ListIcon size={16} weight="bold" className="text-ink-faint" />
          )}
        </button>
        {open ? (
          <nav
            id="section-list"
            aria-label="Sections"
            className="mb-2 max-h-[68vh] w-60 overflow-auto border border-rule-strong bg-paper-raised shadow-xl sm:w-64"
          >
            <ol>
              <li>
                <a
                  href="#top"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 border-b border-rule px-4 py-2.5 text-[13.5px] text-ink-muted hover:bg-paper-sunk hover:text-ink"
                >
                  <CaretUpIcon size={14} weight="bold" />
                  Back to top
                </a>
              </li>
              {items.map((it, i) => {
                const on = it.id === active;
                return (
                  <li key={it.id}>
                    <a
                      href={`#${it.id}`}
                      aria-current={on ? 'location' : undefined}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 border-l-2 px-4 py-2.5 text-[14px] transition-colors ${on ? 'border-accent bg-accent-soft/70 font-semibold text-accent' : 'border-transparent text-ink-muted hover:bg-paper-sunk hover:text-ink'}`}
                    >
                      <span className="w-4 shrink-0 font-mono text-[11.5px] tabular-nums text-ink-faint">{pad(i)}</span>
                      {it.label}
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}
      </div>
    </>
  );
}
