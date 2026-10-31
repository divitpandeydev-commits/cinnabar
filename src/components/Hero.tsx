"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowDown, Link2, Sparkles, ArrowRight, ShieldCheck, Zap, Lock } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      {/* Subtle Warm Background Ambient Elements */}
      <div className="absolute inset-0 bg-warm-grid opacity-60 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#991B1B]/10 via-[#2A1810]/5 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Editorial Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF7F2] border border-[#DCD3C7] shadow-xs text-xs font-mono font-medium text-[#78716C] mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#991B1B]" />
          <span>Persistent Disk Engine • Zero Telemetry Bleed</span>
          <span className="text-[#991B1B] font-semibold">v1.0</span>
        </motion.div>

        {/* Master Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-[#1C1917] leading-[1.12] max-w-4xl mx-auto"
        >
          Transform unruly URLs into{" "}
          <span className="relative inline-block text-[#991B1B] underline decoration-[#991B1B]/30 decoration-wavy underline-offset-8">
            refined connections
          </span>
          .
        </motion.h1>

        {/* Natural, professional editorial copy */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-6 text-lg sm:text-xl text-[#57534E] max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Engineered for developers, writers, and digital craftspeople who value speed and elegance. 
          Enjoy single-digit millisecond redirects, custom vanity slugs, instant vector QR codes, and time-gated link expiration.
        </motion.p>

        {/* Value Proposition Badges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#78716C]"
        >
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#991B1B]" />
            <span>&lt; 15ms Edge Redirects</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[#991B1B]" />
            <span>Persistent Disk Storage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#991B1B]" />
            <span>No Cross-Site Ad Trackers</span>
          </div>
        </motion.div>

        {/* Interactive Visual Representation of URL Shortening */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-12 max-w-3xl mx-auto bg-white border border-[#DCD3C7] rounded-2xl p-4 sm:p-6 shadow-[0_8px_30px_rgba(42,24,16,0.06)] relative overflow-hidden text-left"
        >
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8E1D7] text-xs font-mono text-[#78716C]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#991B1B]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#DCD3C7]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8E1D7]" />
              <span className="ml-2 font-medium text-[#1C1917]">Cinnabar Link Compression Engine</span>
            </div>
            <span className="text-[11px] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#DCD3C7]">
              Ratio: 82% Shorter
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
            {/* Long Messy URL Container */}
            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8E1D7] font-mono text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold text-[#78716C] tracking-wider">
                  Raw Destination URL
                </span>
                <span className="text-[10px] text-red-700 bg-red-50 px-1.5 py-0.5 rounded font-semibold">
                  108 chars
                </span>
              </div>
              <div className="text-[#57534E] break-all leading-tight select-none">
                <span className="text-[#1C1917] font-semibold">https://craftsman.studio</span>
                /articles/typography-and-space?utm_source=newsletter&amp;utm_medium=email&amp;ref=autumn26
              </div>
            </div>

            {/* Visual Arrow / Transform Action */}
            <div className="flex justify-center items-center py-2 md:py-0">
              <div className="w-9 h-9 rounded-full bg-[#991B1B] text-white flex items-center justify-center shadow-sm shadow-[#991B1B]/30 animate-pulse">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Refined Short URL Container */}
            <div className="bg-[#FEF2F2] p-3.5 rounded-xl border border-[#FEE2E2] font-mono text-xs shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold text-[#991B1B] tracking-wider">
                  Refined Short Link
                </span>
                <span className="text-[10px] text-[#991B1B] bg-white px-1.5 py-0.5 rounded border border-[#FEE2E2] font-bold">
                  21 chars
                </span>
              </div>
              <div className="text-[#991B1B] font-bold text-sm tracking-tight flex items-center gap-1">
                <span>cinnabar.app/</span>
                <span className="bg-[#991B1B] text-white px-1.5 py-0.5 rounded text-xs font-semibold">
                  typography
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll Down Invitation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-12 flex flex-col items-center justify-center gap-1 text-[#78716C] text-xs font-mono"
        >
          <span>Craft your shortened URL below</span>
          <motion.a
            href="#shortener"
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="p-1 rounded-full text-[#991B1B] hover:bg-[#FEE2E2] transition-colors"
            aria-label="Scroll to Shortener"
          >
            <ArrowDown className="w-4 h-4" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

