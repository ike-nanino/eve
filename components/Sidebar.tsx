// components/Sidebar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { sidebarLinks } from "@/constant";
import { useState } from "react";
import ProfileImageModal from "./ProfileImageModal";

// async function signOutUser(router: ReturnType<typeof useRouter>) {
//   await fetch("/api/session", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ action: "destroy" }),
//   });
//   const { auth }    = await import("@/lib/firebase");
//   const { signOut } = await import("firebase/auth");
//   await signOut(auth);
//   router.push("/sign-in");
// }

export default function Sidebar() {
  const pathname        = usePathname();
  const router          = useRouter();
  const [imgOpen, setImgOpen] = useState(false);

  const mainLinks   = sidebarLinks.filter(l => l.label !== "Settings");
  const bottomLinks = sidebarLinks.filter(l => l.label === "Settings");

  // const handleSignOut = async () => {
  //   toast.promise(signOutUser(router), {
  //     loading: "Signing out…",
  //     success: "Signed out successfully",
  //     error:   "Sign out failed",
  //   });
  // };

  return (
    <>
      <ProfileImageModal
        open={imgOpen}
        onClose={() => setImgOpen(false)}
        src="/images/pp.png"
        name="Nancy Berry"
      />

      <aside className="w-[220px] min-h-screen bg-white border-r border-slate-100 px-3 py-5 flex flex-col max-md:hidden">

        {/* User profile */}
        <div className="flex flex-col items-center gap-2 mb-6 pb-5 border-b border-slate-100">
          <button
            onClick={() => setImgOpen(true)}
            className="relative group cursor-pointer"
            title="View profile photo"
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden ring-2 ring-blue-100 transition-all group-hover:ring-blue-400">
              <Image
                src="/images/pp.png"
                alt="User Avatar"
                width={56}
                height={56}
                className="object-cover w-full h-full transition-transform group-hover:scale-105"
              />
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-2xl bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-[9px] font-medium">View</span>
            </div>
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-800">Nancy Berry</p>
            <span className="text-[11px] text-slate-400">Premium Savings</span>
          </div>
        </div>

        {/* Main nav */}
        <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
          {mainLinks.map((item) => {
            const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.route}
                href={item.route}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-xl transition-all",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                )}
              >
                <Icon size={16} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: settings + logout */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-0.5">
          {bottomLinks.map((item) => {
            const isActive = pathname === item.route;
            const Icon = item.icon;
            return (
              <Link
                key={item.route}
                href={item.route}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-xl transition-all",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                )}
              >
                <Icon size={16} className="shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            // onClick={handleSignOut}
            className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all w-full text-left"
          >
            <LogOut size={16} className="shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}