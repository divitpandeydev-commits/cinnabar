import Link from "next/link";
import { AlertCircle, ArrowLeft, Home, Link2 } from "lucide-react";

export default async function LinkNotFoundPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-page)] text-[var(--text-primary)]">
      <div className="max-w-md w-full bg-white border border-[var(--brown-border)] rounded-2xl p-8 shadow-sm text-center relative overflow-hidden">
        {/* Subtle accent border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--red-primary)] to-[var(--brown-rich)]" />

        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-[var(--red-primary)] mx-auto flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
          Link Not Found
        </h1>

        <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
          The shortened link{" "}
          {code ? (
            <span className="font-mono font-semibold text-[var(--red-primary)] bg-red-50 px-2 py-0.5 rounded border border-red-100">
              /{code}
            </span>
          ) : (
            "you navigated to"
          )}{" "}
          does not exist or may have been removed by its creator.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--red-primary)] hover:bg-[var(--red-deep)] text-white font-medium text-sm transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            Go to Homepage
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--bg-surface-warm)] hover:bg-[var(--bg-surface-sunken)] text-[var(--brown-rich)] font-medium text-sm transition-colors border border-[var(--brown-border-subtle)]"
          >
            <Link2 className="w-4 h-4" />
            Shorten a New URL
          </Link>
        </div>
      </div>
    </main>
  );
}

