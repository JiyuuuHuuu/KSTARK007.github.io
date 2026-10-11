// Pieces of index.md that do not come from the rendered page: the YAML front
// matter, the title block, and the appendix of figure data. The body in
// between is converted from the built HTML (src/integrations/markdown-export.mjs),
// so the prose is written once, in index.mdx.
import { stringify } from 'yaml';
import { joinNames } from './people';
import type { PostMeta } from './post';

type Row = Record<string, unknown>;
/** heading → the constant behind a figure (an array of rows, or one object). */
export type Appendix = Record<string, readonly Row[] | Row>;

/** Declare a post's appendix in its data.ts; the identity function, for types. */
export const appendix = (entries: Appendix): Appendix => entries;

export function frontMatter(post: PostMeta): string {
  const data = {
    title: `${post.title}: ${post.subtitle}`,
    author: post.people.map((p) => p.name).join(', '),
    authors: post.people.map((p) => ({ name: p.name, url: p.url })),
    canonical_url: post.url,
    date_published: post.datePublished,
    date_modified: post.dateModified,
    description: post.description,
    based_on_papers: post.papers.map((p) => `${p.title} (${p.venue})`).join('; '),
    papers: post.papers.map((p) => ({
      title: p.title,
      venue: p.venue,
      ...(p.note ? { note: p.note } : {}),
      url: p.url,
      authors: p.authors.map((a) => a.name).join(', '),
    })),
    ...(post.artifact ? { artifact: post.artifact.url } : {}),
    keywords: post.keywords,
  };
  return `---\n${stringify(data, { lineWidth: 0 })}---\n`;
}

export function titleBlock(post: PostMeta): string {
  const byline = joinNames(post.people.map((p) => `[${p.name}](${p.url})`));
  const papers = post.papers
    .map((p) => `**${p.title}** (${[p.venue, p.note].filter(Boolean).join(', ')}) by ${joinNames(p.authors.map((a) => a.name))}`)
    .join('; and ');
  return [
    `# ${post.title}`,
    `*${post.subtitle}*`,
    `By ${byline}. Based on ${papers}.`,
    `Canonical HTML version: ${post.url}`,
    '---',
  ].join('\n\n');
}

const cell = (v: unknown) => String(v ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

function table(rows: readonly Row[]): string {
  const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  return [
    `| ${keys.join(' | ')} |`,
    `| ${keys.map(() => '---').join(' | ')} |`,
    ...rows.map((r) => `| ${keys.map((k) => cell(r[k])).join(' | ')} |`),
  ].join('\n');
}

export function appendixMarkdown(entries: Appendix | undefined): string {
  if (!entries || !Object.keys(entries).length) return '';
  const parts = Object.entries(entries).map(([heading, value]) => {
    const body = Array.isArray(value)
      ? table(value)
      : table(Object.entries(value).map(([Name, Value]) => ({ Name, Value })));
    return `### ${heading}\n\n${body}`;
  });
  return [
    '## Appendix: the numbers behind the figures',
    'Every figure on the page, as data. Rendered from the same constants the page itself uses, so these values and the published charts cannot disagree.',
    ...parts,
  ].join('\n\n');
}
