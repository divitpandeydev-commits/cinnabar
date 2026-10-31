"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link2, Sparkles, Send, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Submit Target Destination",
    description:
      "Paste any valid http or https URL. Our validator immediately normalizes protocol standards, validates domain structure, and checks for recursive loops.",
    accent: "bg-[#991B1B]",
  },
  {
    number: "02",
    title: "Refine & Configure Alias",
    description:
      "Choose a memorable vanity slug or let our collision-resistant base62 generator assign an unambiguous 6-character identifier. Optionally set an expiry timer.",
    accent: "bg-[#7F1D1D]",
  },
  {
    number: "03",
    title: "Deploy & Observe Telemetry",
    description:
      "Share your short link or download the print-ready vector QR code. Monitor real-time click counts and device distributions from your private ledger.",
    accent: "bg-[#241610]",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-20 bg-[#F4EFEB] border-y border-[#E8DDD0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#DCD3C7] text-xs font-mono font-bold text-[#78716C] mb-3">
            <span>OPERATIONAL WORKFLOW</span>
          </div>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#1C1917] tracking-tight">
            Three deliberate steps from clutter to clarity.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#57534E]">
            A transparent, frictionless process without subscriptions or artificial delays.
          </p>
        </div>

        {/* Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-white border border-[#DCD3C7] rounded-3xl p-8 relative flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
            >
              <div>
                {/* Step Pill */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-serif font-black text-3xl text-[#991B1B]">
                    {step.number}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E8DDD0] flex items-center justify-center text-[#78716C] text-xs font-mono font-bold">
                    Step
                  </div>
                </div>

                <h3 className="font-serif font-bold text-lg text-[#1C1917] mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-[#57534E] leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#F5EFEB] flex items-center gap-2 text-xs font-mono text-[#78716C]">
                <CheckCircle2 className="w-4 h-4 text-[#991B1B]" />
                <span>Deterministic execution</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

