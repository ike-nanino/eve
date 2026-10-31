import "server-only";
import { createHmac, randomInt, randomUUID, timingSafeEqual } from "node:crypto";

/**
 * ONE-TIME CODES (the "second factor")
 *
 * 1. generateCode()  -> a fresh random 6-digit code on every login.
 *    We use crypto.randomInt, a cryptographically secure random number generator.
 *    Math.random() is NOT safe for this: its output can be predicted.
 *
 * 2. hashCode()      -> we never put the raw code in the cookie. We store
 *    HMAC-SHA256(AUTH_SECRET, challengeId + code).
 *    Why HMAC and not a plain SHA-256? There are only 1,000,000 possible codes.
 *    Anyone could hash all of them in milliseconds and match the hash in the
 *    (readable) JWT payload. An HMAC needs AUTH_SECRET, which only the server has.
 *    Mixing in the challengeId means the same code gives a different hash on each login.
 *
 * 3. codesMatch()    -> compares hashes in constant time (timingSafeEqual), so the
 *    response time does not leak how many characters were correct.
 *
 * 4. The challenge store -> limits guesses. A signed cookie alone cannot count
 *    attempts: an attacker could keep replaying the original cookie and guess
 *    forever. So we keep a small IN-MEMORY map of active challenges:
 *      challengeId -> { attempts, expiresAt }
 *    This is not a database: it lives in the server's RAM and is wiped on restart
 *    (which simply forces users to log in again). With several servers you would
 *    move this to Redis or a DB table.
 */

export const CODE_LENGTH = 6;
export const MAX_ATTEMPTS = 5;

export function generateCode(): string {
  // 0..999999, left-padded so "42" becomes "000042".
  return randomInt(0, 10 ** CODE_LENGTH).toString().padStart(CODE_LENGTH, "0");
}

export function newChallengeId(): string {
  return randomUUID();
}

export function hashCode(challengeId: string, code: string): string {
  return createHmac("sha256", process.env.AUTH_SECRET!)
    .update(`${challengeId}:${code}`)
    .digest("hex");
}

export function codesMatch(expectedHash: string, challengeId: string, submittedCode: string) {
  const a = Buffer.from(expectedHash, "hex");
  const b = Buffer.from(hashCode(challengeId, submittedCode), "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

// ---------- In-memory challenge store ----------

type Challenge = { attempts: number; expiresAt: number };

// Stored on globalThis so the map survives Next.js hot-reloads in development.
const globalStore = globalThis as unknown as { __otpChallenges?: Map<string, Challenge> };
const challenges = (globalStore.__otpChallenges ??= new Map<string, Challenge>());

function purgeExpired() {
  const now = Date.now();
  for (const [id, c] of challenges) if (c.expiresAt <= now) challenges.delete(id);
}

export function startChallenge(challengeId: string, ttlSeconds: number) {
  purgeExpired();
  challenges.set(challengeId, { attempts: 0, expiresAt: Date.now() + ttlSeconds * 1000 });
}

/**
 * Record one guess. Returns:
 *  - "ok"       the guess may be checked
 *  - "locked"   too many wrong guesses: the user must log in again
 *  - "unknown"  challenge already used, expired, or the server restarted
 */
export function registerAttempt(challengeId: string): "ok" | "locked" | "unknown" {
  purgeExpired();
  const c = challenges.get(challengeId);
  if (!c) return "unknown";
  if (c.attempts >= MAX_ATTEMPTS) return "locked";
  c.attempts += 1;
  return "ok";
}

export function attemptsLeft(challengeId: string): number {
  const c = challenges.get(challengeId);
  return c ? Math.max(0, MAX_ATTEMPTS - c.attempts) : 0;
}

/** Codes are single-use: delete the challenge once it succeeds or is replaced. */
export function endChallenge(challengeId: string) {
  challenges.delete(challengeId);
}
