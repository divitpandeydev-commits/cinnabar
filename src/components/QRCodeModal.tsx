"use client";

import React, { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { X, Download, Copy, Check, QrCode as QrIcon, ExternalLink } from "lucide-react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortUrl: string;
  code: string;
}

export default function QRCodeModal({ isOpen, onClose, shortUrl, code }: QRCodeModalProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !shortUrl) return;

    QRCode.toDataURL(shortUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#1F120B", // Roasted espresso QR modules
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [isOpen, shortUrl]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `cinnabar-qr-${code}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-sm bg-white border border-[#DCD3C7] rounded-3xl p-6 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Lacquer top line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#991B1B] to-[#241610]" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8DDD0]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-[#991B1B] flex items-center justify-center border border-red-100">
              <QrIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#1C1917]">Vector QR Code</h3>
              <p className="text-[11px] font-mono text-[#78716C]">High-density print ready</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Canvas Frame */}
        <div className="bg-[#FAF7F2] border-2 border-dashed border-[#DCD3C7] rounded-2xl p-4 flex flex-col items-center justify-center min-h-[220px]">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dataUrl}
              alt={`QR Code for ${shortUrl}`}
              className="w-48 h-48 rounded-xl shadow-xs"
            />
          ) : (
            <div className="text-xs font-mono text-[#78716C] animate-pulse">
              Rendering QR code...
            </div>
          )}
        </div>

        {/* Link Slug Display */}
        <div className="mt-4 p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] flex items-center justify-between text-xs font-mono">
          <span className="truncate text-[#991B1B] font-semibold">{shortUrl}</span>
          <button
            onClick={handleCopyLink}
            className="ml-2 px-2 py-1 rounded bg-white text-[#991B1B] border border-[#FEE2E2] hover:bg-red-50 transition-colors flex items-center gap-1 shrink-0 font-medium cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            onClick={handleDownload}
            disabled={!dataUrl}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F4EFEB] text-[#1C1917] border border-[#DCD3C7] text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Test Redirect</span>
          </a>
        </div>
      </div>
    </div>
  );
}

