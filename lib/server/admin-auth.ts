import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "3d-store-admin-session";
const SESSION_MAX_AGE = 60 * 60 * 8;

type AdminSession = { email: string; expiresAt: number };

export function getAdminConfig() {
  return { email: process.env.ADMIN_EMAIL?.trim().toLowerCase(), password: process.env.ADMIN_PASSWORD, secret: process.env.ADMIN_SESSION_SECRET };
}

export function isAdminConfigured() {
  const config = getAdminConfig();
  return Boolean(config.email && config.password && config.secret);
}

function signature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createAdminToken(email: string) {
  const config = getAdminConfig();
  if (!config.secret) throw new Error("ADMIN_SESSION_SECRET não configurado.");
  const payload = `${email}.${Date.now() + SESSION_MAX_AGE * 1000}`;
  return `${payload}.${signature(payload, config.secret)}`;
}

export function verifyAdminToken(token: string | undefined): AdminSession | null {
  const config = getAdminConfig();
  if (!token || !config.email || !config.secret) return null;
  const parts = token.split(".");
  if (parts.length < 3) return null;
  const providedSignature = parts.pop() || "";
  const payload = parts.join(".");
  const expectedSignature = signature(payload, config.secret);
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;
  const separator = payload.lastIndexOf(".");
  const email = payload.slice(0, separator);
  const expiresAt = Number(payload.slice(separator + 1));
  if (email !== config.email || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;
  return { email, expiresAt };
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export const ADMIN_SESSION_MAX_AGE = SESSION_MAX_AGE;
