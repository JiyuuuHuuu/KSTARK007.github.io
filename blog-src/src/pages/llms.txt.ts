// The post's llms.txt: a short orientation for language models, from front matter.
import type { APIRoute } from 'astro';
import { loadPost, SITE } from '@/lib/post';

export const GET: APIRoute = async () => {
  const { meta: post } = await loadPost();
  const lines = [
    `# ${post.title}: ${post.subtitle}`,
    '',
    `> ${post.description}`,
    '',
    post.llmsAbout,
    '',
    '## Read this instead of the HTML',
    '',
    `- [Full post as markdown](${post.url}index.md): the complete prose plus every figure as data.`,
    ...(post.artifact ? [`- [${post.artifact.name}](${post.artifact.url}): the open-source implementation.`] : []),
    '',
    '## Canonical locations',
    '',
    `- [Post](${post.url})`,
    `- [Blog](${SITE}blog/)`,
    ...post.people.map((p) => `- [${p.name}](${p.url})`),
    ...post.papers.flatMap((p) => {
      const pdf = p.sameAs.find((u) => u.endsWith('/paper.pdf'));
      return pdf ? [`- [${p.name} paper (PDF)](${pdf})`] : [];
    }),
    '',
    '## The one-paragraph version',
    '',
    post.summary,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
