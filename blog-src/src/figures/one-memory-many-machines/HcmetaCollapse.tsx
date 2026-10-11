// HCMeta throughput against dataset size: flat with an unlimited SCR, collapsing once a 100 MB SCR fills.
import { AxisX, AxisY, DrawnPath, Annotation, Grid, Legend, Plot, linePath, makeFrame, scaleLinear, usePlateReveal } from '../kit/plot';
import { Tip, useTip } from '../kit/tip';
import { HCMETA_COLLAPSE } from '@/content/posts/one-memory-many-machines/data';

export default function HcmetaCollapse() {
  const { ref, shown, width } = usePlateReveal(0.25, 520);
  const [tip, setTip] = useTip();
  const w = Math.max(300, width);
  const frame = makeFrame(w, 292, { right: 24, left: 52 });
  const x = scaleLinear([0, 19], [frame.pad.left, frame.pad.left + frame.innerW]);
  const y = scaleLinear([0, 17], [frame.pad.top + frame.innerH, frame.pad.top]);
  const hcmetaPts = HCMETA_COLLAPSE.map((r) => [x.to(r.datasetM), y.to(r.hcmeta)] as [number, number]);
  const unlimitedPts = HCMETA_COLLAPSE.map((r) => [x.to(r.datasetM), y.to(r.unlimited)] as [number, number]);
  const cliff = HCMETA_COLLAPSE[2];
  const bandW = frame.innerW / HCMETA_COLLAPSE.length;

  return (
    <div ref={ref} className="relative">
      <Plot frame={frame} title="HCMeta throughput collapses once the dataset outgrows the coherent region">
        <Grid frame={frame} x={x} y={y} xTicks={[0, 5, 10, 15]} yTicks={[0, 5, 10, 15]} minor={false} />
        <AxisX frame={frame} x={x} ticks={[0, 5, 10, 15]} format={(v) => `${v}M`} label="dataset size (objects)" />
        <AxisY frame={frame} y={y} ticks={[0, 5, 10, 15]} format={(v) => String(v)} label="throughput · Mops/s" />
        <DrawnPath d={linePath(unlimitedPts)} stroke="var(--color-s2)" width={1.75} shown={shown} dash="5 4" />
        <DrawnPath d={linePath(hcmetaPts)} stroke="var(--color-s6)" width={2.25} shown={shown} delay={200} />
        <Annotation
          x={x.to(cliff.datasetM)}
          y={y.to(cliff.hcmeta)}
          label="the SCR fills here"
          color="var(--color-s6)"
          shown={shown}
          delay={640}
          dx={14}
          dy={-16}
          leader
        />
        <Annotation
          x={x.to(15)}
          y={y.to(14.2)}
          label="unlimited SCR (unrealistic)"
          color="var(--color-s2)"
          shown={shown}
          delay={720}
          anchor="end"
          dx={-2}
          dy={17}
        />
        {HCMETA_COLLAPSE.map((r) => {
          const cx = x.to(r.datasetM);
          const active = tip?.title === `${r.datasetM}M objects`;
          return (
            <g key={r.datasetM}>
              {active ? (
                <>
                  <line
                    x1={cx}
                    x2={cx}
                    y1={frame.pad.top}
                    y2={frame.pad.top + frame.innerH}
                    stroke="var(--color-ink)"
                    strokeWidth={0.75}
                    opacity={0.3}
                  />
                  <circle cx={cx} cy={y.to(r.hcmeta)} r={4.5} fill="var(--color-s6)" stroke="var(--color-paper-raised)" strokeWidth={2} />
                  <circle cx={cx} cy={y.to(r.unlimited)} r={4.5} fill="var(--color-s2)" stroke="var(--color-paper-raised)" strokeWidth={2} />
                </>
              ) : null}
              <rect
                x={cx - bandW / 2}
                y={frame.pad.top}
                width={bandW}
                height={frame.innerH}
                fill="transparent"
                onMouseEnter={() =>
                  setTip({
                    x: cx,
                    y: y.to(r.unlimited),
                    title: `${r.datasetM}M objects`,
                    rows: [
                      { label: 'HCMeta, 100 MB SCR', value: `${r.hcmeta.toFixed(1)} Mops/s`, color: 'var(--color-s6)' },
                      { label: 'Unlimited SCR', value: `${r.unlimited.toFixed(1)} Mops/s`, color: 'var(--color-s2)' },
                    ],
                  })
                }
                onMouseLeave={() => setTip(null)}
              />
            </g>
          );
        })}
      </Plot>
      <Tip tip={tip} width={w} height={frame.height} />
      <Legend
        className="mt-3"
        items={[
          { label: 'HCMeta, 100 MB SCR', color: 'var(--color-s6)' },
          { label: 'HCMeta, unlimited SCR', color: 'var(--color-s2)', dash: true },
        ]}
      />
    </div>
  );
}
