import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shamiri Supervisor Copilot",
  description:
    "Dashboard for Tier 2 Supervisors to review Shamiri Fellow group sessions with AI-assisted insights.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isSignedIn = cookieStore.get("mock_supervisor_auth")?.value === "1";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
          <header className="border-b border-[var(--brand--neutrals--stroke-grey)] bg-[var(--brand--neutrals--off-white-background)]">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <Link href="/" className="flex items-center gap-2 transition-colors hover:opacity-90">
                <Image
                  src="/logo.png"
                  alt="Shamiri"
                  width={120}
                  height={36}
                  className="h-8 w-auto object-contain sm:h-9"
                  priority
                />
                <span className="text-sm font-medium text-[var(--brand--color--lilac-purple)]">
                  Supervisor Copilot
                </span>
              </Link>
              <div className="flex items-center gap-3 text-xs sm:items-center">
                <span className="rounded-full bg-[var(--brand--neutrals--card-grey)] px-3 py-1 text-[0.7rem] font-medium uppercase tracking-wide" style={{ color: "var(--text--default--black--navy-blue)" }}>
                  Tier 2 Supervisor
                </span>
                {isSignedIn && (
                  <form action="/api/auth/signout" method="POST">
                    <button
                      type="submit"
                      className="btn-cta rounded-full px-4 py-2 text-[0.75rem] font-semibold disabled:opacity-70"
                    >
                      Sign out
                    </button>
                  </form>
                )}
              </div>
            </div>
          </header>
          <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-5 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
