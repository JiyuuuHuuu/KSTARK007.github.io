// After `astro build`, writes index.md next to the post's index.html: the page
// body converted to Markdown, between the front matter / title block and the
// figure-data appendix that src/pages/md-parts.json.ts renders. Because the
// body is converted from the built page, the prose exists only in index.mdx.
//
// How page elements map to Markdown:
//   <section id=x> / <footer id=x>  → <a id="x"></a> anchor, then its content
//   heading with an id (<Sub>)      → <a id="x"></a> anchor, then the heading
//   masthead                        → only the lede (marked data-md="lede")
//   <Figure>                        → ### title, source line, caption, numbers table, alt text in italics
//   <details> (Fold)                → **summary** paragraph, then its content
//   TL;DR stat tiles (<dl>)         → a bullet list
//   islands, SVG, buttons, nav      → dropped (each figure's data is in the appendix)
import { readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';

const DROP = new Set(['script', 'style', 'svg', 'noscript', 'button', 'nav', 'template', 'astro-island', 'astro-slot', 'caption']);

const el = (tagName, children = [], properties = {}) => ({ type: 'element', tagName, properties, children });
const text = (value) => ({ type: 'text', value });
const classes = (n) => (Array.isArray(n.properties?.className) ? n.properties.className : []);
const isEl = (n, tag) => n?.type === 'element' && (!tag || n.tagName === tag);

function find(node, pred) {
  if (pred(node)) return node;
  for (const c of node.children ?? []) {
    const hit = find(c, pred);
    if (hit) return hit;
  }
  return null;
}

function findAll(node, pred, out = []) {
  if (pred(node)) out.push(node);
  else for (const c of node.children ?? []) findAll(c, pred, out);
  return out;
}

const textOf = (n) => (n.type === 'text' ? n.value : (n.children ?? []).map(textOf).join(''));

function figure(node) {
  const caption = find(node, (n) => isEl(n, 'figcaption'));
  const title = caption && find(caption, (n) => isEl(n, 'h3'));
  const source = caption && find(caption, (n) => isEl(n, 'span'));
  const body = find(node, (n) => classes(n).includes('figure-body'));
  const numbers = find(node, (n) => classes(n).includes('figure-numbers'));
  const alt = find(node, (n) => classes(n).includes('figure-alt'));
  const out = [];
  if (title) out.push(el('h3', [text(textOf(title))]));
  if (source) out.push(el('p', [text(`Source: ${textOf(source)}`)]));
  if (body) out.push(...body.children.flatMap(transform));
  if (numbers) out.push(...findAll(numbers, (n) => isEl(n, 'table')).flatMap(transform));
  if (alt) out.push(el('p', [el('em', [text(textOf(alt))])]));
  return out;
}

function details(node) {
  const summary = node.children.find((n) => isEl(n, 'summary'));
  const rest = node.children.filter((n) => n !== summary);
  return [...(summary ? [el('p', [el('strong', [text(textOf(summary).trim())])])] : []), ...rest.flatMap(transform)];
}

function stats(node) {
  const items = node.children.filter((n) => isEl(n)).map((tile) => {
    const [dt, ...dds] = tile.children.filter((n) => isEl(n));
    const [value, note] = dds.map(textOf);
    return el('li', [el('strong', [text(textOf(dt))]), text(`: ${value}${note ? ` (${note})` : ''}`)]);
  });
  return [el('ul', items)];
}

function transform(node) {
  if (node.type === 'comment') return [];
  if (node.type !== 'element') return [node];
  if (DROP.has(node.tagName) || node.properties?.dataMd === 'skip') return [];
  if (node.tagName === 'header') {
    return findAll(node, (n) => n.properties?.dataMd === 'lede').flatMap((n) => n.children.flatMap(transform));
  }
  if ((node.tagName === 'section' || node.tagName === 'footer') && node.properties?.id) {
    return [el('p', [text(`ANCHOR::${node.properties.id}::`)]), ...node.children.flatMap(transform)];
  }
  if (/^h[2-6]$/.test(node.tagName) && node.properties?.id) {
    return [el('p', [text(`ANCHOR::${node.properties.id}::`)]), { ...node, children: node.children.flatMap(transform) }];
  }
  if (node.tagName === 'figure') return figure(node);
  if (node.tagName === 'details') return details(node);
  if (node.tagName === 'dl') return stats(node);
  return [{ ...node, children: node.children.flatMap(transform) }];
}

export async function htmlToMarkdown(html) {
  const tree = unified().use(rehypeParse).parse(html);
  const main = find(tree, (n) => isEl(n, 'main'));
  if (!main) throw new Error('markdown-export: no <main> in the built page');
  const root = { type: 'root', children: main.children.flatMap(transform) };
  const mdast = await unified().use(rehypeRemark).run(root);
  const md = unified().use(remarkGfm).use(remarkStringify, { bullet: '-', emphasis: '_', rule: '-' }).stringify(mdast);
  return md.replace(/^ANCHOR::([\w-]+)::$/gm, '<a id="$1"></a>');
}

export default function markdownExport({ slug }) {
  return {
    name: 'markdown-export',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const partsFile = join(out, 'md-parts.json');
        const parts = JSON.parse(await readFile(partsFile, 'utf8'));
        await rm(partsFile);
        const body = await htmlToMarkdown(await readFile(join(out, 'index.html'), 'utf8'));
        const md = [parts.frontMatter, parts.title, body.trim(), parts.appendix].filter(Boolean).join('\n\n') + '\n';
        await writeFile(join(out, 'index.md'), md);
        logger.info(`wrote index.md for ${slug} (${Math.round(md.length / 1024)} KB)`);
      },
    },
  };
}
