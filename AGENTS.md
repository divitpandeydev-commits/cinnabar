<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Master AI Instructions & Engineering Charter

## 1. Project Overview
**Cinnabar** is a production-grade, privacy-first URL shortening and link intelligence platform. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, and Framer Motion, it merges artisanal editorial aesthetics with high-performance redirection, custom slugs, QR code generation, real-time click tracking, and link expiration.

## 2. Project Objectives
1. **Production-Ready & Fully Functional**: Provide real, high-speed HTTP redirects, collision-resistant code generation, rate limiting, and persistent storage. No fake buttons or mocked workflows.
2. **Distinctive Editorial Aesthetic**: Reject generic AI-style purple/blue gradient templates. Adhere strictly to the **Deep Red and Dark Brown** palette with warm cream surfaces, refined typography, and purposeful motion.
3. **Flawless User Experience**: Deliver instantaneous client feedback, QR code downloads, link expiration controls, custom slug validation, and detailed click analytics.
4. **Resilient Architecture**: Zero-downtime redirects, persistent disk-backed database with seamless cloud-database readiness, robust error handling, and strict input sanitization.
5. **Open Source & Deployable**: Ready for GitHub hosting and deployment to Vercel, Railway, Render, or Docker with complete documentation.

## 3. Design System & Visual Identity
### Color Palette
- **Primary Color (Deep Red)**:
  - Base: `#991B1B` (Rich Crimson)
  - Hover / Dark: `#7F1D1D` (Deep Burgundy)
  - Accent / Vibrant: `#DC2626` / `#E11D48`
- **Secondary Color (Dark Brown / Espresso)**:
  - Deep Base: `#1F140E` / `#2A1810`
  - Mid Brown: `#382319` / `#44281D`
  - Subtle Warm Border: `rgba(180, 83, 9, 0.18)` / `#5C3A28`
- **Surfaces & Backgrounds**:
  - Warm Cream / Off-White: `#FAF7F2`
  - Parchment Light: `#F5EFEB`
  - Card Surface: `#FFFFFF` with warm stone undertones
  - Dark Mode Background: `#180F0A` (Roasted Espresso)
  - Dark Mode Surface / Card: `#241610` with subtle red-brown edge
- **Typography & Text**:
  - Primary Headings & Body: Dark Charcoal `#1C1917` (light) / Warm Cream `#F5EFEB` (dark)
  - Secondary Text: Warm Ash `#78716C`
  - Accent Text: Warm Terracotta `#C2410C`

### Aesthetic Principles
- **No generic AI tropes**: No neon purple glows, no overuse of glassmorphism, no random floating blobs.
- **Micro-Interactions**: Tactile button presses, copy toasts with spring animations, smooth accordion expansion, crisp SVG QR rendering.
- **Accessibility**: Strict adherence to WCAG AA contrast standards and `prefers-reduced-motion`.

## 4. Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict mode enabled)
- **Styling**: Tailwind CSS v4, custom utility classes
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Utilities**: `nanoid` for collision-resistant base62-style slugs, `qrcode` for QR code generation
- **Database & Storage**: Dual-driver architecture supporting Supabase PostgreSQL (`@supabase/supabase-js`) and an atomic disk-backed file engine (`src/lib/db.ts`).
- **Validation**: Strict RFC-compliant URL parsing, protocol enforcement (`http://`, `https://`), alias sanitization, SSRF protection against private subnets.

## 5. Security & Database Engineering Rules
1. **Never Expose `manage_key`**:
   - `manage_key` is a private authorization secret used solely for link deletion.
   - It must NEVER be selected in public queries, public views (`public_links`), or returned in `GET /api/links`.
   - On Supabase, `REVOKE SELECT (manage_key)` is enforced for `anon` and `authenticated` roles.
2. **Never Expose `SUPABASE_SERVICE_ROLE_KEY` in Frontend Code**:
   - The service-role key is strictly a server-only environment variable.
   - NEVER prefix it with `NEXT_PUBLIC_`.
   - Client components must NEVER import `src/lib/db.ts` or instantiate Supabase with service-role credentials.
3. **Authorized Deletion Only**:
   - Direct `DELETE` on the `links` table is blocked for public roles (`USING (false)`).
   - Deletions must pass through `delete_link_with_key` stored procedure, which matches the cryptographic `manage_key` server-side inside PostgreSQL.
4. **SSRF & Private Network Defense**:
   - Shortening private IP addresses (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x) and cloud metadata services is strictly rejected with `HTTP 400 Bad Request`.

## 6. AI Development Rules & Mandatory Workflow
1. **Mandatory Documentation Inspection**:
   - Before executing code changes, read `AGENTS.md`, `PROJECT_MEMORY.md`, `AI_TASKS.md`, and `CHANGELOG.md`.
2. **Update After Every Task**:
   - Update `AI_TASKS.md` status (Completed / In Progress / Pending).
   - Update `PROJECT_MEMORY.md` with implementation details, file changes, and architectural notes.
   - Update `CHANGELOG.md` with chronological versions and reasons.
3. **No Fake Functionality**:
   - Every button must execute real logic.
   - Every generated short URL must be redirectable via `/[code]`.
   - Every deletion must persist to storage.
4. **Preserve Next.js Agent Rules**:
   - Do not remove the `<!-- BEGIN:nextjs-agent-rules -->` block from `AGENTS.md`.
