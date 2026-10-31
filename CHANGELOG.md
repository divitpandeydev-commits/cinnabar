# CHANGELOG.md — Project Version History

All notable changes to the **Cinnabar** URL Shortener project will be documented in this file.

---

### [1.3.0] - 2026-10-31
#### Supabase RLS Security Hardening & Zero-Exposure Architecture
**Files Created / Modified:**
- `supabase/schema.sql`: Authored hardened idempotent SQL migration script. Dropped overly permissive policies (`SELECT USING (true)`, `DELETE USING (true)`, `INSERT WITH CHECK (true)`).
- `src/lib/db.ts`: Updated Supabase queries to target `public_links` view, eliminating `manage_key` query leakage. Integrated `delete_link_with_key` and `create_short_link` RPC procedures.
- `.env.example`: Clarified server-only `SUPABASE_SERVICE_ROLE_KEY` usage and warned against `NEXT_PUBLIC_` prefixes.
- `AGENTS.md`: Added Section 5 ("Security & Database Engineering Rules") documenting `manage_key` isolation and server-only service-role conventions.
- `PROJECT_MEMORY.md`: Detailed RLS policy restructuring and stored procedure defenses.
- `AI_TASKS.md`: Marked Supabase RLS hardening as completed.
- `scripts/test-e2e.mjs`: Added automated test server polling and verified all 23 assertions.

**Security Enhancements:**
- **Zero `manage_key` Leakage**: Revoked column-level `SELECT (manage_key)` from public `anon` and `authenticated` roles in PostgreSQL. Created `public.public_links` view that omits `manage_key`.
- **Authorized Deletion Enforced in Database**: Revoked direct `DELETE` on table `public.links` for public roles (`USING (false)`). Link deletion is strictly guarded by `delete_link_with_key` stored procedure, ensuring users can never delete other users' links.
- **Controlled Ingestion**: Revoked direct `INSERT` on table `public.links` for public roles (`WITH CHECK (false)`), routing writes through `create_short_link` procedure or server-side service role.
- **Preserved Existing Data**: Ensured all SQL migration statements are non-destructive and idempotent.

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
- Authored initial `supabase/schema.sql` with performance indexes, atomic click procedure, and RLS policies.
- Added SSRF protection (private IP / cloud metadata blocking) and `manageKey` deletion authorization.
- Added trusted proxy header client IP rate limiting.
- Executed comprehensive 23-assertion automated integration test suite with 100% pass rate.

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
