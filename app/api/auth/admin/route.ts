import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE, createAdminToken, getAdminConfig, isAdminConfigured } from "@/lib/server/admin-auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as { email?: string; password?: string };
  const config = getAdminConfig();
  if (!isAdminConfigured()) return NextResponse.json({ error: "Acesso administrativo não configurado no servidor." }, { status: 503 });
  if (body.email?.trim().toLowerCase() !== config.email || body.password !== config.password) return NextResponse.json({ error: "E-mail ou senha administrativa inválidos." }, { status: 401 });
  const response = NextResponse.json({ user: { name: "Administrador", email: config.email, isAdmin: true } });
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminToken(config.email!), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: ADMIN_SESSION_MAX_AGE });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
