# Olamilekan Coding

Personal site: front-end tutorials with downloadable source files, plus the Android
apps I actually code in.

Static HTML, CSS and vanilla JavaScript. No framework, no bundler, no npm install.
Drop the folder on any static host (GitHub Pages included) and it works.

## Structure

```
index.html            home — hero, apps, tutorials, writing, about, contact
page.html, page7.html app detail pages
page3-6.html
page11-16.html        tutorials (the "hot topics" set)
page20-29.html        writing / notes
page2.html            subscribe confirmation
404.html              not found
feed.xml, sitemap.xml, robots.txt

assets/css/main.css   design system + every layout (one file, tokens at the top)
assets/js/site.js     theme, nav, rotator, reveal, forms, service worker
assets/img/           screenshots and logos

content/data.mjs      all page content (titles, blurbs, links, ratings…
tools/build.mjs       optional generator that writes the HTML above

sw.js                 offline shell
manifest.webmanifest  PWA metadata
```

## Editing content

Copy lives in `content/data.mjs`. Change a title, add a tutorial, fix a Drive link,
then regenerate the pages:

```bash
node tools/build.mjs
```

The generated HTML is committed, so **the deployed site never needs a build step**.
If you only tweak one page by hand, that's fine too — just don't run the generator
afterwards, or it will overwrite your edit.

`node tools/build.mjs` exists so 20 near-identical pages don't drift apart.

## Running locally

Any static server works:

```bash
npx serve . -s
# or
python -m http.server
```

Opening `index.html` from disk also works; only the service worker needs a real
origin (it is HTTPS-only by design).

## Deploying

GitHub Pages → Settings → Pages → Deploy from branch → root. No action needed.

Before you point a custom domain at it, update `site.baseUrl` in `content/data.mjs`
and regenerate so canonical URLs, Open Graph tags and the sitemap use the right host.

## Design notes

The 2023 version was six CSS files, floated layouts and `position: relative; top: 6cm`.
This one is a single design system:

- **Canvas:** paper with a faint grid, ink type, hairline rules — a spec sheet, not a
  card dashboard. Dark mode is a real theme, not the default.
- **Type:** Space Grotesk (display), Instrument Sans (body), JetBrains Mono (labels,
  meta, code). Three roles, no more.
- **Colour:** one accent — safety orange — reserved for primary actions, active nav
  and focus rings. Everything else is ink and paper.
- **Layout:** numbered section rail, rules instead of boxes, list rows instead of
  card grids where the content is a list.
- **Motion:** short, eased, and switched off under `prefers-reduced-motion`.

## What changed from the 2023 version

**Bugs and correctness**

- Duplicate `id="sheetdb-form"`, invalid `type="name"`, malformed `pattern` regexes on
  the email fields and a self-closing `<span/>` are gone.
- `alert('ok means it has send…')` no longer fires on every page load.
- A stray `<link href="page2.html">` that did nothing has been removed.
- `font-size: 25pxx`, `14pxpx` and other dead CSS values removed.
- Timers and intervals are cleared, animations respect reduced motion.

**Accessibility**

- Skip link, focus-visible rings, real `<label>`s, `aria-expanded` on the menu,
  `aria-current` on nav, alt text on screenshots, keyboard-reachable everything.
- Decorative elements are `aria-hidden`; the star of the page (the h1) is still a h1.

**Responsive**

- Real breakpoints at 1040 / 900 / 620px instead of `margin-left: 11.5cm`.
- Fluid type scale via `clamp()`; no horizontal scroll at any width.

**Performance**

- Font Awesome's 60KB CSS CDN is gone — four inline SVG icons instead.
- Lazy loading and intrinsic `width`/`height` on images (no layout shift).
- One CSS file, one JS file, no libraries. Fonts preconnected, `display=swap`.

**Privacy and security**

- The fake login form is gone. It posted plaintext passwords to a public sheet.
- The SMTP.js `SecureToken` and its client-side email path are gone — anything in a
  static page is public. The contact form now composes a `mailto:` link in the browser.
- The newsletter form posts straight to the existing sheetdb endpoint, with an inline
  success/error state instead of a popup window.
- Google Fonts is the only third-party request left.

**SEO / sharing**

- Per-page `<title>`, description, canonical, Open Graph and Twitter cards.
- JSON-LD (`WebSite` + `BlogPosting`), `sitemap.xml`, `robots.txt`, `feed.xml`.
- Native `<time datetime="">` on every dated entry.

**PWA**

- `manifest.webmanifest` + `sw.js`: HTML is network-first so edits go live immediately,
  assets are cache-first so the site opens offline.

## Still to do

- The tutorial thumbnails are the original 2023 screenshots and some don't match their
  topic (the "photo slider" card, for example). Replace `assets/img/*.jpg` with real
  previews when you rebuild those demos.
- `page20.html` has no Drive link yet — it shows an honest "ask for the files" state.
- Add a real 512×512 PWA icon and a 1200×630 `og:image`.
