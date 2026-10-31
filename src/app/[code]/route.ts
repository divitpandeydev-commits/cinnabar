import { NextRequest, NextResponse } from "next/server";
import { getLinkByCode, recordClick } from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;

  if (!code || typeof code !== "string") {
    return NextResponse.redirect(new URL("/not-found", request.url));
  }

  // Look up link in persistent store
  const { link, isExpired } = await getLinkByCode(code);

  if (!link) {
    // Redirect to customized not-found page with code query
    const notFoundUrl = new URL("/link-not-found", request.url);
    notFoundUrl.searchParams.set("code", code);
    return NextResponse.redirect(notFoundUrl);
  }

  if (isExpired) {
    // Redirect to expired link notification page
    const expiredUrl = new URL("/link-expired", request.url);
    expiredUrl.searchParams.set("code", code);
    expiredUrl.searchParams.set("original", link.originalUrl);
    return NextResponse.redirect(expiredUrl);
  }

  // Record telemetry asynchronously
  const referrer = request.headers.get("referer") || request.headers.get("referrer") || "Direct";
  const userAgent = request.headers.get("user-agent") || "Unknown";

  recordClick(code, { referrer, userAgent }).catch((err) =>
    console.error("Telemetry record error:", err)
  );

  // High-speed 307 Temporary Redirect to original destination
  return NextResponse.redirect(link.originalUrl, 307);
}

