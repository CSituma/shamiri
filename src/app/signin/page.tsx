import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function SignInPage() {
  const cookieStore = await cookies();
  const alreadySignedIn = cookieStore.get("mock_supervisor_auth")?.value === "1";
  if (alreadySignedIn) {
    redirect("/");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Shamiri Supervisor Copilot
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        Mock sign in
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        This demo uses a mock Tier 2 Supervisor account. Continue to access the dashboard.
      </p>

      <form action="/api/auth/mock-signin" method="POST" className="mt-5">
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Continue as Tier 2 Supervisor
        </button>
      </form>
    </div>
  );
}
