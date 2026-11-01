// app/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Shield, Zap, Globe, Star, ArrowRight, Check,
  TrendingUp, Lock, Smartphone, CreditCard,
  PiggyBank, BarChart3, HeadphonesIcon, ChevronDown, Award, Users, DollarSign,
} from "lucide-react";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";

// ─── Hero background slides ───────────────────────────────────────────────────
// Each image changes in sync with the rotating word in the headline.
// Search these descriptions on Unsplash (unsplash.com) to find suitable photos.

const HERO_SLIDES = [
  {
    // Search: "person using laptop banking app modern home natural light"
    // Pick: a person sitting at a bright desk, phone or laptop in hand, relaxed and confident
    src:   "/images/smarter.jpg",
    word:  "Smarter.",
    alt:   "Person confidently managing their finances on a laptop at a bright modern home desk",
  },
  {
    // Search: "hands holding smartphone mobile payment contactless"
    // Pick: close-up of hands tapping phone on payment terminal, clean background
    src:   "/images/faster.jpg",
    word:  "Faster.",
    alt:   "Close-up of hands holding a smartphone making a contactless mobile payment",
  },
  {
    // Search: "bank vault door steel security finance professional"
    // Pick: dramatic shot of a heavy steel vault door, deep focus, moody lighting
    src:   "/images/safer.jpg",
    word:  "Safer.",
    alt:   "Dramatic close-up of a heavy steel bank vault door symbolising security and trust",
  },
  {
    // Search: "woman smiling phone financial app coffee shop lifestyle"
    // Pick: a young woman smiling at her phone in a cafe, warm ambient light
    src:   "/images/simpler.jpg",
    word:  "Simpler.",
    alt:   "Young woman smiling while using a banking app on her phone in a cosy coffee shop",
  },
];

// ─── Animated counter ─────────────────────────────────────────────────────────

