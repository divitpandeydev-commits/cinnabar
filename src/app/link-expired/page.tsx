import Link from "next/link";
import { Clock, Home, Link2 } from "lucide-react";

export default async function LinkExpiredPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; original?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-page)] text-[var(--text-primary)]">
      <div className="max-w-md w-full bg-white border border-[var(--brown-border)] rounded-2xl p-8 shadow-sm text-center relative overflow-hidden">
        {/* Accent top line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--brown-rich)]" />

        <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 text-[var(--brown-rich)] mx-auto flex items-center justify-center mb-6">
          <Clock className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
          Link Has Expired
        </h1>

        <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
          The link{" "}
          {code ? (
            <span className="font-mono font-semibold text-[var(--brown-rich)] bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
              /{code}
            </span>
          ) : (
            "you are attempting to open"
          )}{" "}
          reached its designated expiration limit and is no longer active.
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
            Create Fresh Link
          </Link>
        </div>
      </div>
    </main>
  );
}

