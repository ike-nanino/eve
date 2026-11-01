// app/(root)/virtual-card/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Settings, Eye, EyeOff, Plus, Smartphone,
  CreditCard, Globe, Lock, ChevronRight, X, Check,
  AlertTriangle, Bell, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import DynamicDate from "@/components/DynamicDate";
import VirtualCreditCard from "@/components/VirtualCreditCard";
import { toast } from "@/components/ui/toast";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface CardData {
  id: string;
  cardType: "visa" | "mastercard";
  cardHolder: string;
  lastFour: string;
  fullNumber: string;
  expiry: string;
  cvv: string;
  limit: number;
  available: number;
  bgGradient: string;
  pin: string;
  name: string;
  settings: {
    contactless: boolean;
    international: boolean;
    onlinePurchases: boolean;
    atmWithdrawals: boolean;
  };
  transactions: {
    id: number;
    date: string;
    description: string;
    amount: number;
    category: string;
  }[];
}

const initialCards: CardData[] = [
  {
    id: "1",
    name: "Platinum Rewards Visa",
    cardType: "visa",
    cardHolder: "Nancy Berry",
    lastFour: "6420",
    fullNumber: "4532 1748 3291 6420",
    expiry: "10/25",
    cvv: "357",
    limit: 10000,
    available: 8500,
    bgGradient: "bg-gradient-to-br from-purple-600 to-indigo-500",
    pin: "1234",
    settings: {
      contactless: true,
      international: false,
      onlinePurchases: true,
      atmWithdrawals: true,
    },
    transactions: [
      { id: 1, date: "Apr 20", description: "Restaurant",      amount: 84.20,  category: "Dining"          },
      { id: 2, date: "Apr 18", description: "Online Shopping", amount: 129.99, category: "Shopping"         },
      { id: 3, date: "Apr 15", description: "Gas Station",     amount: 45.75,  category: "Transportation"   },
      { id: 4, date: "Apr 12", description: "Netflix",         amount: 15.99,  category: "Entertainment"    },
    ],
  },
  {
    id: "2",
    name: "Cash Back Mastercard",
    cardType: "mastercard",
    cardHolder: "Nancy Berry",
    lastFour: "1148",
    fullNumber: "5412 7534 9821 1148",
    expiry: "09/27",
    cvv: "842",
    limit: 7000,
    available: 2500,
    bgGradient: "bg-gradient-to-br from-yellow-500 to-red-500",
    pin: "5678",
    settings: {
      contactless: true,
      international: true,
      onlinePurchases: true,
      atmWithdrawals: false,
    },
    transactions: [
      { id: 1, date: "Apr 19", description: "Grocery Store",      amount: 152.37, category: "Shopping"      },
      { id: 2, date: "Apr 16", description: "Streaming Service",  amount: 14.99,  category: "Entertainment" },
      { id: 3, date: "Apr 10", description: "Pharmacy",           amount: 38.50,  category: "Health"        },
    ],
  },
];

// ─── Setting toggle row ───────────────────────────────────────────────────────

