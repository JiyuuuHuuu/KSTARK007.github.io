// Post authors, referred to by key from a post's `authors:` front matter.
// `id` is the node's @id in the site's JSON-LD graph: Kiran's is defined on the
// homepage, so posts only point at it (the node repeated here is a stub that
// lets a post resolve on its own).
export interface Person {
  name: string;
  url: string;
  id: string;
  affiliation: string;
  sameAs: string[];
}

export const PEOPLE: Record<string, Person> = {
  kiran: {
    name: 'Kiran Hombal',
    url: 'https://kstark007.github.io/',
    id: 'https://kstark007.github.io/#kiran',
    affiliation: 'UIUC',
    sameAs: [
      'https://orcid.org/0009-0003-7870-9300',
      'https://scholar.google.com/citations?user=eyQ0CQ0AAAAJ',
      'https://github.com/KSTARK007',
      'https://www.linkedin.com/in/kiranhombal',
    ],
  },
  jiyu: {
    name: 'Jiyu Hu',
    url: 'https://jiyuuuhuuu.github.io/',
    id: 'https://jiyuuuhuuu.github.io/#jiyu',
    affiliation: 'UIUC',
    sameAs: [],
  },
};

/** "A and B", "A, B and C". */
export function joinNames(names: string[]): string {
  if (names.length < 2) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}
