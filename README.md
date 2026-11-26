# Leonida Front Page: the website

The official site for **Leonida Front Page**, the "everything GTA 6" brand: guides, secrets, news and a GTA 6 database, built to send people to the YouTube channels.

- **Live address:** https://leonidafrontpage.netlify.app
- **Long-form channel:** https://www.youtube.com/@FrontPageLeonida
- **Daily Shorts:** https://www.youtube.com/@LeonidaFP

It's a fast static site (Astro), hosted free on Netlify, and it **updates itself** when new videos are uploaded.

---

## The everyday stuff

### How the site updates itself
You never edit the site to add a video.

- **Long-form videos:** the newest upload becomes the front-page lead story automatically.
- **Shorts:** only high performers are shown (at least 1,000 views *and* above the channel's typical Short), ranked by views. Change the rules in `src/config/site.ts` under `TOP_SHORTS`.
- **Once a day** (about 6am Central) a free GitHub check looks at **both channels** (long form and Shorts) for a new upload and asks Netlify to rebuild **only when there is one**. Each rebuild refreshes the lead story and re-ranks the high-performing Shorts.
- **Website reviews happen once a month**: a Claude cloud routine runs on the 1st (16:00 UTC, about 10am Central) and opens a **"Monthly website review" pull request** with its report (`docs/reviews/YYYY-MM.md`) and any small fixes. Nothing goes live until you merge it. Manage it at https://claude.ai/code/routines. Everything else changes only when you decide.

### Add a guide
1. Open `src/content/guides/` and copy `_TEMPLATE.md`.
2. Rename the copy, using lowercase words joined by dashes, e.g. `best-boats-gta-6.md`. That name becomes the address: `leonidafrontpage.netlify.app/guides/best-boats-gta-6/`.
3. Fill in the lines at the top (title, description, category, date) and write the guide underneath. Use `##` for section headings; they appear in the page's contents bar automatically.
4. Save and publish (see **Publish a change** below).

Turning a placeholder into a real guide: open the guide, write the content, and change `placeholder: true` to `placeholder: false`. It then appears in Google, the Latest feed and the front page.

### Add a news post
Same as a guide, in `src/content/news/` (copy `_TEMPLATE.md`). The newest post becomes the lead story on the News page.

### Attach a YouTube video to a guide, news post or database entry
Add a line `youtubeId: XXXXXXXXXXX` with the video's 11-character ID:
- `https://www.youtube.com/watch?v=`**`dQw4w9WgXcQ`** → `dQw4w9WgXcQ`
- `https://www.youtube.com/shorts/`**`2NjIGDok6dk`** → `2NjIGDok6dk`

If you type it wrong, the site refuses to build and tells you which file to fix, so nothing breaks on the live site.

### Add to the database (vehicles, weapons, characters, missions, checklist)
Each entry is **one file**. In `src/content/vehicles/` (or `weapons/`, `characters/`, `checklist/`), copy `_EXAMPLE.json`, rename it (e.g. `vapid-stanier.json`), fill it in and delete the `_help` line. Missions are `.md` files in `src/content/missions/` (copy `_EXAMPLE.md`).

**Rules:**
- **Only confirmed facts.** Leave a value out if you haven't confirmed it, and the site shows "Not confirmed yet" instead of guessing.
- Set `confirmedIn` to `game`, `rockstar`, `trailer` or `not-confirmed`, and `lastVerified` to the date you checked. Both show on the page.
- Stats are 0-100 and appear as bars.
- **Use your own screenshots**, never Rockstar art. Put them in `public/images/vehicles/` (etc.) as WebP, about 1600 px wide, and list them under `images`.
- Story details go in `spoilerText` with `spoiler: true`, so readers have to tap to reveal them.

A database section stays hidden from the menu and from Google until it has at least one entry, then appears by itself, along with its compare tool and tier list.

To preview the database layout with fake **SAMPLE** entries (never published), run `npm run dev:live`.

### Replace placeholder images
Put your image in `public/images/` (WebP, about 1600×900) and set `image: /images/your-file.webp` (plus `imageAlt:` describing it) at the top of the guide or post.

### Change channel info, contact email or social links
Everything lives in **`src/config/site.ts`**: channel names, links and IDs, the tagline, the contact email (leave empty to hide it), and TikTok/X links (each icon appears once you fill in its link). Nothing channel-related is written anywhere else.

### Change the look
- **Which style each type of page uses** (Broadsheet or Night Desk): `src/config/theme.ts`.
- **Colours:** the top of `src/styles/global.css`.
- **Brand images** (logo cut-out, icons, share image, placeholder art): run `npm run brand`. It rebuilds them from the channel art in `brand/`.

---

## Publish a change
Once the site is connected to GitHub and Netlify:

1. Make your change and save.
2. In a terminal in this folder:
   ```
   git add -A
   git commit -m "Add best boats guide"
   git push
   ```
3. Netlify rebuilds and the live site updates within about a minute. Watch it under **Netlify → your site → Deploys**.

To check on your computer first: `npm run dev`, then open http://localhost:4321.

---

## One-time setup

### 1. Connect Netlify (after the code is on GitHub)
1. Go to **app.netlify.com → Add new site → Import an existing project → GitHub** and pick `leonida-front-page`. The build settings are filled in automatically from `netlify.toml`. Click **Deploy**.
2. **Rename the site** so the address is right: **Site configuration → Site details → Change site name** → `leonidafrontpage`. The address must stay one word in brand order: leonida → front → page. Never `frontpageleonida`. If the name is taken, stop and pick an alternative together, then update `url` in `src/config/site.ts` and `SITE_URL` in `astro.config.mjs`.

### 2. Turn on automatic video updates (build hook)
1. In Netlify: **Site configuration → Build & deploy → Build hooks → Add build hook**. Name it `YouTube check`, branch `main`. Copy the URL it gives you. **It's a private key, so don't share it or put it in the code.**
2. In GitHub: open the repo → **Settings → Secrets and variables → Actions → New repository secret**. Name: `NETLIFY_BUILD_HOOK`. Value: paste the URL.
3. Test it: GitHub repo → **Actions → "Check YouTube for new uploads" → Run workflow** (tick "Rebuild even if there is no new upload"). A new deploy should appear in Netlify.

To check that it's running: **GitHub → Actions** shows every daily run and what it decided ("No new uploads" or "Netlify rebuild requested").

### 3. Email signups (the Morning Edition)
Netlify picks up the signup form on the first deploy. Signups appear under **Netlify → your site → Forms → newsletter**. You can export them as a CSV any time. To send emails you'll later want a mailing tool; that's your call when the list grows.

### 4. Google Search Console (launch day)
1. Go to https://search.google.com/search-console → **Add property → URL prefix** → `https://leonidafrontpage.netlify.app`.
2. Verify with the **HTML tag** method: copy the `content="…"` code and give it to Claude (or add `<meta name="google-site-verification" content="…" />` in `src/layouts/BaseLayout.astro`), publish, then click Verify.
3. **Sitemaps** → submit `sitemap-index.xml`.
4. On Sundays, check **Performance** to see what people search for, and make more of what works.

### 5. Custom domain later (`leonidafrontpage.com`)
Buy it (your decision), then **Netlify → Domain management → Add a domain** and follow the steps. Afterwards, update `url` in `src/config/site.ts` and `SITE_URL` in `astro.config.mjs` to the new address.

---

## For developers
- `npm run dev`: local preview at http://localhost:4321
- `npm run dev:live`: local preview with SAMPLE database entries and sample long-form videos (test mode, never deployed)
- `npm run build`: production build plus the search index (`dist/`)
- `npm run brand`: regenerate brand images from `brand/`

**Stack:** Astro 7 static output · content collections (Markdown/JSON with schema validation) · Pagefind search · YouTube RSS at build time (no API key) · Netlify (headers and CSP in `netlify.toml`) · GitHub Actions for auto-rebuilds.

---

*Leonida Front Page is a fan-made channel and is not affiliated with Rockstar Games or Take-Two Interactive.*
