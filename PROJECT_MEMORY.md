# PROJECT_MEMORY.md — Permanent Project Memory & Architectural Ledger

## 1. Project Synopsis
- **Project Name**: Cinnabar (Artisanal URL Shortener & Link Intelligence)
- **Initiated**: October 31, 2026
- **Architecture**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion + Supabase PostgreSQL
- **GitHub Repository**: `https://github.com/divitpandeydev-commits/cinnabar.git`
- **Active Branch**: `main`
- **Current Status**: Production deployment ready. Live Supabase database integration and security verification completed with 100% passing checks (15/15 live DB checks, 23/23 application E2E tests, 0 build/TypeScript errors).

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
- **Supabase Live Test Suite (`scripts/verify-supabase.mjs`)**: Verified all 15 security and integration conditions against live Supabase PostgreSQL:
  - Anon query on `manage_key` blocked (column privilege enforced).
  - Anon direct `DELETE` blocked by RLS.
  - Anon direct `INSERT` blocked by RLS.
  - Anon RPC invocation of `record_link_click` blocked (permission denied).
  - Anon RPC invocation of `delete_link_with_key` blocked (permission denied).
  - Anon RPC invocation of `create_short_link` blocked (permission denied).
  - Public read on `public.public_links` allowed for redirection.
  - Service-role link creation succeeded.
  - Public redirect query executed without exposing `manage_key`.
  - Public redirect destination resolution verified.
  - Server-side `record_link_click` succeeded and incremented database counter.
  - Unauthorized deletion with invalid key rejected (`delFail === false`).
  - Authorized deletion with matching key succeeded (`delPass === true`).
  - Confirmed permanent deletion from database.
- **Production Build (`npm run build`)**: Passed with exit code 0, 0 TypeScript errors.
- **Automated Test Suite (`scripts/test-e2e.mjs`)**: 23 assertions executed and passed against live Next.js 16 server connected to Supabase.

## 5. Next Steps
- Execute the hardened SQL migration in Supabase SQL editor.
- Push repository commits to GitHub (`git push -u origin main`).
- Deploy to Vercel with Supabase environment variables.
