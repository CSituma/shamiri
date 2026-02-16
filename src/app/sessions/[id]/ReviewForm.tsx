"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ReviewFormProps = {
  sessionId: string;
  currentStatus: string;
  existingReview: {
    finalStatus: "SAFE" | "RISK" | "NEEDS_DISCUSSION";
    note: string | null;
    createdAt: string;
  } | null;
};

export function ReviewForm({
  sessionId,
  currentStatus,
  existingReview,
}: ReviewFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const finalStatus = formData.get("finalStatus") as
      | "SAFE"
      | "RISK"
      | "NEEDS_DISCUSSION";
    const note = (formData.get("note") as string) || undefined;

    if (!finalStatus) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalStatus, note }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save");
      }
      setSuccess("Supervisor decision saved.");
      setTimeout(() => {
        router.refresh();
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800 shadow-sm sm:p-5">
      {success && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-4 z-50 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800 shadow-lg"
        >
          {success}
        </div>
      )}

      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Supervisor decision
      </h2>
      {existingReview && (
        <div className="mt-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
          <p className="font-semibold">
            Final status: {existingReview.finalStatus.replace(/_/g, " ")}
          </p>
          {existingReview.note && (
            <p className="mt-1">Note: {existingReview.note}</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-slate-700">
            How would you classify this session?
          </legend>
          <div className="space-y-1 text-xs">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="finalStatus"
                value="SAFE"
                defaultChecked={currentStatus === "SAFE"}
              />
              <span>Safe</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="finalStatus"
                value="RISK"
                defaultChecked={currentStatus === "RISK"}
              />
              <span>Risk (requires follow-up)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="finalStatus"
                value="NEEDS_DISCUSSION"
                defaultChecked={currentStatus === "NEEDS_DISCUSSION"}
              />
              <span>Needs discussion</span>
            </label>
          </div>
        </fieldset>

        <div className="space-y-1 text-xs">
          <label htmlFor="note" className="font-medium text-slate-700">
            Optional note to record your judgment
          </label>
          <textarea
            id="note"
            name="note"
            rows={4}
            className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-800 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            placeholder="E.g., AI misinterpreted a joke; student denied current intent..."
            defaultValue={existingReview?.note ?? ""}
          />
        </div>

        {error && (
          <p className="text-red-600 text-xs" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-70"
        >
          {saving ? "Saving…" : "Save decision"}
        </button>
      </form>
    </div>
  );
}
