import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  validateAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as { password?: string };
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!validateAdminPassword(password)) {
    return NextResponse.json({ message: "Invalid password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: createAdminSessionToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
