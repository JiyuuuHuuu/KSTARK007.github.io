// npm run build [-- <slug>…]: build every post (or the ones named) and put each
// at ../blog/<slug>/, the directory GitHub Pages serves. That directory is a
// build output: it is gitignored and rebuilt by CI on every deploy.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, astro, listPosts } from './post-env.mjs';

const SITE_BLOG = join(ROOT, '..', 'blog');

function fail(msg) {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
}

const posts = listPosts();
const wanted = process.argv.slice(2);
for (const s of wanted) if (!posts.includes(s)) fail(`No post "${s}". Posts: ${posts.join(', ')}`);
const slugs = wanted.length ? wanted : posts;

for (const slug of slugs) {
  const target = join(SITE_BLOG, slug);

  // A post that still has committed files at blog/<slug>/ was published some
  // other way (e.g. copied in from another build). Replacing it silently would
  // fight that workflow, so stop and say what to do.
  let tracked = '';
  try {
    tracked = execFileSync('git', ['ls-files', '--', target], { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    /* not a git checkout */
  }
  if (tracked) {
    fail(`blog/${slug}/ is still tracked by git, but it is now built from blog-src/.\n` +
      `  Untrack it once with: git rm -r --cached blog/${slug}`);
  }

  console.log(`\n▸ Building ${slug}`);
  await astro(['build'], slug);

  const out = join(ROOT, 'dist', slug);
  // The same checks the deploy makes, surfaced here so they fail on a laptop
  // rather than in CI.
  for (const f of ['index.html', 'index.md', 'llms.txt', 'opengraph-image.png']) {
    if (!existsSync(join(out, f))) fail(`${slug}: the build did not produce ${f}`);
  }
  const html = readFileSync(join(out, 'index.html'), 'utf8');
  const once = (re, what) => {
    const n = (html.match(re) ?? []).length;
    if (n !== 1) fail(`${slug}/index.html has ${n} ${what}; stamp_dates.py needs exactly 1`);
  };
  once(/"dateModified":\s*"/g, '"dateModified" keys');
  once(/<meta property="article:modified_time" content="/g, 'article:modified_time tags');
  // stamp_dates.py takes the first match of this pattern and parses it as JSON.
  const ld = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  if (!ld) fail(`${slug}/index.html has no JSON-LD block`);
  try {
    JSON.parse(ld[1]);
  } catch (e) {
    fail(`${slug}/index.html: the first JSON-LD block is not valid JSON (${e.message})`);
  }

  // Empty the directory rather than deleting it: on Windows a folder that is
  // open in a terminal or Explorer cannot itself be removed.
  mkdirSync(target, { recursive: true });
  for (const entry of readdirSync(target)) rmSync(join(target, entry), { recursive: true, force: true });
  cpSync(out, target, { recursive: true });
  console.log(`✓ ${slug} → blog/${slug}/`);
}
