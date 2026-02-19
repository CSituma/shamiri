import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const expectedEmail = (process.env.ADMIN_EMAIL ?? "admin@shamiri.local").toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "admin1234";

  if (email !== expectedEmail || password !== expectedPassword) {
    return NextResponse.json(
      { error: "Invalid email or password. Please try again." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set("mock_supervisor_auth", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
