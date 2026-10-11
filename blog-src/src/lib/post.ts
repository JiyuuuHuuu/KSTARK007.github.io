// Loads the post being built (POST_SLUG) and validates its front matter, so a
// missing or misspelled field fails the build with a message instead of
// shipping a page with a hole in it.
import { z } from 'astro/zod';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { PEOPLE, type Person } from './people';

export const SITE = 'https://kstark007.github.io/';

// Google rejects date-only values; stamp_dates.py checks the same form.
const isoDateTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/, 'must be an ISO 8601 datetime with offset, e.g. 2026-08-25T09:00:00-05:00');

const link = z.object({ label: z.string(), href: z.string() });

const paper = z.object({
  /** Fragment id for the paper's JSON-LD node (#megalon). */
  id: z.string(),
  title: z.string(),
  /** Short name used in the BibTeX note and llms.txt, e.g. "Megalon". */
  name: z.string(),
  venue: z.string(),
  /** "OSDI '26" */
  venueShort: z.string(),
  note: z.string().optional(),
  publisher: z.string(),
  /** Canonical landing page (USENIX page, DOI). */
  url: z.string(),
  /** Where the paper's title links in the masthead. */
  read: z.string(),
  /** Other copies of the paper (PDFs) for JSON-LD sameAs. */
  sameAs: z.array(z.string()).default([]),
  /** The link row under the paper in Sources. */
  links: z.array(link).default([]),
  authors: z.array(z.object({ name: z.string(), affiliation: z.string() })),
});

export const frontmatterSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  datePublished: isoDateTime,
  authors: z.array(z.string()).min(1),
  keywords: z.array(z.string()),
  articleSection: z.string(),
  /** Masthead line above the paper list. */
  basedOn: z.string(),
  /** Masthead line under the paper list. */
  affiliations: z.string(),
  papers: z.array(paper),
  talks: z.array(z.object({ title: z.string(), venue: z.string(), note: z.string() })).default([]),
  artifact: z.object({ name: z.string(), url: z.string(), about: z.string() }).optional(),
  cite: z.object({ key: z.string(), note: z.string() }),
  /** llms.txt: a few sentences on what the post is. */
  llmsAbout: z.string(),
  /** llms.txt: the whole post in one paragraph. */
  summary: z.string(),
});

export type Frontmatter = z.infer<typeof frontmatterSchema>;
export type Paper = Frontmatter['papers'][number];

export interface PostMeta extends Frontmatter {
  /** Last commit touching the post or its figures (see scripts/post-env.mjs). */
  dateModified: string;
  slug: string;
  url: string;
  people: Person[];
}

interface MdxModule {
  frontmatter: unknown;
  default: AstroComponentFactory;
}

const modules = import.meta.glob<MdxModule>('../content/posts/*/index.mdx');

export const POST_SLUG: string = __POST_SLUG__;

export async function loadPost(slug = POST_SLUG): Promise<{ meta: PostMeta; Content: AstroComponentFactory }> {
  const loader = modules[`../content/posts/${slug}/index.mdx`];
  if (!loader) throw new Error(`No post at src/content/posts/${slug}/index.mdx`);
  const mod = await loader();
  const parsed = frontmatterSchema.safeParse(mod.frontmatter);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Front matter of ${slug}/index.mdx is invalid:\n${issues}`);
  }
  const fm = parsed.data;
  const people = fm.authors.map((key) => {
    const p = PEOPLE[key];
    if (!p) throw new Error(`${slug}/index.mdx: unknown author "${key}" (add them to src/lib/people.ts)`);
    return p;
  });
  return {
    meta: { ...fm, dateModified: __POST_DATE_MODIFIED__, slug, url: `${SITE}blog/${slug}/`, people },
    Content: mod.default,
  };
}
