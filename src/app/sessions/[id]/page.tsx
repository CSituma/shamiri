import Link from "next/link";
import { cookies } from "next/headers";
import { AnalyzeButton } from "./AnalyzeButton";
import { ReviewForm } from "./ReviewForm";

function formatSessionDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: process.env.SESSION_TIME_ZONE ?? "Africa/Nairobi",
  }).format(date);
}

type SessionDetail = {
  id: string;
  fellowName: string;
  groupCode: string;
  completedAt: string;
  status: string;
  transcript: string;
  aiAnalysis: {
    summary: string;
    contentCoverageScore: number;
    contentCoverageRationale: string;
    facilitationScore: number;
    facilitationRationale: string;
    protocolSafetyScore: number;
    protocolSafetyRationale: string;
    riskFlag: "SAFE" | "RISK";
    riskQuote: string | null;
    riskRationale: string;
  } | null;
  supervisorReview:
    | {
        finalStatus: "SAFE" | "RISK" | "NEEDS_DISCUSSION";
        note: string | null;
        createdAt: string;
      }
    | null;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

type SessionNavItem = {
  id: string;
  fellowName: string;
  completedAt: string;
};

async function fetchSession(id: string, cookieHeader: string): Promise<SessionDetail | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const res = await fetch(`${baseUrl ?? ""}/api/sessions/${id}`, {
    cache: "no-store",
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });

  if (!res.ok) return null;
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;
  return res.json();
}

async function fetchSessionNav(cookieHeader: string): Promise<SessionNavItem[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const res = await fetch(`${baseUrl ?? ""}/api/sessions`, {
    cache: "no-store",
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
  if (!res.ok) return [];
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return [];
  const data = await res.json();
  return ((data.sessions ?? []) as SessionNavItem[]).map((s) => ({
    id: s.id,
    fellowName: s.fellowName,
    completedAt: s.completedAt,
  }));
}

function TopRiskBadge(session: SessionDetail) {
  if (session.status === "PENDING_ANALYSIS" || !session.aiAnalysis) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        <span className="h-2 w-2 rounded-full bg-slate-400" />
        Pending analysis
      </span>
    );
  }

  if (session.aiAnalysis.riskFlag === "RISK") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Risk
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      Safe
    </span>
  );
}

function reviewStatusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING_ANALYSIS: "Pending analysis",
    PROCESSED: "Awaiting supervisor review",
    FLAGGED_FOR_REVIEW: "Flagged for review",
    SAFE: "Reviewed",
    RISK: "Reviewed",
    NEEDS_DISCUSSION: "Needs discussion",
  };
  return map[status] ?? status.replace(/_/g, " ");
}

export default async function SessionPage({ params }: PageProps) {
  const { id } = await params;
  const cookieHeader = (await cookies()).toString();
  const [session, navSessions] = await Promise.all([
    fetchSession(id, cookieHeader),
    fetchSessionNav(cookieHeader),
  ]);

  if (!session) {
    return (
      <div className="flex w-full flex-col">
        <Link href="/" className="link-nav mb-4 text-sm font-semibold">
          ← Back to sessions
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Session not found.
        </div>
      </div>
    );
  }

  const completedDate = formatSessionDate(session.completedAt);
  const currentIndex = navSessions.findIndex((s) => s.id === session.id);
  const prevSession = currentIndex >= 0 ? navSessions[currentIndex + 1] : null;
  const nextSession = currentIndex > 0 ? navSessions[currentIndex - 1] : null;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="link-nav text-sm font-semibold">
          ← Back to sessions
        </Link>
        <div className="flex items-center gap-2">
          {prevSession ? (
            <Link
              href={`/sessions/${prevSession.id}`}
              className="action-link rounded-full border border-[var(--brand--color--lilac-purple)] bg-white px-3 py-1.5 text-xs font-semibold transition-colors hover:border-[var(--brand--color--navy-blue)]"
            >
              Previous session
            </Link>
          ) : (
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-400">
              Previous session
            </span>
          )}
          {nextSession ? (
            <Link
              href={`/sessions/${nextSession.id}`}
              className="action-link rounded-full border border-[var(--brand--color--lilac-purple)] bg-white px-3 py-1.5 text-xs font-semibold transition-colors hover:border-[var(--brand--color--navy-blue)]"
            >
              Next session
            </Link>
          ) : (
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-400">
              Next session
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="space-y-4">
          <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  {session.fellowName}
                </h1>
                <p className="mt-1 text-sm text-slate-600" suppressHydrationWarning>
                  Group {session.groupCode} • {completedDate}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[0.7rem] font-medium text-slate-700">
                  {reviewStatusLabel(session.status)}
                </span>
                <TopRiskBadge {...session} />
              </div>
            </div>
          </header>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Session Insight Card
            </h2>
            {!session.aiAnalysis ? (
              <AnalyzeButton sessionId={session.id} />
            ) : (
              <AIInsights analysis={session.aiAnalysis} />
            )}
          </article>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Transcript
            </h2>
            <div className="max-h-[55vh] space-y-1 overflow-y-auto rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-800 md:max-h-[420px]">
              {session.transcript.split("\n").map((line, idx) => (
                <p key={idx} className="whitespace-pre-wrap">
                  {line.trim()}
                </p>
              ))}
            </div>
          </section>
        </section>

        <section className="space-y-4">
          <ReviewForm
            sessionId={session.id}
            currentStatus={session.status}
            existingReview={session.supervisorReview}
          />
          <aside className="rounded-2xl border border-slate-200 bg-yellow-50 p-4 text-xs text-slate-600 shadow-sm">
            <p className="font-semibold text-slate-800">About this Copilot</p>
            <p className="mt-1">
              AI is used to summarize sessions, score quality, and flag possible risk. It does not
              replace clinical judgment. Your review and final decision always override the AI.
            </p>
          </aside>
        </section>
      </div>
    </div>
  );
}

function AIInsights({
  analysis,
}: {
  analysis: NonNullable<SessionDetail["aiAnalysis"]>;
}) {
  return (
    <div className="mt-4 space-y-4 text-sm text-slate-800">
      <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-50">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        Analysis complete
      </div>

      <p>{analysis.summary}</p>

      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard
          label="Content coverage"
          score={analysis.contentCoverageScore}
          rationale={analysis.contentCoverageRationale}
        />
        <MetricCard
          label="Facilitation quality"
          score={analysis.facilitationScore}
          rationale={analysis.facilitationRationale}
        />
        <MetricCard
          label="Protocol safety"
          score={analysis.protocolSafetyScore}
          rationale={analysis.protocolSafetyRationale}
        />
      </div>

      <div
        className={`rounded-xl border px-3 py-2 ${
          analysis.riskFlag === "RISK"
            ? "border-red-200 bg-red-50 text-red-900"
            : "border-emerald-200 bg-emerald-50 text-emerald-900"
        }`}
      >
        <p className="font-semibold">
          {analysis.riskFlag === "RISK"
            ? "AI detected possible risk in this session."
            : "AI did not detect self-harm or severe crisis language."}
        </p>
        {analysis.riskQuote && (
          <p className="mt-1 rounded bg-white/70 px-2 py-1 text-xs italic">
            “{analysis.riskQuote}”
          </p>
        )}
        <p className="mt-1 text-xs">{analysis.riskRationale}</p>
      </div>
    </div>
  );
}

function MetricCard(props: { label: string; score: number; rationale: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{props.label}</p>
      <p className="mt-1 text-base font-semibold text-slate-900">Score {props.score}/3</p>
      <p className="mt-1 text-xs text-slate-700">{props.rationale}</p>
    </div>
  );
}
