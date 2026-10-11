// Grouped bars of SC-ART, SC-BTree and Prism throughput across YCSB A–F
// (Prism Fig. 9), with Prism's largest lead over SC-BTree called out.
import { AxisY, Legend, Plot, makeFrame, scaleLinear, usePlateReveal } from '../kit/plot';
import { Tip, useTip } from '../kit/tip';
import { PRISM_BARS } from '@/content/posts/one-memory-many-machines/data';

const SERIES: { key: 'scArt' | 'scBtree' | 'prism'; label: string; color: string }[] = [
  { key: 'scArt', label: 'SC-ART', color: 'var(--color-s5)' },
  { key: 'scBtree', label: 'SC-BTree', color: 'var(--color-s6)' },
  { key: 'prism', label: 'Prism', color: 'var(--color-accent)' },
];

export default function PrismBars() {
  const { ref, shown, width } = usePlateReveal(0.25, 520);
  const [tip, setTip] = useTip();
  const w = Math.max(300, width);
  const frame = makeFrame(w, 288, { right: 16, left: 52, bottom: 52, top: 18 });
  const y = scaleLinear([0, 24], [frame.pad.top + frame.innerH, frame.pad.top]);
  const groupW = frame.innerW / PRISM_BARS.length;
  const barW = Math.min(24, 0.2 * groupW);
  const baseY = y.to(0);
  const clusterW = SERIES.length * barW + (SERIES.length - 1) * 2;
  // The workload where Prism leads SC-BTree by the widest factor.
  const best = PRISM_BARS.reduce(
    (bi, r, i) => (r.prism / r.scBtree > PRISM_BARS[bi].prism / PRISM_BARS[bi].scBtree ? i : bi),
    0,
  );
  const ratio = PRISM_BARS[best].prism / PRISM_BARS[best].scBtree;

  const callout = () => {
    const cx = frame.pad.left + best * groupW + groupW / 2;
    const lx = cx + clusterW / 2 + 6;
    const yPrism = y.to(PRISM_BARS[best].prism);
    const yBtree = y.to(PRISM_BARS[best].scBtree);
    return lx + 32 <= frame.width ? (
      <>
        <line x1={lx} x2={lx} y1={yPrism} y2={yBtree} stroke="var(--color-accent)" strokeWidth={1} />
        <text x={lx + 4} y={(yPrism + yBtree) / 2 + 3.5} className="font-mono" fill="var(--color-accent)" fontSize={10.5} fontWeight={700}>
          {ratio.toFixed(1)}×
        </text>
      </>
    ) : (
      <text
        x={cx + clusterW / 2 - barW / 2}
        y={yPrism - 19}
        textAnchor="middle"
        className="font-mono"
        fill="var(--color-accent)"
        fontSize={10.5}
        fontWeight={700}
      >
        {ratio.toFixed(1)}×
      </text>
    );
  };

  return (
    <div ref={ref} className="relative">
      <Plot frame={frame} title="Prism versus ported in-memory indexes under YCSB">
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
        {PRISM_BARS.map((r, gi) => {
          const cx = frame.pad.left + gi * groupW + groupW / 2;
          return (
            <g key={r.workload}>
              {SERIES.map((s, si) => {
                const v = r[s.key];
                return (
                  <rect
                    key={s.key}
                    x={cx - clusterW / 2 + si * (barW + 2)}
                    y={y.to(v)}
                    width={barW}
                    height={baseY - y.to(v)}
                    rx={3}
                    fill={s.color}
                    style={{
                      transform: shown ? 'scaleY(1)' : 'scaleY(0)',
                      transformBox: 'fill-box',
                      transformOrigin: 'center bottom',
                      transition: `transform 620ms ${Math.min(60 * gi + 45 * si, 300)}ms var(--ease-out-quint)`,
                    }}
                  />
                );
              })}
              {gi === best
                ? SERIES.map((s, si) =>
                    s.key === 'scArt' ? null : (
                      <text
                        key={s.key}
                        x={cx - clusterW / 2 + si * (barW + 2) + barW / 2}
                        y={y.to(r[s.key]) - 7}
                        textAnchor="middle"
                        className="fill-ink font-mono"
                        fontSize={9.5}
                        fontWeight={700}
                        opacity={shown ? 1 : 0}
                        style={{ transition: `opacity 340ms ${430 + 55 * si}ms ease-out` }}
                      >
                        {r[s.key].toFixed(1)}
                      </text>
                    ),
                  )
                : null}
              {(groupW < 62 ? r.workload.split(' · ').slice(0, 1) : r.workload.split(' · ')).map((line, li) => (
                <text key={line} x={cx} y={baseY + 17 + 12 * li} textAnchor="middle" className="fill-ink-muted font-mono" fontSize={9}>
                  {line}
                </text>
              ))}
              <rect
                x={cx - groupW / 2}
                y={frame.pad.top}
                width={groupW}
                height={frame.innerH}
                fill="transparent"
                onMouseEnter={() =>
                  setTip({
                    x: cx,
                    y: y.to(r.prism),
                    title: r.workload,
                    rows: SERIES.map((s) => ({ label: s.label, value: `${r[s.key].toFixed(1)} Mops/s`, color: s.color })),
                  })
                }
                onMouseLeave={() => setTip(null)}
              />
            </g>
          );
        })}
        <g opacity={shown ? 1 : 0} style={{ transition: 'opacity 380ms 600ms ease-out' }}>
          {callout()}
        </g>
      </Plot>
      <Tip tip={tip} width={w} height={frame.height} />
      <Legend className="mt-3" items={SERIES.map((s) => ({ label: s.label, color: s.color }))} />
    </div>
  );
}
