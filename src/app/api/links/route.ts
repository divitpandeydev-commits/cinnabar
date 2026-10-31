import { NextRequest, NextResponse } from "next/server";
import { deleteLink, getAllLinks } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const links = await getAllLinks(limit);

    // Map links with full shortUrl, scrubbing sensitive manageKey from public response
    const formatted = links.map((link) => ({
      id: link.id,
      code: link.code,
      shortUrl: `${baseUrl}/${link.code}`,
      originalUrl: link.originalUrl,
      createdAt: link.createdAt,
      expiresAt: link.expiresAt,
      clicks: link.clicks,
      isExpired: link.expiresAt ? new Date(link.expiresAt).getTime() < Date.now() : false,
      clickLogs: link.clickLogs || [],
    }));

    return NextResponse.json({ success: true, links: formatted });
  } catch (error) {
    console.error("API /api/links GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch links." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const key = searchParams.get("key") || request.headers.get("x-manage-key") || undefined;

    if (!code) {
      return NextResponse.json({ success: false, error: "Code parameter is required." }, { status: 400 });
    }

    const { success, authorized } = await deleteLink(code, key);

    if (!authorized) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: A valid management key is required to delete this short link.",
        },
        { status: 403 }
      );
    }

    if (!success) {
      return NextResponse.json({ success: false, error: "Link not found or already deleted." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Link /${code} deleted successfully.` });
  } catch (error) {
    console.error("API /api/links DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete link." }, { status: 500 });
  }
}
