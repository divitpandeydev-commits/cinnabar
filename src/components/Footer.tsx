"use client";

import React from "react";
import Link from "next/link";
import { Heart, Shield, Terminal, ArrowUp } from "lucide-react";
import GithubIcon from "./icons/GithubIcon";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#180F0A] text-[#DCD3C7] border-t border-[#2C1A11] pt-16 pb-12 relative overflow-hidden">
      {/* Decorative top red accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#991B1B] via-[#7F1D1D] to-[#241610]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#2C1A11]">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#991B1B] to-[#7F1D1D] flex items-center justify-center text-white font-serif font-black text-lg border border-[#DC2626]/40 shadow-sm">
                C
              </div>
              <span className="font-serif font-bold text-2xl text-[#FAF7F2] tracking-tight">
                Cinnabar
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#A8A29E] max-w-md leading-relaxed font-normal">
              An artisanal URL shortener and link intelligence platform. Built with Next.js 16,
              TypeScript, and Framer Motion, themed in deep crimson and roasted espresso.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-[#DCD3C7]">
                Engine Status: All Core Systems Operational
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#FAF7F2]">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-mono text-[#A8A29E]">
              <li>
                <a href="#shortener" className="hover:text-[#DC2626] transition-colors">
                  URL Shortener
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#DC2626] transition-colors">
                  Architecture &amp; Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#DC2626] transition-colors">
                  Operational Workflow
                </a>
              </li>
              <li>
                <a href="#telemetry" className="hover:text-[#DC2626] transition-colors">
                  System Telemetry
                </a>
              </li>
            </ul>
          </div>

          {/* Developer & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#FAF7F2]">
              Developer &amp; Open Source
            </h4>
            <ul className="space-y-2 text-xs font-mono text-[#A8A29E]">
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#DC2626] transition-colors flex items-center gap-1.5"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <span className="text-[#78716C]">MIT License • Free &amp; Open</span>
              </li>
              <li>
                <span className="text-[#78716C]">Next.js 16 App Router</span>
              </li>
              <li>
                <span className="text-[#78716C]">Tailwind CSS v4 &amp; Motion</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#78716C]">
          <p>© {new Date().getFullYear()} Cinnabar Link Intelligence. Crafted with intention.</p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#241610] hover:bg-[#2C1A11] text-[#DCD3C7] hover:text-[#FAF7F2] transition-colors cursor-pointer border border-[#321E16]"
            aria-label="Back to top"
          >
            <ArrowUp className="w-3.5 h-3.5 text-[#991B1B]" />
            <span>Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
}

