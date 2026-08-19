# Zionie Bake House — website

Static site for a home bakery in Coimbatore. Plain HTML + CSS + vanilla JS,
**no framework and no build step** — the files in this repo are what ships.

## Pages

`index.html` · `menu.html` · `classes.html` · `gallery.html` · `reviews.html` · `contact.html`

Shared styles live in `css/styles.css`, shared behaviour in `js/`. There is no
templating, so the header and footer are duplicated in every page — a nav or
footer change must be applied to all six files.

## Deploy

Cloudflare Pages, connected to this private GitHub repo
(`VybhavsGroup/zionie-bake-house`). Every push to `main` redeploys
automatically.

Project settings in the Cloudflare dashboard:

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | *(empty)* |
| Build output directory | `/` |

There is no build step — the repo root is served as-is. `_headers` sets custom
response headers; Cloudflare Pages reads it from the output directory. Use
`_redirects` in the same place if redirects are ever needed.

Preview locally before pushing:

```bash
python3 -m http.server 8000
```

## Gotchas

- **Phone number is hardcoded in 15 places** — all six pages plus `js/main.js`
  (`WHATSAPP_NUMBER`). In the pages it appears as display text
  `+91 77089 15271` and in `wa.me/917708915271` links. Change it everywhere
  or the order buttons break silently.
- **Ordering has no backend.** Forms build a prefilled WhatsApp message and open
  `wa.me`. Don't introduce anything needing a server.
- **Image filenames are not content-hashed**, so keep names stable when
  replacing a photo; caching is left on Cloudflare's defaults for this reason.
- `tools/build-onefile.py` inlines the whole site into one portable HTML file. It is a
  side utility, not part of the deploy.
- Original full-resolution WhatsApp photos are **not** in this repo — they're in
  `../zione-bakes/images/Website images2` on the Desktop.

## Conventions

Match the existing markup: semantic sections, reveal-on-scroll animations that
respect `prefers-reduced-motion`, and CSS custom properties for colour. Keep the
warm, homemade tone in copy — this is a family bakery, not a chain.
