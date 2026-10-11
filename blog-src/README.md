# blog-src: the source of the built blog posts

Posts in `src/content/posts/<slug>/` are built into `../blog/<slug>/`, which is
what GitHub Pages serves. **Never edit `blog/<slug>/` for these posts.** That
directory is build output: it is gitignored, and CI rebuilds it on every deploy.

Currently built from here: `one-memory-many-machines`.
(`blog/agentic-coding-in-the-wild/` is still a committed export from another repo.)

## Requirements

| Tool | Needed for | Version |
| --- | --- | --- |
| Node.js (includes npm) | everything: preview, build | 22 or newer (CI uses 24) |
| git | dating the post (the build reads its last commit) | any |
| Python 3, rsync | only to test the deploy scripts locally (optional) | 3.10+ |

Nothing else is installed globally. Every package below goes into
`blog-src/node_modules/`, at the exact versions pinned in `package-lock.json`.

## Dependencies

| Package | Why |
| --- | --- |
| `astro` | The site builder: turns `index.mdx` into the page, runs the dev server |
| `@astrojs/mdx` | Markdown with components (`<Section>`, `<Figure>`, …) |
| `@astrojs/react`, `react`, `react-dom` | The animated figures are React components |
| `tailwindcss`, `@tailwindcss/vite` | The CSS utility classes used by the components and figures |
| `@phosphor-icons/react` | The three icons in the section navigation |
| `unified`, `rehype-parse`, `rehype-remark`, `remark-gfm`, `remark-stringify` | Converting the built page into `index.md` |
| `yaml` | The front matter at the top of `index.md` |
| `typescript`, `@types/react`, `@types/react-dom` (dev only) | Type-checking: `npx tsc --noEmit -p tsconfig.json` |

## Install on Linux

1. **Install Node.js 22+.** Either of these works:

   ```sh
   # Ubuntu / Debian, from NodeSource
   curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
   sudo apt-get install -y nodejs git

   # or any distro, without sudo, via nvm
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
   source ~/.bashrc
   nvm install 24
   ```

   (Fedora: `sudo dnf install nodejs git`. Check the version with `node --version`.)

2. **Install the packages**, from the repo root:

   ```sh
   cd blog-src
   npm ci
   ```

   `npm ci` installs exactly what `package-lock.json` lists. Run it again after
   pulling a change to `package.json` or `package-lock.json`.

3. **Check it works:**

   ```sh
   npm run build
   ```

   This should end with `✓ one-memory-many-machines → blog/one-memory-many-machines/`.

On macOS or Windows, install Node from https://nodejs.org (or `brew install node`)
and run the same `npm` commands.

## The edit → test → deploy loop

**1. Preview while you edit.**

```sh
cd blog-src
npm run dev                              # previews the first post
npm run dev -- one-memory-many-machines  # or a specific one
```

