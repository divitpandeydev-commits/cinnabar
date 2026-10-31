"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, QrCode, Tag, Clock, Database, Lock, BarChart3 } from "lucide-react";

const FEATURES_DATA = [
  {
    icon: Zap,
    title: "Sub-15ms Edge Redirection",
    description:
      "Server-side HTTP 307 redirects bypass client render waterfalls. Visitors arrive at their destination instantaneously with zero perceptible latency.",
    tag: "Speed",
  },
  {
    icon: Tag,
    title: "Bespoke Vanity Slugs",
    description:
      "Create clean, human-readable branded aliases such as /launch or /roadmap that reinforce brand prestige and maximize click-through confidence.",
    tag: "Branding",
  },
  {
    icon: QrCode,
    title: "High-Resolution Vector QR",
    description:
      "Every generated link instantly creates an error-corrected vector QR code rendered in warm espresso ink, exportable in high-density PNG for print or web.",
    tag: "Studio",
  },
  {
    icon: Clock,
    title: "Time-Gated Expiration",
    description:
      "Control link lifespan with granular expiration options (1h, 24h, 7d, 30d). Expired links gracefully decline requests with informative visitor notices.",
    tag: "Lifecycle",
  },
  {
    icon: Lock,
    title: "Zero Ad-Tracking Telemetry",
    description:
      "We capture only essential technical analytics (clicks, devices, and referrers). No invasive trackers, no user fingerprinting, and no data brokering.",
    tag: "Privacy",
  },
  {
    icon: Database,
    title: "Atomic Disk Persistence",
    description:
      "Links and metrics are safely stored using an atomic crash-proof engine that survives server restarts, with effortless adapter support for PostgreSQL.",
    tag: "Reliability",
  },
];

export default function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-20 sm:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-mono font-bold text-[#991B1B] mb-3">
            <span>ARCHITECTURAL FOUNDATION</span>
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#1C1917] tracking-tight">
            Engineered for longevity, speed, and discretion.
          </h2>
          <p className="mt-4 text-base text-[#57534E] leading-relaxed">
            Every layer of Cinnabar is designed to eliminate bloated marketing redirects in favor of
            tactile craftsmanship and dependable infrastructure.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {FEATURES_DATA.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="bg-white border border-[#DCD3C7] rounded-3xl p-7 shadow-xs hover:shadow-md hover:border-[#991B1B]/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E8DDD0] flex items-center justify-center text-[#991B1B] group-hover:bg-[#991B1B] group-hover:text-white transition-colors duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#78716C] bg-[#FAF7F2] px-2.5 py-1 rounded-full border border-[#E8DDD0]">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-[#1C1917] mb-2 group-hover:text-[#991B1B] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-[#57534E] leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#F5EFEB] flex items-center gap-1.5 text-xs font-mono text-[#991B1B] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn architecture &rarr;</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

