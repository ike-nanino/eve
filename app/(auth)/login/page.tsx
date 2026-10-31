import { Suspense } from "react";
import { Alert, AuthCard } from "@/components/auth-card";
import { LoginForm } from "./login-form";

// Messages for when another step sends the user back to /login?reason=...
const reasons: Record<string, string> = {
  expired: "Your verification session expired. Please sign in again.",
  locked: "Too many incorrect codes. Please sign in again to get a new one.",
};

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthCard title="Sign in" subtitle="Use your username or email and password.">
      {/* searchParams is request data, so with Cache Components it must sit inside <Suspense>. */}
      <Suspense>
        <ReasonNotice searchParams={searchParams} />
      </Suspense>
      <LoginForm />
    </AuthCard>
  );
}

async function ReasonNotice({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { reason } = await searchParams;
  const notice = typeof reason === "string" ? reasons[reason] : undefined;
  if (!notice) return null;
  return (
    <div className="mb-4">
      <Alert kind="error">{notice}</Alert>
    </div>
  );
}
