import Image from "next/image";
import Link from "next/link";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
         <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-semibold">
           <Image
                    src="/images/logoo1.png"
                    width={200}
                    height={60}
                    alt="logo"
                    className="object-cover mr-4"
                  />
        </Link>
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}

export function Alert({ kind, children }: { kind: "error" | "info"; children: React.ReactNode }) {
  const styles =
    kind === "error"
      ? "bg-red-50 text-red-700 ring-red-200"
      : "bg-emerald-50 text-emerald-700 ring-emerald-200";
  return (
    <p role={kind === "error" ? "alert" : "status"} className={`rounded-lg px-3 py-2 text-sm ring-1 ${styles}`}>
      {children}
    </p>
  );
}

export const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

export const buttonClass =
  "w-full rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60";
