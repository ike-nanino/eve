'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/toast';
import {
  Card, CardContent, CardHeader,
} from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  BanknoteIcon, ArrowRightCircle, HelpCircle, CheckCircle2,
  AlertTriangle, Info, CreditCard, Building2, FileText,
  Banknote, ShieldCheck, Clock, ChevronRight, Loader2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type AccountId = 'savings' | 'checking' | 'investment';
type WithdrawalMethod = 'atm' | 'bank-transfer' | 'check' | 'cash';

interface Account {
  id: AccountId;
  name: string;
  balance: number;
  number: string;
  overdraftLimit: number; // how much over balance is allowed
  overdraftFee: number;
}

interface WithdrawalMethodOption {
  id: WithdrawalMethod;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  fee: number;
  eta: string;
  limit: number; // per-transaction limit
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ACCOUNTS: Account[] = [
  { id: 'checking',   name: 'Checking',   number: '••4821', balance: 5680.32,  overdraftLimit: 500,  overdraftFee: 35  },
  { id: 'savings',    name: 'Savings',    number: '••9302', balance: 12450.75, overdraftLimit: 0,    overdraftFee: 0   },
  { id: 'investment', name: 'Investment', number: '••2211', balance: 34200.18, overdraftLimit: 0,    overdraftFee: 0   },
];

const METHODS: WithdrawalMethodOption[] = [
  { id: 'atm',           label: 'ATM withdrawal',  sublabel: 'Ready in 30 min',       icon: <CreditCard className="w-4 h-4"  />, fee: 0,    eta: '~30 minutes',      limit: 1000  },
  { id: 'bank-transfer', label: 'Bank transfer',   sublabel: '1–3 business days',     icon: <Building2  className="w-4 h-4"  />, fee: 0,    eta: '1–3 business days',limit: 50000 },
  { id: 'check',         label: 'Paper check',     sublabel: '3–5 business days',     icon: <FileText   className="w-4 h-4"  />, fee: 5,    eta: '3–5 business days',limit: 25000 },
  { id: 'cash',          label: 'Cash pickup',     sublabel: 'Visit nearest branch',  icon: <Banknote   className="w-4 h-4"  />, fee: 0,    eta: 'Same day',         limit: 5000  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parseAmount(raw: string): number {
  return parseFloat(raw.replace(/,/g, '')) || 0;
}

function formatInput(raw: string): string {
  const clean = raw.replace(/[^0-9.]/g, '');
  const parts = clean.split('.');
  const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.length > 1 ? `${int}.${parts[1].slice(0, 2)}` : int;
}

// ─── Quick-amount chips ───────────────────────────────────────────────────────

const QUICK = [100, 250, 500, 1000];

// ─── Component ────────────────────────────────────────────────────────────────

export default function WithdrawalPage() {
  const [accountId,   setAccountId]   = useState<AccountId | ''>('');
  const [methodId,    setMethodId]    = useState<WithdrawalMethod | ''>('');
  const [amountRaw,   setAmountRaw]   = useState('');
  const [note,        setNote]        = useState('');
  const [pin,         setPin]         = useState('');
  const [pinVisible,  setPinVisible]  = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [stage,       setStage]       = useState<'form' | 'processing' | 'success'>('form');

  const account = ACCOUNTS.find(a => a.id === accountId) ?? null;
  const method  = METHODS.find(m => m.id === methodId)   ?? null;
  const amount  = parseAmount(amountRaw);

  // ── Derived states ──────────────────────────────────────────────────────────
  const overBalance    = account ? amount > account.balance : false;
  const intoOverdraft  = overBalance && account ? account.overdraftLimit > 0 && amount <= account.balance + account.overdraftLimit : false;
  const exceedsOverdraft = overBalance && account ? amount > account.balance + account.overdraftLimit : false;
  const exceedsMethodLimit = method ? amount > method.limit : false;
  const totalFee       = method?.fee ?? 0;
  const totalDeducted  = amount + totalFee;

  const remainingBalance = account
    ? account.balance - totalDeducted
    : 0;

  const isValid =
    !!account &&
    !!method &&
    amount >= 1 &&
    !exceedsOverdraft &&
    !exceedsMethodLimit &&
    (methodId !== 'atm' || pin.length === 4);

  // ── Reset pin when method changes ───────────────────────────────────────────
  useEffect(() => { setPin(''); }, [methodId]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    setStage('processing');
    await new Promise(r => setTimeout(r, 2400));

    const ok = Math.random() > 0.25;

    if (ok) {
      setStage('success');
      toast.success('Withdrawal confirmed', {
        description: `$${fmt(amount)} will be available via ${method?.label}. ${method?.eta}.`,
        duration: 7000,
      });
      setTimeout(() => {
        setStage('form');
        setAmountRaw('');
        setAccountId('');
        setMethodId('');
        setNote('');
        setPin('');
      }, 3500);
    } else {
      setStage('form');
      toast.error('Withdrawal declined', {
        description: 'We could not process this request. Please contact support at 1-800-555-0199.',
        duration: 9000,
      });
    }
  };

  // ── Balance bar width ────────────────────────────────────────────────────────
  const barPct = account
    ? Math.min(100, Math.max(0, (amount / (account.balance + account.overdraftLimit || 1)) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-muted/40 py-10 px-4 pb-10 md:pb-18 lg:pt-0 p-4 lg:p-8 pt-20 md:pt-0">
      <div className="max-w-lg mx-auto space-y-4">

        {/* ── Account summary cards ── */}
        <div className="grid grid-cols-3 gap-3">
          {ACCOUNTS.map(acc => (
            <button
              key={acc.id}
              type="button"
              onClick={() => setAccountId(acc.id)}
              className={`text-left p-3 rounded-xl border transition-all ${
                accountId === acc.id
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-300'
                  : 'border-border bg-background hover:bg-muted/40'
              }`}
            >
              <p className="text-[11px] text-muted-foreground">{acc.name}</p>
              <p className="text-sm font-medium mt-0.5">${fmt(acc.balance)}</p>
              <p className="text-[10px] text-muted-foreground">{acc.number}</p>
            </button>
          ))}
        </div>

        {/* ── Main card ── */}
        <Card className="overflow-hidden border-border">
          <CardHeader className="px-5 py-4 border-b border-border flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <BanknoteIcon className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm">Withdraw funds</span>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" />
              Encrypted
            </span>
          </CardHeader>

          <CardContent className="p-0">
            <AnimatePresence mode="wait">

              {/* ── Processing ── */}
              {stage === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="py-16 flex flex-col items-center gap-4 px-6"
                >
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <p className="text-sm text-muted-foreground">Processing your withdrawal…</p>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-blue-500 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2.2, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>
              )}

              {/* ── Success ── */}
              {stage === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="py-16 flex flex-col items-center gap-3 text-center px-6"
                >
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                  <p className="font-medium">Withdrawal confirmed</p>
                  <p className="text-sm text-muted-foreground">
                    ${fmt(amount)} is on its way. {method?.eta}.
                  </p>
                  {intoOverdraft && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-1">
                      Overdraft fee of ${fmt(account!.overdraftFee)} has been applied.
                    </p>
                  )}
                </motion.div>
              )}

              {/* ── Form ── */}
              {stage === 'form' && (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="p-5 space-y-5"
                >

                  {/* Amount */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Amount to withdraw</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={amountRaw}
                        onChange={e => setAmountRaw(formatInput(e.target.value))}
                        className="w-full h-12 pl-7 pr-3 text-lg font-medium rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                      />
                    </div>

                    {/* Quick-pick chips */}
                    <div className="flex gap-2 flex-wrap">
                      {QUICK.map(q => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setAmountRaw(formatInput(String(q)))}
                          className="text-xs px-3 py-1 rounded-full border border-border bg-background hover:bg-muted/50 transition-colors"
                        >
                          ${q.toLocaleString()}
                        </button>
                      ))}
                      {account && (
                        <button
                          type="button"
                          onClick={() => setAmountRaw(formatInput(String(account.balance)))}
                          className="text-xs px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          Max ${fmt(account.balance)}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Balance bar + overdraft warnings */}
                  <AnimatePresence>
                    {account && amount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        {/* Bar */}
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>Balance used</span>
                          <span>${fmt(Math.min(amount, account.balance))} of ${fmt(account.balance)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full transition-colors ${
                              exceedsOverdraft ? 'bg-red-500' :
                              intoOverdraft    ? 'bg-amber-400' : 'bg-blue-500'
                            }`}
                            animate={{ width: `${barPct}%` }}
                            transition={{ type: 'spring', stiffness: 120 }}
                          />
                        </div>

                        {/* Normal: show projected balance */}
                        {!overBalance && (
                          <p className="text-[11px] text-muted-foreground">
                            Remaining balance after withdrawal:{' '}
                            <span className="font-medium text-foreground">${fmt(remainingBalance)}</span>
                          </p>
                        )}

                        {/* Overdraft eligible */}
                        {intoOverdraft && (
                          <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800"
                          >
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                            <div className="text-xs space-y-0.5">
                              <p className="font-medium">This withdrawal will trigger an overdraft</p>
                              <p>
                                You're ${fmt(amount - account.balance)} over your balance.
                                A fee of <span className="font-medium">${fmt(account.overdraftFee)}</span> will apply.
                                Your account will show <span className="font-medium text-red-600">-${fmt(amount - account.balance)}</span> after this transaction.
                              </p>
                            </div>
                          </motion.div>
                        )}

                        {/* Exceeds overdraft limit */}
                        {exceedsOverdraft && (
                          <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800"
                          >
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                            <div className="text-xs space-y-0.5">
                              <p className="font-medium">Insufficient funds</p>
                              <p>
                                Your available balance is ${fmt(account.balance)}
                                {account.overdraftLimit > 0 ? ` with a $${fmt(account.overdraftLimit)} overdraft allowance.` : '.'} {' '}
                                {account.overdraftLimit > 0
                                  ? `Max you can withdraw is $${fmt(account.balance + account.overdraftLimit)}.`
                                  : 'This account does not support overdrafts.'}
                              </p>
                            </div>
                          </motion.div>
                        )}

                        {/* Exceeds method limit */}
                        {exceedsMethodLimit && method && (
                          <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800"
                          >
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                            <p className="text-xs">
                              <span className="font-medium">{method.label}</span> has a per-transaction limit of{' '}
                              <span className="font-medium">${fmt(method.limit)}</span>. Please choose a different method or split the withdrawal.
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Withdrawal method tiles */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Withdrawal method</label>
                    <div className="grid grid-cols-2 gap-2">
                      {METHODS.map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMethodId(m.id)}
                          className={`flex items-start gap-2 p-3 rounded-xl border text-left transition-all ${
                            methodId === m.id
                              ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-300'
                              : 'border-border bg-background hover:bg-muted/40'
                          }`}
                        >
                          <span className={`mt-0.5 ${methodId === m.id ? 'text-blue-600' : 'text-muted-foreground'}`}>
                            {m.icon}
                          </span>
                          <div>
                            <p className="text-xs font-medium leading-tight">{m.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{m.sublabel}</p>
                            {m.fee > 0 && (
                              <p className="text-[10px] text-amber-600 mt-0.5">${fmt(m.fee)} fee</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ATM PIN field */}
                  <AnimatePresence>
                    {methodId === 'atm' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <label className="text-xs font-medium text-muted-foreground">ATM PIN (4 digits)</label>
                        <div className="relative">
                          <input
                            type={pinVisible ? 'text' : 'password'}
                            inputMode="numeric"
                            maxLength={4}
                            value={pin}
                            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="••••"
                            className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all tracking-[0.4em]"
                          />
                          <button
                            type="button"
                            onClick={() => setPinVisible(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {pinVisible ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <div className="flex items-start gap-1.5 text-[11px] text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                          <Info className="w-3 h-3 mt-0.5 shrink-0" />
                          A one-time code will be sent to your registered phone for verification at the ATM.
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bank transfer info */}
                  <AnimatePresence>
                    {methodId === 'bank-transfer' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-2 text-[11px] text-muted-foreground bg-muted rounded-xl px-3 py-2.5"
                      >
                        <Clock className="w-3 h-3 mt-0.5 shrink-0" />
                        Transfers submitted after 5:00 PM ET may not begin processing until the next business day. Weekends and holidays add 1 day.
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Optional note */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Memo / note <span className="font-normal">(optional)</span></label>
                    <textarea
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="e.g. Rent payment"
                      maxLength={120}
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Fee summary */}
                  <AnimatePresence>
                    {amount > 0 && method && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="rounded-xl border border-border bg-background divide-y divide-border text-sm"
                      >
                        {[
                          { label: 'Withdrawal amount', value: `$${fmt(amount)}` },
                          { label: `${method.label} fee`, value: totalFee > 0 ? `$${fmt(totalFee)}` : 'Free' },
                          { label: 'Total deducted',    value: `$${fmt(totalDeducted)}`, bold: true },
                        ].map(row => (
                          <div key={row.label} className="flex justify-between px-4 py-2.5">
                            <span className={row.bold ? 'font-medium' : 'text-muted-foreground'}>{row.label}</span>
                            <span className={row.bold ? 'font-medium' : ''}>{row.value}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-4 h-11 rounded-xl border border-border bg-background text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
                      onClick={() => toast.info('Support: 1-800-555-0199', { description: 'Available Mon–Fri, 8am–8pm ET.' })}
                    >
                      <HelpCircle className="w-4 h-4" />
                      Help
                    </button>
                    <button
                      type="submit"
                      disabled={!isValid}
                      className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                      {amount > 0 ? `Withdraw $${fmt(amount)}` : 'Enter an amount'}
                      <ArrowRightCircle className="w-4 h-4" />
                    </button>
                  </div>

                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {/* ── Confirm dialog ── */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm withdrawal</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  You're withdrawing <span className="font-medium text-foreground">${fmt(amount)}</span> from your{' '}
                  <span className="font-medium text-foreground">{account?.name} {account?.number}</span> via{' '}
                  <span className="font-medium text-foreground">{method?.label}</span>.
                </p>
                {totalFee > 0 && (
                  <p>A fee of <span className="font-medium text-foreground">${fmt(totalFee)}</span> applies. Total deducted: <span className="font-medium text-foreground">${fmt(totalDeducted)}</span>.</p>
                )}
                {intoOverdraft && (
                  <div className="flex gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-xs">
                      This will overdraft your account by <span className="font-medium">${fmt(amount - (account?.balance ?? 0))}</span>.
                      An overdraft fee of <span className="font-medium">${fmt(account?.overdraftFee ?? 0)}</span> will be charged.
                    </p>
                  </div>
                )}
                <p className="text-xs">Estimated availability: <span className="font-medium text-foreground">{method?.eta}</span>.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700 text-white">
              Confirm withdrawal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}