// "Show the numbers" tables, declared in a post's data.ts over the same rows the
// chart draws, so the table and the chart cannot disagree:
//
//   export const MEGALON_TABLE = numbers(MEGALON_BARS, {
//     'Shared objects': (r) => r.objects,
//     HCMeta: (r) => mops(r.hcmeta),
//   });
export interface NumbersTable {
  columns: string[];
  rows: string[][];
}

export function numbers<T>(rows: readonly T[], columns: Record<string, (row: T) => string | number>): NumbersTable {
  const cols = Object.entries(columns);
  return {
    columns: cols.map(([label]) => label),
    rows: rows.map((r) => cols.map(([, get]) => String(get(r)))),
  };
}

/** 15.5 → "15.5 Mops/s", 1 → "1.0 Mops/s". */
export const mops = (v: number) => `${v.toFixed(1)} Mops/s`;
