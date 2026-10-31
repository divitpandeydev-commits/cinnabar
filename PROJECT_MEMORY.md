# PROJECT_MEMORY.md — Permanent Project Memory & Architectural Ledger

## 1. Project Synopsis
- **Project Name**: Cinnabar (Artisanal URL Shortener & Link Intelligence)
- **Initiated**: October 31, 2026
- **Architecture**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion + Supabase PostgreSQL
- **Current Status**: Production deployment ready. Dual-driver database implemented, enterprise security audit passed, all 23 automated integration tests verified.

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

### Dual-Driver Database Engine (`src/lib/db.ts`)
- **Cloud Driver (Supabase PostgreSQL)**:
  - Enabled automatically when `SUPABASE_URL` and `SUPABASE_ANON_KEY` are provided.
  - Solves the serverless ephemeral filesystem problem on Vercel/Netlify.
  - All records, click counts, timestamps, and logs persist permanently across cold starts.
  - Authored `supabase/schema.sql` with performance indexes on `code`, `created_at`, and `expires_at`, stored procedure `record_link_click` for atomic updates, and Row Level Security (RLS) policies.
- **Local Engine (Atomic Disk Engine)**:
  - Fallback engine using atomic `.tmp` writes and file renaming to prevent data corruption.
  - Zero-config for local development and self-hosted environments.

### Security Hardening Implemented
1. **SSRF & Private Network Defense**:
   - Strictly blocks private IP ranges: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`.
   - Blocks cloud metadata endpoints: `169.254.169.254`, `metadata.google.internal`.
   - Blocks non-HTTP protocols: `javascript:`, `data:`, `file:`, `vbscript:`.
2. **Authorized Link Deletion Defense**:
   - Generated a 32-character cryptographic `manageKey` for every shortened link.
   - Deletion endpoint `DELETE /api/links?code=xyz&key=...` checks key authorization. Unauthorized attempts receive `403 Forbidden`.
   - Browser stores `manageKey` in `localStorage` for seamless owner deletion.
   - Global `ADMIN_SECRET` environment variable allows master operational deletions.
3. **Advanced Rate Limiting**:
   - Reads real client IP through trusted proxy headers (`cf-connecting-ip`, `x-real-ip`, `x-forwarded-for`).
4. **Collision & Reserved Slugs**:
   - Case-insensitive collision detection and reserved keyword protection (`api`, `admin`, `links`, etc.).

## 4. Verification & Testing Performed
- **Production Build (`npm run build`)**: Passed with exit code 0.
- **Automated Test Suite (`scripts/test-e2e.mjs`)**: 23 assertions executed and passed:
  - Test 1: Homepage 200 OK.
  - Test 2: Core shortening 201 Created with `manageKey`.
  - Test 3: Custom vanity slug generation.
  - Test 4: Dynamic redirect 307 to destination.
  - Test 5: Duplicate custom slug returns 409 Conflict.
  - Test 6: Reserved slug `/admin` returns 400 Bad Request.
  - Test 7: SSRF attempt on `127.0.0.1` and `169.254.169.254` blocked with 400.
  - Test 8: Malicious `javascript:` protocol rejected with 400.
  - Test 9: Unauthorized deletion without key rejected with 403 Forbidden.
  - Test 10: Authorized deletion with `manageKey` succeeded with 200 OK.
  - Test 11: Link expiration redirected to `/link-expired`.
  - Test 12: High-density QR code rendered valid PNG data URL.
  - Test 13: Platform telemetry metrics returned active counts.

## 5. Next Steps
- Await user's GitHub repository URL.
- Configure remote origin and push clean master branch.
- Deploy to Vercel/Railway with Supabase PostgreSQL connection.
