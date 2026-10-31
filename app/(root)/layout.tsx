"use client";

import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

    <main className="relative flex h-screen max-h-screen w-full overflow-hidden">

      {/* Sidebar */}
      <Sidebar />

      {/* Mobile Header */}
      <div className="absolute bg-blue-700 z-50 inset-0 flex h-16 items-center justify-between p-5 sm:p-8 md:hidden">
        <MobileNav />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
        <Toaster position="top-right" richColors />
      </div>

    </main>
  );
}