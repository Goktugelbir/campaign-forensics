# Raw collection — instagram-wordmark-2026

Collected 2026-10-12 via the Apify MCP connector. Usernames, display names, profile
links, profile photos and author IDs were dropped **before** saving; only the fields
needed to trace each item back to its public post are kept.

| File | Actor | Run | Input (limits) |
|---|---|---|---|
| `google-search.json` | `apify/google-search-scraper` | `IpaZSRNZqKTfBXg7N`, `umo1EssdQwz6fSey8` | 10 queries × 1 page |
| `reddit.json` | `fatihtahta/reddit-scraper-search-fast` | `cC95e5ZtFpkpuuK7k` | 4 thread URLs, `maxComments` 12 |
| `youtube.json` | `streamers/youtube-comments-scraper` | `0K0s5FhPJJ1UVvGO9` | 1 video, `maxComments` 25, top comments |
| `instagram.json` | `apify/instagram-comment-scraper` | `ckfVyibB3HGSBGBdp`, `8l20euvqTJyNnDW0E` | 5 posts, `resultsLimit` 30 / 25 |
| `web.json` | `apify/web-fetch` | `IBakTH3yPmM5z1XLw`, `KFY2bNgg2OmNkzJXZ`, `igXPtQWc1uRvMU4F0`, `fox4mtZBShuxSfhwi`, `og4e2igK2IzcDFepe` | 5 article URLs |
| — | `futurizerush/meta-threads-scraper` | `gHPPyBHvSRxt3HxAe` | "Instagram new logo", 15 posts → **0 results** (skipped) |

Approximate spend: ~$0.6.
