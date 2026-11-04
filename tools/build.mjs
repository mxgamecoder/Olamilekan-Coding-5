// Optional generator. The generated HTML is committed, so deploying needs no build.
// Usage: node tools/build.mjs
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { site, apps, tutorials, posts } from "../content/data.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ---------- helpers ---------- */
const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const abs = (p) => site.baseUrl.replace(/\/$/, "") + "/" + String(p).replace(/^\//, "");

const dateLabel = (iso) =>
  new Date(iso + "T09:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

const ratingPct = (r) => Math.round((r / 5) * 100);

const ICON = {
  github:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.1.79-.25.79-.55v-2.1c-3.2.7-3.88-1.4-3.88-1.4-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.78 2.7 1.27 3.36.97.1-.75.4-1.27.73-1.56-2.55-.3-5.24-1.28-5.24-5.72 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a10.9 10.9 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.45-2.7 5.42-5.26 5.71.41.36.78 1.05.78 2.13v3.16c0 .3.2.66.8.55A11.5 11.5 0 0 0 12 .5Z"/></svg>',
  theme:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" stroke-linecap="round"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round"/></svg>',
  arrow: '<svg class="arw" viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  up: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 10l4-4 4 4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  diag: '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 12l8-8M6 4h6v6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

/* ---------- head ---------- */
const head = ({ title, description, path, type = "website", image = "assets/img/4.png", jsonld }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${esc(site.author)}">
<link rel="canonical" href="${abs(path)}">
<meta name="theme-color" content="#f1f2ef">
<meta name="color-scheme" content="light dark">

<meta property="og:type" content="${type}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${abs(path)}">
<meta property="og:image" content="${abs(image)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${abs(image)}">

<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/img/4.png">
<link rel="manifest" href="manifest.webmanifest">
<link rel="alternate" type="application/rss+xml" title="${esc(site.name)}" href="feed.xml">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="assets/css/main.css">

<script>(function(){try{var t=localStorage.getItem("oc-theme")||"system";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light");}catch(e){}})();</script>
<script src="assets/js/site.js" defer></script>
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ""}
</head>`;

/* ---------- chrome ---------- */
const NAV = [
  ["#apps", "Apps"],
  ["#tutorials", "Tutorials"],
  ["#posts", "Writing"],
  ["#about", "About"],
  ["#contact", "Contact"],
];

const header = ({ onIndex = false, current = "" }) => {
  const href = (h) => (onIndex ? h : "index.html" + h);
  const links = NAV.map(
    ([h, label]) =>
      `<a href="${href(h)}"${current === h ? ' aria-current="true"' : ""}>${label}</a>`
  ).join("\n        ");
  const drawerLinks = NAV.map(
    ([h, label], i) =>
      `<li><a href="${href(h)}"><span>${String(i + 1).padStart(2, "0")}</span>${label}</a></li>`
  ).join("\n          ");

  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="shell inner">
    <a class="brand" href="index.html"><b>Olamilekan</b><span>/</span><b>Coding</b></a>
    <nav class="nav" aria-label="Primary">
        ${links}
    </nav>
    <div class="header-tools">
      <a class="icon-btn" href="${site.github}" target="_blank" rel="noopener me" aria-label="GitHub profile">${ICON.github}</a>
      <button class="icon-btn" type="button" data-theme-toggle aria-label="Switch colour theme" aria-pressed="false">${ICON.theme}</button>
      <button class="icon-btn nav-toggle" type="button" data-nav-toggle aria-controls="drawer" aria-expanded="false" aria-label="Open menu">${ICON.menu}</button>
    </div>
  </div>
  <div class="drawer" id="drawer" data-drawer data-open="false">
    <nav class="shell" aria-label="Mobile">
      <ul>
          ${drawerLinks}
      </ul>
    </nav>
  </div>
</header>`;
};

const footer = () => `<footer class="site-footer">
  <div class="shell footer-grid">
    <div>
      <a class="brand" href="index.html"><b>Olamilekan</b><span>/</span><b>Coding</b></a>
      <p>Tutorials, source files and the tools I use to build on a phone. Written by ${esc(
        site.author
      )}, ${esc(site.location.split(",")[0])}.</p>
    </div>
    <ul class="footer-links">
      <li><a href="index.html#apps">Apps</a></li>
      <li><a href="index.html#tutorials">Tutorials</a></li>
      <li><a href="index.html#posts">Writing</a></li>
      <li><a href="index.html#contact">Contact</a></li>
      <li><a href="${site.github}" target="_blank" rel="noopener me">GitHub</a></li>
      <li><a href="feed.xml">RSS</a></li>
    </ul>
  </div>
  <div class="shell footer-bottom">
    <span class="mono">© <span data-year>2026</span> ${esc(site.author)}</span>
    <span class="mono">Built by hand · HTML · CSS · JS</span>
  </div>
</footer>`;

const page = (opts) => `${head(opts)}<body>
${header(opts)}
<main id="main">
${opts.body}
</main>
${footer()}
</body>
</html>
`;

/* ---------- home ---------- */
const appRows = apps
  .map(
    (a, i) => `        <li>
          <a class="app-row" href="${a.page}" data-reveal>
            <span class="idx">${String(i + 1).padStart(2, "0")}</span>
            <span class="shot"><img src="${a.image}" alt="${esc(a.title)} app screenshot" width="116" height="73" loading="lazy" decoding="async"></span>
            <span>
              <h3>${esc(a.title)}</h3>
              <span class="desc">${esc(a.tagline)}</span>
              <span class="app-meta">
                <span class="rating"><span class="meter"><i style="width:${ratingPct(
                  a.rating
                )}%"></i></span>${a.rating.toFixed(1)}</span>
                ${a.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}
              </span>
            </span>
            <span class="row-go" aria-hidden="true">${ICON.diag}</span>
          </a>
        </li>`
  )
  .join("\n");

const tutCards = tutorials
  .map(
    (t) => `        <a class="tut" href="${t.page}" data-reveal>
          <span class="shot"><img src="${t.image}" alt="" width="400" height="300" loading="lazy" decoding="async"></span>
          <span class="body">
            <span class="kicker"><span class="mono">${esc(t.tags.join(" · "))}</span><span class="mono">${t.minutes} min</span></span>
            <h3>${esc(t.title)}</h3>
            <span class="foot">Read tutorial ${ICON.arrow}</span>
          </span>
        </a>`
  )
  .join("\n");

const postRows = posts
  .map(
    (p, i) => `        <li>
          <a href="${p.page}">
            <span class="num">${String(i + 1).padStart(2, "0")}</span>
            <time datetime="${p.date}">${dateLabel(p.date)}</time>
            <span class="t">${esc(p.title)}</span>
            <span class="go" aria-hidden="true">${ICON.diag}</span>
          </a>
        </li>`
  )
  .join("\n");

const CODE_SAMPLE = `// about.js — what this site is built with
const coder = {
  name: "Olamilekan",
  role: "front-end developer",
  base: "Lagos, Nigeria",
  stack: ["HTML", "CSS", "JavaScript", "Next.js"],
  writes: "tutorials with source files",
  since: 2023,
};

export function build(idea) {
  return ship(idea, { fast: true, simple: true });
}`;

const codeHtml = CODE_SAMPLE.replace(
  /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*")|\b(const|let|return|export|function|new)\b|\b(\d{4})\b|(\w+)(?=\()/g,
  (m, com, str, kw, num, fn) => {
    if (com) return `<span class="tok-com">${esc(com)}</span>`;
    if (str) return `<span class="tok-str">${esc(str)}</span>`;
    if (kw) return `<span class="tok-key">${kw}</span>`;
    if (num) return `<span class="tok-num">${num}</span>`;
    if (fn) return `<span class="tok-fn">${fn}</span>`;
    return m;
  }
);

const yearNow = new Date().getFullYear();

const homeBody = `<div class="shell">
  <section class="hero">
    <div>
      <p class="eyebrow mono"><span class="dot" aria-hidden="true"></span>${esc(
        site.location
      )} · open to work</p>
      <h1>I'm Olamilekan.<br>I build <span class="rot" data-rotator data-words="interfaces|tools|blogs|side projects">interfaces</span><span class="caret" aria-hidden="true"></span></h1>
      <p class="lede">Front-end developer and blogger. I write tutorials that end in a <strong>downloadable, working file</strong> — not a screenshot of one. Everything here is built and tested on a phone first.</p>
      <div class="cta-row">
        <a class="btn btn--primary" href="#tutorials">Browse tutorials ${ICON.arrow}</a>
        <a class="btn btn--ghost" href="#apps">The apps I use</a>
      </div>
      <ul class="stats">
        <li><b>${String(tutorials.length + posts.length).padStart(2, "0")}</b><span>Tutorials</span></li>
        <li><b>${String(apps.length).padStart(2, "0")}</b><span>Apps reviewed</span></li>
        <li><b>${yearNow - site.since}+</b><span>Years building</span></li>
      </ul>
    </div>
    <div class="code-window" data-reveal>
      <div class="code-bar">
        <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="file">about.js</span>
        <button class="copy" type="button" data-copy="${esc(CODE_SAMPLE)}">copy</button>
      </div>
      <pre><code>${codeHtml}</code></pre>
      <div class="code-foot"><i aria-hidden="true"></i>last deploy · this build</div>
    </div>
  </section>

  <section class="section" id="apps">
    <div class="section-head">
      <span class="idx">02 / apps</span>
      <h2>The Android apps I actually code in</h2>
      <p class="note">Six editors and IDEs that survived real use — offline builds, small screens, no laptop. Ratings are from the Play Store.</p>
    </div>
    <ul class="app-list">
${appRows}
    </ul>
  </section>

  <section class="section" id="tutorials">
    <div class="section-head">
      <span class="idx">03 / tutorials</span>
      <h2>Build it once, keep the source</h2>
      <p class="note">Short, self-contained builds. Every tutorial links to the files, so you can open them, break them and put them back together.</p>
    </div>
    <div class="tut-grid">
${tutCards}
    </div>
  </section>

  <section class="section" id="posts">
    <div class="section-head">
      <span class="idx">04 / writing</span>
      <h2>Notes from the editor</h2>
      <p class="note">Smaller pieces: one effect, one problem, one fix. Written while building the things above.</p>
    </div>
    <ul class="ledger">
${postRows}
    </ul>
  </section>

  <section class="section" id="about">
    <div class="section-head">
      <span class="idx">05 / about</span>
      <h2>A phone, a text editor and too many tabs</h2>
    </div>
    <div class="contact">
      <div class="prose prose-sm">
        <p>I started this site in ${site.since} to keep my own notes in one place. It turned into a tutorial archive: the clock, the slider, the dark-mode toggle — each one written up with the code that made it work.</p>
        <p>Most of it was written on Android, between classes, in editors that crash more than they should. That is why the downloads matter and why every demo stays small.</p>
        <p>If a tutorial helped, tell me which one. If one broke, tell me faster.</p>
      </div>
      <div>
        <ul class="contact-list">
          <li><span class="k">Email</span><a class="link" href="mailto:${site.email}">${site.email}</a></li>
          <li><span class="k">Phone</span><span>${site.phone}</span></li>
          <li><span class="k">GitHub</span><a class="link" href="${site.github}" target="_blank" rel="noopener me">@${site.handle}</a></li>
          <li><span class="k">Based</span><span>${esc(site.location)}</span></li>
        </ul>
      </div>
    </div>
  </section>

  <section class="band" id="subscribe">
    <div>
      <h2>One new build in your inbox</h2>
      <p>When a tutorial ships, you get the link and the source file. No course funnel, no weekly newsletter you never asked for.</p>
    </div>
    <form class="sub-form" data-subscribe action="${site.subscribeEndpoint}" data-fallback="${site.email}">
      <div class="field-row">
        <label class="sr-only" for="sub-email">Email address</label>
        <input id="sub-email" type="email" name="email" placeholder="you@example.com" autocomplete="email" required>
        <button class="btn btn--primary" type="submit">Subscribe ${ICON.arrow}</button>
      </div>
      <p class="form-status" data-status role="status" aria-live="polite">No spam. Unsubscribe whenever.</p>
    </form>
  </section>

  <section class="section" id="contact">
    <div class="section-head">
      <span class="idx">06 / contact</span>
      <h2>Say something</h2>
      <p class="note">Work, a question about a tutorial, or a bug in one of the demos. This form opens your mail app — nothing is sent through a third party.</p>
    </div>
    <form class="form-grid" data-contact data-to="${site.email}">
      <div class="field">
        <label for="c-name">Your name</label>
        <input id="c-name" name="name" type="text" autocomplete="name" required>
      </div>
      <div class="field">
        <label for="c-email">Email</label>
        <input id="c-email" name="email" type="email" autocomplete="email" required>
      </div>
      <div class="field">
        <label for="c-message">Message</label>
        <textarea id="c-message" name="message" rows="5" required></textarea>
      </div>
      <button class="btn btn--primary" type="submit">Open mail app ${ICON.arrow}</button>
      <p class="form-status" data-status role="status" aria-live="polite"></p>
    </form>
  </section>
</div>`;

/* ---------- detail pages ---------- */
const crumbs = (label, backHref, backLabel) => `<nav class="crumbs" aria-label="Breadcrumb">
      <a href="index.html">Home</a><span aria-hidden="true">/</span>
      <a href="${backHref}">${esc(backLabel)}</a><span aria-hidden="true">/</span>
      <span class="mono current">${esc(label)}</span>
    </nav>`;

const downloadPanel = (item) => {
  if (item.download) {
    return `<div class="panel">
        <h2>Source files</h2>
        <a class="btn btn--primary" href="${item.download}" target="_blank" rel="noopener">Open download ${ICON.diag}</a>
        <p class="note-line">Google Drive · free · opens in a new tab</p>
      </div>`;
  }
  return `<div class="panel">
        <h2>Source files</h2>
        <a class="btn btn--ghost" href="mailto:${site.email}?subject=${encodeURIComponent(
    "Source for " + item.title
  )}">Ask for the files</a>
        <p class="note-line">This one is not on Drive yet. Mail me and I'll send it.</p>
      </div>`;
};

const tutorialPage = (item, index, list) => {
  const prev = list[index - 1];
  const next = list[index + 1];
  return page({
    title: `${item.title} — ${site.name}`,
    description: item.blurb,
    path: item.page,
    type: "article",
    image: item.image,
    jsonld: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: item.title,
      description: item.blurb,
      image: abs(item.image),
      author: { "@type": "Person", name: site.author },
      publisher: { "@type": "Organization", name: site.name },
      mainEntityOfPage: abs(item.page),
      ...(item.date ? { datePublished: item.date } : {}),
    },
    body: `<article>
  <header class="page-head shell">
    ${crumbs(item.tags[0], "index.html#tutorials", "Tutorials")}
    <h1>${esc(item.title)}</h1>
    <div class="page-meta">
      <span class="mono">${esc(item.tags.join(" · "))}</span>
      <span class="mono">${item.level}</span>
      <span class="mono">${item.minutes} min read</span>
      ${item.date ? `<time class="mono" datetime="${item.date}">${dateLabel(item.date)}</time>` : ""}
    </div>
    <figure class="cover">
      <img src="${item.image}" alt="Preview of ${esc(item.title)}" width="1200" height="675" fetchpriority="high" decoding="async">
    </figure>
    <div class="cover-cap mono"><span>fig. 01 — the finished build</span><span>html · css · js</span></div>
  </header>

  <div class="article-body shell">
    <div class="prose">
      <p class="prose-intro">${esc(
        item.blurb
      )}</p>
      <p>${esc(item.intro)}</p>
      <h2>What you'll build</h2>
      <ul>
        ${item.build.map((b) => `<li>${esc(b)}</li>`).join("\n        ")}
      </ul>
      <h2>Files in the download</h2>
      <ul>
        ${item.inside.map((f) => `<li><code>${esc(f)}</code></li>`).join("\n        ")}
      </ul>
      <h2>Before you start</h2>
      <p>You need a text editor and a browser — that's it. No package manager, no build step, no framework. Open <code>index.html</code> and the demo runs.</p>
      <p>If you change something and it breaks, open the browser console first. Nine times out of ten the answer is a typo in a selector or a variable used before it exists.</p>
    </div>
    <aside class="aside">
      ${downloadPanel(item)}
      <div class="panel">
        <h2>In this build</h2>
        <ul>
          ${item.tags.map((t) => `<li>${esc(t)}</li>`).join("\n          ")}
          <li>${item.level} level</li>
          <li>~${item.minutes} minutes</li>
        </ul>
      </div>
      <div class="panel">
        <h2>Stuck?</h2>
        <p>Send the error text and the file you're editing. I answer these first.</p>
        <a class="btn btn--ghost panel-btn" href="mailto:${site.email}">Email me</a>
      </div>
    </aside>
  </div>

  <nav class="pager shell" aria-label="More tutorials">
    ${
      prev
        ? `<a href="${prev.page}"><span class="dir">← Previous</span><span class="t">${esc(prev.title)}</span></a>`
        : `<a href="index.html#tutorials"><span class="dir">← Previous</span><span class="t">All tutorials</span></a>`
    }
    ${
      next
        ? `<a class="next" href="${next.page}"><span class="dir">Next →</span><span class="t">${esc(next.title)}</span></a>`
        : `<a class="next" href="index.html#posts"><span class="dir">Next →</span><span class="t">More writing</span></a>`
    }
  </nav>
</article>`,
  });
};

const appPage = (item, index) => {
  const others = apps.filter((a) => a.page !== item.page).slice(0, 3);
  return page({
    title: `${item.title} review — ${site.name}`,
    description: item.desc,
    path: item.page,
    type: "article",
    image: item.image,
    body: `<article>
  <header class="page-head shell">
    ${crumbs(item.title, "index.html#apps", "Apps")}
    <h1>${esc(item.title)}</h1>
    <p class="page-lede">${esc(item.tagline)}</p>
    <div class="page-meta">
      <span class="mono">Play Store rating ${item.rating.toFixed(1)} / 5</span>
      ${item.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}
    </div>
    <figure class="cover cover--app">
      <img src="${item.image}" alt="${esc(item.title)} screenshot" width="1200" height="675" fetchpriority="high" decoding="async">
    </figure>
  </header>

  <div class="article-body shell">
    <div class="prose">
      <p class="prose-intro">${esc(
        item.desc
      )}</p>
      <h2>Why it made this list</h2>
      <p>I keep a small set of tools installed and delete everything else. An app stays if it opens fast, works without a connection when it claims to, and doesn't hide the file I just wrote behind a paywall.</p>
      <p><strong>${esc(item.title)}</strong> passed that test. It is not perfect — no mobile IDE is — but it is the one I reach for.</p>
      <h2>Spec sheet</h2>
      <ul>
        <li><strong>Platform:</strong> Android</li>
        <li><strong>Price:</strong> ${esc(item.tags.includes("Freemium") ? "Free with paid extras" : "Free")}</li>
        <li><strong>Store rating:</strong> ${item.rating.toFixed(1)} / 5</li>
        <li><strong>Best for:</strong> ${esc(item.tagline)}</li>
      </ul>
      <p>The rating shown is the store's, not mine. Mine would be higher on the two I use daily.</p>
    </div>
    <aside class="aside">
      <div class="panel">
        <h2>Get the app</h2>
        <a class="btn btn--primary" href="${item.store}" target="_blank" rel="noopener nofollow">Play Store ${ICON.diag}</a>
        <p class="note-line">android · google play</p>
      </div>
      <div class="panel">
        <h2>More tools</h2>
        <ul>
          ${others.map((o) => `<li><a class="link" href="${o.page}">${esc(o.title)}</a></li>`).join("\n          ")}
        </ul>
      </div>
    </aside>
  </div>

  <nav class="pager shell" aria-label="More pages">
    <a href="index.html#apps"><span class="dir">← Back</span><span class="t">All apps</span></a>
    <a class="next" href="${apps[index + 1] ? apps[index + 1].page : "index.html#tutorials"}"><span class="dir">Next →</span><span class="t">${
      apps[index + 1] ? esc(apps[index + 1].title) : "Start a tutorial"
    }</span></a>
  </nav>
</article>`,
  });
};

/* ---------- static pages ---------- */
const thanksPage = page({
  title: `You're subscribed — ${site.name}`,
  description: "Subscription confirmed.",
  path: "page2.html",
  body: `<div class="shell notfound">
    <span class="mono">// subscribed</span>
    <h1 class="h2">You're on the list</h1>
    <p>Next build lands in your inbox the week it ships. In the meantime, the tutorials are all free — start with the clock.</p>
    <div class="cta-row cta-center">
      <a class="btn btn--primary" href="index.html#tutorials">Browse tutorials ${ICON.arrow}</a>
      <a class="btn btn--ghost" href="index.html">Back home</a>
    </div>
  </div>`,
});

const notFoundPage = page({
  title: `404 — ${site.name}`,
  description: "That page does not exist.",
  path: "404.html",
  body: `<div class="shell notfound">
    <span class="code">404</span>
    <h1 class="h2">This file was never written</h1>
    <p>The link you followed is dead, or I renamed something without telling anyone. Both are possible.</p>
    <div class="cta-row cta-center">
      <a class="btn btn--primary" href="index.html">Back home ${ICON.arrow}</a>
      <a class="btn btn--ghost" href="index.html#tutorials">All tutorials</a>
    </div>
  </div>`,
});

/* ---------- write ---------- */
const files = [];
const put = (name, content) => files.push([name, content]);

put(
  "index.html",
  page({
    title: `${site.name} — front-end tutorials, source files and tools`,
    description: site.description,
    path: "index.html",
    onIndex: true,
    jsonld: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: site.name,
      url: abs("index.html"),
      author: { "@type": "Person", name: site.author },
      description: site.description,
    },
    body: homeBody,
  })
);

tutorials.forEach((t, i) => put(t.page, tutorialPage(t, i, tutorials)));
posts.forEach((p, i) => put(p.page, tutorialPage(p, i, posts)));
apps.forEach((a, i) => put(a.page, appPage(a, i)));
put("page2.html", thanksPage);
put("404.html", notFoundPage);

const allItems = [...tutorials, ...posts];

put(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${abs("index.html")}</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
${allItems
  .map(
    (i) =>
      `  <url><loc>${abs(i.page)}</loc><lastmod>${
        i.date || new Date().toISOString().slice(0, 10)
      }</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`
  )
  .join("\n")}
</urlset>
`
);

put(
  "robots.txt",
  `User-agent: *
Allow: /

Sitemap: ${abs("sitemap.xml")}
`
);

put(
  "feed.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${esc(site.name)}</title>
<link>${abs("index.html")}</link>
<description>${esc(site.description)}</description>
<language>en</language>
${allItems
  .map(
    (i) => `<item>
  <title>${esc(i.title)}</title>
  <link>${abs(i.page)}</link>
  <guid>${abs(i.page)}</guid>
  ${i.date ? `<pubDate>${new Date(i.date).toUTCString()}</pubDate>` : ""}
  <description>${esc(i.blurb)}</description>
</item>`
  )
  .join("\n")}
</channel></rss>
`
);

for (const [name, content] of files) {
  await writeFile(join(root, name), content, "utf8");
}

console.log(`wrote ${files.length} files`);
