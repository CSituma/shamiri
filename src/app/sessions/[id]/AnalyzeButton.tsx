"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AnalyzeButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/analyze`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Analysis failed");
      }
      setSuccess("AI analysis generated successfully.");
      setTimeout(() => {
        router.refresh();
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
      {success && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-4 z-50 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800 shadow-lg"
        >
          {success}
        </div>
      )}

      <p className="font-medium text-slate-800">AI analysis is not yet available for this session.</p>
      <div className="inline-flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-70"
        >
          {loading ? "Analyzing… (10–20 sec)" : "Generate AI analysis"}
        </button>
        <span className="text-xs text-slate-500">
          This may take around 10–20 seconds.
        </span>
      </div>
      {error && (
        <p className="text-red-600" role="alert">
          {error}. You can try again or review the transcript manually.
        </p>
      )}
    </div>
  );
}
