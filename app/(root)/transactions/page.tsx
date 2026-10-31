"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, Download, ChevronDown, ChevronUp,
  ArrowUpRight, ArrowDownLeft, RefreshCw, X,
  TrendingUp, TrendingDown, DollarSign, Calendar,
  ShoppingCart, Banknote, Wallet, CreditCard, PiggyBank,
  Plane, Home, Utensils, Bus, Heart, Gamepad2, Gift,
  Dumbbell, Car, GraduationCap, Phone, Film, Music2,
  Building2, UtensilsCrossed, ShoppingBasket, Tv,
  TrendingUp as InvestIcon, Shield, Receipt, Wrench,
  BookOpen, Zap, PawPrint, Sparkles, ArrowLeftRight,
  CheckCircle2, Clock, AlertCircle,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type TxType   = "credit" | "debit";
type TxStatus = "completed" | "pending" | "failed";

interface Transaction {
  id:          string;
  date:        string;
  description: string;
  category:    string;
  type:        TxType;
  status:      TxStatus;
  amount:      number;
  account:     string;
  reference:   string;
  note?:       string;
  cardDigits?: string;
  cardType?:   string;
}

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  "Salary":         { icon: <Banknote    className="w-4 h-4" />, color: "text-green-600",  bg: "bg-green-100"  },
  "Transfer In":    { icon: <ArrowDownLeft className="w-4 h-4" />, color: "text-blue-600", bg: "bg-blue-100"   },
  "Transfer Out":   { icon: <ArrowUpRight className="w-4 h-4" />, color: "text-slate-600", bg: "bg-slate-100"  },
  "Deposit":        { icon: <PiggyBank   className="w-4 h-4" />, color: "text-emerald-600",bg: "bg-emerald-100"},
  "Withdrawal":     { icon: <Wallet      className="w-4 h-4" />, color: "text-orange-600", bg: "bg-orange-100" },
  "Shopping":       { icon: <ShoppingCart className="w-4 h-4" />, color: "text-pink-600",  bg: "bg-pink-100"   },
  "Groceries":      { icon: <ShoppingBasket className="w-4 h-4" />, color: "text-lime-600",bg: "bg-lime-100"   },
  "Dining":         { icon: <UtensilsCrossed className="w-4 h-4" />, color: "text-amber-600", bg: "bg-amber-100" },
  "Food Delivery":  { icon: <Utensils    className="w-4 h-4" />, color: "text-orange-500", bg: "bg-orange-50"  },
  "Transport":      { icon: <Bus         className="w-4 h-4" />, color: "text-cyan-600",   bg: "bg-cyan-100"   },
  "Travel":         { icon: <Plane       className="w-4 h-4" />, color: "text-sky-600",    bg: "bg-sky-100"    },
  "Bills":          { icon: <Building2   className="w-4 h-4" />, color: "text-red-600",    bg: "bg-red-100"    },
  "Subscriptions":  { icon: <Tv          className="w-4 h-4" />, color: "text-violet-600", bg: "bg-violet-100" },
  "Health":         { icon: <Heart       className="w-4 h-4" />, color: "text-rose-600",   bg: "bg-rose-100"   },
  "Fitness":        { icon: <Dumbbell    className="w-4 h-4" />, color: "text-teal-600",   bg: "bg-teal-100"   },
  "Entertainment":  { icon: <Gamepad2    className="w-4 h-4" />, color: "text-purple-600", bg: "bg-purple-100" },
  "Movies":         { icon: <Film        className="w-4 h-4" />, color: "text-indigo-600", bg: "bg-indigo-100" },
  "Music":          { icon: <Music2      className="w-4 h-4" />, color: "text-fuchsia-600",bg: "bg-fuchsia-100"},
  "Education":      { icon: <GraduationCap className="w-4 h-4" />, color: "text-blue-700", bg: "bg-blue-100"  },
  "Books":          { icon: <BookOpen    className="w-4 h-4" />, color: "text-yellow-700", bg: "bg-yellow-100" },
  "Investment":     { icon: <InvestIcon  className="w-4 h-4" />, color: "text-green-700",  bg: "bg-green-100"  },
  "Savings":        { icon: <PiggyBank   className="w-4 h-4" />, color: "text-emerald-700",bg: "bg-emerald-100"},
  "Rent":           { icon: <Home        className="w-4 h-4" />, color: "text-stone-600",  bg: "bg-stone-100"  },
  "Insurance":      { icon: <Shield      className="w-4 h-4" />, color: "text-slate-600",  bg: "bg-slate-100"  },
  "Car":            { icon: <Car         className="w-4 h-4" />, color: "text-zinc-600",   bg: "bg-zinc-100"   },
  "Phone":          { icon: <Phone       className="w-4 h-4" />, color: "text-blue-500",   bg: "bg-blue-50"    },
  "Tax":            { icon: <Receipt     className="w-4 h-4" />, color: "text-red-700",    bg: "bg-red-100"    },
  "Gifts":          { icon: <Gift        className="w-4 h-4" />, color: "text-pink-500",   bg: "bg-pink-100"   },
  "Pet Care":       { icon: <PawPrint    className="w-4 h-4" />, color: "text-amber-700",  bg: "bg-amber-100"  },
  "Beauty":         { icon: <Sparkles    className="w-4 h-4" />, color: "text-rose-500",   bg: "bg-rose-100"   },
  "Electronics":    { icon: <Zap         className="w-4 h-4" />, color: "text-yellow-600", bg: "bg-yellow-100" },
  "Repair":         { icon: <Wrench      className="w-4 h-4" />, color: "text-gray-600",   bg: "bg-gray-100"   },
  "Freelance":      { icon: <DollarSign  className="w-4 h-4" />, color: "text-green-600",  bg: "bg-green-100"  },
  "Loan Repayment": { icon: <CreditCard  className="w-4 h-4" />, color: "text-red-600",    bg: "bg-red-100"    },
};

