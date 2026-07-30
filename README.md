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

> **Currently disabled on this site.** `.aem.page` and `.aem.live` are open, because
> StreamX has to fetch published pages to index them and the connector cannot present
> a token — see [Search: tags, categories and facets](#search-tags-categories-and-facets).
> The rest of this section describes how access control works when it is switched
> back on.

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

## Search: tags, categories and facets

Site search lives at `/en/results`. The filters down the left of that page — **TAGS**,
**CATEGORIES**, **CONTENT TYPE** — are built from metadata you author on each page.
Every value in them, and every count, comes from what is typed in the document, so
getting the metadata right is most of the job.

### What to author

Every blog page has a **metadata** table at the bottom of the document in
[da.live](https://da.live). Three rows matter for search:

| Row | Example | What it does |
| --- | --- | --- |
| `tags` | `AEM, Versions, day cq` | Used by the *site*: article feeds, and the `article:tag` tags in the page head. **Not** read by search. |
| `Category` | `AEM News` | Used by the *site* for display and feeds. **Not** read by search. |
| `searchtags` | see below | **The only row search reads.** Everything in the filter sidebar comes from here. |

`searchtags` is a list of taxonomy paths, one per line:

```
Arbory Display | Content type / Blogs,
Arbory Display | tags / AEM,
Arbory Display | tags / Versions,
Arbory Display | tags / day cq,
Arbory Display | Category / AEM News
```

Read one line as `Arbory Display | <group> / <value>`. **The group — the bit between
the pipe and the slash — decides which filter box the value lands in:**

| Group you write | Filter box it appears under |
| --- | --- |
| `Content type` | CONTENT TYPE |
| `tags` | TAGS |
| `Category` | CATEGORIES |

So the example above puts *AEM*, *Versions* and *day cq* under TAGS, *AEM News* under
CATEGORIES, and *Blogs* under CONTENT TYPE.

Those three groups are the ones currently wired up. Inventing a fourth is safe — the
value is still indexed, and the filter box is named after the group automatically — but
it will not *appear* until someone adds it to the search template in `arbory-streamx`.
So if you need a new grouping, ask rather than assume it will show up.

### Rules worth knowing

- **Separate entries with a comma.** The line breaks are only there to make the cell
  readable; the comma is what actually divides one entry from the next. Miss one and
  two entries merge into a single nonsense value.
- **Never put `/` inside a value.** The slash separates the group from the value, so
  `ci/cd` would read as group `ci`. Write `ci-cd`.
- **Case matters in values.** `AEM` and `Aem` are two different filters sitting next to
  each other in the sidebar. Pick one spelling per concept and stay with it. (The
  *group* name is forgiving — `tags`, `Tags` and `TAGS` all work.)
- **Values match exactly.** `AEM 6.5` and `aem 6.5` will not merge, and neither will
  `Edge Delivery` and `Edge Delivery Services`.
- **`tags` and `searchtags` are separate on purpose**, so keep them in step. If you add
  a tag for the site's feeds, add the matching `Arbory Display | tags / …` line too, or
  it won't be searchable.

### Checking your work

A page only enters the search index when it is **published**, and re-enters it on every
republish. After publishing, search for the page at `/en/results` and confirm your tag
appears in the sidebar with the count you expect. If a value shows up twice with
different capitalisation, that is the case rule above.

If a page is missing from search entirely, the usual cause is that it has no
`searchtags` row at all.

### What does what

Publishing a page starts a chain across three repos and two services:

| Step | What happens | Where it lives |
| --- | --- | --- |
| 1 | You edit the metadata table and publish | [da.live](https://da.live) → AEM content bus |
| 2 | Publishing fires a `resource-published` event at this repo | AEM → GitHub |
| 3 | A workflow tells StreamX to go and fetch the published page | `.github/workflows/streamx-publish.yaml` |
| 4 | StreamX fetches the page HTML and reads the `searchtags` tag out of the head | `arbory-streamx` → `mesh/configs/indexable-resources-producer.properties` |
| 5 | An OpenSearch ingest pipeline splits that one string into the separate filter fields | `arbory-streamx` → `mesh/configs/opensearch/service-init/` |
| 6 | The results page queries OpenSearch and draws a filter box per field it gets back | `blocks/search-tabs`, `blocks/results-panel` |

Deleting a page runs the mirror of step 3 (`unpublish-from-streamx.yaml`) and removes it
from the index.

Two consequences of that chain worth remembering:

- **Search always trails publish**, usually by well under a minute. If a change isn't
  showing, give the workflow a moment before digging.
- **The step-4 fetch is why the origins are currently unauthenticated.** StreamX cannot
  present a login token, so when access control was on it received `401` and indexed
  every page as an empty stub — right title missing, no filters. That failure is silent:
  the publish workflow still reports success.

### Where the search plumbing is configured

Almost none of it is in this repo:

- **Which metadata becomes a filter** — `arbory-streamx`, branch `dev-streamx-mesh`,
  `mesh/configs/indexable-resources-producer.properties`.
- **How `searchtags` is parsed into filter fields** — the ingest pipeline migrations
  under `mesh/configs/opensearch/service-init/` in the same repo. Those files are
  versioned and applied in order; add a new version rather than editing an applied one.
- **Which filter boxes are drawn** — the `eds-pages` search template, also under
  `service-init/`. It names the three fields explicitly, which is why a brand-new
  taxonomy group needs a change here before it appears.
- **The results page layout and labels** — authored on the `/en/results` page itself, in
  the `search-tabs` and `search-tab` blocks.
- **This repo** only holds the two publish/unpublish workflows and the blocks that
  render the results.
