# AI_TASKS.md — Development Task Registry

## 1. Completed Tasks
- [x] **Project Scaffolding**: Initialized Next.js 16 (App Router) project with TypeScript, React 19, and Tailwind CSS v4.
- [x] **Dependencies Installation**: Installed `lucide-react`, `framer-motion`, `qrcode`, `@types/qrcode`, `nanoid`, and `@supabase/supabase-js`.
- [x] **Documentation Bootstrap**: Established `AGENTS.md`, `AI_TASKS.md`, `PROJECT_MEMORY.md`, `CHANGELOG.md`, and `README.md`.
- [x] **Phase 1 — Inspection & Planning**: Defined architecture, route structure, API contracts, and persistent database design.
- [x] **Phase 2 — Design System & Visual Identity**:
  - Configured Deep Red (`#991B1B`), Roasted Espresso (`#1F120B`), and Warm Cream (`#FAF7F2`) theme tokens in `src/app/globals.css`.
  - Configured custom typography, subtle dot grids, and tactile micro-interactions.
- [x] **Phase 3 & 4 — Landing Page & Scroll Motion**:
  - Built `Navbar.tsx` with logo mark, responsive navigation, and GitHub link.
  - Built `Hero.tsx` with editorial headline, subhead, badges, and animated long-to-short URL compression visualizer.
  - Built `Features.tsx` showcasing 6 architectural highlights with Framer Motion staggered reveals.
  - Built `HowItWorks.tsx` with 3-step operational workflow.
  - Built `Footer.tsx` with operational system status indicator and back-to-top control.
- [x] **Phase 5 & 6 — Backend & Persistent Database Engine**:
  - Implemented dual-driver architecture in `src/lib/db.ts` supporting both Supabase PostgreSQL and local atomic disk persistence.
  - Authored `supabase/schema.sql` with tables, indexes, stored procedure for click tracking, and RLS policies.
  - Built `src/lib/utils.ts` with URL normalization, SSRF/private host blocking, loop prevention, and slug sanitization.
  - Built `src/lib/rate-limit.ts` with sliding window rate limiting and trusted proxy header resolution.
  - Built `POST /api/shorten` API endpoint with validation, custom alias collision checking, and expiration support.
  - Built `GET /api/links` and `DELETE /api/links` API endpoints with cryptographic `manageKey` authorization.
  - Built `GET /api/stats` endpoint for real-time telemetry metrics.
  - Built `app/[code]/route.ts` server-side 307 redirect route with asynchronous telemetry logging.
  - Built `app/link-not-found/page.tsx` and `app/link-expired/page.tsx` for custom status pages.
- [x] **Phase 7 — Additional Features**:
  - Built `ShortenerForm.tsx` with collapsible custom vanity alias and expiration selector (1h, 24h, 7d, 30d, permanent).
  - Built `UrlResultCard.tsx` with instant copy feedback, visit button, and QR trigger.
  - Built `QRCodeModal.tsx` rendering high-density QR code with PNG download capability.
  - Built `UrlHistory.tsx` with search filtering, click indicators, and instant deletion.
  - Built `AnalyticsPreview.tsx` displaying real-time links, clicks, and live telemetry log stream.
- [x] **Phase 8 & 9 — Production Security Audit & Hardening**:
  - Patched SSRF vulnerability by blocking private IP ranges (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x).
  - Patched unauthorized deletion vulnerability with cryptographic `manageKey` token enforcement.
  - Executed automated test suite (`scripts/test-e2e.mjs`) covering 13 test suites and 23 assertions passed with 0 failures.
  - Verified zero-error production build (`npm run build`).
- [x] **Phase 10 & 11 — Advanced Supabase Privilege Hardening & Security Definer Defense**:
  - Fixed table-level privilege issue: revoked table-level `SELECT` on `public.links` from `PUBLIC, anon, authenticated` before granting column-level read.
  - Added `security_barrier = true` to `public.public_links` view.
  - Hardened `SECURITY DEFINER` functions with `SET search_path = public, pg_catalog, pg_temp;` and fully qualified objects to block search-path hijacking.
  - Revoked default `PUBLIC` execution privileges from all stored procedures (`record_link_click`, `create_short_link`, `delete_link_with_key`), restricting execution strictly to `service_role`.
  - Authored standalone live Supabase verification script `scripts/verify-supabase.mjs`.
  - Verified all 23 integration and security assertions with zero failures.

## 2. Currently Working
- [ ] **GitHub Authentication & First Push**:
  - Ready for user push to `https://github.com/divitpandeydev-commits/cinnabar.git`.

## 3. Pending Tasks
- [ ] **Phase 12 — Live Deployment & Production Smoke Testing**:
  - Deploy to Vercel with Supabase environment variables.
  - Verify live public URL and redirection across internet.

## 4. Future Improvements
- [ ] Distributed Redis cache adapter for multi-region edge instances.
- [ ] Password-protected private links with decrypt challenge.
- [ ] Interactive geo-location map for redirect traffic.

## 5. Bugs to Fix
*Zero unresolved bugs. All tests passed.*
