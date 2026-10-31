export interface ClickEvent {
  timestamp: string;
  referrer: string;
  userAgent?: string;
  device?: string;
}

export interface LinkRecord {
  id: string;
  code: string;
  originalUrl: string;
  createdAt: string;
  expiresAt: string | null;
  clicks: number;
  lastClickedAt: string | null;
  clickLogs: ClickEvent[];
}

export interface CreateLinkParams {
  url: string;
  customSlug?: string;
  expiresInSeconds?: number | null; // e.g. 3600 (1h), 86400 (24h), 604800 (7d), 2592000 (30d), null (never)
}

export interface GlobalStats {
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
  averageRedirectMs: number;
}

export interface ShortenApiResponse {
  success: boolean;
  data?: {
    code: string;
    shortUrl: string;
    originalUrl: string;
    createdAt: string;
    expiresAt: string | null;
    clicks: number;
  };
  error?: string;
}

