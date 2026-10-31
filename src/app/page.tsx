"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ShortenerForm from "@/components/ShortenerForm";
import UrlResultCard from "@/components/UrlResultCard";
import UrlHistory from "@/components/UrlHistory";
import QRCodeModal from "@/components/QRCodeModal";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import AnalyticsPreview from "@/components/AnalyticsPreview";
import Footer from "@/components/Footer";
import { LinkRecord } from "@/lib/types";

export default function HomePage() {
  const [links, setLinks] = useState<(LinkRecord & { shortUrl: string; isExpired?: boolean })[]>([]);
  const [latestCreated, setLatestCreated] = useState<(LinkRecord & { shortUrl: string }) | null>(null);

  // QR Code Modal State
  const [qrModal, setQrModal] = useState<{ isOpen: boolean; shortUrl: string; code: string }>({
    isOpen: false,
    shortUrl: "",
    code: "",
  });

  // Fetch saved links from server on mount
  const fetchLinks = async () => {
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      if (data.success && Array.isArray(data.links)) {
        setLinks(data.links);
      }
    } catch (err) {
      console.error("Failed to load link history:", err);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  // When a link is shortened
  const handleShortenSuccess = (newLink: LinkRecord & { shortUrl: string }) => {
    setLatestCreated(newLink);
    setLinks((prev) => [newLink, ...prev.filter((l) => l.code !== newLink.code)]);

    // Store management authorization key in browser localStorage
    if (typeof window !== "undefined" && newLink.manageKey) {
      try {
        const stored = JSON.parse(localStorage.getItem("cinnabar_manage_keys") || "{}");
        stored[newLink.code.toLowerCase()] = newLink.manageKey;
        localStorage.setItem("cinnabar_manage_keys", JSON.stringify(stored));
      } catch {
        // ignore
      }
    }
  };

  // Delete a link with creator authorization key
  const handleDeleteLink = async (code: string) => {
    try {
      let manageKey = "";
      if (typeof window !== "undefined") {
        try {
          const stored = JSON.parse(localStorage.getItem("cinnabar_manage_keys") || "{}");
          manageKey = stored[code.toLowerCase()] || "";
        } catch {
          // ignore
        }
      }

      const res = await fetch(
        `/api/links?code=${encodeURIComponent(code)}&key=${encodeURIComponent(manageKey)}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "Failed to delete link.");
        return;
      }

      setLinks((prev) => prev.filter((l) => l.code !== code));
      if (latestCreated && latestCreated.code === code) {
        setLatestCreated(null);
      }

      // Cleanup key from localStorage
      if (typeof window !== "undefined") {
        try {
          const stored = JSON.parse(localStorage.getItem("cinnabar_manage_keys") || "{}");
          delete stored[code.toLowerCase()];
          localStorage.setItem("cinnabar_manage_keys", JSON.stringify(stored));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error("Failed to delete link:", err);
      alert("An unexpected error occurred while deleting the link.");
    }
  };

  // Open QR modal
  const handleOpenQR = (shortUrl: string, code: string) => {
    setQrModal({
      isOpen: true,
      shortUrl,
      code,
    });
  };

  const handleCloseQR = () => {
    setQrModal((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] selection:bg-[#991B1B] selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Landing Page Content */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero />

        {/* 2. Shortener Form */}
        <ShortenerForm onSuccess={handleShortenSuccess} />

        {/* 3. Latest Result Card (Appears dynamically upon shortening) */}
        {latestCreated && (
          <UrlResultCard link={latestCreated} onOpenQR={handleOpenQR} />
        )}

        {/* 4. Real-time Links Ledger & History */}
        <UrlHistory
          links={links}
          onDelete={handleDeleteLink}
          onOpenQR={handleOpenQR}
        />

        {/* 5. Architectural Features */}
        <Features />

        {/* 6. Step-by-Step Workflow */}
        <HowItWorks />

        {/* 7. System Telemetry & Live Activity Preview */}
        <AnalyticsPreview links={links} />
      </main>

      {/* Global QR Code Modal */}
      <QRCodeModal
        isOpen={qrModal.isOpen}
        onClose={handleCloseQR}
        shortUrl={qrModal.shortUrl}
        code={qrModal.code}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
