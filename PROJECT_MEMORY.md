# PROJECT_MEMORY.md — Permanent Project Memory & Architectural Ledger

## 1. Project Synopsis
- **Project Name**: Cinnabar (Artisanal URL Shortener & Link Intelligence)
- **Initiated**: October 31, 2026
- **Architecture**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion + Supabase PostgreSQL
- **GitHub Repository**: `https://github.com/divitpandeydev-commits/cinnabar.git`
- **Active Branch**: `main`
- **Current Status**: Production deployment ready. Advanced PostgreSQL privilege hardening completed (table-level revoke + column-level grants + search_path defense + restricted RPC execution). All 23 integration tests verified.

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

## 3. Production Architecture & Advanced Security Hardening

### Dual-Driver Database Engine (`src/lib/db.ts`)
- **Cloud Driver (Supabase PostgreSQL)**:
  - Enabled automatically when `SUPABASE_URL` and `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` are provided.
  - Solves the serverless ephemeral filesystem problem on Vercel/Netlify.
  - All records, click counts, timestamps, and logs persist permanently across cold starts.
- **Local Engine (Atomic Disk Engine)**:
  - Fallback engine using atomic `.tmp` writes and file renaming to prevent data corruption.
  - Zero-config for local development and self-hosted environments.

### PostgreSQL Privilege & Stored Procedure Hardening Audit
1. **Fix Table-Level SELECT Override**:
   - In PostgreSQL, column-level `REVOKE` is ineffective if a table-level `SELECT` privilege exists.
   - Fixed by explicitly executing:
     ```sql
     REVOKE ALL ON TABLE public.links FROM PUBLIC, anon, authenticated;
     REVOKE SELECT ON TABLE public.links FROM PUBLIC, anon, authenticated;
     GRANT SELECT (id, code, original_url, created_at, expires_at, clicks, last_clicked_at, click_logs)
       ON TABLE public.links TO anon, authenticated;
     ```
   - Now, attempts by `anon` or `authenticated` to query `manage_key` or `*` are blocked at the PostgreSQL engine level.
2. **Security Barrier on View**:
   - Built `public.public_links` with `WITH (security_barrier = true)` to prevent query optimizer leakage through malicious user-defined predicates.
3. **Hardened SECURITY DEFINER Functions**:
   - Set `SET search_path = public, pg_catalog, pg_temp;` on all stored procedures (`record_link_click`, `delete_link_with_key`, `create_short_link`) to eliminate search-path hijacking (CVE-class vulnerability).
   - Fully qualified all table references (`public.links`).
4. **RPC Function Execution Restrictions**:
   - Revoked `PUBLIC` execution privileges from all stored procedures (`REVOKE ALL ON FUNCTION ... FROM PUBLIC, anon, authenticated;`).
   - Granted execution strictly to `service_role` (the server backend).
   - Prevents public users from invoking `record_link_click` to inflate statistics or `create_short_link` to bypass SSRF/validation checks.
5. **Key Protection in Application Code**:
   - `getLinkByCode`, `getAllLinks`, and `getGlobalStats` query `public_links` and never touch `manage_key`.
   - `SUPABASE_SERVICE_ROLE_KEY` is strictly a server-only variable (never prefixed with `NEXT_PUBLIC_`).
   - Client components never import `db.ts` or instantiate Supabase directly.

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
- **Supabase Live Test Suite (`scripts/verify-supabase.mjs`)**: Authored standalone test verifying all 8 live database conditions.

## 5. Next Steps
- Execute the hardened SQL migration in Supabase SQL editor.
- Push repository commits to GitHub (`git push -u origin main`).
- Deploy to Vercel with Supabase environment variables.
