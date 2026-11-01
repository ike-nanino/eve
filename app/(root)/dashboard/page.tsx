"use client"

import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faCreditCard, faArrowUp, faArrowDown, faChartLine, faXmark, faBullseye, faWallet, faPiggyBank, faCheck } from '@fortawesome/free-solid-svg-icons'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/components/ui/toast'
import { TrendingUp, TrendingDown, ArrowRight, X, Plus, Target, Receipt } from 'lucide-react'

config.autoAddCss = false

// ─── Animated counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ value, prefix = '$', duration = 1200 }: { value: number; prefix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef   = useRef<number | null>(null)

  useEffect(() => {
    startRef.current = null
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const progress = Math.min((ts - startRef.current) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(value * eased * 100) / 100)
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value, duration])

  return (
    <span>
      {prefix}{display.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </span>
  )
}

// ─── Sparkline SVG ────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 80, h = 32
  const min = Math.min(...data), max = Math.max(...data)
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / (max - min || 1)) * h
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Account detail modal ─────────────────────────────────────────────────────

function AccountModal({ account, onClose }: { account: { name: string; balance: number; change: number; color: string; history: number[]; transactions: { desc: string; amt: number; date: string }[] }; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className={`${account.color} px-6 py-5 text-white`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-80">{account.name}</p>
              <p className="text-3xl font-bold mt-1">
                <AnimatedNumber value={account.balance} />
              </p>
            </div>
            <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm">
            {account.change >= 0
              ? <TrendingUp className="w-4 h-4" />
              : <TrendingDown className="w-4 h-4" />}
            <span>{account.change >= 0 ? '+' : ''}{account.change}% from last month</span>
          </div>
          <div className="mt-3">
            <Sparkline data={account.history} color="rgba(255,255,255,0.7)" />
          </div>
        </div>

        <div className="px-6 py-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Recent activity</p>
          <div className="space-y-3">
            {account.transactions.map((t, i) => (
              <div key={i} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.desc}</p>
                  <p className="text-xs text-gray-400">{t.date}</p>
                </div>
                <span className={`text-sm font-semibold ${t.amt >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {t.amt >= 0 ? '+' : ''}${Math.abs(t.amt).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href="/transactions" className="py-2 text-center text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors">
              All transactions
            </Link>
            <Link href="/online-deposit" className="py-2 text-center text-sm bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors">
              Deposit
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Receive modal ────────────────────────────────────────────────────────────

function ReceiveModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const accountNumber = '4821 •••• •••• 9302'
  const routingNumber = '021000021'

  const copy = (val: string, label: string) => {
    navigator.clipboard.writeText(val.replace(/\s/g, ''))
    setCopied(true)
    toast.success(`${label} copied`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-6 py-5 text-white">
          <div className="flex justify-between items-center">
            <p className="font-semibold">Receive money</p>
            <button onClick={onClose}><X className="w-5 h-5 opacity-70" /></button>
          </div>
          <p className="text-sm opacity-80 mt-1">Share your details to receive a transfer</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {[
            { label: 'Account holder', value: 'Johnson', copy: false },
            { label: 'Account number', value: accountNumber, copy: true },
            { label: 'Routing number', value: routingNumber, copy: true },
            { label: 'Bank name',      value: 'SecureBank',  copy: false },
          ].map(row => (
            <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-xs text-gray-400">{row.label}</p>
                <p className="text-sm font-medium text-gray-800">{row.value}</p>
              </div>
              {row.copy && (
                <button
                  onClick={() => copy(row.value, row.label)}
                  className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>
          ))}

          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700">
            Transfers typically arrive within 1–3 business days. For instant transfers, share your $tag with the sender.
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Pay bills modal ──────────────────────────────────────────────────────────

function PayBillsModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [amount,   setAmount]   = useState('')
  const [paying,   setPaying]   = useState(false)
  const [done,     setDone]     = useState(false)

  const bills = [
    { id: 'electric', label: 'Electricity',  icon: '⚡', due: '$124.50', dueDate: 'Apr 28' },
    { id: 'internet', label: 'Internet',     icon: '📡', due: '$80.00',  dueDate: 'May 02' },
    { id: 'water',    label: 'Water',        icon: '💧', due: '$45.20',  dueDate: 'May 05' },
    { id: 'rent',     label: 'Rent',         icon: '🏠', due: '$1,200',  dueDate: 'May 01' },
  ]

  const pay = async () => {
    if (!selected || !amount) return
    setPaying(true)
    await new Promise(r => setTimeout(r, 1800))
    setPaying(false)
    setDone(true)
    toast.success('Bill paid successfully', { description: `$${amount} sent to ${bills.find(b => b.id === selected)?.label}` })
    setTimeout(onClose, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 px-6 py-5 text-white">
          <div className="flex justify-between items-center">
            <p className="font-semibold">Pay a bill</p>
            <button onClick={onClose}><X className="w-5 h-5 opacity-70" /></button>
          </div>
        </div>

        {done ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <faCheck className="text-green-500 text-xl" />
              ✓
            </div>
            <p className="font-medium text-gray-800">Payment sent!</p>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Select biller</p>
            <div className="grid grid-cols-2 gap-2">
              {bills.map(b => (
                <button
                  key={b.id}
                  onClick={() => { setSelected(b.id); setAmount(b.due.replace(/[$,]/g, '')) }}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    selected === b.id
                      ? 'border-purple-400 bg-purple-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl mb-1">{b.icon}</span>
                  <p className="text-sm font-medium text-gray-800">{b.label}</p>
                  <p className="text-xs text-gray-500">Due {b.dueDate}</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">{b.due}</p>
                </button>
              ))}
            </div>

            {selected && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                <label className="text-xs text-gray-500">Amount ($)</label>
                <input
                  type="text"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={{ fontSize: '16px' }}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </motion.div>
            )}

            <button
              onClick={pay}
              disabled={!selected || !amount || paying}
              className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {paying ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/></svg>
                  Processing…
                </span>
              ) : 'Pay now'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ─── Invest modal ─────────────────────────────────────────────────────────────

function InvestModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount]   = useState('')
  const [asset,  setAsset]    = useState<string | null>(null)
  const [done,   setDone]     = useState(false)
  const [buying, setBuying]   = useState(false)

  const assets = [
    { id: 'sp500',  label: 'S&P 500 Index', ticker: 'VOO',  change: '+1.2%', price: '$432.10', positive: true  },
    { id: 'btc',    label: 'Bitcoin',        ticker: 'BTC',  change: '+3.8%', price: '$67,420', positive: true  },
    { id: 'bonds',  label: 'US Treasury',    ticker: 'BND',  change: '-0.1%', price: '$74.30',  positive: false },
    { id: 'nasdaq', label: 'NASDAQ 100',     ticker: 'QQQ',  change: '+2.1%', price: '$441.50', positive: true  },
  ]

  const buy = async () => {
    if (!asset || !amount) return
    setBuying(true)
    await new Promise(r => setTimeout(r, 2000))
    setBuying(false)
    setDone(true)
    toast.success('Investment placed', { description: `$${amount} invested in ${assets.find(a => a.id === asset)?.label}` })
    setTimeout(onClose, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 px-6 py-5 text-white">
          <div className="flex justify-between items-center">
            <p className="font-semibold">Invest funds</p>
            <button onClick={onClose}><X className="w-5 h-5 opacity-70" /></button>
          </div>
          <p className="text-sm opacity-80 mt-1">Choose an asset to invest in</p>
        </div>

        {done ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-2xl">📈</div>
            <p className="font-medium text-gray-800">Investment confirmed!</p>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-2">
              {assets.map(a => (
                <button
                  key={a.id}
                  onClick={() => setAsset(a.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    asset === a.id ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.label}</p>
                    <p className="text-xs text-gray-400">{a.ticker}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{a.price}</p>
                    <p className={`text-xs font-medium ${a.positive ? 'text-green-500' : 'text-red-500'}`}>{a.change}</p>
                  </div>
                </button>
              ))}
            </div>

            {asset && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                <label className="text-xs text-gray-500">Amount to invest ($)</label>
                <input
                  type="text"
                  placeholder="100.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={{ fontSize: '16px' }}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </motion.div>
            )}

            <button
              onClick={buy}
              disabled={!asset || !amount || buying}
              className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              {buying ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70"/></svg>
                  Placing order…
                </span>
              ) : 'Buy now'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ─── Savings goal modal ───────────────────────────────────────────────────────

function AddGoalModal({ onAdd, onClose }: { onAdd: (g: SavingsGoal) => void; onClose: () => void }) {
  const [name,   setName]   = useState('')
  const [target, setTarget] = useState('')
  const [saved,  setSaved]  = useState('')

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500']
  const [color, setColor] = useState(colors[0])

  const submit = () => {
    if (!name || !target) return
    onAdd({
      id:     Date.now().toString(),
      name,
      target: parseFloat(target),
      saved:  parseFloat(saved) || 0,
      color,
    })
    onClose()
    toast.success('Savings goal added!')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 px-6 py-5 text-white">
          <div className="flex justify-between items-center">
            <p className="font-semibold">New savings goal</p>
            <button onClick={onClose}><X className="w-5 h-5 opacity-70" /></button>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          {[
            { label: 'Goal name',           value: name,   set: setName,   placeholder: 'e.g. Vacation fund' },
            { label: 'Target amount ($)',    value: target, set: setTarget, placeholder: '5000' },
            { label: 'Already saved ($)',    value: saved,  set: setSaved,  placeholder: '0' },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
              <input
                type="text"
                value={f.value}
                placeholder={f.placeholder}
                onChange={e => f.set(e.target.value)}
                style={{ fontSize: '16px' }}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}

          <div>
            <label className="text-xs text-gray-500 block mb-2">Colour</label>
            <div className="flex gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full ${c} transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={submit}
            disabled={!name || !target}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium transition-all"
          >
            Create goal
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Contribute modal ─────────────────────────────────────────────────────────

function ContributeModal({ goal, onContribute, onClose }: { goal: SavingsGoal; onContribute: (id: string, amt: number) => void; onClose: () => void }) {
  const [amount, setAmount] = useState('')

  const submit = () => {
    const n = parseFloat(amount)
    if (!n || n <= 0) return
    onContribute(goal.id, n)
    toast.success(`$${n.toFixed(2)} added to ${goal.name}!`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-xs shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <p className="font-medium text-gray-800">Add to — {goal.name}</p>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="text-xs text-gray-400">
            ${goal.saved.toLocaleString()} saved of ${goal.target.toLocaleString()} target
          </div>
          <input
            type="text"
            placeholder="Amount ($)"
            value={amount}
            onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            autoFocus
            style={{ fontSize: '16px' }}
            className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={submit}
            disabled={!amount}
            className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white text-sm font-medium transition-all"
          >
            Contribute
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SavingsGoal {
  id: string
  name: string
  target: number
  saved: number
  color: string
}

// ─── Investment ticker ────────────────────────────────────────────────────────

const TICKERS = [
  { symbol: 'VOO',  base: 432.10 },
  { symbol: 'BTC',  base: 67420  },
  { symbol: 'AAPL', base: 189.50 },
  { symbol: 'QQQ',  base: 441.50 },
]

function LiveTicker() {
  const [prices, setPrices] = useState(TICKERS.map(t => ({ ...t, price: t.base, delta: 0 })))

  useEffect(() => {
    const id = setInterval(() => {
      setPrices(prev => prev.map(t => {
        const delta = (Math.random() - 0.49) * t.base * 0.002
        return { ...t, price: t.price + delta, delta }
      }))
    }, 1800)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
      {prices.map(t => (
        <div key={t.symbol} className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-semibold text-gray-600">{t.symbol}</span>
          <motion.span
            key={Math.round(t.price * 10)}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            className={`text-xs font-mono font-medium ${t.delta >= 0 ? 'text-green-500' : 'text-red-500'}`}
          >
            ${t.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </motion.span>
          <span className={`text-[10px] ${t.delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {t.delta >= 0 ? '▲' : '▼'}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [openModal,      setOpenModal]      = useState<'receive' | 'bills' | 'invest' | 'addGoal' | null>(null)
  const [openAccount,    setOpenAccount]    = useState<number | null>(null)
  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null)

  const [goals, setGoals] = useState<SavingsGoal[]>([
    { id: '1', name: 'Vacation fund', target: 3000,  saved: 1200, color: 'bg-blue-500'   },
    { id: '2', name: 'New car',       target: 25000, saved: 5400, color: 'bg-green-500'  },
  ])

  const accounts = [
    {
      name: 'Checking',
      balance: 7845.20,
      change: 4.2,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      history: [5200, 5400, 5100, 5600, 5750, 5690, 5845],
      transactions: [
        { desc: 'Papa`s Pizza',    amt: -30.20,  date: 'Oct 27'     },
        { desc: 'Salary deposit',   amt: 2750.00, date: 'Sep 29' },
        { desc: 'Electric bill',    amt: -124.50, date: 'Sep 25'    },
      ],
    },
    {
      name: 'Savings',
      balance: 16350.75,
      change: 1.8,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      history: [11200, 11500, 11800, 12000, 12100, 12250, 12350],
      transactions: [
        { desc: 'Auto transfer',    amt: 500.00,  date: 'Apr 01'   },
        { desc: 'Interest payment', amt: 12.88,   date: 'Mar 31'   },
      ],
    },
    {
      name: 'Investments',
      balance: 38640.50,
      change: 7.5,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      history: [28000, 29500, 30200, 31000, 31800, 32100, 32640],
      transactions: [
        { desc: 'VOO dividend',     amt: 84.20,   date: 'Apr 10'   },
        { desc: 'AAPL purchase',    amt: -500.00, date: 'Apr 05'   },
      ],
    },
  ]

  const recentTransactions = [
    { id: 1, name: 'Papa`s Pizza',       amount: -30.20,  date: 'Oct 27',     icon: '🍕' },
    { id: 2, name: 'Salary Deposit',      amount: 2750.00, date: 'Sep 29', icon: '💼' },
    { id: 3, name: 'Electric Bill',       amount: -124.50, date: 'Sep 25',    icon: '⚡' },
    { id: 4, name: 'Netflix Subscription',amount: -26.99,  date: 'Sep 20',    icon: '📺' },
  ]

  const expenseCategories = [
    { name: 'Food',          amount: 450, color: 'bg-orange-500', bgColor: 'bg-orange-100' },
    { name: 'Internet',      amount: 80,  color: 'bg-indigo-500', bgColor: 'bg-indigo-100' },
    { name: 'Gas',           amount: 120, color: 'bg-rose-500',   bgColor: 'bg-rose-100'   },
    { name: 'Gym',           amount: 50,  color: 'bg-cyan-500',   bgColor: 'bg-cyan-100'   },
    { name: 'Entertainment', amount: 200, color: 'bg-purple-500', bgColor: 'bg-purple-100' },
    { name: 'Healthcare',    amount: 150, color: 'bg-pink-500',   bgColor: 'bg-pink-100'   },
  ]

  const addGoal       = (g: SavingsGoal) => setGoals(prev => [...prev, g])
  const contribute    = (id: string, amt: number) => setGoals(prev => prev.map(g => g.id === id ? { ...g, saved: Math.min(g.saved + amt, g.target) } : g))
  const deleteGoal    = (id: string) => setGoals(prev => prev.filter(g => g.id !== id))

  return (
    <div className="bg-gray-50 min-h-screen py-16 lg:py-0">

      {/* Modals */}
      <AnimatePresence>
        {openModal === 'receive'  && <ReceiveModal   onClose={() => setOpenModal(null)} />}
        {openModal === 'bills'    && <PayBillsModal  onClose={() => setOpenModal(null)} />}
        {openModal === 'invest'   && <InvestModal    onClose={() => setOpenModal(null)} />}
        {openModal === 'addGoal'  && <AddGoalModal   onAdd={addGoal} onClose={() => setOpenModal(null)} />}
        {openAccount !== null     && <AccountModal   account={accounts[openAccount]} onClose={() => setOpenAccount(null)} />}
        {contributeGoal           && <ContributeModal goal={contributeGoal} onContribute={contribute} onClose={() => setContributeGoal(null)} />}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Financial Dashboard</h1>
            <p className="text-gray-500">Welcome back, Nancy!</p>
          </div>
          <div className="flex items-center gap-4">
    
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              PE
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Account balance cards — clickable */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Account Balance</h2>
                <FontAwesomeIcon icon={faChartLine} className="text-blue-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {accounts.map((acc, i) => (
                  <motion.button
                    key={acc.name}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setOpenAccount(i)}
                    className={`${acc.color} p-4 rounded-xl text-white text-left w-full transition-shadow hover:shadow-lg`}
                  >
                    <p className="text-sm opacity-80">{acc.name}</p>
                    <p className="text-2xl font-bold mt-1">
                      <AnimatedNumber value={acc.balance} duration={900} />
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 text-xs">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{acc.change}% this month</span>
                      </div>
                      <Sparkline data={acc.history} color="rgba(255,255,255,0.6)" />
                    </div>
                    <p className="text-[10px] opacity-50 mt-2">Tap for details →</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Live ticker on investments card */}
            <div className="bg-white rounded-xl px-6 py-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <p className="text-xs font-medium text-gray-500">Live market</p>
              </div>
              <LiveTicker />
            </div>

            {/* Cards section — simplified display only */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Your Cards</h2>
                <Link href="/virtual-card" className="flex items-center gap-2 text-blue-500 font-medium text-sm">
                  <FontAwesomeIcon icon={faPlus} />
                  Manage
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {/* Visa */}
                <div className="min-w-[260px] h-40 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-5 flex flex-col justify-between shrink-0">
                  <div className="flex justify-between items-center">
                    <Image src="/images/chip.png" alt="Chip" width={32} height={32} />
                    <Image src="/images/visa.png" alt="Visa" width={48} height={28} />
                  </div>
                  <div>
                    <p className="text-white font-mono tracking-widest text-sm">•••• •••• •••• 1412</p>
                    <div className="flex justify-between text-white text-xs mt-2 opacity-80">
                      <span>Johnson</span>
                      <span>24/12</span>
                    </div>
                  </div>
                </div>
                {/* Mastercard */}
                <div className="min-w-[260px] h-40 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 p-5 flex flex-col justify-between shrink-0">
                  <div className="flex justify-between items-center">
                    <Image src="/images/chip.png" alt="Chip" width={32} height={32} />
                    <Image src="/images/mastercard.png" alt="MC" width={48} height={28} />
                  </div>
                  <div>
                    <p className="text-white font-mono tracking-widest text-sm">•••• •••• •••• 5678</p>
                    <div className="flex justify-between text-white text-xs mt-2 opacity-80">
                      <span>Johnson</span>
                      <span>25/11</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expense categories */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Monthly Expenses</h2>
                <span className="text-xs text-gray-400">April 2025</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {expenseCategories.map((cat, i) => {
                  const total = expenseCategories.reduce((s, c) => s + c.amount, 0)
                  const pct   = Math.round((cat.amount / total) * 100)
                  return (
                    <motion.div
                      key={cat.name}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={`${cat.bgColor} rounded-xl p-4`}
                    >
                      <div className={`w-8 h-8 ${cat.color} rounded-full flex items-center justify-center text-white text-sm font-bold mb-2`}>
                        {cat.name.charAt(0)}
                      </div>
                      <p className="text-gray-700 font-medium text-sm">{cat.name}</p>
                      <p className="text-gray-900 font-bold">${cat.amount}</p>
                      <div className="mt-2 h-1 bg-white/60 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${cat.color} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: i * 0.06 + 0.3, duration: 0.6 }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">{pct}% of total</p>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/domestic-transfer">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="bg-blue-50 hover:bg-blue-100 p-4 rounded-xl flex flex-col items-center cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white mb-2">
                      <FontAwesomeIcon icon={faArrowUp} />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">Send</span>
                  </motion.div>
                </Link>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setOpenModal('receive')}
                  className="bg-green-50 hover:bg-green-100 p-4 rounded-xl flex flex-col items-center cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mb-2">
                    <FontAwesomeIcon icon={faArrowDown} />
                  </div>
                  <span className="text-gray-700 font-medium text-sm">Receive</span>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setOpenModal('bills')}
                  className="bg-purple-50 hover:bg-purple-100 p-4 rounded-xl flex flex-col items-center cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white mb-2">
                    <FontAwesomeIcon icon={faCreditCard} />
                  </div>
                  <span className="text-gray-700 font-medium text-sm">Pay Bills</span>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setOpenModal('invest')}
                  className="bg-amber-50 hover:bg-amber-100 p-4 rounded-xl flex flex-col items-center cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white mb-2">
                    <FontAwesomeIcon icon={faChartLine} />
                  </div>
                  <span className="text-gray-700 font-medium text-sm">Invest</span>
                </motion.div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
                <Link href="/transactions" className="text-sm text-blue-500 font-medium">See All</Link>
              </div>
              <div className="space-y-3">
                {recentTransactions.map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                        {tx.icon}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{tx.name}</p>
                        <p className="text-xs text-gray-400">{tx.date}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Savings Goals */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Savings Goals</h2>
                <button
                  onClick={() => setOpenModal('addGoal')}
                  className="w-7 h-7 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <AnimatePresence>
                {goals.length === 0 && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-gray-400 text-center py-4">
                    No goals yet. Add one!
                  </motion.p>
                )}
                {goals.map(goal => {
                  const pct = Math.min(Math.round((goal.saved / goal.target) * 100), 100)
                  const done = pct >= 100
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="mb-4 last:mb-0"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">{goal.name}</span>
                          {done && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">✓ Complete</span>}
                        </div>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                        <span>${goal.saved.toLocaleString()} saved</span>
                        <span>${goal.target.toLocaleString()} goal</span>
                      </div>

                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${done ? 'bg-green-500' : goal.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>

                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-[11px] text-gray-400">{pct}%</span>
                        {!done && (
                          <button
                            onClick={() => setContributeGoal(goal)}
                            className="text-[11px] text-blue-500 hover:text-blue-700 font-medium flex items-center gap-0.5 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Add funds
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}