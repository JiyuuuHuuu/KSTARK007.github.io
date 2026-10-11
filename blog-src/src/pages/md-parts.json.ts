// Build-time only: the parts of index.md that are not the page body. The
// markdown-export integration reads this file, assembles index.md around the
// converted HTML, and deletes it, so it is never published.
import type { APIRoute } from 'astro';
import { loadPost } from '@/lib/post';
import { appendixMarkdown, frontMatter, titleBlock, type Appendix } from '@/lib/markdown';

const dataModules = import.meta.glob<{ APPENDIX?: Appendix }>('../content/posts/*/data.ts');

export const GET: APIRoute = async () => {
  const { meta } = await loadPost();
  const load = dataModules[`../content/posts/${meta.slug}/data.ts`];
  const data = load ? await load() : {};
  return new Response(
    JSON.stringify({
      frontMatter: frontMatter(meta),
      title: titleBlock(meta),
      appendix: appendixMarkdown(data.APPENDIX),
    }),
  );
};
