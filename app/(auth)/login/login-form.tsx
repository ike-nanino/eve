"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { Alert, buttonClass, inputClass } from "@/components/auth-card";

/**
 * A client component only because useActionState needs the browser.
 * It holds no secrets: submitting the form calls the `login` server action,
 * and `state` is whatever that action returned (e.g. an error message).
 */
export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.error && <Alert kind="error">{state.error}</Alert>}

      <div className="space-y-1.5">
        <label htmlFor="identifier" className="text-sm font-medium">
          Username or email
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          required
          defaultValue={state?.identifier}
          className={inputClass}
          placeholder="demo or you@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Checking..." : "Continue"}
      </button>

      <p className="text-center text-xs text-zinc-500">
        Demo account: <span className="font-mono">demo</span> /{" "}
        <span className="font-mono">password123</span>
      </p>
    </form>
  );
}
