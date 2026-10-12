# Raw collection — lays-rebrand

Collected 2026-10-12 via the Apify MCP connector. Usernames, profile links/photos, @mentions
and phone numbers were removed before saving. Comments with political/boycott content and
celebrity fan messages were dropped (sensitive-topic and personal-data rules).

| File | Actor | Run | Input (limits) |
|---|---|---|---|
| `google-search.json` | `apify/google-search-scraper` | `CsWsRAymPFFa1OJrR` (US/en), `CMxxPwcjOVWng7QXY` (TR/tr) | 8 + 6 queries × 1 page |
| `reddit.json` | `fatihtahta/reddit-scraper-search-fast` | `2foHt8ojYsMdck9FY` | 6 thread URLs, `maxComments` 12 → 78 items |
| `instagram.json` | `apify/instagram-comment-scraper` | `DQTx28aaQIsLGhq0B` (US launch posts), `srWkj1J4KzSMHC50U` (TR ad reels) | 4 posts, `resultsLimit` 30 / 25 → 55 items |
| `web.json` | `apify/web-fetch` | `UeToG330TbtzOC4rJ`, `KYhZ97ctK9kIeFuT3`, `PnEU7ObqwBUOaBAw6`, `Qoxfc6zTzPACD5xmu` | PepsiCo newsroom, Inc., a Turkish marketing trade site, Adweek |
| — | `streamers/youtube-comments-scraper` | `JtEekRkAGLoOQmhdU` | Super Bowl LX "Last Harvest" video, 30 comments → **0 results** (comments unavailable) |

Approximate spend: ~$0.5. The Turkish ad film (TBWA\Istanbul, 29 Mar 2026) was verified via a Turkish marketing trade site.