const DEFAULT_CAT = { icon: <Wallet className="w-4 h-4" />, color: "text-slate-500", bg: "bg-slate-100" };

// ─── Transaction data ─────────────────────────────────────────────────────────

const ALL_TRANSACTIONS: Transaction[] = [
  // April 2025
  { id:"t001", date:"2025-04-20", description:"Monthly Salary",           category:"Salary",        type:"credit", status:"completed", amount:4200.00, account:"Checking ••4821",  reference:"SAL-2025-04" },
  { id:"t002", date:"2025-04-19", description:"Rent Payment",             category:"Rent",           type:"debit",  status:"completed", amount:1200.00, account:"Checking ••4821",  reference:"RENT-APR25",  cardType:"Visa",       cardDigits:"••4821" },
  { id:"t003", date:"2025-04-18", description:"Savings Top-up",           category:"Savings",        type:"credit", status:"completed", amount:500.00,  account:"Savings ••9302",   reference:"SAVAUTO-04",  note:"Automatic monthly transfer" },
  { id:"t004", date:"2025-04-18", description:"Savings Transfer Out",     category:"Transfer Out",   type:"debit",  status:"completed", amount:500.00,  account:"Checking ••4821",  reference:"SAVAUTO-04" },
  { id:"t005", date:"2025-04-17", description:"Whole Foods Market",       category:"Groceries",      type:"debit",  status:"completed", amount:134.72,  account:"Checking ••4821",  reference:"WFM-041725",  cardType:"Visa",       cardDigits:"••4821" },
  { id:"t006", date:"2025-04-16", description:"Netflix",                  category:"Subscriptions",  type:"debit",  status:"completed", amount:15.99,   account:"Checking ••4821",  reference:"NFX-APR25",   cardType:"Mastercard", cardDigits:"••1122" },
  { id:"t007", date:"2025-04-15", description:"Uber Ride",                category:"Transport",      type:"debit",  status:"completed", amount:18.40,   account:"Checking ••4821",  reference:"UBR-041525",  cardType:"Visa",       cardDigits:"••4821" },
  { id:"t008", date:"2025-04-14", description:"VOO Dividend",             category:"Investment",     type:"credit", status:"completed", amount:84.20,   account:"Investment ••2211", reference:"VOO-DIV-Q1" },
  { id:"t009", date:"2025-04-13", description:"Electricity Bill",         category:"Bills",          type:"debit",  status:"completed", amount:124.50,  account:"Checking ••4821",  reference:"ELEC-APR25" },
  { id:"t010", date:"2025-04-12", description:"Zara",                     category:"Shopping",       type:"debit",  status:"completed", amount:89.95,   account:"Checking ••4821",  reference:"ZAR-041225",  cardType:"Mastercard", cardDigits:"••1122" },
  { id:"t011", date:"2025-04-11", description:"ATM Withdrawal",           category:"Withdrawal",     type:"debit",  status:"completed", amount:200.00,  account:"Checking ••4821",  reference:"ATM-041125" },
  { id:"t012", date:"2025-04-10", description:"Spotify Premium",          category:"Music",          type:"debit",  status:"completed", amount:9.99,    account:"Checking ••4821",  reference:"SPT-APR25",   cardType:"Visa",       cardDigits:"••4821" },
  { id:"t013", date:"2025-04-09", description:"Dental Checkup",           category:"Health",         type:"debit",  status:"completed", amount:150.00,  account:"Checking ••4821",  reference:"DENT-040925" },
  { id:"t014", date:"2025-04-08", description:"Freelance Invoice #12",    category:"Freelance",      type:"credit", status:"completed", amount:750.00,  account:"Checking ••4821",  reference:"FRL-INV-012", note:"Web design project" },
  { id:"t015", date:"2025-04-07", description:"Planet Fitness",           category:"Fitness",        type:"debit",  status:"completed", amount:24.99,   account:"Checking ••4821",  reference:"GYM-APR25",   cardType:"Visa",       cardDigits:"••4821" },
  { id:"t016", date:"2025-04-06", description:"Uber Eats",                category:"Food Delivery",  type:"debit",  status:"pending",   amount:32.15,   account:"Checking ••4821",  reference:"UBE-040625",  cardType:"Mastercard", cardDigits:"••1122" },
  { id:"t017", date:"2025-04-05", description:"AAPL Stock Purchase",      category:"Investment",     type:"debit",  status:"completed", amount:500.00,  account:"Investment ••2211", reference:"AAPL-040525" },
  { id:"t018", date:"2025-04-04", description:"Interest Earned",          category:"Savings",        type:"credit", status:"completed", amount:64.30,   account:"Savings ••9302",   reference:"INT-APR25",   note:"4.65% APY monthly credit" },
  { id:"t019", date:"2025-04-03", description:"Car Insurance",            category:"Insurance",      type:"debit",  status:"completed", amount:89.00,   account:"Checking ••4821",  reference:"INS-APR25" },
  { id:"t020", date:"2025-04-02", description:"Online Deposit",           category:"Deposit",        type:"credit", status:"completed", amount:1000.00, account:"Checking ••4821",  reference:"DEP-040225",  note:"ACH deposit from external account" },
  { id:"t021", date:"2025-04-01", description:"Loan Repayment",           category:"Loan Repayment", type:"debit",  status:"completed", amount:320.00,  account:"Checking ••4821",  reference:"LOAN-APR25" },

  // March 2025
  { id:"t022", date:"2025-03-31", description:"Wire Transfer Received",   category:"Transfer In",    type:"credit", status:"completed", amount:2500.00, account:"Checking ••4821",  reference:"WIRE-033125", note:"From Johnson LLC" },
  { id:"t023", date:"2025-03-30", description:"Amazon.com",               category:"Shopping",       type:"debit",  status:"completed", amount:67.43,   account:"Checking ••4821",  reference:"AMZ-033025",  cardType:"Visa",       cardDigits:"••4821" },
  { id:"t024", date:"2025-03-28", description:"Phone Bill",               category:"Phone",          type:"debit",  status:"completed", amount:45.00,   account:"Checking ••4821",  reference:"PHONE-MAR25" },
  { id:"t025", date:"2025-03-27", description:"Chipotle",                 category:"Dining",         type:"debit",  status:"completed", amount:14.85,   account:"Checking ••4821",  reference:"CHIP-032725", cardType:"Mastercard", cardDigits:"••1122" },
  { id:"t026", date:"2025-03-26", description:"Flight to NYC",            category:"Travel",         type:"debit",  status:"completed", amount:312.00,  account:"Checking ••4821",  reference:"FLT-032625",  cardType:"Visa",       cardDigits:"••4821" },
  { id:"t027", date:"2025-03-25", description:"Monthly Salary",           category:"Salary",         type:"credit", status:"completed", amount:4200.00, account:"Checking ••4821",  reference:"SAL-2025-03" },
  { id:"t028", date:"2025-03-24", description:"Cheque Deposit",           category:"Deposit",        type:"credit", status:"pending",   amount:450.00,  account:"Checking ••4821",  reference:"CHQ-032425",  note:"Personal cheque — clearing" },
  { id:"t029", date:"2025-03-22", description:"Quarterly Tax Payment",    category:"Tax",            type:"debit",  status:"failed",    amount:800.00,  account:"Checking ••4821",  reference:"TAX-Q1-25",   note:"Payment failed — insufficient funds at time of processing" },
  { id:"t030", date:"2025-03-20", description:"ATM Withdrawal",           category:"Withdrawal",     type:"debit",  status:"completed", amount:100.00,  account:"Checking ••4821",  reference:"ATM-032025" },
  { id:"t031", date:"2025-03-18", description:"Savings Top-up",           category:"Savings",        type:"credit", status:"completed", amount:500.00,  account:"Savings ••9302",   reference:"SAVAUTO-03" },
  { id:"t032", date:"2025-03-15", description:"Interest Earned",          category:"Savings",        type:"credit", status:"completed", amount:61.80,   account:"Savings ••9302",   reference:"INT-MAR25" },
  { id:"t033", date:"2025-03-12", description:"Apple TV+",                category:"Subscriptions",  type:"debit",  status:"completed", amount:8.99,    account:"Checking ••4821",  reference:"ATVM-MAR25",  cardType:"Mastercard", cardDigits:"••1122" },
  { id:"t034", date:"2025-03-10", description:"Gift for Mom",             category:"Gifts",          type:"debit",  status:"completed", amount:55.00,   account:"Checking ••4821",  reference:"GIFT-031025", cardType:"Visa",       cardDigits:"••4821" },
  { id:"t035", date:"2025-03-08", description:"Costco",                   category:"Groceries",      type:"debit",  status:"completed", amount:198.34,  account:"Checking ••4821",  reference:"CST-030825",  cardType:"Mastercard", cardDigits:"••1122" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function groupByDate(txs: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};
  txs.forEach(tx => {
    const d = new Date(tx.date);
    const key = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });
  return groups;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TxStatus }) {
  const map = {
    completed: { icon: <CheckCircle2 className="w-3 h-3" />, cls: "bg-green-100 text-green-700",  label: "Completed" },
    pending:   { icon: <Clock        className="w-3 h-3" />, cls: "bg-amber-100 text-amber-700",   label: "Pending"   },
    failed:    { icon: <AlertCircle  className="w-3 h-3" />, cls: "bg-red-100 text-red-600",       label: "Failed"    },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.cls}`}>
      {s.icon}{s.label}
    </span>
  );
}

// ─── Transaction row ──────────────────────────────────────────────────────────

function TxRow({ tx }: { tx: Transaction }) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORY_CONFIG[tx.category] ?? DEFAULT_CAT;

  return (
    <>
      <motion.tr
        layout
        onClick={() => setExpanded(v => !v)}
        className="cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
      >
        {/* Category */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cat.bg} ${cat.color}`}>
              {cat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{tx.description}</p>
              <p className="text-xs text-slate-400">{tx.category}</p>
            </div>
          </div>
        </td>

        {/* Account */}
        <td className="px-4 py-3 text-xs text-slate-500 hidden sm:table-cell">
          {tx.account}
        </td>

        {/* Status */}
        <td className="px-4 py-3 hidden md:table-cell">
          <StatusBadge status={tx.status} />
        </td>

        {/* Amount */}
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            <span className={`text-sm font-bold ${tx.type === "credit" ? "text-green-600" : "text-slate-800"}`}>
              {tx.type === "credit" ? "+" : "-"}${fmt(tx.amount)}
            </span>
            {tx.type === "credit"
              ? <ArrowDownLeft className="w-3.5 h-3.5 text-green-500" />
              : <ArrowUpRight  className="w-3.5 h-3.5 text-slate-400" />}
          </div>
        </td>

        {/* Expand chevron */}
        <td className="px-3 py-3 text-slate-300">
          {expanded
            ? <ChevronUp   className="w-4 h-4" />
            : <ChevronDown className="w-4 h-4" />}
        </td>
      </motion.tr>

      {/* Expanded detail row */}
      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={5} className="px-0 py-0">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden bg-slate-50 border-b border-slate-200"
              >
                <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Reference</p>
                    <p className="text-xs font-mono font-medium text-slate-700">{tx.reference}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Date</p>
                    <p className="text-xs font-medium text-slate-700">
                      {new Date(tx.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Status</p>
                    <StatusBadge status={tx.status} />
                  </div>
                  {tx.cardType && (
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Card used</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${tx.cardType === "Visa" ? "bg-blue-700 text-white" : "bg-orange-500 text-white"}`}>
                        {tx.cardType}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">{tx.cardDigits}</span>
                    </div>
                  )}
                  {tx.note && (
                    <div className="col-span-2 sm:col-span-4">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Note</p>
                      <p className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2">{tx.note}</p>
                    </div>
                  )}
                  <div className="col-span-2 sm:col-span-4 flex gap-2 pt-1">
                    <button
                      onClick={e => { e.stopPropagation(); toast.success("Reference copied"); navigator.clipboard.writeText(tx.reference); }}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      Copy reference
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      onClick={e => { e.stopPropagation(); toast.info("Dispute raised", { description: "Our team will review this transaction within 2 business days." }); }}
                      className="text-[11px] text-red-500 hover:text-red-700 font-medium transition-colors"
                    >
                      Dispute transaction
                    </button>
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const CATEGORIES = ["All", ...Array.from(new Set(ALL_TRANSACTIONS.map(t => t.category))).sort()];
const STATUSES   = ["All", "Completed", "Pending", "Failed"];
const ACCOUNTS   = ["All accounts", "Checking ••4821", "Savings ••9302", "Investment ••2211"];

export default function TransactionsPage() {
  const [search,      setSearch]      = useState("");
  const [category,    setCategory]    = useState("All");
  const [status,      setStatus]      = useState("All");
  const [account,     setAccount]     = useState("All accounts");
  const [typeFilter,  setTypeFilter]  = useState<"all" | "credit" | "debit">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page,        setPage]        = useState(1);

  const PER_PAGE = 15;

  // Filter
  const filtered = useMemo(() => {
    return ALL_TRANSACTIONS.filter(tx => {
      const matchSearch   = tx.description.toLowerCase().includes(search.toLowerCase()) ||
                            tx.category.toLowerCase().includes(search.toLowerCase()) ||
                            tx.reference.toLowerCase().includes(search.toLowerCase());
      const matchCat      = category    === "All"           || tx.category === category;
      const matchStatus   = status      === "All"           || tx.status   === status.toLowerCase();
      const matchAccount  = account     === "All accounts"  || tx.account  === account;
      const matchType     = typeFilter  === "all"           || tx.type     === typeFilter;
      return matchSearch && matchCat && matchStatus && matchAccount && matchType;
    });
  }, [search, category, status, account, typeFilter]);

  // Paginate
  const totalPages   = Math.ceil(filtered.length / PER_PAGE);
  const paginated    = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const grouped      = groupByDate(paginated);

  // Summary stats
  const totalIn  = filtered.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter(t => t.type === "debit").reduce((s,  t) => s + t.amount, 0);
  const net      = totalIn - totalOut;

  const resetFilters = () => {
    setSearch(""); setCategory("All"); setStatus("All");
    setAccount("All accounts"); setTypeFilter("all"); setPage(1);
  };

  const activeFilters = [category !== "All", status !== "All", account !== "All accounts", typeFilter !== "all", search !== ""].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8 mt-16 md:mt-0">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
            <p className="text-sm text-slate-500 mt-0.5">{filtered.length} transactions found</p>
          </div>
          <button
            onClick={() => toast.success("Statement downloading…", { description: "Your CSV statement has been prepared." })}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Money in",   value: totalIn,  color: "text-green-600",  icon: <TrendingUp   className="w-4 h-4 text-green-500"  />, bg: "bg-green-50"  },
            { label: "Money out",  value: totalOut, color: "text-red-600",    icon: <TrendingDown className="w-4 h-4 text-red-500"    />, bg: "bg-red-50"    },
            { label: "Net",        value: Math.abs(net), color: net >= 0 ? "text-blue-600" : "text-red-600", icon: <ArrowLeftRight className="w-4 h-4 text-blue-500" />, bg: "bg-blue-50" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`w-6 h-6 rounded-lg ${s.bg} flex items-center justify-center`}>{s.icon}</div>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
              <p className={`text-lg font-bold ${s.color}`}>
                {net < 0 && s.label === "Net" ? "-" : ""}${fmt(s.value)}
              </p>
            </div>
          ))}
        </div>

        {/* Search + filter bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by description, category, or reference…"
                style={{ fontSize: "16px" }}
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-1.5 px-4 h-10 rounded-xl border text-sm font-medium transition-all ${
                showFilters || activeFilters > 0
                  ? "border-blue-400 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilters > 0 && (
                <span className="w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          {/* Type pills */}
          <div className="flex gap-2">
            {(["all", "credit", "debit"] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  typeFilter === t
                    ? t === "credit" ? "bg-green-600 text-white" : t === "debit" ? "bg-red-500 text-white" : "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t === "all" ? "All types" : t === "credit" ? "Money in" : "Money out"}
              </button>
            ))}
            {activeFilters > 0 && (
              <button
                onClick={resetFilters}
                className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-all"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>

          {/* Expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                  {[
                    { label: "Category", value: category,   set: setCategory,   options: CATEGORIES },
                    { label: "Status",   value: status,     set: setStatus,     options: STATUSES   },
                    { label: "Account",  value: account,    set: setAccount,    options: ACCOUNTS   },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="text-xs text-slate-400 block mb-1">{f.label}</label>
                      <select
                        value={f.value}
                        onChange={e => { f.set(e.target.value); setPage(1); }}
                        style={{ fontSize: "16px" }}
                        className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      >
                        {f.options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Transaction list */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <p className="font-medium text-slate-700">No transactions found</p>
              <p className="text-sm text-slate-400">Try adjusting your filters or search term</p>
              <button onClick={resetFilters} className="text-sm text-blue-600 hover:underline font-medium">
                Clear all filters
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Transaction</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Account</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {Object.entries(grouped).map(([dateLabel, txs]) => (
                  <>
                    <tr key={`date-${dateLabel}`}>
                      <td colSpan={5} className="px-4 py-2 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-500">{dateLabel}</span>
                          <span className="text-xs text-slate-400">
                            · {txs.filter(t => t.type === "credit").length > 0 && (
                              <span className="text-green-600">+${fmt(txs.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0))}</span>
                            )}
                            {txs.filter(t => t.type === "credit").length > 0 && txs.filter(t => t.type === "debit").length > 0 && " / "}
                            {txs.filter(t => t.type === "debit").length > 0 && (
                              <span className="text-slate-500">-${fmt(txs.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0))}</span>
                            )}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {txs.map(tx => <TxRow key={tx.id} tx={tx} />)}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 text-xs rounded-lg border transition-all ${
                    p === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}