Open http://localhost:4321/blog/one-memory-many-machines/ and edit the post's
`index.mdx` or `data.ts` ([Where things live](#where-things-live) lists which
file holds what). The page updates on every save. If you break the syntax, the
browser shows the error and the line. Stop the server with Ctrl+C.

**2. Check the real build** (optional, a few seconds):

```sh
npm run build
```

It runs the same checks as the deploy: front-matter fields, required files,
JSON-LD and the date markers. If anything is wrong it stops with a message
naming the problem. It writes `../blog/<slug>/`, which git ignores, so there is
nothing extra to commit.

**3. Deploy.** Commit only what you changed under `blog-src/`, then push to `master`:

```sh
git add blog-src
git commit -m "Tighten section 5"
git push
```

The deploy workflow builds the post, stamps its dates from git, publishes it and
tells search engines it changed. The live site deploys from
`KSTARK007/KSTARK007.github.io`, so from a fork, push to your fork and open a
pull request. The post goes live when the change reaches upstream `master`.

**Testing the deploy scripts** (only if you changed `.github/scripts/`): see
the scratch-copy recipe in the repo's top-level `README.md`. It needs
Python 3 and rsync, which on Windows are easiest from WSL.

## Where things live

Every piece of text is in exactly one file.

| To change… | Edit |
| --- | --- |
| A paragraph, heading, section deck, figure caption or figure alt text | `src/content/posts/<slug>/index.mdx` |
| Title, description, publish date, authors, papers and their links, keywords, citation key, the `llms.txt` summary | the front matter at the top of `index.mdx` |
| A number in a chart, a row in "Show the numbers", a stepper's step text, a tab's caption | `src/content/posts/<slug>/data.ts` |
| How an animation looks or behaves | `src/figures/<slug>/<Name>.tsx` (agent-managed, see `src/figures/README.md`) |
| An author's name, homepage or profile links | `src/lib/people.ts` |
| Social preview image, favicon | `src/content/posts/<slug>/public/` |
| Colours, fonts, spacing shared by all posts | `src/styles/global.css` |

Never edit by hand: `index.md`, `llms.txt`, the JSON-LD, the sitemap and the
feed. They are all generated from the files above. The last-modified date comes
from git history.

## Writing in index.mdx

It is Markdown, plus a few components for layout. Leave a blank line after an
opening tag and before its closing tag, or the Markdown inside is not parsed.

```mdx
<Section id="intro" toc="Intro" title="1. Intro" deck="One-sentence summary">

<Prose>

Body text. **bold**, _italic_, [a link](#other-section), and `110 ns`
for a highlighted number.

<Fold summary="Background · Caches" hint="expand if new to CPU caches">

Collapsible text, closed by default.

</Fold>

</Prose>

<Figure title="Plate title" source="Paper, Figure 3" alt="What the figure shows, for screen readers."
        numbers={D.SOME_TABLE}>
  <SomeFigure client:visible />

  The caption: every paragraph after the drawing.
</Figure>

---

<Prose>

The `---` above draws a rule between two runs of rows.

</Prose>

</Section>
```

| Component | What it does |
| --- | --- |
| `<Hero actions={…}>` | Masthead. Its Markdown is the lede. The drawing goes in `slot="figure"`. Title, byline and papers come from front matter. |
| `<Tldr stats={…}>` | The TL;DR box and stat tiles. |
| `<Section id toc title deck kicker narrow>` | A numbered section. `toc` is its label in the side navigation. Background colours alternate on their own. |
| `<Prose>` | Body text, in the left column. |
| `<Figure title source alt numbers>` | A figure plate, in the right column, next to the `<Prose>` before it. It stays on screen while that text scrolls. `numbers` adds a "Show the numbers" table. |
| `<Sub id title deck>` | A sub-heading with a rule above it, across the full width. |
| `<Fold summary hint variant>` | A collapsible aside. `variant="recap"` gives the shaded "skipped ahead?" box. |
| `<Callout title>` | A shaded box that is always open, e.g. a results summary. |
| `<PaperSources />`, `<RefList title>` | The Sources section: the papers from front matter, then Markdown lists of references. |
| `<About>` | The closing block. The "Cite this post" box is generated. |

Each component's file in `src/components/post/` starts with its usage.

`{D.NAME.field}` inserts a value from `data.ts`, for example
`{D.PIN_STORY.perPinAdvantage}`. Use it where the same number is also drawn by a
figure, so the figure and the text cannot drift apart.

## Adding a post

1. Copy `src/content/posts/one-memory-many-machines/` to `src/content/posts/<new-slug>/`.
   Rewrite the front matter and body, and empty `data.ts`.
2. Put its figures, if any, in `src/figures/<new-slug>/`.
3. Add `blog/<new-slug>/` to the repo's `.gitignore`.
4. Add the post to `blog/index.html`, in both the visible list and the `blogPost` JSON-LD.
5. Add `blog/<new-slug>/index.md`, `llms.txt` and `opengraph-image.png` to the
   required-files list in `.github/workflows/deploy.yml`.

## How it works

- `astro.config.mjs` builds one post per run, selected by `POST_SLUG`.
  `scripts/build-posts.mjs` runs it once per post and copies each result into place.
- `src/pages/index.astro` loads the post and checks its front matter against the
  schema in `src/lib/post.ts`. Mistakes fail the build with the field's name.
- `src/integrations/markdown-export.mjs` turns the built page into `index.md`.
  The front matter and the appendix of figure data come from
  `src/pages/md-parts.json.ts`. `src/pages/llms.txt.ts` writes `llms.txt`.
- The deploy then runs `.github/scripts/stamp_dates.py`. It dates a built post by
  the last commit to `src/content/posts/<slug>/` or `src/figures/<slug>/`, the
  same rule `scripts/post-env.mjs` uses during the build.
