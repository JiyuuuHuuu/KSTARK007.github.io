// Everything the figures draw, in one place: numbers, series, step-by-step
// captions and tab text. Edit a value here and the chart, its "Show the
// numbers" table and the appendix of index.md all change together.
//
// The figures themselves are in src/figures/one-memory-many-machines/.
import { appendix } from '@/lib/markdown';
import { mops, numbers } from '@/lib/table';

// ---- 1. Intro to CXL ---------------------------------------------------------

export const PIN_STORY = {
  ddrChannel: 'DDR5-6400',
  ddrPins: '~200 signal pins',
  ddrBandwidth: '~51 GB/s',
  cxlLink: 'x16 PCIe 5.0',
  cxlPins: '64 signal pins',
  cxlBandwidth: '~63 GB/s per direction',
  cxlRate: '32 GT/s, 128b/130b encoding',
  cxlGen6Bandwidth: '~126 GB/s per direction at PCIe 6.0 rates',
  perPinAdvantage: '4×',
};

export const LATENCY_LADDER = [
  { tier: 'L1 cache', ns: 1, label: '~1 ns', note: 'on the core itself', basis: 'textbook order of magnitude', accent: false },
  { tier: 'L2 cache', ns: 4, label: '~4 ns', note: 'private per core', basis: 'textbook order of magnitude', accent: false },
  { tier: 'L3 cache', ns: 15, label: '~15 ns', note: 'shared on the die', basis: 'textbook order of magnitude', accent: false },
  { tier: 'Local DRAM', ns: 114, label: '~111–117 ns', note: 'over the DDR bus', basis: 'measured on three Melody platforms', accent: false },
  { tier: 'CXL memory', ns: 300, label: '~170–400 ns', note: 'about one NUMA hop away', basis: 'Melody measured 214–394 ns; industry quotes 170–250 ns', accent: true },
  { tier: 'RDMA read', ns: 3000, label: '~2–10 µs', note: 'network round trip', basis: 'commonly reported range', accent: false },
  { tier: 'NVMe SSD', ns: 30000, label: '~10–100 µs', note: 'flash storage', basis: 'commonly reported range', accent: false },
];

export const LATENCY_TABLE = numbers(LATENCY_LADDER, {
  Tier: (r) => r.tier,
  Latency: (r) => r.label,
  Note: (r) => r.note,
  Basis: (r) => r.basis,
});

export const CXL_VERSIONS = [
  { version: 'CXL 1.0 / 1.1', year: '2019', headline: 'Expansion', what: 'One host attaches more memory over PCIe and uses plain loads and stores.' },
  { version: 'CXL 2.0', year: '2020', headline: 'Pooling', what: 'Switching lets a rack carve one memory pool into slices, but each slice still belongs to one host at a time.' },
  { version: 'CXL 3.x', year: '2022–24', headline: 'Sharing', what: 'Fabrics and true multi-host sharing: several machines map the same region, at the same time.' },
];

// ---- 2. The catch: partly coherent memory -------------------------------------

/** The note printed under the SCR/LNR bar. */
export const TWO_REGIONS_NOTE =
  'A few hundred MB on a device of several TB: roughly one part in ten thousand. The marker is widened so that it is visible at all. Everything the hardware promises about coherence across hosts happens inside it.';

export const STALE_READ_STEPS = [
  { caption: 'Host 1 reads A from the LNR', detail: 'The value drops into host 1’s CPU cache, as every read does.' },
  { caption: 'Host 2 writes A′', detail: 'The LNR now holds A′. No invalidation is sent to anyone, because the LNR has no coherence machinery to send one.' },
  { caption: 'Host 1 reads A again', detail: 'Its cache answers: “I have that.” It serves the old A. Nothing in the hardware detects the lie.' },
  { caption: 'The stale read', detail: 'Host 1 is now computing on stale data. This is the bug class the rest of the post is about.' },
];

// ---- 3. Software coherence ----------------------------------------------------

export const HCMETA_STEPS = [
  { caption: 'Host 1 reads A', detail: 'Host 1 reads A from the LNR and notes its version from A’s coherence record in the SCR: 0.' },
  { caption: 'Host 2 writes A′', detail: 'Host 2 writes A′, flushes it to the LNR, and bumps A’s version in the SCR to 1. The LNR still sends no invalidation, but the SCR is hardware-coherent, so every host sees the new version.' },
  { caption: 'Host 1 checks the SCR', detail: 'Before trusting its cache, host 1 checks A’s record. Its copy is version 0 and the SCR says 1. Mismatch, so host 1 invalidates its cached A.' },
  { caption: 'Host 1 reads fresh data', detail: 'The read misses the cache and fetches A′ from the LNR; host 1’s copy now matches version 1 in the SCR. Correct, at the price of one metadata record per shared object in the scarce SCR.' },
];

