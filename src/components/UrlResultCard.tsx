"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, QrCode, ExternalLink, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { LinkRecord } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

interface UrlResultCardProps {
  link: LinkRecord & { shortUrl: string };
  onOpenQR: (shortUrl: string, code: string) => void;
}

export default function UrlResultCard({ link, onOpenQR }: UrlResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // ignore
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
      className="max-w-3xl mx-auto mt-6 px-4 sm:px-6"
    >
      <div className="bg-white border-2 border-[#991B1B]/40 rounded-3xl p-6 sm:p-7 shadow-[0_12px_36px_rgba(153,27,27,0.09)] relative overflow-hidden">
        {/* Subtle glow badge */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8DDD0] text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#991B1B] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#991B1B] animate-ping" />
            <span>Link Active &amp; Ready</span>
          </div>
          {link.expiresAt ? (
            <div className="flex items-center gap-1 text-[#78716C]">
              <Clock className="w-3.5 h-3.5 text-[#991B1B]" />
              <span>Expires {formatRelativeTime(link.expiresAt)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[#78716C]">
              <ShieldCheck className="w-3.5 h-3.5 text-green-700" />
              <span>Permanent link</span>
            </div>
          )}
        </div>

        {/* Short URL Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#DCD3C7]">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xs font-mono text-[#78716C] uppercase shrink-0 font-bold">
              Short Link:
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-[#991B1B] truncate select-all">
              {link.shortUrl}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                copied
                  ? "bg-green-700 text-white shadow-sm"
                  : "bg-[#991B1B] hover:bg-[#7F1D1D] text-white shadow-sm shadow-[#991B1B]/20"
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied to Clipboard" : "Copy Link"}</span>
            </button>

            {/* QR Code Action */}
            <button
              onClick={() => onOpenQR(link.shortUrl, link.code)}
              className="p-2.5 rounded-xl bg-white hover:bg-[#F4EFEB] text-[#1C1917] border border-[#DCD3C7] transition-colors cursor-pointer"
              title="Generate QR Code"
              aria-label="Generate QR Code"
            >
              <QrCode className="w-4 h-4 text-[#991B1B]" />
            </button>

            {/* Test Link Action */}
            <a
              href={link.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-white hover:bg-[#F4EFEB] text-[#1C1917] border border-[#DCD3C7] transition-colors"
              title="Test Short Link in New Tab"
              aria-label="Test Short Link"
            >
              <ExternalLink className="w-4 h-4 text-[#57534E]" />
            </a>
          </div>
        </div>

        {/* Destination preview */}
        <div className="mt-3.5 flex items-center gap-2 text-xs font-mono text-[#78716C] px-1 truncate">
          <span className="shrink-0 font-semibold text-[#57534E]">Redirects to:</span>
          <span className="truncate underline decoration-[#DCD3C7]" title={link.originalUrl}>
            {link.originalUrl}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

