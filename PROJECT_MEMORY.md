# PROJECT_MEMORY.md — Permanent Project Memory & Architectural Ledger

## 1. Project Synopsis
- **Project Name**: Cinnabar (Artisanal URL Shortener & Link Intelligence)
- **Initiated**: October 31, 2026
- **Architecture**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion
- **Current Status**: Production build verified, all automated E2E tests passing with 100% success rate.

## 2. Design System & Visual Identity Implemented
- **Palette**: Strictly adheres to the **Deep Red and Dark Brown** combination:
  - Deep Red (`#991B1B` Rich Crimson, `#7F1D1D` Burgundy, `#B91C1C` Accent, `#DC2626` Vibrant)
  - Dark Brown (`#180F0A` Roasted Espresso, `#241610` Deep Chestnut, `#321E16` Rich Umber, `#4A2E22` Mid Brown)
  - Warm Surfaces (`#FAF7F2` Cream Paper, `#F4EFEB` Surface Warm, `#FFFFFF` Card)
  - Typography (`#1C1917` Charcoal Main, `#57534E` Secondary, `#78716C` Muted)
- **Tactile UX Details**:
  - Eliminated generic AI blue/purple gradients and neon glows.
  - Interactive long URL to short URL compression visualizer in Hero section with 82% compression ratio demonstration.
  - Animated copy buttons with spring transition and checkmark confirmation.
  - Modal with downloadable high-res vector QR codes in espresso ink.
  - Real-time link search filter and instant deletion in link ledger.

## 3. Architecture & Functional Components

### Storage Engine (`src/lib/db.ts`)
- Implemented file-backed atomic JSON persistence stored in `data/urls.json`.
- Uses `.tmp` file writing and atomic file rename to prevent database corruption during concurrent writes.
- Includes in-memory lookup cache for sub-millisecond route resolution.
- Click logging tracks timestamps, referrers, and device types (Desktop, Mobile, Tablet) up to 50 recent events per link.
- Supports expiration checking on link retrieval.
- Exposes `getGlobalStats()` for real platform metrics calculation.

### Redirect Engine (`src/app/[code]/route.ts`)
- High-speed HTTP 307 temporary redirect bypassing client-side waterfalls.
- Captures `referer` and `user-agent` headers and logs telemetry asynchronously without adding latency to the visitor redirect.
- Gracefully redirects invalid codes to `/link-not-found?code=...` and expired links to `/link-expired?code=...`.

### API Routes
- `POST /api/shorten`: URL validation, protocol normalization (`http://` / `https://`), custom alias sanitization, collision checking, expiration duration calculation, and IP rate limiting (30 requests/minute).
- `GET /api/links`: Returns paginated links with calculated status and real click numbers.
- `DELETE /api/links?code=...`: Deletes links from persistent storage.
- `GET /api/stats`: Serves live counts for total links, total redirects, active links, and average latency.

### User Interface Components
- `Navbar.tsx`: Fixed header with brand badge, navigation links, GitHub shortcut, and mobile menu.
- `Hero.tsx`: Typography-first hero section with compression visualizer and scroll invitation.
- `ShortenerForm.tsx`: Input form with expandable advanced controls (custom alias & expiration selector).
- `UrlResultCard.tsx`: Immediate visual display of shortened link with copy, test, and QR actions.
- `UrlHistory.tsx`: Searchable link management ledger with click indicators and deletion.
- `QRCodeModal.tsx`: High-resolution canvas/image QR generator with PNG download.
- `Features.tsx`: 6 architectural highlight cards with Framer Motion staggered reveals.
- `HowItWorks.tsx`: 3-step operational workflow.
- `AnalyticsPreview.tsx`: Live platform metric counters and recent click stream feed.
- `Footer.tsx`: Editorial footer with operational status and top scroll button.

## 4. Verification & Testing Performed
- Executed `scripts/test-e2e.mjs` against a live Next.js production server:
  - Homepage (`GET /`) returned HTTP 200.
  - Shorten endpoint (`POST /api/shorten`) created short link with HTTP 201.
  - Redirect route (`GET /github-trending`) returned HTTP 307 pointing to `https://github.com/trending`.
  - Click counter incremented from 0 to 1 upon redirect.
  - Links list (`GET /api/links`) successfully retrieved persisted records.
  - Platform stats (`GET /api/stats`) verified active links and total redirects.
  - Invalid route (`GET /invalid-code-xyz`) redirected to `/link-not-found`.
- `npm run build` executed and passed with code 0 with all routes properly compiled.

## 5. Next Steps
- Commit clean state to local git.
- Coordinate with user for remote GitHub repository push and Vercel/Railway deployment.