function CountUp({ end, prefix = "", suffix = "", duration = 2000 }: {
  end: number; prefix?: string; suffix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start   = 0;
    const step  = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); return; }
      setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ─── Fade-in on scroll ────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
      {children}
    </span>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % HERO_SLIDES.length), 3000);
    return () => clearInterval(t);
  }, []);

  const slide = HERO_SLIDES[idx];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* ── Background image slideshow ── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Dark overlay — keeps text readable over any photo */}
          <div className="absolute inset-0 bg-black/45" />
          {/* Subtle blue tint for brand consistency */}
        
        </motion.div>
      </AnimatePresence>

      {/* ── Dot navigation ── */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="transition-all duration-300"
          >
            <motion.div
              animate={{ width: i === idx ? 24 : 8, opacity: i === idx ? 1 : 0.4 }}
              className="h-2 bg-white rounded-full"
            />
          </button>
        ))}
      </div>

      {/* ── Grid overlay ── */}
      <div className="absolute inset-0 z-10 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }} />

      {/* ── Content ── */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">

    

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white leading-[1.05] tracking-tight mb-4">
            Banking made{" "}
            <br className="hidden sm:block" />
            <AnimatePresence mode="wait">
              <motion.span
                key={idx}
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                transition={{ duration: 0.45 }}
                className="text-transparent bg-clip-text bg-linear-to-b from-blue-400 to-cyan-300 inline-block"
              >
                {slide.word}
              </motion.span>
            </AnimatePresence>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Chase Bank gives you the power to manage, grow, and protect your
          money — all from one beautifully simple dashboard.
          Open an account in minutes.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-20"
        >
          {/* <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-2xl text-sm transition-all hover:shadow-2xl hover:shadow-blue-500/30 group"
          >
            Open an account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link> */}
          {/* <button className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium px-8 py-4 rounded-2xl text-sm transition-all backdrop-blur-sm group">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Play className="w-3 h-3 fill-white ml-0.5" />
            </div>
            Watch demo
          </button> */}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden max-w-3xl mx-auto border border-white/10 backdrop-blur-sm"
        >
          {[
            { value: 2,    suffix: "M+", label: "Customers"        },
            { value: 99.9, suffix: "%",  label: "Uptime SLA"       },
            { value: 4.9,  suffix: "★",  label: "App Store rating" },
            { value: 10,  suffix: "+",  label: "Countries"        },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 px-6 py-5 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">
                <CountUp end={s.value} suffix={s.suffix} />
              </p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
            <ChevronDown className="w-5 h-5 text-white/30" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Social proof strip ───────────────────────────────────────────────────────

function SocialProof() {
  const logos = [
    // { name: "Forbes",      src: "/images/press/forbes.png"      },
    { name: "TechCrunch",  src: "/images/tc.png"  },
    { name: "Bloomberg",   src: "/images/bloomberg.png"   },
    { name: "NerdWallet",  src: "/images/nw.png"  },
    { name: "Bankrate",    src: "/images/br.png"    },
    { name: "WSJ",         src: "/images/wsj.png"         },
  ];

  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">
          As featured in
        </p>
        {/*
          For the press logos, search each name on Google Images:
          - "Forbes logo PNG transparent dark"
          - "TechCrunch logo PNG transparent"
          - "Bloomberg logo PNG dark transparent"
          - "NerdWallet logo PNG transparent"
          - "Bankrate logo PNG transparent"
          - "Wall Street Journal WSJ logo PNG dark"
          Download the dark/grey versions so they look consistent on white.
          Place them in /public/images/
        */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {logos.map((logo, i) => (
            <FadeIn key={logo.name} delay={i * 0.06}>
              <div className="relative h-7 w-24 grayscale opacity-40 hover:opacity-70 hover:grayscale-0 transition-all duration-300">
                <Image
                  src={logo.src}
                  alt={`${logo.name} logo — SecureBank featured in ${logo.name}`}
                  fill
                  className="object-contain"
                />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

function Features() {
  const features = [
    { icon: <Zap         className="w-5 h-5" />, color: "bg-amber-100  text-amber-600",  title: "Instant transfers",    desc: "Send money in seconds — domestic, international, or peer-to-peer. No delays, no excuses."       },
    { icon: <Shield      className="w-5 h-5" />, color: "bg-blue-100   text-blue-600",   title: "Bank-grade security",  desc: "256-bit encryption, biometric login, 2FA, and real-time fraud detection on every account."     },
    { icon: <TrendingUp  className="w-5 h-5" />, color: "bg-green-100  text-green-600",  title: "Smart investing",      desc: "Access stocks, ETFs, and crypto from $1. Our robo-advisor builds and rebalances automatically."},
    { icon: <Smartphone  className="w-5 h-5" />, color: "bg-purple-100 text-purple-600", title: "Mobile-first banking", desc: "Full banking power in your pocket. Deposit checks, pay bills, freeze cards — anywhere."           },
    { icon: <Globe       className="w-5 h-5" />, color: "bg-teal-100   text-teal-600",   title: "Global reach",         desc: "Multi-currency accounts, real exchange rates, and ATM access in 150+ countries worldwide."     },
    { icon: <BarChart3   className="w-5 h-5" />, color: "bg-rose-100   text-rose-600",   title: "Spending insights",    desc: "AI-powered analytics that track spending, flag waste, and help you hit your savings goals."     },
  ];

  return (
    <section id="features" className="py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <SectionLabel>Features</SectionLabel>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Everything you need.<br />Nothing you don&apos;t.
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            We built Chase Bank to be the only banking app you&apos;ll ever need.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.07}>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50/80 transition-all group h-full cursor-default">
                <div className={`w-11 h-11 rounded-2xl ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-base">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── App showcase ─────────────────────────────────────────────────────────────

function AppShowcase() {
  return (
    <section className="py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Text */}
          <FadeIn>
            <SectionLabel>The app</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
              Your entire bank in your pocket
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-8">
              Chase Bank app puts full banking control in your hands.
              Check balances, send money, deposit cheques, freeze cards,
              and track spending — all from one beautifully designed interface
              that works on any device.
            </p>
            <ul className="space-y-4 mb-10">
              {[
                "Biometric login — Face ID and fingerprint",
                "Instant push notifications for every transaction",
                "Mobile cheque deposit — just take a photo",
                "Real-time spending breakdown by category",
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-slate-700 text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <div className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold cursor-pointer hover:bg-slate-700 transition-colors">
                App Store
              </div>
              <div className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold cursor-pointer hover:bg-slate-700 transition-colors">
                Google Play
              </div>
            </div>
          </FadeIn>

          {/* Phone mockup image */}
          <FadeIn delay={0.15} className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Glow behind phone */}
              <div className="absolute inset-0 bg-blue-500/15 rounded-full blur-3xl scale-110" />
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                {/*
                  Search Unsplash: "iPhone banking app mockup hand holding phone screen dashboard"
                  Pick: a hand holding a modern iPhone displaying a clean finance/banking UI
                  Alternatively search: "smartphone finance app screen mockup white background"
                  Place at: /public/images/app-mockup.png
                  Ideal size: portrait, around 400×700px
                */}
                <div className="relative w-72 h-140 sm:w-80 sm:h-155">
                  <Image
                    src="/images/mockup1.png"
                    alt="Hand holding an iPhone displaying the SecureBank mobile banking dashboard with account balances and recent transactions"
                    fill
                    className="object-contain drop-shadow-2xl"
                  />
                </div>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─── Products showcase ────────────────────────────────────────────────────────

function Products() {
  const [active, setActive] = useState(0);

  const products = [
    {
      icon:     <PiggyBank  className="w-5 h-5" />,
      tab:      "Savings",
      title:    "High-yield savings that actually earns",
      desc:     "Earn up to 4.65% APY — 10× the national average. No minimum balance, no monthly fees, and your money is always accessible.",
      perks:    ["4.65% APY guaranteed", "No minimum balance", "FDIC insured to $250K", "Instant access anytime"],
      stat:     { value: "4.65%", label: "APY — 10× national average" },
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon:     <CreditCard className="w-5 h-5" />,
      tab:      "Cards",
      title:    "Rewards on every single purchase",
      desc:     "Our Platinum Visa gives you 3% cash back on dining, 2% groceries, 1% everything else — with zero annual fee.",
      perks:    ["Up to 3% cash back", "No annual fee", "Zero foreign transaction fees", "Virtual card for online safety"],
      stat:     { value: "3%",    label: "Cash back on dining" },
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      icon:     <TrendingUp className="w-5 h-5" />,
      tab:      "Investing",
      title:    "Invest from $1 with zero commission",
      desc:     "Access stocks, ETFs, index funds, and crypto. Our robo-advisor builds and rebalances your portfolio automatically.",
      perks:    ["$0 commission trades", "Fractional shares from $1", "Auto-rebalancing portfolio", "Real-time market data"],
      stat:     { value: "$0",    label: "Commission on every trade" },
      gradient: "from-purple-500 to-pink-600",
    },
    {
      icon:     <DollarSign className="w-5 h-5" />,
      tab:      "Loans",
      title:    "Flexible loans at rates you deserve",
      desc:     "Personal loans, mortgages, and auto loans with same-day decisions. Rates start at 8.9% APR with no prepayment penalties.",
      perks:    ["APR from 8.9%", "Same-day decisions", "No prepayment penalty", "Dedicated loan advisor"],
      stat:     { value: "8.9%",  label: "Starting APR" },
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  const p = products[active];

  return (
    <section id="products" className="py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-14">
          <SectionLabel>Products</SectionLabel>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            One bank, every financial need
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            From your first paycheck to your retirement — we have a product built for every stage.
          </p>
        </FadeIn>

        <div className="flex justify-center gap-2 mb-12 flex-wrap">
          {products.map((prod, i) => (
            <button
              key={prod.tab}
              onClick={() => setActive(i)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                active === i
                  ? "bg-slate-900 text-white shadow-lg scale-105"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {prod.icon}
              {prod.tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
          >
            <div>
              <h3 className="text-3xl font-extrabold text-slate-900 mb-4 leading-tight">{p.title}</h3>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed">{p.desc}</p>
              <ul className="space-y-3 mb-8">
                {p.perks.map(perk => (
                  <li key={perk} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-slate-700 font-medium text-sm">{perk}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all group"
              >
                Get started free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className={`bg-linear-to-br ${p.gradient} rounded-3xl p-8 text-white min-h-75 flex flex-col justify-between relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    {p.icon}
                  </div>
                  <span className="text-white/60 text-sm font-medium">{p.tab}</span>
                </div>
                <div className="mb-6">
                  <p className="text-white/70 text-sm mb-1">{p.stat.label}</p>
                  <p className="text-6xl font-extrabold tracking-tight">{p.stat.value}</p>
                </div>
              </div>
              <div className="relative z-10 flex flex-wrap gap-2">
                {p.perks.map(perk => (
                  <span key={perk} className="text-xs bg-white/10 border border-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full font-medium">
                    {perk}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── Team / human section ─────────────────────────────────────────────────────

function HumanSection() {
  return (
    <section className="py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Images grid */}
          <FadeIn className="grid grid-cols-2 gap-3">
            {/*
              Search these on Unsplash to find all four images:

              Top-left  (portrait, tall):
              Search: "diverse woman professional smiling office financial"
              Pick: a confident woman at a desk or in an office, warm lighting, genuine smile
              Place at: /public/images/team/team-1.jpg

              Top-right (portrait, shorter):
              Search: "man laptop coffee working remote finance professional"
              Pick: a man working on a laptop in a bright space, relaxed atmosphere
              Place at: /public/images/team/team-2.jpg

              Bottom-left (landscape):
              Search: "team meeting office collaboration diverse group"
              Pick: 3-4 people around a table, mixed backgrounds, engaged in discussion
              Place at: /public/images/team/team-3.jpg

              Bottom-right (portrait, tall):
              Search: "customer service woman headset smiling finance support"
              Pick: a woman with a headset smiling, professional but approachable
              Place at: /public/images/team/team-4.jpg
            */}
            <div className="space-y-3">
              <div className="relative h-64 rounded-2xl overflow-hidden">
                <Image
                  src="/images/team-1.jpg"
                  alt="Confident professional woman smiling at her desk in a modern financial services office"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="relative h-44 rounded-2xl overflow-hidden">
                <Image
                  src="/images/team-3.jpg"
                  alt="Diverse team of financial advisors collaborating around a meeting table in a bright modern office"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="space-y-3 mt-8">
              <div className="relative h-44 rounded-2xl overflow-hidden">
                <Image
                  src="/images/team-2.jpg"
                  alt="Professional man working on a laptop in a modern bright workspace with natural light"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="relative h-64 rounded-2xl overflow-hidden">
                <Image
                  src="/images/team-4.jpg"
                  alt="Friendly customer support specialist wearing a headset and smiling, ready to help banking customers"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </FadeIn>

          {/* Text */}
          <FadeIn delay={0.15}>
            <SectionLabel>Our people</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
              Talk to Us
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-6">
              We believe banking should feel personal. Behind every feature,
              every call, and every decision is a team of real people who genuinely
              care about your financial wellbeing.
            </p>
            <p className="text-slate-500 text-lg leading-relaxed mb-8">
              Our support team is available 24/7 — not just chatbots.
              Your dedicated account manager is a phone call away whenever you need them.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { value: "24/7",  label: "Live human support"    },
                { value: "< 2m",  label: "Average response time" },
                { value: "98%",   label: "Customer satisfaction" },
                { value: "500+",  label: "Team members globally" },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4">
                  <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <Link
              href="/#about"
              className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:gap-3 transition-all"
            >
              Meet the team <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

// function Pricing() {
//   const [annual, setAnnual] = useState(true);

//   const plans = [
//     {
//       name:      "Basic",
//       price:     { monthly: 0,  annual: 0  },
//       desc:      "Perfect for everyday banking",
//       perks:     ["Checking & savings account", "Debit card included", "Mobile banking app", "2 free wire transfers/mo", "Email support"],
//       cta:       "Get started free",
//       highlight: false,
//     },
//     {
//       name:      "Premium",
//       price:     { monthly: 9,  annual: 7  },
//       desc:      "For those who want more",
//       perks:     ["Everything in Basic", "4.65% APY savings", "Unlimited wire transfers", "Virtual cards", "Priority phone support", "Investment account"],
//       cta:       "Start 30-day trial",
//       highlight: true,
//     },
//     {
//       name:      "Business",
//       price:     { monthly: 29, annual: 22 },
//       desc:      "Built for growing businesses",
//       perks:     ["Everything in Premium", "Business checking", "Multi-user access (5 seats)", "Expense management", "Payroll integration", "Dedicated manager"],
//       cta:       "Contact sales",
//       highlight: false,
//     },
//   ];

//   return (
//     <section id="pricing" className="py-28 bg-slate-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <FadeIn className="text-center mb-14">
//           <SectionLabel>Pricing</SectionLabel>
//           <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
//             Simple, transparent pricing
//           </h2>
//           <p className="text-slate-500 text-lg mb-8">No hidden fees. No surprises. Cancel any time.</p>

//           <div className="inline-flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
//             <button
//               onClick={() => setAnnual(false)}
//               className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${!annual ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}
//             >
//               Monthly
//             </button>
//             <button
//               onClick={() => setAnnual(true)}
//               className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${annual ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}
//             >
//               Annual
//               <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold">-20%</span>
//             </button>
//           </div>
//         </FadeIn>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//           {plans.map((plan, i) => (
//             <FadeIn key={plan.name} delay={i * 0.1}>
//               <div className={`relative rounded-2xl p-7 h-full flex flex-col ${
//                 plan.highlight
//                   ? "bg-slate-900 text-white ring-2 ring-blue-500 shadow-2xl shadow-blue-500/10 scale-[1.02]"
//                   : "bg-white border border-slate-200"
//               }`}>
//                 {plan.highlight && (
//                   <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
//                     <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
//                       Most popular
//                     </span>
//                   </div>
//                 )}
//                 <div className="mb-6">
//                   <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${plan.highlight ? "text-blue-400" : "text-blue-600"}`}>
//                     {plan.name}
//                   </p>
//                   <div className="flex items-baseline gap-1 mb-1">
//                     <AnimatePresence mode="wait">
//                       <motion.span
//                         key={annual ? "annual" : "monthly"}
//                         initial={{ opacity: 0, y: 8 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -8 }}
//                         className={`text-5xl font-extrabold ${plan.highlight ? "text-white" : "text-slate-900"}`}
//                       >
//                         ${annual ? plan.price.annual : plan.price.monthly}
//                       </motion.span>
//                     </AnimatePresence>
//                     <span className={`text-sm ${plan.highlight ? "text-white/40" : "text-slate-400"}`}>/mo</span>
//                   </div>
//                   <p className={`text-sm ${plan.highlight ? "text-white/50" : "text-slate-500"}`}>{plan.desc}</p>
//                 </div>
//                 <ul className="space-y-3 flex-1 mb-8">
//                   {plan.perks.map(perk => (
//                     <li key={perk} className="flex items-start gap-2.5 text-sm">
//                       <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${plan.highlight ? "bg-blue-500/20" : "bg-green-100"}`}>
//                         <Check className={`w-2.5 h-2.5 ${plan.highlight ? "text-blue-300" : "text-green-600"}`} />
//                       </div>
//                       <span className={plan.highlight ? "text-white/70" : "text-slate-600"}>{perk}</span>
//                     </li>
//                   ))}
//                 </ul>
//                 <Link
//                   href="/sign-up"
//                   className={`w-full py-3.5 text-center rounded-xl text-sm font-bold transition-all block ${
//                     plan.highlight
//                       ? "bg-blue-600 hover:bg-blue-500 text-white"
//                       : "bg-slate-100 hover:bg-slate-200 text-slate-800"
//                   }`}
//                 >
//                   {plan.cta}
//                 </Link>
//               </div>
//             </FadeIn>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// ─── Testimonials ─────────────────────────────────────────────────────────────

function Testimonials() {
  const reviews = [
    { name: "Jules K.",  role: "Small business owner", rating: 5, text: "Switched from my old bank after 12 years. The transfer speeds and savings rate alone are worth it — wish I'd done it sooner." },
    { name: "Marcus T.", role: "Freelance designer",    rating: 5, text: "Managing multiple currencies used to be a nightmare. Valemont Crest Investment Bank makes it effortless with real rates and absolutely zero fees." },
    { name: "Priya M.",  role: "Software engineer",     rating: 5, text: "Started investing with $50 in fractional shares. The robo-advisor built me a properly diversified portfolio automatically." },
    { name: "James O.",  role: "Retired teacher",       rating: 5, text: "4.65% APY is genuinely unbeatable. My money actually grows now instead of sitting in an account earning next to nothing." },
    { name: "Elena R.",  role: "Marketing director",    rating: 5, text: "The spending insights showed me I was burning $400/mo on forgotten subscriptions. Saved me money in the first week." },
    { name: "David L.",  role: "E-commerce seller",     rating: 5, text: "The business account and multi-user access are incredible. My whole team uses it and the expense management is seamless." },
  ];

  return (
    <section className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <SectionLabel>Testimonials</SectionLabel>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Loved by over 2 million customers
          </h2>
          <div className="flex items-center justify-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
            ))}
            <span className="text-slate-500 text-sm ml-2 font-medium">
              4.9 · 142,000+ verified reviews
            </span>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <FadeIn key={r.name} delay={i * 0.07}>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all h-full">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-5">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{r.name}</p>
                    <p className="text-xs text-slate-400">{r.role}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Trust bar ────────────────────────────────────────────────────────────────

function TrustBar() {
  const items = [
    { icon: <Shield         className="w-5 h-5 text-blue-400"   />, label: "FDIC Insured",           sub: "Up to $250,000 per depositor"  },
    { icon: <Lock           className="w-5 h-5 text-green-400"  />, label: "256-bit Encryption",     sub: "Bank-grade security always on" },
    { icon: <Award          className="w-5 h-5 text-amber-400"  />, label: "Best Digital Bank 2024", sub: "Forbes, NerdWallet & Bankrate" },
    { icon: <Users          className="w-5 h-5 text-purple-400" />, label: "2M+ Customers",          sub: "And growing every single day"  },
    { icon: <HeadphonesIcon className="w-5 h-5 text-rose-400"   />, label: "24/7 Live Support",      sub: "Real humans, not just chatbots"},
  ];

  return (
    <section className="py-16 bg-slate-900 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {items.map((item, i) => (
            <FadeIn key={item.label} delay={i * 0.08}>
              <div className="flex flex-col items-center text-center gap-2.5">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{item.label}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{item.sub}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    { q: "Is Chase Bank a real FDIC-insured bank?",         a: "Yes. Chase Bank is a federally chartered bank, FDIC-insured up to $250,000 per depositor. Your deposits are protected by the full faith of the US government — the same protection as any major bank." },
    { q: "How long does it take to open an account?",       a: "Most accounts are fully open in under 5 minutes. You'll need a government-issued ID and your Social Security number. There's no paperwork and no branch visit required." },
    { q: "Are there any monthly or hidden fees?",           a: "Our Basic plan is completely free — no monthly fees, no minimum balance, no surprises. Premium and Business plans have a flat monthly fee with a free 30-day trial." },
    { q: "How does the 4.65% APY savings rate work?",       a: "Your entire savings balance earns 4.65% APY, compounded daily and credited to your account monthly. There are no rate tiers — everyone earns the same rate from dollar one." },
    { q: "What happens to my money if Chase Bank closes?",  a: "All deposits are FDIC-insured up to $250,000 per depositor. Beyond that, Chase Bank maintains capital reserves significantly above the regulatory minimum." },
    { q: "Can I use Chase Bank outside the United States?", a: "Yes. Our debit and credit cards work in 150+ countries with no foreign transaction fees. International wire transfers are available to 80+ countries with real mid-market exchange rates." },
  ];

  return (
    <section id="about" className="py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-14">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Honest answers
          </h2>
          <p className="text-slate-500 text-lg">Everything you need to know before you open an account.</p>
        </FadeIn>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                >
                  <span className="text-sm font-bold text-slate-800">{faq.q}</span>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-200 pt-4">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}



// ─── Page assembly ────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <SocialProof />
      <Features />
      <AppShowcase />
      <Products />
      <HumanSection />
      {/* <Pricing /> */}
      <Testimonials />
      <TrustBar />
      <FAQ />
      <Footer />
    </main>
  );
}