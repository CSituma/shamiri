import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SignInForm } from "./SignInForm";

export default async function SignInPage() {
  const cookieStore = await cookies();
  const alreadySignedIn = cookieStore.get("mock_supervisor_auth")?.value === "1";
  if (alreadySignedIn) {
    redirect("/");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col rounded-2xl border border-[var(--brand--neutrals--stroke-grey)] bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--brand--color--lilac-purple)" }}>
        Shamiri Supervisor Review Tool
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight" style={{ color: "var(--text--default--black--navy-blue)" }}>
        Admin sign in
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Sign in with the configured admin email and password to access the dashboard.
      </p>
      <SignInForm />
    </div>
  );
}
