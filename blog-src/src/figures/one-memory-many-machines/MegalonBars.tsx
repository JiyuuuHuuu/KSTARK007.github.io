// Grouped bars: Megalon holds steady while HCMeta falls as the number of shared objects grows.
import { AxisY, Legend, Plot, makeFrame, scaleLinear, usePlateReveal } from '../kit/plot';
import { Tip, useTip } from '../kit/tip';
import { MEGALON_BARS } from '@/content/posts/one-memory-many-machines/data';

const SERIES = [
  { key: 'hcmeta', label: 'HCMeta', color: 'var(--color-s6)' },
  { key: 'megalon', label: 'Megalon', color: 'var(--color-accent)' },
] as const;

export default function MegalonBars() {
  const { ref, shown, width } = usePlateReveal(0.25, 520);
  const [tip, setTip] = useTip();
  const w = Math.max(300, width);
  const frame = makeFrame(w, 268, { right: 16, left: 52, bottom: 44, top: 18 });
  const y = scaleLinear([0, 20], [frame.pad.top + frame.innerH, frame.pad.top]);
  const groupW = frame.innerW / MEGALON_BARS.length;
  const barW = Math.min(30, 0.3 * groupW);
  const baseline = y.to(0);
  const last = MEGALON_BARS[MEGALON_BARS.length - 1];
  const ratio = last.megalon / last.hcmeta;
  const gapX = frame.pad.left + frame.innerW - groupW / 2;

  return (
    <div ref={ref} className="relative">
      <Plot frame={frame} title="Megalon versus HCMeta as the number of shared objects grows">
        {[0, 10, 20].map((t) => (
          <line
            key={t}
            x1={frame.pad.left}
            x2={frame.pad.left + frame.innerW}
            y1={y.to(t)}
            y2={y.to(t)}
            stroke="var(--color-rule)"
            strokeWidth={0.75}
            aria-hidden="true"
          />
        ))}
        <AxisY frame={frame} y={y} ticks={[0, 10, 20]} format={(v) => String(v)} label="throughput · Mops/s" />
        {MEGALON_BARS.map((row, gi) => {
          const cx = frame.pad.left + gi * groupW + groupW / 2;
          const isLast = gi === MEGALON_BARS.length - 1;
          return (
            <g key={row.objects}>
              {SERIES.map((s, si) => {
                const v = row[s.key];
                return (
                  <rect
                    key={s.key}
                    x={cx + (si === 0 ? -barW - 1 : 1)}
                    y={y.to(v)}
                    width={barW}
                    height={baseline - y.to(v)}
                    rx={3}
                    fill={s.color}
                    style={{
                      transform: shown ? 'scaleY(1)' : 'scaleY(0)',
                      transformBox: 'fill-box',
                      transformOrigin: 'center bottom',
                      transition: `transform 620ms ${Math.min(55 * gi + 45 * si, 300)}ms var(--ease-out-quint)`,
                    }}
                  />
                );
              })}
              {isLast
                ? SERIES.map((s, si) => (
                    <text
                      key={s.key}
                      x={cx + (si === 0 ? -barW / 2 - 1 : barW / 2 + 1)}
                      y={y.to(row[s.key]) - 7}
                      textAnchor="middle"
                      className="fill-ink font-mono"
                      fontSize={10}
                      fontWeight={700}
                      opacity={shown ? 1 : 0}
                      style={{ transition: `opacity 340ms ${420 + 60 * si}ms ease-out` }}
                    >
                      {row[s.key].toFixed(1)}
                    </text>
                  ))
                : null}
              <text x={cx} y={baseline + 17} textAnchor="middle" className="fill-ink-muted font-mono" fontSize={9.5}>
                {row.objects}
              </text>
              <rect
                x={cx - groupW / 2}
                y={frame.pad.top}
                width={groupW}
                height={frame.innerH}
                fill="transparent"
                onMouseEnter={() =>
                  setTip({
                    x: cx,
                    y: y.to(row.megalon),
                    title: `${row.objects} shared objects`,
                    rows: SERIES.map((s) => ({ label: s.label, value: `${row[s.key].toFixed(1)} Mops/s`, color: s.color })),
                  })
                }
                onMouseLeave={() => setTip(null)}
              />
            </g>
          );
        })}
        <text x={frame.pad.left + frame.innerW / 2} y={frame.height - 4} textAnchor="middle" className="fill-ink-muted" fontSize={10}>
          shared objects
        </text>
        <g opacity={shown ? 1 : 0} style={{ transition: 'opacity 380ms 560ms ease-out' }}>
          <line x1={gapX + 26} x2={gapX + 26} y1={y.to(last.megalon)} y2={y.to(last.hcmeta)} stroke="var(--color-accent)" strokeWidth={1} />
          <text
            x={gapX + 31}
            y={(y.to(last.megalon) + y.to(last.hcmeta)) / 2 + 3.5}
            className="font-mono"
            fill="var(--color-accent)"
            fontSize={11}
            fontWeight={700}
          >
            {ratio.toFixed(0)}×
          </text>
        </g>
      </Plot>
      <Tip tip={tip} width={w} height={frame.height} />
      <Legend className="mt-3" items={SERIES.map((s) => ({ label: s.label, color: s.color }))} />
    </div>
  );
}
