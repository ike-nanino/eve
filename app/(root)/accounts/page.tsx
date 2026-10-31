// app/(root)/accounts/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight, ArrowDownLeft, RefreshCw,
  ChevronRight, X, TrendingUp, TrendingDown,
  PiggyBank, Wallet, BarChart3, Plus, Download,
  Eye, EyeOff, Clock, ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/toast";
import DynamicDate from "@/components/DynamicDate";

// ─── Types & data ─────────────────────────────────────────────────────────────

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: "credit" | "debit";
}

interface Account {
  id: string;
  name: string;
  accountNumber: string;
  routingNumber: string;
  balance: number;
  change: number;
  changeAmt: number;
  type: "checking" | "savings" | "investment";
  interestRate: number;
  openedDate: string;
  color: string;
  iconBg: string;
  history: number[];
  transactions: Transaction[];
}

const accountsData: Account[] = [
  {
    id: "1",
    name: "Primary Checking",
    accountNumber: "**** **** 4567",
    routingNumber: "021000021",
    balance: 7297.96,
    change: 4.2,
    changeAmt: 293.10,
    type: "checking",
    interestRate: 0.01,
    openedDate: "Jan 2021",
    color: "from-blue-500 to-blue-700",
    iconBg: "bg-blue-100 text-blue-600",
    history: [6800, 7000, 6700, 7100, 7250, 7100, 7297],
    transactions: [
      { id: 1, date: "Apr 20", description: "Grocery Store",    amount: 78.65,  category: "Shopping", type: "debit"  },
      { id: 2, date: "Apr 18", description: "Salary Deposit",   amount: 3200.00,category: "Income",   type: "credit" },
      { id: 3, date: "Apr 15", description: "Electric Bill",    amount: 124.50, category: "Bills",    type: "debit"  },
      { id: 4, date: "Apr 12", description: "Transfer Out",     amount: 500.00, category: "Transfer", type: "debit"  },
      { id: 5, date: "Apr 10", description: "Netflix",          amount: 15.99,  category: "Entertainment", type: "debit" },
      { id: 6, date: "Apr 01", description: "Rent Payment",     amount: 1200.00,category: "Housing",  type: "debit"  },
    ],
  },
  {
    id: "2",
    name: "Savings Account",
    accountNumber: "**** **** 7890",
    routingNumber: "021000021",
    balance: 16704.04,
    change: 1.8,
    changeAmt: 295.28,
    type: "savings",
    interestRate: 4.65,
    openedDate: "Mar 2020",
    color: "from-emerald-500 to-emerald-700",
    iconBg: "bg-emerald-100 text-emerald-600",
    history: [15800, 16000, 16100, 16300, 16400, 16580, 16704],
    transactions: [
      { id: 1, date: "Apr 01", description: "Auto Transfer",    amount: 500.00, category: "Transfer", type: "credit" },
      { id: 2, date: "Mar 31", description: "Interest Payment", amount: 212.88, category: "Income",   type: "credit" },
      { id: 3, date: "Mar 15", description: "Withdrawal",       amount: 300.00, category: "Transfer", type: "debit"  },
    ],
  },
  {
    id: "3",
    name: "Investment Portfolio",
    accountNumber: "**** **** 2211",
    routingNumber: "021000021",
    balance: 32640.50,
    change: 7.5,
    changeAmt: 2277.50,
    type: "investment",
    interestRate: 0,
    openedDate: "Jun 2019",
    color: "from-purple-500 to-purple-700",
    iconBg: "bg-purple-100 text-purple-600",
    history: [28000, 29200, 30100, 31000, 31500, 32000, 32640],
    transactions: [
      { id: 1, date: "Apr 10", description: "VOO Dividend",     amount: 84.20,  category: "Income",   type: "credit" },
      { id: 2, date: "Apr 05", description: "AAPL Purchase",    amount: 500.00, category: "Investment",type: "debit"  },
      { id: 3, date: "Mar 28", description: "QQQ Purchase",     amount: 441.50, category: "Investment",type: "debit"  },
    ],
  },
];

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ data, light }: { data: number[]; light?: boolean }) {
  const w = 80, h = 28;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={light ? "rgba(255,255,255,0.6)" : "#3b82f6"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Account icon ─────────────────────────────────────────────────────────────

function AccountIcon({ type, className }: { type: Account["type"]; className?: string }) {
  const icons = {
    checking:   <Wallet    className="w-5 h-5" />,
    savings:    <PiggyBank className="w-5 h-5" />,
    investment: <BarChart3 className="w-5 h-5" />,
  };
  return <div className={className}>{icons[type]}</div>;
}

// ─── Transfer modal ───────────────────────────────────────────────────────────

function TransferModal({ from, accounts, onClose }: {
  from: Account;
  accounts: Account[];
  onClose: () => void;
}) {
  const [toId,    setToId]    = useState(accounts.find(a => a.id !== from.id)?.id ?? "");
  const [amount,  setAmount]  = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  const toAccount = accounts.find(a => a.id === toId);

  const transfer = async () => {
    if (!amount || !toId) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    setDone(true);
    toast.success("Transfer complete", { description: `$${amount} moved from ${from.name} to ${toAccount?.name}` });
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
        <div className={`bg-gradient-to-r ${from.color} px-5 py-4 text-white`}>
          <div className="flex justify-between items-center">
            <p className="font-semibold">Transfer funds</p>
            <button onClick={onClose}><X className="w-5 h-5 opacity-70" /></button>
          </div>
          <p className="text-sm opacity-80 mt-0.5">From: {from.name}</p>
        </div>

        {done ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-green-500" />
            </div>
            <p className="font-medium text-slate-700">Transfer complete!</p>
          </div>
        ) : (
          <div className="px-5 py-5 space-y-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Transfer to</label>
              <select
                value={toId}
                onChange={e => setToId(e.target.value)}
                style={{ fontSize: "16px" }}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                {accounts.filter(a => a.id !== from.id).map(a => (
                  <option key={a.id} value={a.id}>{a.name} — ${a.balance.toLocaleString()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Amount ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="text"
                  value={amount}
                  placeholder="0.00"
                  onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  style={{ fontSize: "16px" }}
                  className="w-full h-10 pl-7 pr-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Available: ${from.balance.toLocaleString()}</p>
            </div>
            <button
              onClick={transfer}
              disabled={!amount || loading}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Processing…</>
              ) : "Transfer now"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Account detail panel ─────────────────────────────────────────────────────

function AccountDetailPanel({
  account,
  hideBalance,
  onTransfer,
  onClose,
}: {
  account: Account;
  hideBalance: boolean;
  onTransfer: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      key={account.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
    >
      {/* Hero */}
      <div className={`bg-gradient-to-br ${account.color} px-5 py-5 text-white`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm opacity-80">{account.name}</p>
            <p className="text-3xl font-bold mt-1">
              {hideBalance ? "••••••" : `$${account.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs">
              {account.change >= 0
                ? <TrendingUp   className="w-3.5 h-3.5" />
                : <TrendingDown className="w-3.5 h-3.5" />}
              <span>+${account.changeAmt.toFixed(2)} ({account.change}%) this month</span>
            </div>
          </div>
          <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-3">
          <Sparkline data={account.history} light />
        </div>
      </div>

      {/* Account details */}
      <div className="px-5 py-4 border-b border-slate-100">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Account details</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: "Account number", value: account.accountNumber },
            { label: "Routing number", value: account.routingNumber },
            { label: "Interest rate",  value: account.interestRate > 0 ? `${account.interestRate}% APY` : "N/A" },
            { label: "Opened",         value: account.openedDate },
          ].map(row => (
            <div key={row.label}>
              <p className="text-xs text-slate-400">{row.label}</p>
              <p className="font-medium text-slate-800">{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-5 py-4 border-b border-slate-100 grid grid-cols-3 gap-2">
        <Link
          href="/online-deposit"
          className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium transition-all"
        >
          <ArrowDownLeft className="w-4 h-4" />
          Deposit
        </Link>
        <Link
          href="/withdrawal"
          className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-all"
        >
          <ArrowUpRight className="w-4 h-4" />
          Withdraw
        </Link>
        <button
          onClick={onTransfer}
          className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-medium transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Transfer
        </button>
      </div>

      {/* Transactions */}
      <div className="px-5 py-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-semibold text-slate-800">Recent transactions</p>
          <Link href="/transactions" className="text-xs text-blue-500 hover:underline flex items-center gap-0.5">
            All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-0">
          {account.transactions.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${tx.type === "credit" ? "bg-green-100 text-green-600" : "bg-red-50 text-red-500"}`}>
                  {tx.type === "credit" ? "+" : "-"}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{tx.description}</p>
                  <p className="text-xs text-slate-400">{tx.date} · {tx.category}</p>
                </div>
              </div>
              <p className={`text-sm font-semibold ${tx.type === "credit" ? "text-green-600" : "text-red-500"}`}>
                {tx.type === "credit" ? "+" : "-"}${tx.amount.toFixed(2)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Export */}
      <div className="px-5 pb-4">
        <button
          onClick={() => toast.success("Statement downloaded", { description: "Your account statement has been saved." })}
          className="w-full py-2.5 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-sm text-slate-500 hover:bg-slate-50 transition-all"
        >
          <Download className="w-4 h-4" />
          Download statement
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AccountsPage() {
  const [accounts,      setAccounts]      = useState(accountsData);
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const [hideBalance,   setHideBalance]   = useState(false);
  const [transferFrom,  setTransferFrom]  = useState<Account | null>(null);

  const selected = accounts.find(a => a.id === selectedId) ?? null;

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8 mt-16 md:mt-0">
      <AnimatePresence>
        {transferFrom && (
          <TransferModal
            from={transferFrom}
            accounts={accounts}
            onClose={() => setTransferFrom(null)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Accounts</h1>
            <DynamicDate />
          </div>
          <button
            onClick={() => setHideBalance(v => !v)}
            className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
          >
            {hideBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Total balance banner */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl px-5 py-5 text-white">
          <p className="text-sm opacity-60">Total net worth</p>
          <p className="text-3xl font-bold mt-1">
            {hideBalance ? "••••••••" : `$${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs opacity-60">
            <Clock className="w-3 h-3" />
            Updated just now
          </div>
        </div>

        {/* Account cards */}
        <div className="space-y-3">
          {accounts.map((acc, i) => (
            <motion.button
              key={acc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setSelectedId(selectedId === acc.id ? null : acc.id)}
              className={`w-full bg-white rounded-2xl border px-5 py-4 text-left transition-all ${selectedId === acc.id ? "border-blue-300 shadow-md shadow-blue-50" : "border-slate-200 hover:border-slate-300 hover:shadow-sm"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AccountIcon type={acc.type} className={`w-10 h-10 rounded-xl ${acc.iconBg} flex items-center justify-center`} />
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{acc.name}</p>
                    <p className="text-xs text-slate-400">{acc.accountNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">
                    {hideBalance ? "••••••" : `$${acc.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                  </p>
                  <div className="flex items-center justify-end gap-0.5 text-xs text-green-500">
                    <TrendingUp className="w-3 h-3" />
                    <span>+{acc.change}%</span>
                  </div>
                </div>
              </div>

              {/* Mini sparkline */}
              <div className="mt-3 flex items-end justify-between">
                <Sparkline data={acc.history} />
                <span className="text-xs text-slate-400">
                  {acc.type === "savings" && acc.interestRate > 0 ? `${acc.interestRate}% APY` : acc.type === "investment" ? "Portfolio" : "Checking"}
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Expanded detail panel */}
        <AnimatePresence>
          {selected && (
            <AccountDetailPanel
              account={selected}
              hideBalance={hideBalance}
              onTransfer={() => { setTransferFrom(selected); }}
              onClose={() => setSelectedId(null)}
            />
          )}
        </AnimatePresence>

        {/* Open new account CTA */}
        <button
          onClick={() => toast.info("Opening application…", { description: "New account applications take about 5 minutes." })}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center gap-2 text-sm text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all"
        >
          <Plus className="w-4 h-4" />
          Open a new account
        </button>
      </div>
    </div>
  );
}