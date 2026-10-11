// The post's JSON-LD @graph, built from front matter.
//
// stamp_dates.py rewrites "dateModified" in place at deploy time and requires
// exactly one match in the page, so only the BlogPosting may carry that key.
// The homepage defines the #kiran Person and #website nodes; this graph points
// at them by @id rather than redefining them.
import { SITE, type PostMeta } from './post';

const org = (name: string) => ({ '@type': 'Organization', name });

export function buildGraph(post: PostMeta) {
  const url = post.url;
  const ref = (frag: string) => ({ '@id': `${url}#${frag}` });
  const fullTitle = `${post.title} | ${post.subtitle}`;
  const image = `${url}opengraph-image.png`;
  const owner = post.people[0];

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: fullTitle,
      description: post.description,
      inLanguage: 'en',
      isPartOf: { '@id': `${SITE}#website` },
      primaryImageOfPage: image,
      breadcrumb: ref('breadcrumb'),
      mainEntity: ref('post'),
    },
    {
      '@type': 'BlogPosting',
      '@id': `${url}#post`,
      url,
      mainEntityOfPage: ref('webpage'),
      headline: post.title,
      alternativeHeadline: post.subtitle,
      description: post.description,
      image,
      inLanguage: 'en',
      keywords: post.keywords,
      articleSection: post.articleSection,
      datePublished: post.datePublished,
      dateModified: post.dateModified,
      author: post.people.map((p) => ({ '@id': p.id })),
      publisher: { '@id': owner.id },
      isPartOf: { '@id': `${SITE}blog/#blog` },
      about: post.papers.map((p) => ref(p.id)),
      citation: post.papers.map((p) => ref(p.id)),
      isBasedOn: post.papers.map((p) => ref(p.id)),
    },
    ...post.papers.map((p) => ({
      '@type': 'ScholarlyArticle',
      '@id': `${url}#${p.id}`,
      headline: p.title,
      name: p.title,
      url: p.url,
      sameAs: p.sameAs,
      inLanguage: 'en',
      datePublished: post.datePublished.slice(0, 4),
      author: p.authors.map((a) => ({ '@type': 'Person', name: a.name, affiliation: org(a.affiliation) })),
      publisher: org(p.publisher),
    })),
    ...(post.artifact
      ? [
          {
            '@type': 'SoftwareSourceCode',
            '@id': `${url}#${post.artifact.about}-artifact`,
            name: post.artifact.name,
            codeRepository: post.artifact.url,
            about: ref(post.artifact.about),
          },
        ]
      : []),
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: owner.name, item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE}blog/` },
        { '@type': 'ListItem', position: 3, name: post.title, item: url },
      ],
    },
    ...post.people.map((p) => ({
      '@type': 'Person',
      '@id': p.id,
      name: p.name,
      url: p.url,
      affiliation: org(p.affiliation),
      ...(p.sameAs.length ? { sameAs: p.sameAs } : {}),
    })),
  ];

  return { '@context': 'https://schema.org', '@graph': graph };
}

/** JSON for a <script> body: `</` must not appear or it would close the tag. */
export function scriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
