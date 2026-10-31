"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resendCode, verifyCode } from "@/app/actions/auth";
import { Alert, buttonClass, inputClass } from "@/components/auth-card";

export function VerifyForm() {
  const [verifyState, verifyAction, verifying] = useActionState(verifyCode, undefined);
  const [resendState, resendAction, resending] = useActionState(resendCode, undefined);

  return (
    <div className="space-y-4">
      {verifyState?.error && <Alert kind="error">{verifyState.error}</Alert>}
      {resendState?.error && <Alert kind="error">{resendState.error}</Alert>}
      {resendState?.message && <Alert kind="info">{resendState.message}</Alert>}

      <form action={verifyAction} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="code" className="text-sm font-medium">
            Verification code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            autoFocus
            placeholder="123456"
            className={`${inputClass} text-center font-mono text-2xl tracking-[0.5em]`}
          />
        </div>
        <button type="submit" disabled={verifying} className={buttonClass}>
          {verifying ? "Verifying..." : "Verify and continue"}
        </button>
      </form>

      <div className="flex items-center justify-between text-sm">
        <form action={resendAction}>
          <button
            type="submit"
            disabled={resending}
            className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-60"
          >
            {resending ? "Sending..." : "Resend code"}
          </button>
        </form>
        <Link href="/login" className="text-zinc-500 hover:text-zinc-700">
          Use a different account
        </Link>
      </div>
    </div>
  );
}