/** Megalon Figure 1(c), Mops/s. */
export const HCMETA_COLLAPSE = [
  { datasetM: 1.2, hcmeta: 15.5, unlimited: 15.5 },
  { datasetM: 2.4, hcmeta: 15.2, unlimited: 15.3 },
  { datasetM: 4.8, hcmeta: 1, unlimited: 15.1 },
  { datasetM: 7.2, hcmeta: 0.9, unlimited: 15 },
  { datasetM: 12, hcmeta: 0.7, unlimited: 14.6 },
  { datasetM: 18, hcmeta: 0.6, unlimited: 13.8 },
];

export const HCMETA_COLLAPSE_TABLE = numbers(HCMETA_COLLAPSE, {
  Dataset: (r) => `${r.datasetM}M objects`,
  'HCMeta, 100 MB SCR': (r) => mops(r.hcmeta),
  'Unlimited SCR': (r) => mops(r.unlimited),
});

// ---- 4. Megalon -----------------------------------------------------------------

/** Megalon Figure 6(a): 5% writes, 200 MB SCR, Mops/s. */
export const MEGALON_BARS = [
  { objects: '4.8M', hcmeta: 16.6, megalon: 17.7 },
  { objects: '7.2M', hcmeta: 5.7, megalon: 17.2 },
  { objects: '12M', hcmeta: 2.5, megalon: 17.4 },
  { objects: '24M', hcmeta: 1.7, megalon: 17.4 },
];

export const MEGALON_TABLE = numbers(MEGALON_BARS, {
  'Shared objects': (r) => r.objects,
  HCMeta: (r) => mops(r.hcmeta),
  Megalon: (r) => mops(r.megalon),
});

/** The note printed under the split-metadata drawing. */
export const SPLIT_METADATA_NOTE =
  'The index moved to where memory is plentiful, saving SCR space for frequently accessed tiny coherence records.';

/** The note printed under the shared-log drawing. */
export const SHARED_LOG_NOTE =
  'Only the head and tail pointers need hardware coherence. The entries sit in the LNR, written with a flush and read past the cache, and order does the rest.';

// ---- 5. The index problem -------------------------------------------------------

export const INDEX_DILEMMA = {
  keys: '100M',
  artNodes: '~40M',
  realisticScr: '128 MB',
  artCoverageAt100M: 'about 40%',
  versionBytes: 8,
  versionsFitAt128MB: '16M',
  scArtSlowdown: '20×',
  scArtSlowdownBasis: 'with no SCR at all, against a 128 MB SCR',
  scBtreeFanout: 128,
  scBtreeMops: 1.8,
  scArtUnlimitedMops: 12,
};

const D = INDEX_DILEMMA;

export const VERSION_OVERFLOW_STEPS = [
  { caption: 'A small tree: every version number fits', detail: 'Each node of SC-ART keeps its version number in the SCR. With five nodes, five of the eight slots are used, and a host checks a node’s version there before trusting its cached copy.' },
  { caption: 'The tree grows', detail: 'Eight leaves arrive and each needs a slot too. Thirteen version numbers do not fit in eight slots, so five of them spill into the LNR.' },
  { caption: 'A spilled version number can itself be stale', detail: 'The LNR has no cross-host coherence, so a host cannot tell whether its cached copy of a spilled version number is fresh. It has to flush and re-read it on every access, even if nothing has changed.' },
  { caption: 'The cost at scale', detail: `With ${D.keys} keys ART has ${D.artNodes} inner nodes, and a ${D.realisticScr} SCR holds ${D.artCoverageAt100M} of their version numbers. Take the SCR away entirely, so that every version number spills, and SC-ART runs about ${D.scArtSlowdown} slower than with a ${D.realisticScr} SCR.` },
];

export const FALSE_INVALIDATION_STEPS = [
  { caption: 'One version number for the whole node', detail: 'A large node holds 128 keys in the LNR and shares a single version number in the SCR. Host 2 has read key 298 before, so the whole node sits in its cache at version 7.' },
  { caption: 'Host 1 updates key 194', detail: 'Host 1 writes key 194 in place, flushes it to the LNR, and bumps the node’s version number in the SCR from 7 to 8.' },
  { caption: 'Host 2 reads key 298', detail: 'Host 2 checks the node’s version first: its cache says 7, the SCR says 8. It must flush and re-read the whole node, even though key 298 has not changed.' },
  { caption: 'A false invalidation', detail: 'One write to one key forced 127 unmodified keys out of host 2’s cache. The metadata fits, but every write now costs a flush on every host that cached the node.' },
];

// ---- 6. Prism ---------------------------------------------------------------------

