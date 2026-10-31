// components/marketing/Navbar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, Menu, X, PiggyBank, CreditCard,
  TrendingUp, Banknote, ArrowRight,
} from "lucide-react";

// ─── Products dropdown data ───────────────────────────────────────────────────

const PRODUCTS = [
  {
    icon: <PiggyBank  className="w-4 h-4" />,
    label:   "Savings",
    desc:    "High-yield accounts up to 4.65% APY",
    href:    "/savings",
    color:   "bg-emerald-100 text-emerald-600",
  },
  {
    icon: <CreditCard className="w-4 h-4" />,
    label:   "Cards",
    desc:    "Rewards cards with zero annual fee",
    href:    "/cards",
    color:   "bg-blue-100 text-blue-600",
  },
  {
    icon: <TrendingUp className="w-4 h-4" />,
    label:   "Investing",
    desc:    "Stocks, ETFs and crypto from $1",
    href:    "/investing",
    color:   "bg-purple-100 text-purple-600",
  },
  {
    icon: <Banknote   className="w-4 h-4" />,
    label:   "Loans",
    desc:    "Personal loans and mortgages",
    href:    "/loans",
    color:   "bg-amber-100 text-amber-600",
  },
];

const NAV_LINKS = [
  { label: "Features", href: "/#features"  },
  { label: "Pricing",  href: "/#pricing"   },
  { label: "About",    href: "/#about"     },
  { label: "Contact",  href: "/#contact"   },
];

// ─── Products dropdown ────────────────────────────────────────────────────────

function ProductsDropdown({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[340px] bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
    >
      <div className="p-2">
        {PRODUCTS.map(p => (
          <Link
            key={p.label}
            href={p.href}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors group"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${p.color}`}>
              {p.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                {p.label}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{p.desc}</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400 transition-colors shrink-0" />
          </Link>
        ))}
      </div>

      <div className="border-t border-slate-100 px-4 py-3 bg-slate-50 flex items-center justify-between">
        <p className="text-xs text-slate-400">All products are FDIC insured</p>
        <Link
          href="/sign-up"
          onClick={onClose}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Open account →
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Main navbar ──────────────────────────────────────────────────────────────

export default function Navbar() {
  const [scrolled,      setScrolled]      = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [productsOpen,  setProductsOpen]  = useState(false);
  const [mobileProducts,setMobileProducts]= useState(false);
  const dropdownRef                       = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProductsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navBase   = "fixed top-0 left-0 right-0 z-50 transition-all duration-300";
  const navBg     = scrolled || mobileOpen
    ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100"
    : "bg-transparent";

  const linkColor = scrolled || mobileOpen
    ? "text-slate-600 hover:text-slate-900"
    : "text-white/80 hover:text-white";

  const logoColor = scrolled || mobileOpen ? "text-slate-900" : "text-white";

  return (
    <>
      <header className={`${navBase} ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <Image
                        src="/images/logoo1.png"
                        alt=" logo"
                        width={156}
                        height={56}
                        className="rounded-2xl"
                        priority
                      />

            {/* ── Desktop nav ── */}
            <nav className="hidden lg:flex items-center gap-1">

              {/* Products dropdown trigger */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setProductsOpen(v => !v)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${linkColor}`}
                >
                  Products
                  <motion.div animate={{ rotate: productsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {productsOpen && (
                    <ProductsDropdown onClose={() => setProductsOpen(false)} />
                  )}
                </AnimatePresence>
              </div>

              {/* Regular links */}
              {NAV_LINKS.map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${linkColor}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* ── Desktop CTAs ── */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/login"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  scrolled
                    ? "text-slate-700 hover:bg-slate-100"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                Sign in
              </Link>
              <Link
                href="/#"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/25"
              >
                Open account
              </Link>
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className={`lg:hidden p-2 rounded-xl transition-colors ${
                scrolled || mobileOpen
                  ? "text-slate-700 hover:bg-slate-100"
                  : "text-white hover:bg-white/10"
              }`}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {mobileOpen
                  ? <motion.div key="x"    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X    className="w-5 h-5" /></motion.div>
                  : <motion.div key="menu" initial={{ rotate:  90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate:-90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu className="w-5 h-5" /></motion.div>}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-slate-100 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">

                {/* Products accordion */}
                <button
                  onClick={() => setMobileProducts(v => !v)}
                  className="w-full flex items-center justify-between px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Products
                  <motion.div animate={{ rotate: mobileProducts ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {mobileProducts && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden pl-3"
                    >
                      {PRODUCTS.map(p => (
                        <Link
                          key={p.label}
                          href={p.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${p.color}`}>
                            {p.icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">{p.label}</p>
                            <p className="text-xs text-slate-400">{p.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Regular links */}
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Mobile CTAs */}
                <div className="pt-3 space-y-2 border-t border-slate-100">
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full py-3 text-center text-sm font-medium border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full py-3 text-center text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors"
                  >
                    Open account
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}