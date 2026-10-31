"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, BarChart2, Shield, Smartphone, Monitor, Globe, RefreshCw } from "lucide-react";
import { GlobalStats, LinkRecord } from "@/lib/types";

interface AnalyticsPreviewProps {
  links: LinkRecord[];
}

export default function AnalyticsPreview({ links }: AnalyticsPreviewProps) {
  const [stats, setStats] = useState<GlobalStats>({
    totalLinks: 0,
    totalClicks: 0,
    activeLinks: 0,
    averageRedirectMs: 12,
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch {
      // fallback to computed from links prop
      let totalClicks = 0;
      let active = 0;
      for (const l of links) {
        totalClicks += l.clicks;
        if (!l.expiresAt || new Date(l.expiresAt).getTime() > Date.now()) active++;
      }
      setStats({
        totalLinks: links.length,
        totalClicks,
        activeLinks: active,
        averageRedirectMs: 12,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [links]);

  // Aggregate recent click events across all active links
  const recentClicks = links
    .flatMap((link) =>
      link.clickLogs.map((log) => ({
        ...log,
        code: link.code,
      }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  return (
    <section id="telemetry" className="scroll-mt-24 py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-mono font-bold text-[#991B1B] mb-3">
              <span>SYSTEM OBSERVABILITY</span>
            </div>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#1C1917] tracking-tight">
              Live Telemetry &amp; Link Metrics
            </h2>
            <p className="mt-2 text-sm text-[#57534E]">
              Real-time platform activity calculated directly from your persistent data store.
            </p>
          </div>

          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#DCD3C7] text-xs font-mono text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#991B1B]" : ""}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Total Links */}
          <div className="bg-white border border-[#DCD3C7] rounded-3xl p-6 shadow-xs">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#78716C] block mb-1">
              Links Stored
            </span>
            <div className="font-serif font-black text-3xl sm:text-4xl text-[#1C1917]">
              {stats.totalLinks}
            </div>
            <p className="text-[11px] font-mono text-[#A8A29E] mt-2">Unique shortened URLs</p>
          </div>

          {/* Total Clicks */}
          <div className="bg-white border border-[#DCD3C7] rounded-3xl p-6 shadow-xs">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#78716C] block mb-1">
              Total Redirects
            </span>
            <div className="font-serif font-black text-3xl sm:text-4xl text-[#991B1B]">
              {stats.totalClicks}
            </div>
            <p className="text-[11px] font-mono text-[#A8A29E] mt-2">HTTP 307 dispatches</p>
          </div>

          {/* Active Links */}
          <div className="bg-white border border-[#DCD3C7] rounded-3xl p-6 shadow-xs">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#78716C] block mb-1">
              Active Lifespans
            </span>
            <div className="font-serif font-black text-3xl sm:text-4xl text-[#1C1917]">
              {stats.activeLinks}
            </div>
            <p className="text-[11px] font-mono text-[#A8A29E] mt-2">Unexpired destinations</p>
          </div>

          {/* Redirect Latency */}
          <div className="bg-white border border-[#DCD3C7] rounded-3xl p-6 shadow-xs">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#78716C] block mb-1">
              Average Latency
            </span>
            <div className="font-serif font-black text-3xl sm:text-4xl text-emerald-700">
              ~{stats.averageRedirectMs}ms
            </div>
            <p className="text-[11px] font-mono text-[#A8A29E] mt-2">Serverless resolution</p>
          </div>
        </div>

        {/* Real-time Click Stream Activity Preview */}
        <div className="bg-[#1F120B] border border-[#321E16] rounded-3xl p-6 sm:p-8 text-[#FAF7F2] shadow-xl relative overflow-hidden">
          {/* Subtle lacquer top accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#991B1B] via-[#DC2626] to-[#7F1D1D]" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-[#321E16]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-xs uppercase tracking-wider text-[#DCD3C7] font-semibold">
                Live Redirect Stream
              </span>
            </div>
            <span className="text-xs font-mono text-[#A8A29E]">
              Protected telemetry • Anonymized IP
            </span>
          </div>

          {recentClicks.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#A8A29E]">
              No click dispatches recorded in this deployment yet. Click any shortened link to stream
              telemetry events here in real time.
            </div>
          ) : (
            <div className="space-y-2.5 font-mono text-xs">
              {recentClicks.map((click, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-xl bg-[#2C1A11] border border-[#3D2418] hover:border-[#991B1B]/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#DC2626] font-bold">/{click.code}</span>
                    <span className="text-[#DCD3C7] truncate max-w-xs sm:max-w-md">
                      Referrer: {click.referrer}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[#A8A29E] text-[11px] shrink-0">
                    <span className="px-2 py-0.5 rounded bg-[#180F0A] border border-[#321E16]">
                      {click.device || "Desktop"}
                    </span>
                    <span>{new Date(click.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

