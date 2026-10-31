'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/components/ui/toast"
import {
  Copy, CheckCircle2, Shield, Star, Phone, Mail,
  MessageSquare, Calendar, ChevronRight, BadgeCheck,
  TrendingUp, Clock, AlertCircle, X, Send, Paperclip,
  User, Lock, FileText, Bell, ChevronDown,
} from "lucide-react"
import DynamicDate from "@/components/DynamicDate"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: number
  from: "user" | "manager"
  text: string
  time: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useCopy() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const copy = (value: string, key: string, label: string) => {
    navigator.clipboard.writeText(value)
    setCopiedKey(key)
    toast.success(`${label} copied`)
    setTimeout(() => setCopiedKey(null), 2000)
  }
  return { copiedKey, copy }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
      {children}
    </p>
  )
}

function DetailRow({
  label, value, copyKey, copyLabel, onCopy, copiedKey, accent,
}: {
  label: string
  value: string
  copyKey?: string
  copyLabel?: string
  onCopy?: (v: string, k: string, l: string) => void
  copiedKey?: string | null
  accent?: boolean
}) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${accent ? "text-blue-600" : "text-slate-800"}`}>
          {value}
        </span>
        {copyKey && onCopy && (
          <button
            onClick={() => onCopy(value, copyKey, copyLabel ?? label)}
            className="text-slate-300 hover:text-blue-500 transition-colors"
          >
            {copiedKey === copyKey
              ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Upgrade modal ────────────────────────────────────────────────────────────

function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [chosen,    setChosen]    = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)

  const tiers = [
    {
      id: "gold",
      name: "Gold",
      limit: "$50,000",
      rate: "4.80% APY",
      perks: ["Priority support", "No transfer fees", "Dedicated manager"],
      color: "border-amber-300 bg-amber-50",
      badge: "bg-amber-100 text-amber-700",
    },
    {
      id: "platinum",
      name: "Platinum",
      limit: "$200,000",
      rate: "5.10% APY",
      perks: ["24/7 concierge", "Free international wires", "Investment advisory"],
      color: "border-blue-400 bg-blue-50",
      badge: "bg-blue-100 text-blue-700",
      recommended: true,
    },
  ]

  const submit = async () => {
    if (!chosen) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    setLoading(false)
    setDone(true)
    toast.success("Upgrade request submitted", {
      description: "Your account manager will contact you within 24 hours.",
    })
    setTimeout(onClose, 1500)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-linear-to-r from-slate-800 to-slate-900 px-5 py-4 text-white flex justify-between items-center">
          <div>
            <p className="font-semibold">Upgrade account</p>
            <p className="text-xs opacity-60 mt-0.5">Choose a new tier</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 opacity-60" /></button>
        </div>

        {done ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="font-medium text-slate-700">Request submitted!</p>
          </div>
        ) : (
          <div className="px-5 py-5 space-y-3">
            {tiers.map(t => (
              <button
                key={t.id}
                onClick={() => setChosen(t.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  chosen === t.id ? t.color + " ring-2 ring-offset-1 ring-blue-300" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.badge}`}>{t.name}</span>
                    {t.recommended && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                        Recommended
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-700">{t.rate}</span>
                </div>
                <p className="text-xs text-slate-500 mb-2">Limit: {t.limit}</p>
                <ul className="space-y-1">
                  {t.perks.map(p => (
                    <li key={p} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </button>
            ))}

            <button
              onClick={submit}
              disabled={!chosen || loading}
              className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                </svg>
              ) : "Request upgrade"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ─── Schedule call modal ──────────────────────────────────────────────────────

