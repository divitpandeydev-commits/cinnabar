"use client";

import React, { useState } from "react";
import { Copy, Check, QrCode, ExternalLink, Trash2, Clock, MousePointerClick, Search, AlertCircle, Link2 } from "lucide-react";
import { LinkRecord } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

interface UrlHistoryProps {
  links: (LinkRecord & { shortUrl: string; isExpired?: boolean })[];
  onDelete: (code: string) => Promise<void>;
  onOpenQR: (shortUrl: string, code: string) => void;
}

export default function UrlHistory({ links, onDelete, onOpenQR }: UrlHistoryProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  const handleCopy = async (shortUrl: string, code: string) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleDeleteClick = async (code: string) => {
    if (!window.confirm(`Are you sure you want to delete short link /${code}?`)) {
      return;
    }
    setDeletingCode(code);
    try {
      await onDelete(code);
    } finally {
      setDeletingCode(null);
    }
  };

  const filteredLinks = links.filter(
    (item) =>
      item.code.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.originalUrl.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <section className="max-w-4xl mx-auto mt-14 px-4 sm:px-6">
      <div className="bg-white border border-[#DCD3C7] rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(42,24,16,0.04)]">
        {/* Header and Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DDD0]">
          <div>
            <h2 className="font-serif font-bold text-xl text-[#1C1917] flex items-center gap-2">
              <Link2 className="w-5 h-5 text-[#991B1B]" />
              <span>Link Ledger &amp; Management</span>
            </h2>
            <p className="text-xs font-mono text-[#78716C] mt-0.5">
              Live records persisted to disk with real-time telemetry
            </p>
          </div>

          {/* Search/Filter Bar */}
          {links.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by slug or URL..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E8DDD0] focus:border-[#991B1B] text-xs font-mono text-[#1C1917]"
              />
            </div>
          )}
        </div>

        {/* Links Table / List */}
        {links.length === 0 ? (
          <div className="py-12 text-center text-[#78716C] space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E8DDD0] flex items-center justify-center mx-auto text-[#991B1B]">
              <Link2 className="w-6 h-6" />
            </div>
            <p className="font-serif text-base text-[#1C1917] font-semibold">No links created yet</p>
            <p className="text-xs max-w-sm mx-auto font-mono">
              Shorten your first URL above to populate this ledger and observe real-time click metrics.
            </p>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="py-10 text-center text-xs font-mono text-[#78716C]">
            No links matching &ldquo;{filterQuery}&rdquo;
          </div>
        ) : (
          <div className="mt-4 divide-y divide-[#E8DDD0]">
            {filteredLinks.map((item) => {
              const isExpired = item.expiresAt ? new Date(item.expiresAt).getTime() < Date.now() : false;

              return (
                <div
                  key={item.id || item.code}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 group transition-colors hover:bg-[#FAF7F2]/50 -mx-2 px-2 rounded-xl"
                >
                  {/* Left Column: Short URL + Destination */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#991B1B]">
                        /{item.code}
                      </span>

                      {/* Status Badges */}
                      {isExpired ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-stone-100 text-[#78716C] border border-stone-200">
                          Expired
                        </span>
                      ) : item.expiresAt ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>Expires {formatRelativeTime(item.expiresAt)}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Active
                        </span>
                      )}

                      {/* Click Counter */}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-red-50 text-[#991B1B] border border-red-100 flex items-center gap-1">
                        <MousePointerClick className="w-2.5 h-2.5" />
                        <span>{item.clicks} clicks</span>
                      </span>
                    </div>

                    {/* Original URL Truncated */}
                    <div className="text-xs font-mono text-[#57534E] truncate max-w-xl">
                      <span className="text-[#A8A29E] mr-1">→</span>
                      <span title={item.originalUrl}>{item.originalUrl}</span>
                    </div>

                    <div className="text-[10px] font-mono text-[#A8A29E]">
                      Created {formatRelativeTime(item.createdAt)}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-2 md:pt-0">
                    {/* Copy */}
                    <button
                      onClick={() => handleCopy(item.shortUrl, item.code)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                        copiedCode === item.code
                          ? "bg-green-700 text-white"
                          : "bg-white hover:bg-[#FAF7F2] text-[#1C1917] border border-[#DCD3C7]"
                      }`}
                      title="Copy short link"
                    >
                      {copiedCode === item.code ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#991B1B]" />
                      )}
                      <span>{copiedCode === item.code ? "Copied" : "Copy"}</span>
                    </button>

                    {/* QR Code */}
                    <button
                      onClick={() => onOpenQR(item.shortUrl, item.code)}
                      className="p-1.5 rounded-lg bg-white hover:bg-[#FAF7F2] text-[#1C1917] border border-[#DCD3C7] transition-colors cursor-pointer"
                      title="Show QR Code"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#57534E]" />
                    </button>

                    {/* Visit */}
                    <a
                      href={item.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white hover:bg-[#FAF7F2] text-[#1C1917] border border-[#DCD3C7] transition-colors"
                      title="Visit destination via short link"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#57534E]" />
                    </a>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteClick(item.code)}
                      disabled={deletingCode === item.code}
                      className="p-1.5 rounded-lg bg-white hover:bg-red-50 text-red-700 border border-transparent hover:border-red-200 transition-colors cursor-pointer disabled:opacity-50"
                      title="Delete link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

