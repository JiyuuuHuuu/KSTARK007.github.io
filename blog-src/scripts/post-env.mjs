// Shared by dev.mjs and build-posts.mjs: which posts exist, and the
// environment one Astro run needs to build or serve a post.
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const POSTS_DIR = join(ROOT, 'src', 'content', 'posts');
export const FIGURES_DIR = join(ROOT, 'src', 'figures');

export function listPosts() {
  return readdirSync(POSTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(POSTS_DIR, d.name, 'index.mdx')))
    .map((d) => d.name)
    .sort();
}

/**
 * When the post last changed: the newest commit touching its content folder or
 * its figures. .github/scripts/stamp_dates.py applies the same rule at deploy
 * time, so the two always agree. A post with no commits yet gets "now".
 */
export function dateModified(slug) {
  const paths = [join(POSTS_DIR, slug), join(FIGURES_DIR, slug)].filter(existsSync);
  let out = '';
  try {
    out = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...paths], { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    /* not a git checkout */
  }
  return out || new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function postEnv(slug) {
  return { ...process.env, POST_SLUG: slug, POST_DATE_MODIFIED: dateModified(slug) };
}

/** Run the Astro CLI for one post; resolves on exit code 0. */
export function astro(args, slug) {
  const bin = join(ROOT, 'node_modules', 'astro', 'bin', 'astro.mjs');
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [bin, ...args], { cwd: ROOT, env: postEnv(slug), stdio: 'inherit' });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`astro ${args.join(' ')} failed for ${slug} (exit ${code})`))));
  });
}