function ScheduleModal({ onClose }: { onClose: () => void }) {
  const slots = ["Mon Apr 28 · 10:00 AM", "Mon Apr 28 · 2:00 PM", "Tue Apr 29 · 9:00 AM", "Tue Apr 29 · 4:00 PM", "Wed Apr 30 · 11:00 AM"]
  const [chosen,  setChosen]  = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  const confirm = async () => {
    if (!chosen) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setDone(true)
    toast.success("Call scheduled", { description: `Your call is confirmed for ${chosen}.` })
    setTimeout(onClose, 1500)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white flex justify-between items-center">
          <div>
            <p className="font-semibold">Schedule a call</p>
            <p className="text-xs opacity-70 mt-0.5">With Sandra M. Johnson</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 opacity-70" /></button>
        </div>

        {done ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="font-medium text-slate-700">Call confirmed!</p>
            <p className="text-xs text-slate-400">{chosen}</p>
          </div>
        ) : (
          <div className="px-5 py-5 space-y-3">
            <p className="text-xs text-slate-500">Select an available time slot</p>
            <div className="space-y-2">
              {slots.map(s => (
                <button
                  key={s}
                  onClick={() => setChosen(s)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all ${
                    chosen === s
                      ? "border-blue-400 bg-blue-50 text-blue-700 font-medium"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={confirm}
              disabled={!chosen || loading}
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                </svg>
              ) : "Confirm slot"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ─── Live chat panel ──────────────────────────────────────────────────────────

function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, from: "manager", text: "Hi! I'm Sandra, your dedicated account manager. How can I help you today?", time: "9:01 AM" },
  ])
  const [input,   setInput]   = useState("")
  const [typing,  setTyping]  = useState(false)

  const autoReplies = [
    "Great question! Let me look into that for you.",
    "I can arrange that for you. Give me a moment.",
    "Your account is in excellent standing. Is there anything specific you need?",
    "I'll escalate this to our specialist team and get back to you shortly.",
  ]

  const send = () => {
    if (!input.trim()) return
    const userMsg: Message = {
      id:   Date.now(),
      from: "user",
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setTyping(true)

    setTimeout(() => {
      setTyping(false)
      const reply: Message = {
        id:   Date.now() + 1,
        from: "manager",
        text: autoReplies[Math.floor(Math.random() * autoReplies.length)],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages(prev => [...prev, reply])
    }, 1800)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl"
    >
      {/* Chat header */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
              SJ
            </div>
            {/* <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" /> */}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Sandra M. Johnson</p>
            <p className="text-xs text-blue-200">Account Manager · Online</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50">
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm ${
              msg.from === "user"
                ? "bg-blue-600 text-white rounded-br-sm"
                : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
            }`}>
              <p>{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.from === "user" ? "text-blue-200 text-right" : "text-slate-400"}`}>
                {msg.time}
              </p>
            </div>
          </motion.div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-slate-100 flex gap-2">
        <button className="text-slate-300 hover:text-slate-500 transition-colors">
          <Paperclip className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Type a message…"
          style={{ fontSize: "16px" }}
          className="flex-1 text-sm bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-300"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 rounded-full flex items-center justify-center transition-all"
        >
          <Send className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type ModalType = "upgrade" | "schedule" | null

export default function AccountManagerPage() {
  const [modal,      setModal]      = useState<ModalType>(null)
  const [chatOpen,   setChatOpen]   = useState(false)
  const [expandDocs, setExpandDocs] = useState(false)
  const { copiedKey, copy }         = useCopy()

  const account = {
    type:          "Premium Savings",
    number:        "**** **** **** 9302",
    limit:         "$20,000.00",
    balance:       "$16,704.04",
    interestRate:  "4.65% APY",
    status:        "Active",
    verification:  "Level 2",
    memberSince:   "March 2020",
    nextReview:    "June 2025",
    score:         820,
  }

  const manager = {
    name:       "Sandra M. Johnson",
    title:      "Senior Account Manager",
    email:      "sandra.johnson@securebank.com",
    phone:      "+1 (555) 678-9012",
    extension:  "Ext. 4402",
    hours:      "Mon–Fri, 9 AM – 6 PM ET",
    rating:     4.9,
    reviews:    142,
  }

  const activity = [
    { icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />, text: "Account verified successfully",       time: "2 days ago"  },
    { icon: <TrendingUp   className="w-3.5 h-3.5 text-blue-500"  />, text: "Interest credited — $212.88",        time: "Apr 1"        },
    { icon: <AlertCircle  className="w-3.5 h-3.5 text-amber-500" />, text: "Unusual login detected & confirmed", time: "Mar 28"       },
    { icon: <Lock         className="w-3.5 h-3.5 text-slate-400" />, text: "Password changed",                   time: "Mar 15"       },
  ]

  const docs = [
    { label: "Account agreement",    date: "Jan 2021" },
    { label: "Privacy policy",       date: "Jan 2024" },
    { label: "Terms & conditions",   date: "Jan 2024" },
    { label: "Fee schedule",         date: "Mar 2025" },
  ]

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8 mt-16 md:mt-0">
      <AnimatePresence>
        {modal === "upgrade"  && <UpgradeModal  onClose={() => setModal(null)} />}
        {modal === "schedule" && <ScheduleModal onClose={() => setModal(null)} />}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Account overview</h1>
            <DynamicDate />
          </div>
          <div className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center">
            <Bell className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Hero balance card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl px-5 py-5 text-white"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 mb-1">{account.type}</p>
              <p className="text-3xl font-bold">{account.balance}</p>
              <p className="text-xs text-slate-400 mt-1">{account.number}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                {account.status}
              </span>
              <p className="text-xs text-slate-400 mt-2">{account.interestRate}</p>
            </div>
          </div>

          {/* Score bar */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>Credit health score</span>
              <span className="text-green-400 font-semibold">{account.score} / 850</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-linear-to-r from-green-400 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(account.score / 850) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              />
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
            {[
              { label: "Limit",       value: account.limit         },
              { label: "Verified",    value: account.verification  },
              { label: "Member since",value: account.memberSince   },
            ].map(s => (
              <div key={s.label}>
                <p className="text-[10px] text-slate-500 mb-0.5">{s.label}</p>
                <p className="text-xs font-semibold text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Account details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 px-5 py-4"
        >
          <SectionHeading>Account details</SectionHeading>
          <DetailRow label="Account type"       value={account.type}         />
          <DetailRow label="Account number"     value={account.number}       copyKey="acct"   copyLabel="Account number" onCopy={copy} copiedKey={copiedKey} />
          <DetailRow label="Account limit"      value={account.limit}        />
          <DetailRow label="Interest rate"      value={account.interestRate} accent />
          <DetailRow label="Verification level" value={account.verification} />
          <DetailRow label="Next review date"   value={account.nextReview}   />

          <button
            onClick={() => setModal("upgrade")}
            className="mt-4 w-full flex items-center justify-between px-4 py-3 rounded-xl bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 hover:from-amber-100 hover:to-orange-100 transition-all"
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-700">Upgrade to Gold or Platinum</span>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </button>
        </motion.div>

        {/* Account manager */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-slate-200 px-5 py-4"
        >
          <SectionHeading>Your account manager</SectionHeading>

          {/* Manager profile */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                SJ
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-slate-800">{manager.name}</p>
                <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
              </div>
              <p className="text-xs text-slate-500">{manager.title}</p>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < Math.floor(manager.rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
                ))}
                <span className="text-xs text-slate-400 ml-1">{manager.rating} ({manager.reviews} reviews)</span>
              </div>
            </div>
          </div>

          <DetailRow label="Email"     value={manager.email}     copyKey="email" copyLabel="Email"     onCopy={copy} copiedKey={copiedKey} accent />
          <DetailRow label="Phone"     value={manager.phone}     copyKey="phone" copyLabel="Phone"     onCopy={copy} copiedKey={copiedKey} />
          <DetailRow label="Extension" value={manager.extension} copyKey="ext"   copyLabel="Extension" onCopy={copy} copiedKey={copiedKey} />
          <DetailRow label="Hours"     value={manager.hours} />

          {/* Contact actions */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: "Call",     icon: <Phone     className="w-4 h-4" />, color: "bg-green-50  hover:bg-green-100  text-green-700",  action: () => toast.info("Calling Sandra…") },
              { label: "Email",    icon: <Mail      className="w-4 h-4" />, color: "bg-blue-50   hover:bg-blue-100   text-blue-700",   action: () => window.location.href = `mailto:${manager.email}` },
              { label: "Chat",     icon: <MessageSquare className="w-4 h-4" />, color: "bg-purple-50 hover:bg-purple-100 text-purple-700", action: () => setChatOpen(v => !v) },
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

          <button
            onClick={() => setModal("schedule")}
            className="mt-3 w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
          >
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Schedule a call</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              Next available: Mon 10 AM
            </div>
          </button>
        </motion.div>

        {/* Live chat panel */}
        <AnimatePresence>
          {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
        </AnimatePresence>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 px-5 py-4"
        >
          <SectionHeading>Recent account activity</SectionHeading>
          <div className="space-y-0">
            {activity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 + 0.2 }}
                className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <p className="text-sm text-slate-700">{item.text}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0 ml-2">{item.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Documents */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-slate-200 px-5 py-4"
        >
          <button
            onClick={() => setExpandDocs(v => !v)}
            className="w-full flex items-center justify-between"
          >
            <SectionHeading>Documents & agreements</SectionHeading>
            <motion.div animate={{ rotate: expandDocs ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4 text-slate-400 mb-3" />
            </motion.div>
          </button>

          <AnimatePresence>
            {expandDocs && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-0 overflow-hidden"
              >
                {docs.map((doc, i) => (
                  <button
                    key={i}
                    onClick={() => toast.success("Document opening…", { description: `${doc.label} (Updated ${doc.date})` })}
                    className="w-full flex items-center justify-between py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2 text-slate-700">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-sm">{doc.label}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{doc.date}</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Security section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200 px-5 py-4"
        >
          <SectionHeading>Security & verification</SectionHeading>
          {[
            { label: "Two-factor authentication", status: "Enabled",  ok: true  },
            { label: "Biometric login",           status: "Enabled",  ok: true  },
            { label: "Identity verification",     status: "Level 2",  ok: true  },
            { label: "Suspicious login alerts",   status: "On",       ok: true  },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-700">{item.label}</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {item.status}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Support CTA */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          onClick={() => window.location.href = "mailto:support@securebank.com"}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center gap-2 text-sm text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all"
        >
          <Mail className="w-4 h-4" />
          Contact general support
        </motion.button>

      </div>
    </div>
  )
}