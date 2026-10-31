# PROJECT_MEMORY.md — Permanent Project Memory & Architectural Ledger

## 1. Project Synopsis
- **Project Name**: Cinnabar (Artisanal URL Shortener & Link Intelligence)
- **Initiated**: October 31, 2026
- **Architecture**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion + Supabase PostgreSQL
- **GitHub Repository**: `https://github.com/divitpandeydev-commits/cinnabar.git`
- **Active Branch**: `main`
- **Current Status**: Production build verified, security audited, remote origin linked and verified. Ready for GitHub push authentication.

## 2. Design System & Visual Identity
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

## 3. Production Architecture & Security Hardening
- **Dual-Driver Database Engine (`src/lib/db.ts`)**:
  - Supabase PostgreSQL cloud driver automatically enabled when `SUPABASE_URL` and `SUPABASE_ANON_KEY` are provided.
  - Fallback atomic file engine for offline zero-config development.
  - Ready-to-run SQL migration schema provided in `supabase/schema.sql`.
- **Security Hardening**:
  - SSRF protection against private subnets (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x).
  - Cryptographic `manageKey` authorization preventing unauthorized link deletions (HTTP 403 defense).
  - Trusted proxy header client IP rate limiting (`CF-Connecting-IP`, `X-Forwarded-For`).
  - Reserved keyword guard protecting system routes.

## 4. Git & GitHub Integration Status
- **Remote Origin**: Configured to `https://github.com/divitpandeydev-commits/cinnabar.git`.
- **Pre-Upload Security Audit**: Passed. All `.env`, `.env.local`, `node_modules`, `.next`, and database files verified excluded from tracked tree.
- **Commit History**:
  - `b6ee1b1`: `feat: production architecture hardening, Supabase PostgreSQL dual-driver, and security enhancements`
  - `7179ac2`: `feat: complete production-grade Cinnabar URL shortener platform`
  - `2680dad`: `Initial commit from Create Next App`
- **Authentication State**: GitHub rejected non-interactive password authentication during headless push. Awaiting token authentication or terminal credential helper sign-in.

## 5. Next Steps
- Complete GitHub authentication push.
- Import repository into Vercel for public deployment.
- Connect Supabase PostgreSQL instance using environment variables.
