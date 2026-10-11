// The index dilemma as a node-size slider: small nodes overflow the SCR with
// version numbers, large nodes fit but falsely invalidate their neighbours.
import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from '../kit/motion';
import { StepperControls } from '../kit/stepper';
import { track } from '@/lib/analytics';
import { INDEX_DILEMMA } from '@/content/posts/one-memory-many-machines/data';

/** Slider positions the ◀ / ▶ buttons jump between. */
const PRESETS = [0, 0.2, 0.4, 0.6, 0.8, 1];

type Tone = 'bad' | 'mixed';

export default function IndexDilemma() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.3 });
  const reduced = useReducedMotion();
  const [pos, setPos] = useState(0.5);
  const [wantPlay, setWantPlay] = useState(false);
  const used = useRef(false);
  const firstUse = () => {
    if (!used.current) {
      used.current = true;
      track('dilemma_slider_used');
    }
  };
  const atEnd = pos >= 1;
  const running = wantPlay && visible && !reduced && !atEnd;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setPos((p) => Math.min(1, Math.round(100 * p + 1) / 100)), 70);
    return () => clearTimeout(t);
  }, [running, pos]);

  const set = (v: number) => {
    setPos(Math.max(0, Math.min(1, v)));
    setWantPlay(false);
    firstUse();
  };
  const next = () => set(PRESETS.find((p) => p > pos + 1e-6) ?? 1);

  // Model: fan-out 4–128 along the slider; version numbers needed vs the 16M the SCR holds.
  const fanout = Math.round(4 * Math.pow(32, pos));
  const versions = 16e7 / fanout;
  const spill = Math.max(0, 1 - 16e6 / versions);
  const falselyInvalidated = fanout - 1;
  const invalidatedShare = falselyInvalidated / 127;
  const versionCells = Math.round(versions / 4e5);
  const measuredArt = fanout <= 5;
  const measuredBtree = fanout >= 120;
  const spillPct = Math.round(100 * spill);

  const readout: { label: string; detail: string; tone: Tone } = measuredArt
    ? {
        label: 'measured: SC-ART, problem 1',
        detail: `only ${INDEX_DILEMMA.artCoverageAt100M} of its version numbers fit in the SCR (Prism Fig. 1); with no SCR at all it runs about ${INDEX_DILEMMA.scArtSlowdown} slower than with 128 MB (Prism §7.10)`,
        tone: 'bad',
      }
    : measuredBtree
      ? {
          label: 'measured: SC-BTree, problem 2',
          detail: `every version number fits, but under write-heavy YCSB it drops to ${INDEX_DILEMMA.scBtreeMops} Mops/s against ${INDEX_DILEMMA.scArtUnlimitedMops} for an unlimited-SCR ART (Prism Fig. 2)`,
          tone: 'bad',
        }
      : spill > 0.35
        ? {
            label: 'modeled: version numbers overflow the SCR',
            detail: `${spillPct}% of the version numbers would sit in the LNR, so every access to them flushes the cache whether or not anything changed`,
            tone: 'bad',
          }
        : spill > 0
          ? {
              label: 'modeled: both problems at once',
              detail: `${spillPct}% of the version numbers spill, and one write still invalidates ${falselyInvalidated} unmodified keys`,
              tone: 'mixed',
            }
          : invalidatedShare > 0.35
            ? {
                label: 'modeled: false invalidations dominate',
                detail: `one key written forces ${falselyInvalidated} unmodified keys out of every host’s cache`,
                tone: 'bad',
              }
            : {
                label: 'modeled: version numbers fit, false invalidations begin',
                detail: `every version number fits, but one write already invalidates ${falselyInvalidated} unmodified keys; smaller nodes avoid that and overflow the SCR again`,
                tone: 'mixed',
              };

  const versionsLabel = versions >= 1e6 ? `${(versions / 1e6).toFixed(versions < 1e7 ? 1 : 0)}M` : `${(versions / 1e3).toFixed(0)}K`;

  return (
    <div ref={ref}>
      <svg
        viewBox="0 0 520 200"
        className="block h-auto w-full overflow-visible"
        role="img"
        aria-label={`Node fan-out ${fanout}: ${spillPct} percent of version numbers spill out of the coherent region, and one update invalidates ${falselyInvalidated} neighbouring keys`}
      >
        <title>Small nodes overflow the SCR; large nodes cause false invalidations</title>
        <text x={16} y={16} className="fill-ink font-mono" fontSize={9.5} fontWeight={700}>
          VERSION NUMBERS vs THE SCR ({INDEX_DILEMMA.realisticScr})
        </text>
        <rect x={16} y={24} width={190} height={62} rx={4} fill="var(--color-accent-soft)" stroke="var(--color-accent)" strokeWidth={1.25} />
        <rect
          x={212}
          y={24}
          width={292}
          height={62}
          rx={4}
          fill="var(--color-s5)"
          opacity={0.12}
          stroke="var(--color-s5)"
          strokeDasharray="4 3"
        />
        <text x={358} y={19} textAnchor="middle" className="font-mono" fill="var(--color-s5)" fontSize={8.5}>
          spilled into the LNR
        </text>
        {Array.from({ length: 40 }, (_, i) => {
          const filled = i < Math.min(40, versionCells);
          const row = Math.floor(i / 10);
          return (
            <rect
              key={`s${i}`}
              x={24 + (i % 10) * 17}
              y={31 + 13 * row}
              width={14}
              height={10}
              rx={1.5}
              fill={filled ? 'var(--color-accent)' : 'none'}
              stroke={filled ? 'none' : 'var(--color-accent)'}
              strokeDasharray={filled ? undefined : '2 2'}
              opacity={filled ? 0.85 : 0.45}
              style={{ transition: 'fill 260ms, opacity 260ms' }}
            />
          );
        })}
        {Array.from({ length: 60 }, (_, i) => {
          const row = Math.floor(i / 15);
          return (
            <rect
              key={`l${i}`}
              x={222 + (i % 15) * 18.6}
              y={31 + 13 * row}
              width={14}
              height={10}
              rx={1.5}
              fill="var(--color-s6)"
              opacity={i < versionCells - 40 ? 0.85 : 0}
              style={{ transition: 'opacity 260ms' }}
            />
          );
        })}
        <text x={23} y={100} className="fill-ink-muted font-mono" fontSize={9}>
          {versionsLabel}
          {' version numbers needed · '}
          {INDEX_DILEMMA.versionsFitAt128MB}
          {' fit'}
          {spill > 0 ? ` · ${spillPct}% spill` : ' · all fit'}
          {measuredArt || measuredBtree ? ' · measured' : ' · modeled'}
        </text>
        <text x={16} y={128} className="fill-ink font-mono" fontSize={9.5} fontWeight={700}>
          ONE KEY WRITTEN → KEYS FLUSHED
        </text>
        <g aria-hidden="true">
          {(
            [
              ['written', 'var(--color-ink)', 1],
              ['falsely invalidated', 'var(--color-s6)', 0.85],
              ['untouched', 'var(--color-s2)', 0.22],
            ] as const
          ).map(([label, color, opacity], i) => {
            const x = [268, 322, 444][i];
            return (
              <g key={label}>
                <rect x={x} y={121} width={8} height={8} rx={1.5} fill={color} opacity={opacity} />
                <text x={x + 11} y={128} className="fill-ink-faint font-mono" fontSize={8}>
                  {label}
                </text>
              </g>
            );
          })}
        </g>
        <rect x={16} y={136} width={488} height={26} rx={4} fill="var(--color-paper-sunk)" stroke="var(--color-rule)" />
        {Array.from({ length: 32 }, (_, i) => {
          const invalidated = i < Math.max(1, Math.round(32 * invalidatedShare));
          const written = i === 0;
          return (
            <rect
              key={i}
              x={22 + 15 * i}
              y={141}
              width={12}
              height={16}
              rx={2}
              fill={written ? 'var(--color-ink)' : invalidated ? 'var(--color-s6)' : 'var(--color-s2)'}
              opacity={written ? 1 : invalidated ? 0.85 : 0.22}
              style={{ transition: 'fill 250ms, opacity 250ms' }}
            />
          );
        })}
        <text x={22} y={178} className="fill-ink-muted font-mono" fontSize={9}>
          {'fan-out '}
          {fanout}
          {': the write touches 1 key'}
          {falselyInvalidated > 0 ? ` and invalidates ${falselyInvalidated} unmodified keys` : ''}
        </text>
      </svg>
      <StepperControls
        value={pos}
        min={0}
        max={1}
        step={0.01}
        valueText={`fan-out ${fanout}, ${spill > 0 ? `${spillPct} percent of versions spill` : 'all versions fit'}`}
        onChange={set}
        onPrev={() => set([...PRESETS].reverse().find((p) => p < pos - 1e-6) ?? 0)}
        onNext={next}
        prevDisabled={pos <= 0}
        nextDisabled={pos >= 1}
        play={running ? 'playing' : atEnd ? 'ended' : 'paused'}
        onPlay={() => {
          firstUse();
          if (atEnd) {
            setPos(0);
            setWantPlay(true);
            return;
          }
          if (running) setWantPlay(false);
          else if (reduced) next();
          else setWantPlay(true);
        }}
        prevLabel="Previous node-size preset (halve the fan-out)"
        nextLabel="Next node-size preset (double the fan-out)"
        rangeLabel="Index node fan-out, from 4 to 128"
        startLabel="small nodes"
        endLabel="large nodes"
      />
      <div
        className="mt-3 min-h-[3.1rem] border-l-2 pl-4"
        style={{ borderColor: readout.tone === 'bad' ? 'var(--color-s6)' : 'var(--color-rule-strong)' }}
      >
        <p
          className="font-mono text-[10.5px] tracking-[0.12em] uppercase"
          style={{ color: readout.tone === 'bad' ? 'var(--color-s6)' : 'var(--color-ink-faint)' }}
        >
          {readout.label}
        </p>
        <p className="mt-1 text-[12.5px] leading-snug text-ink-muted" aria-live={running ? 'off' : 'polite'}>
          {readout.detail}
        </p>
      </div>
    </div>
  );
}
