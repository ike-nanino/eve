// components/MobileNav.tsx
"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { sidebarLinks } from "@/constant";
import { Menu, LogOut } from "lucide-react";
import { toast } from "@/components/ui/toast";
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

export default function MobileNav() {
  const [open,    setOpen]    = useState(false);
  const [imgOpen, setImgOpen] = useState(false);
  const pathname              = usePathname();
  const router                = useRouter();

  const mainLinks   = sidebarLinks.filter(l => l.label !== "Settings");
  const bottomLinks = sidebarLinks.filter(l => l.label === "Settings");

  // const handleSignOut = async () => {
  //   setOpen(false);
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
        name="Princess Evenly"
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger>
          <button className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <Menu className="w-5 h-5 text-white" />
          </button>
        </SheetTrigger>

        <SheetContent side="left" className="w-70 border-none bg-white p-0 flex flex-col">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>

          {/* Header with clickable avatar */}
          <div className="flex flex-col items-center gap-2 px-5 pt-8 pb-5 border-b border-slate-100">
            <button
              onClick={() => {
                setOpen(false);
                setTimeout(() => setImgOpen(true), 200);
              }}
              className="relative group cursor-pointer"
              title="View profile photo"
            >
              <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden ring-2 ring-blue-100 group-hover:ring-blue-400 transition-all">
                <Image
                  src="/images/pp.png"
                  alt="User Avatar"
                  width={64}
                  height={64}
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-[9px] font-medium">View</span>
              </div>
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-800">Princess Evenly</p>
              <span className="text-xs text-slate-400">Premium Savings</span>
            </div>
          </div>

          {/* Main nav */}
          <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto px-3 py-3">
            {mainLinks.map((item) => {
              const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`);
              const Icon = item.icon;
              return (
                <SheetClose key={item.route}>
                  <Link
                    href={item.route}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all",
                      isActive
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    )}
                  >
                    <Icon size={17} className="shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </SheetClose>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="px-3 pb-6 pt-3 border-t border-slate-100 flex flex-col gap-0.5">
            {bottomLinks.map((item) => {
              const isActive = pathname === item.route;
              const Icon = item.icon;
              return (
                <SheetClose key={item.route}>
                  <Link
                    href={item.route}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    )}
                  >
                    <Icon size={17} className="shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </SheetClose>
              );
            })}

            <button
              // onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all w-full text-left"
            >
              <LogOut size={17} className="shrink-0" />
              <span>Sign out</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}