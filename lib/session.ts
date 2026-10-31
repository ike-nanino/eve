import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  PENDING_COOKIE,
  PENDING_TTL_SECONDS,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  signPendingToken,
  signSessionToken,
  verifyPendingToken,
  verifySessionToken,
} from "./tokens";

/**
 * COOKIES
 *
 * Tokens travel in cookies with these flags:
 *   httpOnly  -> JavaScript in the page cannot read the cookie, so an XSS bug
 *                cannot steal the session.
 *   secure    -> sent only over HTTPS (switched off on localhost, which is plain http).
 *   sameSite  -> "lax": not sent with cross-site POSTs, which blocks most CSRF attacks.
 *   path "/"  -> sent to every route.
 *   maxAge    -> the browser deletes the cookie when it expires. The JWT has its
 *                own `exp` too, which is what the server actually trusts.
 */

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

// ---------- Full session ----------

export async function createSession(user: { id: string; username: string }) {
  const token = await signSessionToken(user);
  (await cookies()).set(SESSION_COOKIE, token, { ...baseCookie, maxAge: SESSION_TTL_SECONDS });
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/**
 * DATA ACCESS LAYER CHECK
 *
 * Call this at the top of every protected page or server action.
 * proxy.ts already redirects logged-out users, but the proxy is only a first,
 * optimistic filter. The real check happens next to the data.
 * React's cache() makes repeat calls during one request run only once.
 */
export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session) redirect("/login");
  return { userId: session.sub, username: session.username };
});

// ---------- Pending 2FA ----------

export async function createPendingLogin(input: {
  userId: string;
  challengeId: string;
  codeHash: string;
}) {
  const token = await signPendingToken(input);
  (await cookies()).set(PENDING_COOKIE, token, { ...baseCookie, maxAge: PENDING_TTL_SECONDS });
}

export async function getPendingLogin() {
  const token = (await cookies()).get(PENDING_COOKIE)?.value;
  return verifyPendingToken(token);
}

export async function deletePendingLogin() {
  (await cookies()).delete(PENDING_COOKIE);
}
