// npm run dev [-- <slug>]: live preview of one post at
// http://localhost:4321/blog/<slug>/ (reloads on every save).
import { astro, listPosts } from './post-env.mjs';

const posts = listPosts();
const slug = process.argv[2] ?? posts[0];
if (!posts.includes(slug)) {
  console.error(`No post "${slug}". Posts: ${posts.join(', ')}`);
  process.exit(1);
}
console.log(`Previewing ${slug} → http://localhost:4321/blog/${slug}/`);
await astro(['dev', ...process.argv.slice(3)], slug);
