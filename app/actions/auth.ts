"use server";

/**
 * SERVER ACTIONS
 *
 * "use server" makes these functions run ONLY on the server. The forms call
 * them directly. Next.js turns each call into a POST request behind the scenes.
 * Passwords, codes and AUTH_SECRET never reach the browser's JavaScript.
 *
 * Flow:
 *   login()      password check -> email a code -> set "pending_2fa" cookie -> /verify
 *   verifyCode() check code     -> delete pending cookie -> set "session" cookie -> /dashboard
 *   resendCode() new random code, old one stops working
 *   logout()     delete cookies -> /
 *
 * Note: redirect() works by throwing a special error, so never call it inside a try/catch.
 */

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { findUserById, findUserByIdentifier, type User } from "@/lib/users";
import {
  attemptsLeft,
  codesMatch,
  endChallenge,
  generateCode,
  hashCode,
  newChallengeId,
  registerAttempt,
  startChallenge,
} from "@/lib/otp";
import { sendVerificationEmail } from "@/lib/mail";
import {
  createPendingLogin,
  createSession,
  deletePendingLogin,
  deleteSession,
  getPendingLogin,
} from "@/lib/session";
import { PENDING_TTL_SECONDS } from "@/lib/tokens";

export type FormState = { error?: string; message?: string; identifier?: string } | undefined;

// A valid bcrypt hash used when the user does not exist (see the timing note in login()).
const DUMMY_HASH = "$2b$10$VaMh.F9g6luG0KFmwp0yNeBVfFr4iCkWugCZMfAkSu1oT3dWLvrA.";
const RESEND_COOLDOWN_SECONDS = 30;

/** Create a fresh random code, email it, and set the pending cookie. */
async function startTwoFactor(user: User): Promise<string | null> {
  const code = generateCode();
  const challengeId = newChallengeId();

  try {
    await sendVerificationEmail(user.email, code);
  } catch (err) {
    console.error("Failed to send verification email:", err);
    return "We couldn't send the verification email. Please try again.";
  }

  startChallenge(challengeId, PENDING_TTL_SECONDS);
  await createPendingLogin({
    userId: user.id,
    challengeId,
    codeHash: hashCode(challengeId, code),
  });
  return null;
}

// ---------- Step 1: username/email + password ----------

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  // 1a. Validate input on the SERVER. Browser checks like `required` are easy to bypass.
  if (!identifier || !password) {
    return { error: "Enter your username or email and your password.", identifier };
  }
  if (identifier.length > 254 || password.length > 72) {
    return { error: "Invalid username/email or password.", identifier };
  }

  // 1b. Look the user up by username OR email.
  const user = findUserByIdentifier(identifier);

  // 1c. Check the password against the stored bcrypt hash.
  //     We run bcrypt even when the user does not exist. Otherwise "no such user"
  //     would answer faster than "wrong password", and an attacker could time
  //     responses to find out which usernames exist.
  const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  // 1d. Use ONE generic error for both cases, again so we don't reveal which accounts exist.
  if (!user || !passwordOk) {
    return { error: "Invalid username/email or password.", identifier };
  }

  // 1e. The password is correct, but the user is NOT logged in yet. Start the second factor.
  const error = await startTwoFactor(user);
  if (error) return { error, identifier };

  redirect("/verify");
}

// ---------- Step 2: email code ----------

export async function verifyCode(_prev: FormState, formData: FormData): Promise<FormState> {
  // 2a. The pending cookie must be valid: signed by us, not expired, audience "2fa-pending".
  const pending = await getPendingLogin();
  if (!pending) redirect("/login?reason=expired");

  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) {
    return { error: "Enter the 6-digit code from your email." };
  }

  // 2b. Count this guess in the server-side store, which stops brute-forcing.
  const status = registerAttempt(pending.jti);
  if (status !== "ok") {
    endChallenge(pending.jti);
    await deletePendingLogin();
    redirect(status === "locked" ? "/login?reason=locked" : "/login?reason=expired");
  }

  // 2c. Compare the code with the HMAC stored in the signed cookie.
  if (!codesMatch(pending.codeHash, pending.jti, code)) {
    const left = attemptsLeft(pending.jti);
    if (left === 0) {
      endChallenge(pending.jti);
      await deletePendingLogin();
      redirect("/login?reason=locked");
    }
    return { error: `Incorrect code. ${left} attempt${left === 1 ? "" : "s"} left.` };
  }

  const user = findUserById(pending.sub);
  if (!user) redirect("/login");

  // 2d. Success. The code is single-use, so remove the challenge and the pending cookie,
  //     then issue the real session.
  endChallenge(pending.jti);
  await deletePendingLogin();
  await createSession(user);

  redirect("/dashboard");
}

export async function resendCode(): Promise<FormState> {
  const pending = await getPendingLogin();
  if (!pending) redirect("/login?reason=expired");

  // Small cooldown so the button can't be used to spam someone's inbox.
  const secondsSinceIssued = Math.floor(Date.now() / 1000) - (pending.iat ?? 0);
  if (secondsSinceIssued < RESEND_COOLDOWN_SECONDS) {
    return { error: `Please wait ${RESEND_COOLDOWN_SECONDS - secondsSinceIssued}s before requesting a new code.` };
  }

  const user = findUserById(pending.sub);
  if (!user) redirect("/login");

  // Cancel the old challenge so its code stops working, then start a new one.
  endChallenge(pending.jti);
  const error = await startTwoFactor(user);
  if (error) return { error };

  return { message: "A new code has been sent. Earlier codes no longer work." };
}

// ---------- Sign out ----------

export async function logout() {
  // The server keeps no session state, so signing out means deleting the cookies.
  await deleteSession();
  await deletePendingLogin();
  redirect("/");
}
