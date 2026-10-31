"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Link2, Shield, Sparkles, Menu, X, ArrowUpRight } from "lucide-react";
import GithubIcon from "./icons/GithubIcon";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8DDD0] shadow-[0_4px_20px_rgba(42,24,16,0.04)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Seal */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#991B1B] to-[#7F1D1D] flex items-center justify-center text-white shadow-md shadow-[#991B1B]/20 group-hover:scale-105 transition-transform duration-200 border border-[#DC2626]/30">
              <span className="font-serif font-black text-xl tracking-tight">C</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl tracking-tight text-[#1C1917] flex items-center gap-1.5">
                Cinnabar
                <span className="w-2 h-2 rounded-full bg-[#991B1B] inline-block animate-pulse" />
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#78716C] -mt-1 font-semibold">
                Link Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#shortener"
              className="text-sm font-medium text-[#57534E] hover:text-[#991B1B] transition-colors"
            >
              Shortener
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-[#57534E] hover:text-[#991B1B] transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-[#57534E] hover:text-[#991B1B] transition-colors"
            >
              How It Works
            </a>
            <a
              href="#telemetry"
              className="text-sm font-medium text-[#57534E] hover:text-[#991B1B] transition-colors"
            >
              Telemetry
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#57534E] hover:text-[#1C1917] px-3 py-2 rounded-lg hover:bg-[#EFE8DF] transition-colors border border-transparent hover:border-[#DCD3C7]"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <a
              href="#shortener"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-semibold tracking-wide transition-all duration-200 shadow-sm shadow-[#991B1B]/25 hover:shadow-md hover:shadow-[#991B1B]/35 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Shorten Now</span>
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#EFE8DF] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF7F2] border-b border-[#E8DDD0] px-4 pt-2 pb-6 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <a
            href="#shortener"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#57534E] hover:text-[#991B1B] hover:bg-[#F4EFEB]"
          >
            Shortener
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#57534E] hover:text-[#991B1B] hover:bg-[#F4EFEB]"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#57534E] hover:text-[#991B1B] hover:bg-[#F4EFEB]"
          >
            How It Works
          </a>
          <a
            href="#telemetry"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-[#57534E] hover:text-[#991B1B] hover:bg-[#F4EFEB]"
          >
            Telemetry
          </a>
          <div className="pt-2 border-t border-[#E8DDD0] flex flex-col gap-2">
            <a
              href="#shortener"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#991B1B] text-white text-sm font-semibold shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Shorten Link</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

