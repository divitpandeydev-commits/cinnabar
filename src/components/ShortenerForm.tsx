"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Sparkles, Sliders, Clock, Tag, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { LinkRecord } from "@/lib/types";

interface ShortenerFormProps {
  onSuccess: (link: LinkRecord & { shortUrl: string }) => void;
}

const EXPIRATION_OPTIONS = [
  { label: "Never expires (Permanent)", value: null },
  { label: "1 Hour", value: 3600 },
  { label: "24 Hours (1 Day)", value: 86400 },
  { label: "7 Days (1 Week)", value: 604800 },
  { label: "30 Days (1 Month)", value: 2592000 },
];

export default function ShortenerForm({ onSuccess }: ShortenerFormProps) {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(false);

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setErrorMessage("Please enter a destination URL to shorten.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: trimmedUrl,
          customSlug: customSlug.trim() || undefined,
          expiresIn,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to shorten link.");
      }

      // Success
      setSuccessNotice(true);
      setUrl("");
      setCustomSlug("");
      onSuccess(data.data);

      setTimeout(() => {
        setSuccessNotice(false);
      }, 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="shortener" className="scroll-mt-28 max-w-3xl mx-auto px-4 sm:px-6">
      <div className="bg-white border-2 border-[#DCD3C7] focus-within:border-[#991B1B] rounded-3xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(42,24,16,0.08)] transition-all duration-300 relative overflow-hidden">
        {/* Subtle decorative lacquer accent on top card edge */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#991B1B] via-[#7F1D1D] to-[#241610]" />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="target-url"
              className="block text-xs font-mono font-bold uppercase tracking-wider text-[#1C1917]"
            >
              Enter Long Destination URL
            </label>

            {/* Input Row */}
            <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#78716C]">
                  <Link2 className="w-5 h-5 text-[#991B1B]" />
                </div>
                <input
                  id="target-url"
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="https://example.com/very-long-article-or-campaign-link..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DDD0] focus:border-[#991B1B] focus:bg-white text-[#1C1917] placeholder:text-[#A8A29E] font-medium text-sm sm:text-base transition-colors"
                  disabled={loading}
                  autoComplete="off"
                />
              </div>

              {/* Shorten Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-[#991B1B] hover:bg-[#7F1D1D] active:scale-[0.98] text-white font-semibold text-sm sm:text-base tracking-wide transition-all duration-200 shadow-md shadow-[#991B1B]/25 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Compressing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Shorten Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Advanced Customizations Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#78716C] hover:text-[#991B1B] transition-colors cursor-pointer select-none"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showAdvanced ? "Hide advanced options" : "Customize alias & link expiration"}</span>
            </button>

            {/* Expandable Options Drawer */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-[#E8DDD0] grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Custom Slug / Vanity Alias */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="custom-slug"
                        className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#57534E]"
                      >
                        <Tag className="w-3.5 h-3.5 text-[#991B1B]" />
                        <span>Custom Vanity Alias (Optional)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-mono text-[#A8A29E]">
                          /
                        </span>
                        <input
                          id="custom-slug"
                          type="text"
                          value={customSlug}
                          onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                          placeholder="e.g. spring-launch-26"
                          maxLength={40}
                          className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DDD0] focus:border-[#991B1B] text-xs font-mono text-[#1C1917] placeholder:text-[#A8A29E]"
                          disabled={loading}
                        />
                      </div>
                      <p className="text-[11px] text-[#78716C]">
                        Alphanumeric, hyphens, and underscores (3-40 chars).
                      </p>
                    </div>

                    {/* Expiration Selector */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="expiration-select"
                        className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#57534E]"
                      >
                        <Clock className="w-3.5 h-3.5 text-[#991B1B]" />
                        <span>Link Lifespan (Expiration)</span>
                      </label>
                      <select
                        id="expiration-select"
                        value={expiresIn === null ? "null" : expiresIn}
                        onChange={(e) => {
                          const val = e.target.value;
                          setExpiresIn(val === "null" ? null : parseInt(val, 10));
                        }}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DDD0] focus:border-[#991B1B] text-xs font-mono text-[#1C1917] cursor-pointer"
                        disabled={loading}
                      >
                        {EXPIRATION_OPTIONS.map((opt, idx) => (
                          <option key={idx} value={opt.value === null ? "null" : opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-[#78716C]">
                        Link will automatically deactivate after expiration.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Feedback & Notifications */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium"
              >
                <AlertCircle className="w-4 h-4 text-[#991B1B] shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {successNotice && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-900 text-xs font-medium"
              >
                <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
                <span>Short link generated and saved to persistent storage!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}

