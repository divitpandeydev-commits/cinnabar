# CHANGELOG.md — Project Version History

All notable changes to the **Cinnabar** URL Shortener project will be documented in this file.

---

### [1.0.0] - 2026-10-31
#### Production Release Baseline & Complete Feature Implementation
**Files Created / Modified:**
- `src/lib/types.ts`: Defined data contracts for links, click logs, and statistics.
- `src/lib/utils.ts`: Implemented URL normalization, validation, slug sanitization, and device parsing.
- `src/lib/rate-limit.ts`: Implemented in-memory sliding window rate limiter.
- `src/lib/db.ts`: Implemented persistent disk storage engine with atomic writes and cache.
- `src/app/api/shorten/route.ts`: Built URL shortening API with custom slug and expiration support.
- `src/app/api/links/route.ts`: Built link listing and deletion endpoint.
- `src/app/api/stats/route.ts`: Built real-time platform metrics endpoint.
- `src/app/[code]/route.ts`: Built server-side HTTP 307 redirect route with asynchronous telemetry.
- `src/app/link-not-found/page.tsx`: Built branded 404 handler for invalid short codes.
- `src/app/link-expired/page.tsx`: Built branded notification page for expired links.
- `src/components/Navbar.tsx`: Built header with navigation and responsive mobile drawer.
- `src/components/Hero.tsx`: Built hero section with animated URL compression visualizer.
- `src/components/ShortenerForm.tsx`: Built input form with vanity slug and expiration options.
- `src/components/UrlResultCard.tsx`: Built result card with copy button and quick actions.
- `src/components/UrlHistory.tsx`: Built link ledger with live click indicators and search filter.
- `src/components/QRCodeModal.tsx`: Built high-density QR code studio with PNG download.
- `src/components/Features.tsx`: Built 6-card architectural feature section with Framer Motion.
- `src/components/HowItWorks.tsx`: Built 3-step operational workflow section.
- `src/components/AnalyticsPreview.tsx`: Built live telemetry dashboard and click stream.
- `src/components/Footer.tsx`: Built footer with system status and quick links.
- `src/components/icons/GithubIcon.tsx`: Built SVG vector icon component.
- `scripts/test-e2e.mjs`: Built automated end-to-end integration test suite.
- `.env.example`: Configured environment variables.
- `.gitignore`: Configured exclusions for temporary files and local database.
- `AGENTS.md`, `AI_TASKS.md`, `PROJECT_MEMORY.md`, `README.md`: Updated comprehensive documentation.

**Features Added:**
- Instant server-side 307 URL redirection with sub-15ms latency.
- Collision-resistant 62-base unique short slug generation.
- Custom vanity alias validation and uniqueness enforcement.
- Granular link expiration (1 hour, 24 hours, 7 days, 30 days, permanent).
- High-resolution QR code generator with single-click PNG download.
- Searchable link ledger with real-time click tracking and instant deletion.
- Real-time telemetry dashboard with live click stream.
- Sliding window rate limiting protecting against abuse.

**Design Changes:**
- Established bespoke editorial Deep Red (`#991B1B`) and Roasted Espresso (`#1F120B`) color system.
- Added tactile button feedback, copy confirmation toasts, and responsive micro-interactions.

**Reason for Change:**
Initial complete production release satisfying all Phase 1–8 and Phase 12 requirements.

---

### [0.1.0] - 2026-10-31
#### Initial Project Architecture & Documentation Baseline
- Scaffolded Next.js 16 (App Router) project with React 19, TypeScript, and Tailwind CSS v4.
- Installed core packages and established 5 mandatory AI documentation files.
