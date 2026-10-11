// One Astro project builds every post, one post per `astro build`, selected by
// POST_SLUG. Each build is self-contained under /blog/<slug>/ with its own
// _astro/ assets, which is the shape deploy.yml, stamp_dates.py and robots.txt
// already expect. Use `npm run build` / `npm run dev`, which set POST_SLUG.
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import markdownExport from './src/integrations/markdown-export.mjs';

const slug = process.env.POST_SLUG;
if (!slug) {
  throw new Error('POST_SLUG is not set. Run `npm run dev -- <slug>` or `npm run build` instead of astro directly.');
}

export default defineConfig({
  site: 'https://kstark007.github.io',
  base: `/blog/${slug}`,
  trailingSlash: 'always',
  // Never point outDir at ../blog/<slug>: astro empties outDir before a build.
  // scripts/build-posts.mjs copies the result into place after checking it.
  outDir: `./dist/${slug}`,
  publicDir: `./src/content/posts/${slug}/public`,
  build: { format: 'directory', assets: '_astro' },
  devToolbar: { enabled: false },
  // Publish punctuation exactly as written: no automatic curly quotes or dashes.
  markdown: { smartypants: false },
  integrations: [mdx(), react(), markdownExport({ slug })],
  vite: {
    plugins: [tailwindcss()],
    define: {
      __POST_SLUG__: JSON.stringify(slug),
      __POST_DATE_MODIFIED__: JSON.stringify(process.env.POST_DATE_MODIFIED ?? ''),
    },
  },
});
