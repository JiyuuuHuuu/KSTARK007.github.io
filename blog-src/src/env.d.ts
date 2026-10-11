/// <reference types="astro/client" />

/** The slug of the post being built; set from POST_SLUG in astro.config.mjs. */
declare const __POST_SLUG__: string;
/** ISO datetime of the last commit to the post's sources; set by scripts/post-env.mjs. */
declare const __POST_DATE_MODIFIED__: string;

declare namespace App {
  interface Locals {
    /** The post being rendered. Set by src/pages/index.astro before anything renders. */
    post: import('./lib/post').PostMeta;
  }
}
