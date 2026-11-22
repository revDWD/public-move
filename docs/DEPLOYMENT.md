# Deploying Public / Move to move.abbydavid.com

## Hosting architecture

- **Static files, no build.** The repository root is the website. GitHub Pages serves the `main` branch from `/` (the existing "deploy from a branch" setup). No GitHub Actions workflow is needed.
- **Custom subdomain:** `move.abbydavid.com`, declared by the `CNAME` file. This follows the same pattern as `atfitnesstracker.abbydavid.com`. The apex `abbydavid.com` stays with the separate `AbbyDavid.com` repository; nothing there changes.
- **HTTPS:** issued automatically by GitHub Pages (Let’s Encrypt) once DNS resolves.
- **Routing:** two real pages, `/` (landing) and `/app/` (demo). Screens inside the demo use the URL hash (`/app/#live`, `#fleet`, `#impact`, `#access`), so no server rewrites or SPA fallback are needed. `?to=work` (or `clinic`, `market`, `college`, `library`, `station`, `park`) opens the demo with that destination chosen.
- **Paths:** every asset and page link is **relative**, so the site works both at `move.abbydavid.com/` and at `revdwd.github.io/public-move/`. The only exception is `404.html`, which uses root paths (`/`, `/app/`) because GitHub serves it at arbitrary depths on the custom domain.

```
/                 index.html (landing)
/app/             app/index.html (demo shell)
/src/             ES modules shared by both pages
/assets/css       base.css (design system), landing.css, app.css
/assets/fonts     Inter variable, self-hosted (OFL)
/assets/img       favicon.svg, apple-touch-icon.png, og-image.png
/pitch/           St. Louis pilot one-pager (standalone)
CNAME, .nojekyll, 404.html, robots.txt, sitemap.xml
```

## Cut-over steps (do these in order)

> **Add the DNS record before merging.** Once the `CNAME` file is on `main`, GitHub redirects `revdwd.github.io/public-move/` to `move.abbydavid.com`. If DNS isn't ready yet, the old address stops working.

1. **DNS.** At the DNS host for `abbydavid.com` (the same place the `atfitnesstracker` record lives), add:

   | Type | Name | Value | TTL |
   |---|---|---|---|
   | CNAME | `move` | `revdwd.github.io` | Auto / 3600 |

   Don't add A records for the subdomain, and don't include the repository name in the value.
2. **Check propagation:** `dig +short move.abbydavid.com` should return `revdwd.github.io.` and then GitHub’s IP addresses (usually within minutes, at most a few hours).
3. **Merge the PR** to `main`. Pages rebuilds in about a minute.
4. **GitHub settings → Pages** for `revDWD/public-move`: confirm the custom domain reads `move.abbydavid.com` and the DNS check is green. Tick **Enforce HTTPS** once the certificate has been issued (this can take up to an hour after DNS resolves).
5. **Optional, recommended:** verify `abbydavid.com` under *GitHub → Settings (account) → Pages → Verified domains*. That stops anyone else claiming a subdomain of it on Pages.
6. **Update the link on abbydavid.com.** `projects/index.html` in the `AbbyDavid.com` repo points to `https://revdwd.github.io/public-move/`. Change it to `https://move.abbydavid.com/`. The old URL will redirect anyway, but a direct link is cleaner.

## Verifying production

- `https://move.abbydavid.com/` loads with no console errors; the fleet cards render.
- `https://move.abbydavid.com/app/` runs a full trip; `/app/#live` opens the map.
- `https://move.abbydavid.com/nope` shows the custom 404.
- `https://revdwd.github.io/public-move/` redirects to the subdomain.
- Paste the URL into a link-preview checker (or a chat app) to see the Open Graph card.

## Local development

ES modules don't load from `file://`, so serve the folder:

```
python3 -m http.server 8000
# http://localhost:8000/ and http://localhost:8000/app/
```

## Rolling back

Delete the `CNAME` file (or clear the custom domain in Pages settings) and the site returns to `revdwd.github.io/public-move/`. Every path is relative, so nothing else needs to change.
