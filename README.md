# Cinnabar — Artisanal URL Shortener & Link Intelligence

A modern, high-performance, and beautifully crafted URL shortening and link intelligence platform. Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Framer Motion**, themed in a distinctive **Deep Red and Roasted Brown** editorial aesthetic.

---

## Highlights & Features

- **Blazing-Fast Redirections**: Server-side HTTP 307 redirects executing in single-digit milliseconds via Next.js App Router dynamic routes (`/[code]`).
- **Deep Red & Dark Brown Design**: Bespoke visual identity combining rich crimson, roasted espresso, warm cream parchment, and meticulous micro-interactions.
- **Custom Slugs & Aliases**: Generate clean, branded vanity URLs (e.g., `cinnabar.app/launch`).
- **QR Code Studio**: Instant high-resolution QR code rendering with single-click PNG download for print and digital campaigns.
- **Link Expiration Engine**: Set URLs to auto-expire after 1 hour, 24 hours, 7 days, 30 days, or persist forever.
- **Persistent Storage**: Disk-backed atomic database engine with transaction-safe JSON persistence, click logging, device identification, and cloud database adapter readiness (PostgreSQL/Supabase).
- **Real-Time Link Management**: Live click tracking, instant copy with tactile feedback, and link deletion.
- **Strict Validation & Security**: RFC-compliant URL parsing, protocol enforcement (`https://`), and rate limiting to prevent abuse.
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
| **Storage** | Atomic Disk-Backed Engine (`src/lib/db.ts`) with PostgreSQL adapter |

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
   *(Defaults work out of the box without any third-party services required).*

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | The public domain of your application | `http://localhost:3000` |
| `DATABASE_URL` | Optional PostgreSQL / Supabase connection string | *(File-based if not set)* |
| `NODE_ENV` | Application environment | `development` |

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
    "code": "trending-repos",
    "shortUrl": "http://localhost:3000/trending-repos",
    "originalUrl": "https://github.com/trending",
    "createdAt": "2026-10-31T13:30:00.000Z",
    "expiresAt": "2026-11-01T13:30:00.000Z",
    "clicks": 0
  }
}
```

### 2. Fetch User Links
`GET /api/links`

Returns a list of shortened links with real-time click statistics and expiration status.

### 3. Delete a Shortened URL
`DELETE /api/links?code={code}`

Removes the shortened link from storage.

### 4. Fetch Platform Stats
`GET /api/stats`

Returns live telemetry: total links created, total redirects handled, and average response latency.

---

## Project Structure

```
├── public/                 # Static assets & favicons
├── src/
│   ├── app/
│   │   ├── [code]/         # Server-side 307 redirect route
│   │   ├── api/            # REST API endpoints (shorten, links, stats)
│   │   ├── globals.css     # Design tokens & color variables
│   │   ├── layout.tsx      # Root layout & typography
│   │   └── page.tsx        # Landing page & shortener interface
│   ├── components/         # Reusable modular UI components
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── ShortenerForm.tsx
│   │   ├── UrlResultCard.tsx
│   │   ├── UrlHistory.tsx
│   │   ├── QRCodeModal.tsx
│   │   ├── Features.tsx
│   │   ├── HowItWorks.tsx
│   │   └── Footer.tsx
│   └── lib/                # Storage, validation & helper functions
│       ├── db.ts           # Persistent database driver
│       ├── utils.ts        # URL formatters & validators
│       └── rate-limit.ts   # Rate limiting protection
├── AGENTS.md               # AI developer guidelines
├── AI_TASKS.md             # Development task tracker
├── PROJECT_MEMORY.md       # Architectural memory ledger
├── CHANGELOG.md            # Versioned release log
└── README.md               # GitHub repository documentation
```

---

## Deployment

### Deploying to Vercel
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Set `NEXT_PUBLIC_BASE_URL` to your production URL (e.g. `https://cinnabar.vercel.app`).
4. Click **Deploy**.

---

## License

MIT License. Free for personal and commercial use.
