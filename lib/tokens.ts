import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/**
 * TOKENS (JWTs)
 *
 * Without a database we can't store "who is logged in" on the server.
 * Instead we give the browser a SIGNED token (a JWT) inside a cookie.
 *
 *   header.payload.signature
 *
 * - The payload is readable by anyone (it's just base64), so never put secrets in it.
 * - The signature is an HMAC of header+payload using AUTH_SECRET. Only the server
 *   knows AUTH_SECRET, so only the server can create a valid signature. If a user
 *   edits the payload (e.g. changes their userId), the signature no longer matches
 *   and jwtVerify() rejects it.
 *
 * We use TWO kinds of token, told apart by the `aud` (audience) claim:
 *
 *   "2fa-pending" -> password was correct, but the email code is not entered yet.
 *                    Only lets you reach /verify. Short-lived (10 min).
 *   "session"     -> fully logged in (password + code). Lets you reach /dashboard.
 *
 * Checking the audience is critical: without it, a pending token could be
 * presented as a session token and skip 2FA entirely.
 *
 * This file is imported by proxy.ts as well as server code, so it must not
 * import anything that only works inside React Server Components.
 */

export const SESSION_COOKIE = "session";
export const PENDING_COOKIE = "pending_2fa";

export const SESSION_TTL_SECONDS = 60 * 60; // 1 hour
export const PENDING_TTL_SECONDS = 10 * 60; // 10 minutes

const ISSUER = "learningauth";
const SESSION_AUDIENCE = "session";
const PENDING_AUDIENCE = "2fa-pending";

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET is missing or too short (need 32+ chars). See .env.example");
  }
  return new TextEncoder().encode(secret);
}

// ---------- Session token (fully authenticated) ----------

export type SessionPayload = JWTPayload & {
  sub: string; // user id
  username: string;
};

export async function signSessionToken(user: { id: string; username: string }) {
  return new SignJWT({ username: user.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuer(ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

/** Returns the payload if the token is valid, otherwise null. Never throws. */
export async function verifySessionToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, getSecretKey(), {
      issuer: ISSUER,
      audience: SESSION_AUDIENCE,
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    // Bad signature, expired, wrong audience, malformed... all mean "not logged in".
    return null;
  }
}

// ---------- Pending-2FA token (password OK, code not yet entered) ----------

export type PendingPayload = JWTPayload & {
  sub: string; // user id
  jti: string; // unique id for this login attempt (the "challenge id")
  codeHash: string; // HMAC of the 6-digit code. NOT the code itself.
};

export async function signPendingToken(input: {
  userId: string;
  challengeId: string;
  codeHash: string;
}) {
  return new SignJWT({ codeHash: input.codeHash })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.userId)
    .setJti(input.challengeId)
    .setIssuer(ISSUER)
    .setAudience(PENDING_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${PENDING_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyPendingToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<PendingPayload>(token, getSecretKey(), {
      issuer: ISSUER,
      audience: PENDING_AUDIENCE,
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}
