import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "admin_session";

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("Missing ADMIN_PASSWORD.");
  }
  return password;
}

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing ADMIN_SESSION_SECRET.");
  }
  return secret;
}

function safeCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

export function validateAdminPassword(input: string) {
  return safeCompare(input, getAdminPassword());
}

export function createAdminSessionToken() {
  return createHmac("sha256", `${getSessionSecret()}:${getAdminPassword()}`)
    .update("engagement-party-admin-session")
    .digest("hex");
}

export function verifyAdminSessionToken(token: string | undefined) {
  if (!token) {
    return false;
  }

  return safeCompare(token, createAdminSessionToken());
}
