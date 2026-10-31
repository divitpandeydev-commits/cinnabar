import { NextRequest, NextResponse } from "next/server";
import { createLink, isCodeAvailable } from "@/lib/db";
import { extractClientIp, isRateLimited } from "@/lib/rate-limit";
import { validateAndNormalizeUrl, validateCustomSlug } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting by real client IP
    const clientIp = extractClientIp(request.headers);
    const { limited } = isRateLimited(clientIp, 30, 60000); // 30 requests per minute
    if (limited) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many shorten requests. Please slow down and try again shortly.",
        },
        { status: 429 }
      );
    }

    // 2. Parse request body
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload provided." },
        { status: 400 }
      );
    }

    const { url, customSlug, expiresIn } = body;

    // 3. Validate target URL with SSRF & protocol checks
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const urlValidation = validateAndNormalizeUrl(url, baseUrl);

    if (!urlValidation.valid || !urlValidation.normalizedUrl) {
      return NextResponse.json(
        { success: false, error: urlValidation.error || "Invalid destination URL." },
        { status: 400 }
      );
    }

    // 4. Validate custom slug if supplied
    let sanitizedSlug: string | undefined = undefined;
    if (customSlug && typeof customSlug === "string" && customSlug.trim() !== "") {
      const slugValidation = validateCustomSlug(customSlug);
      if (!slugValidation.valid || !slugValidation.sanitizedSlug) {
        return NextResponse.json(
          { success: false, error: slugValidation.error || "Invalid custom alias." },
          { status: 400 }
        );
      }

      const available = await isCodeAvailable(slugValidation.sanitizedSlug);
      if (!available) {
        return NextResponse.json(
          { success: false, error: `The custom alias "${slugValidation.sanitizedSlug}" is already taken.` },
          { status: 409 }
        );
      }

      sanitizedSlug = slugValidation.sanitizedSlug;
    }

    // 5. Expiration duration parsing
    let expiresInSeconds: number | null = null;
    if (typeof expiresIn === "number" && expiresIn > 0) {
      // Maximum 1 year expiration
      expiresInSeconds = Math.min(expiresIn, 31536000);
    }

    // 6. Save link to persistent storage
    const newLink = await createLink({
      url: urlValidation.normalizedUrl,
      customSlug: sanitizedSlug,
      expiresInSeconds,
    });

    const shortUrl = `${baseUrl}/${newLink.code}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newLink.id,
          code: newLink.code,
          shortUrl,
          originalUrl: newLink.originalUrl,
          createdAt: newLink.createdAt,
          expiresAt: newLink.expiresAt,
          clicks: newLink.clicks,
          manageKey: newLink.manageKey,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to shorten URL.";
    console.error("API /api/shorten error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
