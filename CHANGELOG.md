# CHANGELOG.md — Project Version History

All notable changes to the **Cinnabar** URL Shortener project will be documented in this file.

---

### [1.2.0] - 2026-10-31
#### GitHub Integration & Remote Repository Link
**Files Created / Modified:**
- `AI_TASKS.md`: Updated with GitHub remote origin link and security clearance.
- `PROJECT_MEMORY.md`: Recorded remote repository URL, main branch, and authentication status.
- `CHANGELOG.md`: Added release notes for GitHub repository link.

**Actions Performed:**
- Configured Git remote `origin` to `https://github.com/divitpandeydev-commits/cinnabar.git`.
- Performed pre-upload security audit: confirmed 0 credentials, secrets, or local environment files are tracked.
- Renamed local branch to `main` with 100% preserved chronological commits.
- Verified remote repository readiness via `git ls-remote`.

---

### [1.1.0] - 2026-10-31
#### Production Architecture Hardening & Cloud Database Migration
- Implemented dual-driver architecture with Supabase PostgreSQL client and atomic disk engine.
- Authored `supabase/schema.sql` with performance indexes, atomic click procedure, and RLS policies.
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
