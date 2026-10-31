# CHANGELOG.md — Project Version History

All notable changes to the **Cinnabar** URL Shortener project will be documented in this file.

---

### [1.4.0] - 2026-10-31
#### Advanced PostgreSQL Privilege & SECURITY DEFINER Hardening
**Files Created / Modified:**
- `supabase/schema.sql`: 
  - Revoked all table-level privileges and table-level `SELECT` on `public.links` from `PUBLIC, anon, authenticated` before granting column-level `SELECT` on safe columns.
  - Added `WITH (security_barrier = true)` to `public.public_links` view.
  - Set `SET search_path = public, pg_catalog, pg_temp;` on `record_link_click`, `delete_link_with_key`, and `create_short_link`.
  - Fully qualified all table references (`public.links`).
  - Revoked default `PUBLIC` execution privileges from all stored procedures and granted them strictly to `service_role`.
- `scripts/verify-supabase.mjs`: Authored live Supabase database verification script checking all 8 security conditions.
- `AI_TASKS.md`: Updated development task registry.
- `PROJECT_MEMORY.md`: Recorded privilege architecture and security definer defense ledger.

**Security Enhancements:**
- Fixed PostgreSQL privilege additive behavior: eliminated risk of table-level `SELECT` overriding column-level `manage_key` restrictions.
- Eliminated search-path hijacking risk on all `SECURITY DEFINER` procedures.
- Prevented unauthorized public execution of stored procedures over PostgREST (`anon` cannot inflate clicks or create spam links via direct RPC).

---

### [1.3.0] - 2026-10-31
#### Supabase RLS Security Hardening & Zero-Exposure Architecture
- Authored initial hardened idempotent SQL migration script.
- Replaced permissive policies (`SELECT USING (true)`, `DELETE USING (true)`, `INSERT WITH CHECK (true)`).
- Updated `src/lib/db.ts` to query `public_links` view.

---

### [1.2.0] - 2026-10-31
#### GitHub Integration & Remote Repository Link
- Configured Git remote `origin` to `https://github.com/divitpandeydev-commits/cinnabar.git`.
- Performed pre-upload security audit: confirmed 0 credentials, secrets, or local environment files are tracked.
- Renamed local branch to `main` with 100% preserved chronological commits.
- Verified remote repository readiness via `git ls-remote`.

---

### [1.1.0] - 2026-10-31
#### Production Architecture Hardening & Cloud Database Migration
- Implemented dual-driver architecture with Supabase PostgreSQL client and atomic disk engine.
- Added SSRF protection and `manageKey` deletion authorization.
- Added trusted proxy header client IP rate limiting.

---

### [1.0.0] - 2026-10-31
#### Production Release Baseline & Complete Feature Implementation
- Scaffolded Next.js 16 (App Router) project with React 19, TypeScript, and Tailwind CSS v4.
- Established Deep Red and Roasted Brown editorial design system.
- Built all frontend components, server-side 307 redirect engine, QR generator studio, and link ledger.

---

### [0.1.0] - 2026-10-31
#### Initial Project Architecture & Documentation Baseline
- Initial scaffolding and mandatory markdown files.