function SettingRow({
  icon, label, sublabel, enabled, onToggle, dangerous,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  enabled: boolean;
  onToggle: () => void;
  dangerous?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${enabled ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">{label}</p>
          <p className="text-xs text-slate-400">{sublabel}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? (dangerous ? "bg-red-500" : "bg-blue-500") : "bg-slate-200"}`}
      >
        <motion.div
          animate={{ x: enabled ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
        />
      </button>
    </div>
  );
}

// ─── Spend limit modal ────────────────────────────────────────────────────────

function SpendLimitModal({ card, onClose }: { card: CardData; onClose: () => void }) {
  const [daily,   setDaily]   = useState("500");
  const [monthly, setMonthly] = useState("3000");
  const [saved,   setSaved]   = useState(false);

  const save = () => {
    setSaved(true);
    toast.success("Spend limits updated");
    setTimeout(onClose, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
          <p className="font-semibold text-slate-800">Spend limits — {card.name}</p>
          <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          {[
            { label: "Daily limit ($)",   value: daily,   set: setDaily   },
            { label: "Monthly limit ($)", value: monthly, set: setMonthly },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs text-slate-500 block mb-1">{f.label}</label>
              <input
                type="text"
                value={f.value}
                onChange={e => f.set(e.target.value.replace(/[^0-9]/g, ""))}
                style={{ fontSize: "16px" }}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}
          <button
            onClick={save}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            {saved ? <><Check className="w-4 h-4" /> Saved</> : "Save limits"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Report card modal ────────────────────────────────────────────────────────

function ReportModal({ card, onClose }: { card: CardData; onClose: () => void }) {
  const [reason,    setReason]    = useState("");
  const [submitted, setSubmitted] = useState(false);

  const reasons = ["Card lost", "Card stolen", "Suspicious transaction", "Card damaged", "Never received"];

  const submit = () => {
    if (!reason) return;
    setSubmitted(true);
    toast.error("Card reported", { description: "Your card has been blocked. A replacement will arrive in 3–5 business days." });
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-red-500 px-5 py-4 text-white flex justify-between items-center">
          <div>
            <p className="font-semibold">Report this card</p>
            <p className="text-xs opacity-80 mt-0.5">Card will be blocked immediately</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 opacity-70" /></button>
        </div>
        {submitted ? (
          <div className="py-10 flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm font-medium text-slate-700">Card reported & blocked</p>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-3">
            <p className="text-xs text-slate-500">Select a reason</p>
            <div className="space-y-2">
              {reasons.map(r => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${reason === r ? "border-red-400 bg-red-50 text-red-700 font-medium" : "border-slate-200 hover:bg-slate-50 text-slate-700"}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={submit} disabled={!reason} className="flex-1 h-10 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium transition-all">
                Report card
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function VirtualCardPage() {
  const [cards,       setCards]       = useState<CardData[]>(initialCards);
  const [activeCard,  setActiveCard]  = useState(0);
  const [hideBalance, setHideBalance] = useState(false);
  const [modal,       setModal]       = useState<"limit" | "report" | null>(null);

  const card = cards[activeCard];

  const toggleSetting = (key: keyof CardData["settings"]) => {
    setCards(prev => prev.map((c, i) => {
      if (i !== activeCard) return c;
      const next = { ...c.settings, [key]: !c.settings[key] };
      toast.success(
        `${key === "contactless" ? "Contactless payments" : key === "international" ? "International transactions" : key === "onlinePurchases" ? "Online purchases" : "ATM withdrawals"} ${next[key] ? "enabled" : "disabled"}`
      );
      return { ...c, settings: next };
    }));
  };

  const usedCredit = card.limit - card.available;
  const usagePct   = Math.round((usedCredit / card.limit) * 100);

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8 mt-16 md:mt-0">
      <AnimatePresence>
        {modal === "limit"  && <SpendLimitModal card={card} onClose={() => setModal(null)} />}
        {modal === "report" && <ReportModal     card={card} onClose={() => setModal(null)} />}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Cards</h1>
            <DynamicDate />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setHideBalance(v => !v)}
              className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
            >
              {hideBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <Link href="/notifications" className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
              <Bell className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Card selector tabs */}
        <div className="flex gap-2">
          {cards.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActiveCard(i)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border transition-all ${activeCard === i ? "bg-white border-blue-300 text-blue-700 shadow-sm" : "bg-transparent border-slate-200 text-slate-500 hover:bg-white"}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* The card itself */}
        <AnimatePresence mode="wait">
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <VirtualCreditCard
              cardType={card.cardType}
              cardHolder={card.cardHolder}
              lastFour={card.lastFour}
              fullNumber={card.fullNumber}
              expiry={card.expiry}
              cvv={card.cvv}
              limit={card.limit}
              available={card.available}
              bgGradient={card.bgGradient}
              pin={card.pin}
            />
          </motion.div>
        </AnimatePresence>

        {/* Credit usage */}
        <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Credit used</span>
            <span className="font-medium text-slate-800">
              {hideBalance ? "••••" : `$${usedCredit.toLocaleString()}`} of {hideBalance ? "••••" : `$${card.limit.toLocaleString()}`}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${usagePct > 80 ? "bg-red-500" : usagePct > 50 ? "bg-amber-400" : "bg-blue-500"}`}
              initial={{ width: 0 }}
              animate={{ width: `${usagePct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Available: <span className="text-slate-700 font-medium">{hideBalance ? "••••" : `$${card.available.toLocaleString()}`}</span></span>
            <span className={usagePct > 80 ? "text-red-500 font-medium" : usagePct > 50 ? "text-amber-500" : "text-blue-500"}>{usagePct}% used</span>
          </div>
        </div>

        {/* Quick card actions */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Spend limits",    icon: <Shield    className="w-4 h-4" />, action: () => setModal("limit"),  color: "text-blue-600   bg-blue-50   hover:bg-blue-100"   },
            { label: "Report card",     icon: <AlertTriangle className="w-4 h-4" />, action: () => setModal("report"), color: "text-red-600    bg-red-50    hover:bg-red-100"    },
            { label: "Pay balance",     icon: <ArrowUpRight  className="w-4 h-4" />, action: () => toast.info("Redirecting to payment…"), color: "text-green-600  bg-green-50  hover:bg-green-100"  },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={btn.action}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all ${btn.color}`}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
        </div>

        {/* Card settings */}
        <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-slate-400" />
            <p className="text-sm font-semibold text-slate-800">Card settings</p>
          </div>
          <SettingRow
            icon={<Smartphone className="w-4 h-4" />}
            label="Contactless payments"
            sublabel="Tap to pay at terminals"
            enabled={card.settings.contactless}
            onToggle={() => toggleSetting("contactless")}
          />
          <SettingRow
            icon={<Globe className="w-4 h-4" />}
            label="International transactions"
            sublabel="Use card outside home country"
            enabled={card.settings.international}
            onToggle={() => toggleSetting("international")}
            dangerous
          />
          <SettingRow
            icon={<CreditCard className="w-4 h-4" />}
            label="Online purchases"
            sublabel="E-commerce and subscriptions"
            enabled={card.settings.onlinePurchases}
            onToggle={() => toggleSetting("onlinePurchases")}
          />
          <SettingRow
            icon={<Lock className="w-4 h-4" />}
            label="ATM withdrawals"
            sublabel="Cash advances at ATMs"
            enabled={card.settings.atmWithdrawals}
            onToggle={() => toggleSetting("atmWithdrawals")}
          />
        </div>

        {/* Recent transactions for this card */}
        <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-semibold text-slate-800">Recent transactions</p>
            <Link href="/transactions" className="text-xs text-blue-500 font-medium hover:underline flex items-center gap-0.5">
              See all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-0">
            {card.transactions.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{tx.description}</p>
                  <p className="text-xs text-slate-400">{tx.date} · {tx.category}</p>
                </div>
                <p className="text-sm font-semibold text-red-500">-${tx.amount.toFixed(2)}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Add new card */}
        <button
          onClick={() => toast.info("New card application", { description: "Redirecting to card application form…" })}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center gap-2 text-sm text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all"
        >
          <Plus className="w-4 h-4" />
          Apply for a new card
        </button>
      </div>
    </div>
  );
}