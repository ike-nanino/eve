import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { getPendingLogin } from "@/lib/session";
import { findUserById } from "@/lib/users";
import { maskEmail } from "@/lib/mail";
import { VerifyForm } from "./verify-form";

export default function VerifyPage() {
  return (
    <AuthCard
      title="Check your email"
      subtitle={
        <>
          We sent a 6-digit code to{" "}
          <Suspense fallback="your email">
            <MaskedEmail />
          </Suspense>
          . It expires in 10 minutes.
        </>
      }
    >
      <VerifyForm />
    </AuthCard>
  );
}

// Reads the pending cookie (request data), so it is rendered inside <Suspense>.
async function MaskedEmail() {
  // The proxy already checked this, but pages check again themselves.
  const pending = await getPendingLogin();
  const user = pending ? findUserById(pending.sub) : undefined;
  if (!user) redirect("/login");
  return <span className="font-medium text-zinc-900">{maskEmail(user.email)}</span>;
}