export const SURFACE_AREA_MODES = [
  { key: 'tree', label: 'ART or B+-tree', mutableTo: 1, verdict: 'the whole index', caption: 'Any node from root to leaf can be modified in place, so the updatable surface area spans the entire index. Every node needs a version number, and together they do not fit in the SCR.' },
  { key: 'lsm', label: 'LSM', mutableTo: 0.28, verdict: 'the memtable', caption: 'In-place updates are confined to the memtable, which fits in the SCR. The SSTables below are immutable for their whole lifetime, so they can live in the LNR with no coherence tracking.' },
];

export const PRISM_WRITE_STEPS = [
  { operation: 'Write A = 1', caption: 'First write: enter the BUL', detail: 'Start with an empty memtable and key B already in the BUL after one write. Writing A = 1 misses both the memtable and the BUL, so A is inserted into the BUL. Neither key takes up memtable space.' },
  { operation: 'Write A = 2', caption: 'Repeated write: promote A', detail: 'Writing A = 2 misses the memtable but finds A in the BUL. This repeated write promotes A into the memtable with its new value and removes A from the BUL. B stays in the BUL.' },
  { operation: 'Write A = 3', caption: 'Memtable hit: update in place', detail: 'The next write to A finds it in the memtable. A is updated in place, from 2 to 3, using hardware coherence in the SCR. The BUL and SSTables are unchanged.' },
  { operation: 'Periodic or near-full BUL flush', caption: 'Cold entry: flush B to an SSTable', detail: 'Periodically, or when the BUL is nearly full, cold entries are flushed into new immutable SSTables and removed from the BUL. B was written only once, so it goes to a new L0 SSTable without ever occupying memtable space in the SCR. A remains in the memtable.' },
];

/** Prism Figure 7(c), Mops/s. */
export const WRITE_RATIO_SWEEP = [
  { writeRatio: 10, scArt: 3, scBtree: 9.3, prism: 17.4 },
  { writeRatio: 20, scArt: 2.9, scBtree: 4.2, prism: 16.7 },
  { writeRatio: 30, scArt: 2.8, scBtree: 2.6, prism: 14.9 },
  { writeRatio: 40, scArt: 2.7, scBtree: 2.2, prism: 13.4 },
  { writeRatio: 50, scArt: 2.5, scBtree: 1.8, prism: 11.6 },
];

export const WRITE_RATIO_TABLE = numbers(WRITE_RATIO_SWEEP, {
  'Write ratio': (r) => `${r.writeRatio}%`,
  'SC-ART': (r) => mops(r.scArt),
  'SC-BTree': (r) => mops(r.scBtree),
  Prism: (r) => mops(r.prism),
});

/** Prism Figure 9, Mops/s. */
export const PRISM_BARS = [
  { workload: 'YCSB-A · 50% writes', scArt: 2.2, scBtree: 1.6, prism: 11.8 },
  { workload: 'YCSB-B · 5% writes', scArt: 3.1, scBtree: 13, prism: 18.5 },
  { workload: 'YCSB-C · read-only', scArt: 3.3, scBtree: 19.5, prism: 21 },
  { workload: 'YCSB-D · read latest', scArt: 2.8, scBtree: 12.8, prism: 17.7 },
  { workload: 'YCSB-E · short scans', scArt: 2.9, scBtree: 13.7, prism: 9.8 },
  { workload: 'YCSB-F · 50% RMW', scArt: 1.9, scBtree: 1.5, prism: 14.1 },
];

export const PRISM_TABLE = numbers(PRISM_BARS, {
  Workload: (r) => r.workload,
  'SC-ART': (r) => mops(r.scArt),
  'SC-BTree': (r) => mops(r.scBtree),
  Prism: (r) => mops(r.prism),
});

// ---- index.md appendix: every figure's data, as tables ----------------------------

export const APPENDIX = appendix({
  'Pin efficiency, DDR vs CXL': PIN_STORY,
  'Latency ladder': LATENCY_LADDER,
  'CXL generations': CXL_VERSIONS,
  'The stale read, step by step': STALE_READ_STEPS,
  'Software coherence, step by step': HCMETA_STEPS,
  'HCMeta collapse (Megalon Fig. 1c, Mops/s)': HCMETA_COLLAPSE,
  'Megalon vs HCMeta (Mops/s, 5% writes, 200 MB SCR)': MEGALON_BARS,
  'The SC-ART / SC-BTree dilemma': INDEX_DILEMMA,
  'Problem 1, step by step': VERSION_OVERFLOW_STEPS,
  'Problem 2, step by step': FALSE_INVALIDATION_STEPS,
  'Updatable surface area, by index': SURFACE_AREA_MODES,
  'Prism writes, step by step': PRISM_WRITE_STEPS,
  'Throughput against write ratio (Prism Fig. 7c, Mops/s)': WRITE_RATIO_SWEEP,
  'Prism under YCSB (Mops/s)': PRISM_BARS,
});
