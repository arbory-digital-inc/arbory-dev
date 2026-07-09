# ARBORY BLOG - DARK ALLEY

This codebase runs the Arbory Digital Blog on Dark Alley.

## CDN & Delivery Architecture

This site runs on **AEM Edge Delivery Services** (a.k.a. "Dark Alley"). There are two
independent sources that feed the same delivery origin:

| Layer | Source | Notes |
| --- | --- | --- |
| **Code** | This GitHub repo (`arbory-digital-inc/arbory-dev`, `main` branch) | Blocks, `scripts/`, `styles/`, etc. Synced to the AEM *code bus* automatically on push via AEM Code Sync. |
| **Content** | Document Authoring (`content.da.live/arbory-digital-inc/arbory-dev`) | Pages/documents. Edited via [da.live](https://da.live) and published through the Sidekick. Lives in the AEM *content bus*. |

Configuration for both lives in the AEM config service, not in this repo (`config.json`
holds `code.source`, `content.source`, `contentBusId`, `sidekick`, `access`, etc.).

### Environments / URLs

| Purpose | URL |
| --- | --- |
| Preview origin | `https://main--arbory-dev--arbory-digital-inc.aem.page` |
| Live origin | `https://main--arbory-dev--arbory-digital-inc.aem.live` |
| DEV site (public host) | `https://blog-dev.arborydigital.com` |

`blog-dev.arborydigital.com` is fronted by the **Adobe Managed CDN** (a multi-tier
Fastly stack — you'll see `x-cache: MISS, MISS, MISS, HIT` across the layers). The
managed host is registered in the site's CDN config so the CDN is wired into AEM's
purge path:

```json
// admin.hlx.page/config/arbory-digital-inc/sites/arbory-dev/cdn.json
{ "prod": { "host": "blog-dev.arborydigital.com", "type": "managed" } }
```

### Caching & invalidation (read this before you chase a "stale" bug)

- Responses are served with `Cache-Control: max-age=7200, must-revalidate` (a 2h TTL).
- **Push invalidation** is what keeps things fresh: any change to `main` — code *or*
  content — automatically purges the managed CDN within a minute or two. The 2h TTL is
  only a backstop; you should almost never wait for it.
- If updates on `.aem.live` are **not** showing on `blog-dev` until the TTL expires,
  the CDN is likely not registered for push invalidation. Check `cdn.json` above — if it
  404s, the host isn't wired in and nothing gets purged. (This was the state through
  2026-07; see project history.)

Gotchas when debugging the CDN directly:

- **Query strings are stripped from the cache key** — `?v=123` cache-busting does *not*
  work against this host. Use `curl` and read the `etag` / `x-cache` headers instead.
- **Responses are gzip-compressed** — decompress before grepping the body:
  `curl -s --compressed https://blog-dev.arborydigital.com/scripts/delayed.js`.
- To inspect what the origin actually has (code-bus freshness, source timestamps):
  `GET https://admin.hlx.page/status/arbory-digital-inc/arbory-dev/main/<path>`
  (authenticated — see below). Code files like `/scripts/*.js` legitimately show
  `live`/`preview` status `404` there because they're served from the code bus, not
  published as content.

## Web Authentication

Both origins and the DEV host are **access-controlled** — this is not a public site.
Access is enforced at the AEM origin (unauthenticated requests to `.aem.page` /
`.aem.live` return `401`).

Access is granted by email domain via the `access.site.allow` list in the site config.
Currently allowed:

- `*@arborydigital.com`
- `*@streamx.com`
- `*@ds.pl`

Anyone in those domains signs in through the AEM login flow (Adobe IMS) and receives a
session cookie; requests without it are rejected.

### Admin API access (for scripting config / status)

Operations against `admin.hlx.page` (status, config, purge, etc.) require an auth token:

- Authenticate the token as a **cookie**: `--cookie "auth_token=<jwt>"`.
  The `Authorization: Bearer <jwt>` header form is **not** accepted and returns `401`.
- Verify a token with `GET https://admin.hlx.page/profile`.

### Granting a new dev/team access

Add their email (or domain glob) to `access.site.allow` in the site config via the
config service — it is not managed from this repo. Site-membership changes do not
require a code deploy.
