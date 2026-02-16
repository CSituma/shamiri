import Link from "next/link";

type SessionListItem = {
  id: string;
  fellowName: string;
  groupCode: string;
  completedAt: string;
  status: string;
  riskFlag: "SAFE" | "RISK";
  hasReview: boolean;
};

async function fetchSessions(): Promise<SessionListItem[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const res = await fetch(`${baseUrl ?? ""}/api/sessions`, {
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.sessions ?? [];
}

function statusPill(status: string) {
  const map: Record<string, string> = {
    PENDING_ANALYSIS: "bg-slate-100 text-slate-700",
    PROCESSED: "bg-blue-100 text-blue-800",
    FLAGGED_FOR_REVIEW: "bg-amber-100 text-amber-800",
    SAFE: "bg-emerald-100 text-emerald-800",
    RISK: "bg-red-100 text-red-800",
    NEEDS_DISCUSSION: "bg-amber-100 text-amber-800",
  };

  return map[status] ?? "bg-slate-100 text-slate-700";
}

function riskBadge(status: string, riskFlag: "SAFE" | "RISK", compact = false) {
  const base = compact ? "text-[0.7rem]" : "text-xs";

  if (status === "PENDING_ANALYSIS") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600 ${base}`}
      >
        <span className="h-2 w-2 rounded-full bg-slate-400" />
        Pending analysis
      </span>
    );
  }

  if (riskFlag === "RISK") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 font-semibold text-red-800 ${base}`}
      >
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Risk
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-800 ${base}`}
    >
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      Safe
    </span>
  );
}

export default async function Home() {
  const sessions = await fetchSessions();
  const pendingCount = sessions.filter((s) => s.status === "PENDING_ANALYSIS").length;
  const reviewedCount = sessions.filter((s) => s.hasReview).length;

  return (
    <div className="flex w-full flex-col gap-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Completed Sessions
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Review Shamiri Fellow sessions with AI summaries, risk flags, and supervisor decisions.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
            Total sessions: <span className="font-semibold text-slate-900">{sessions.length}</span>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
            Pending analysis: <span className="font-semibold text-slate-900">{pendingCount}</span>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
            Reviewed: <span className="font-semibold text-slate-900">{reviewedCount}</span>
          </div>
        </div>
      </section>

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Fellow</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Group</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Date</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Risk</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sessions.map((session) => (
              <tr key={session.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{session.fellowName}</td>
                <td className="px-4 py-3 text-slate-700">{session.groupCode}</td>
                <td className="px-4 py-3 text-slate-700">
                  {new Date(session.completedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusPill(
                      session.status,
                    )}`}
                  >
                    {session.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {riskBadge(session.status, session.riskFlag)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/sessions/${session.id}`}
                    className="text-sm font-semibold text-slate-900 hover:text-slate-700"
                  >
                    {session.hasReview ? "View decision" : "Review session"}
                  </Link>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                  No sessions found for the current supervisor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {sessions.map((session) => (
          <Link
            key={session.id}
            href={`/sessions/${session.id}`}
            className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">{session.fellowName}</p>
                <p className="mt-0.5 text-xs text-slate-600">
                  Group {session.groupCode} • {new Date(session.completedAt).toLocaleString()}
                </p>
              </div>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-[0.7rem] font-medium ${statusPill(
                  session.status,
                )}`}
              >
                {session.status.replace(/_/g, " ")}
              </span>
            </div>

            <div className="mt-3">{riskBadge(session.status, session.riskFlag, true)}</div>

            <p className="mt-3 text-xs font-semibold text-slate-900">
              {session.hasReview ? "View decision" : "Review session"}
            </p>
          </Link>
        ))}

        {sessions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
            No sessions found for the current supervisor.
          </div>
        )}
      </div>
    </div>
  );
}
