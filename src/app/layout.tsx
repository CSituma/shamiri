import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
          <header className="border-b border-slate-800 bg-slate-900 text-slate-50">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <div className="relative h-8 w-8 rounded-md bg-slate-100">
                  <span className="absolute left-1 top-1 h-2 w-2 rotate-45 bg-lime-400" />
                  <span className="absolute right-1 bottom-1 h-2 w-2 rotate-45 bg-blue-700" />
                </div>
                <div>
                  <div className="text-base font-semibold leading-tight tracking-wide text-white sm:text-lg">
                    Shamiri Institute
                  </div>
                  <div className="text-xs text-slate-300">Supervisor Copilot</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs sm:flex-col sm:items-end sm:gap-1">
                <div className="rounded-full bg-slate-800 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-wide text-slate-100">
                  Tier 2 Supervisor
                </div>
                <div className="text-[0.7rem] text-slate-400">Mock account for demo</div>
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
