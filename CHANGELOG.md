# CHANGELOG.md — Project Version History

All notable changes to the **Cinnabar** URL Shortener project will be documented in this file.

---

### [1.1.0] - 2026-10-31
#### Production Architecture Hardening & Cloud Database Migration
**Files Created / Modified:**
- `src/lib/db.ts`: Implemented dual-driver architecture with Supabase PostgreSQL client and atomic disk engine.
- `supabase/schema.sql`: Authored PostgreSQL schema with performance indexes, atomic click procedure, and RLS policies.
- `src/lib/types.ts`: Added `manageKey` cryptographic field to `LinkRecord` and API response.
- `src/lib/utils.ts`: Added SSRF protection (private IP / cloud metadata blocking), expanded reserved slugs, and `generateManageKey()`.
- `src/lib/rate-limit.ts`: Added trusted proxy header client IP extraction (`cf-connecting-ip`, `x-real-ip`, `x-forwarded-for`).
- `src/app/api/shorten/route.ts`: Integrated client IP rate limiter and `manageKey` return.
- `src/app/api/links/route.ts`: Implemented cryptographic authorization check on link deletion and scrubbed keys from public output.
- `src/app/page.tsx`: Implemented creator `manageKey` storage in `localStorage` and authenticated deletion requests.
- `scripts/test-e2e.mjs`: Expanded comprehensive integration test suite covering 13 test suites and 23 assertions.
- `.env.example`: Documented Supabase environment variables, `ADMIN_SECRET`, and production configuration.
- `README.md`: Added production deployment guide, Supabase migration steps, and security documentation.
- `AI_TASKS.md`, `PROJECT_MEMORY.md`: Updated development ledger and task registry.

**Features & Improvements Added:**
- Supabase PostgreSQL persistence solving serverless ephemeral storage restrictions.
- Cryptographic authorization for link deletion (`403 Forbidden` defense against unauthorized deletion).
- Server-Side Request Forgery (SSRF) defense blocking private subnets and cloud metadata endpoints (`169.254.169.254`).
- Duplicate vanity slug collision rejection (`409 Conflict`).
- System reserved keyword guard protecting core routes (`400 Bad Request`).
- Automated 23-assertion production test suite verified.

**Reason for Change:**
Production deployment readiness and security audit per user request.

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
