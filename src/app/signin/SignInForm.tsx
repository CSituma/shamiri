"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SignInForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const res = await fetch("/api/auth/mock-signin", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Invalid email or password. Please try again.");
      }

      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-3">
      <div className="space-y-1">
        <label htmlFor="email" className="text-xs font-medium text-slate-700">
          Admin email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-slate-900"
          placeholder="admin@shamiri.local"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-xs font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-slate-900"
          placeholder="********"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-cta inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-70"
      >
        {submitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
