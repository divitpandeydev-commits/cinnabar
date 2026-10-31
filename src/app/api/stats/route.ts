import { NextResponse } from "next/server";
import { getGlobalStats } from "@/lib/db";

export async function GET() {
  try {
    const stats = await getGlobalStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("API /api/stats GET error:", error);
    return NextResponse.json(
      {
        success: false,
        stats: { totalLinks: 0, totalClicks: 0, activeLinks: 0, averageRedirectMs: 12 },
      },
      { status: 500 }
    );
  }
}
