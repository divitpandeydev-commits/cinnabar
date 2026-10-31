# Cinnabar — Artisanal URL Shortener & Link Intelligence

A modern, high-performance, and beautifully crafted URL shortening and link intelligence platform. Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Framer Motion**, themed in a distinctive **Deep Red and Roasted Brown** editorial aesthetic.

---

## Highlights & Features

- **Blazing-Fast Redirections**: Server-side HTTP 307 redirects executing in single-digit milliseconds via Next.js App Router dynamic routes (`/[code]`).
- **Deep Red & Dark Brown Design**: Bespoke visual identity combining rich crimson, roasted espresso, warm cream parchment, and meticulous micro-interactions.
- **Dual-Driver Storage Architecture**:
  - **Cloud PostgreSQL (Supabase)**: Multi-region, zero-maintenance database persistence ready for serverless platforms like Vercel and Netlify.
  - **Atomic Disk Engine**: Crash-proof local file storage with in-memory caching for zero-config local development and self-hosted environments.
- **Custom Vanity Slugs**: Generate clean, branded vanity URLs (e.g., `cinnabar.app/launch`) with collision prevention and reserved keyword guards.
- **Enterprise Security & SSRF Protection**: Strict RFC URL parsing, HTTPS protocol enforcement, and automatic blocking of private/loopback/cloud metadata IP ranges (`127.0.0.1`, `169.254.169.254`, `metadata.google.internal`).
- **Cryptographic Deletion Authorization**: Each created link generates a private `manageKey` preventing unauthorized deletion while allowing legitimate creators to manage links.
- **Vector QR Code Studio**: Instant high-resolution QR code rendering with single-click PNG download for print and digital campaigns.
- **Link Expiration Engine**: Set URLs to auto-expire after 1 hour, 24 hours, 7 days, 30 days, or persist permanently.
- **Searchable Link Ledger**: Real-time management table with live click counters, search filtering, copy confirmations, and instant deletion.
- **Sliding-Window Rate Limiting**: Abuse prevention with trusted proxy IP extraction (`CF-Connecting-IP`, `X-Forwarded-For`).
- **Accessible & Responsive**: Fully responsive across mobile, tablet, laptop, and ultra-wide screens, with full reduced-motion support.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript (Strict Mode) |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS v4 |
| **Motion** | Framer Motion |
| **Icons** | Lucide React |
| **Identifier Engine** | NanoID (URL-safe base62) |
| **QR Engine** | QRCode SVG/Canvas generator |
| **Database** | Supabase PostgreSQL (`@supabase/supabase-js`) + Atomic Disk Driver |

---

## Getting Started

### Prerequisites
- **Node.js**: v18.17.0 or higher (v20+ recommended)
- **npm**, **pnpm**, or **yarn**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/cinnabar-url-shortener.git
   cd cinnabar-url-shortener
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   *(Defaults work out of the box with the local atomic engine without third-party services).*

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

---

## Production Database Setup (Supabase PostgreSQL)

For deployment on Vercel, Netlify, or serverless platforms where local disk storage is ephemeral, configure Supabase:

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase Dashboard, open **SQL Editor** and paste the contents of [`supabase/schema.sql`](./supabase/schema.sql). Click **Run**.
3. In **Project Settings** > **API**, copy your **Project URL** and **anon/public key**.
4. Set the environment variables in `.env.local` or your hosting dashboard:
   ```env
   SUPABASE_URL="https://your-project-id.supabase.co"
   SUPABASE_ANON_KEY="your-anon-key"
   ```
5. Cinnabar will automatically switch to the Supabase cloud driver.

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | Public domain of the application | `http://localhost:3000` |
| `SUPABASE_URL` | Supabase project URL | *(File-based if omitted)* |
| `SUPABASE_ANON_KEY` | Supabase anon/public key | *(File-based if omitted)* |
| `ADMIN_SECRET` | Secret key for administrative master deletion | Optional |
| `ALLOW_LOCAL_URLS` | Allow shortening `localhost` (dev only) | `false` |
| `NODE_ENV` | Application environment | `production` |

---

## API Documentation

### 1. Shorten a URL
`POST /api/shorten`

**Request Body:**
```json
{
  "url": "https://github.com/trending",
  "customSlug": "trending-repos",
  "expiresIn": 86400
}
```

**Success Response (`201 Created`):**
```json
{
  "success": true,
  "data": {
    "id": "link_1793434287830_f37x73",
    "code": "trending-repos",
    "shortUrl": "https://cinnabar.app/trending-repos",
    "originalUrl": "https://github.com/trending",
    "createdAt": "2026-10-31T13:30:00.000Z",
    "expiresAt": "2026-11-01T13:30:00.000Z",
    "clicks": 0,
    "manageKey": "b2f901a89c4de83f71c49120a109ec78"
  }
}
```

### 2. Fetch Links Ledger
`GET /api/links?limit=50`

Returns a list of links with click statistics and expiration status. Sensitive `manageKey` is automatically scrubbed from public output.

### 3. Authorized Link Deletion
`DELETE /api/links?code={code}&key={manageKey}`

Removes the link from persistent storage. Requires the creator's `manageKey` or the server's `ADMIN_SECRET`. Unauthorized requests receive `403 Forbidden`.

### 4. Fetch Platform Stats
`GET /api/stats`

Returns live telemetry: total links, total redirects, active links, and latency.

---

## Production Deployment

### Recommended: Deploying to Vercel
1. Push your code to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_BASE_URL`: Your production URL (e.g., `https://cinnabar.app`)
   - `SUPABASE_URL`: Your Supabase Project URL
   - `SUPABASE_ANON_KEY`: Your Supabase Anon Key
4. Click **Deploy**.

---

## License

MIT License. Free for personal and commercial use.
