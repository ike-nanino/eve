'use client';

import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BadgeDollarSign, Home, ChevronRight, Info,
  CheckCircle2, Loader2, ShieldCheck, TrendingDown,
  AlertTriangle, Calculator,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const LOAN_RATES: Record<number, number> = {
  6:  0.089,
  12: 0.099,
  24: 0.114,
  36: 0.129,
};

const MORTGAGE_RATES: Record<number, number> = {
  10: 0.0612,
  15: 0.0589,
  20: 0.0574,
  30: 0.0699,
};

const LOAN_PURPOSES = [
  'Debt consolidation',
  'Home improvement',
  'Medical expenses',
  'Education',
  'Vehicle purchase',
  'Business startup',
  'Emergency fund',
  'Other',
];

const EMPLOYMENT_TYPES = ['Full-time employed', 'Self-employed', 'Part-time employed', 'Retired', 'Other'];
const CREDIT_BANDS = ['Excellent (750+)', 'Good (700–749)', 'Fair (650–699)', 'Poor (below 650)'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 2) {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function parseNum(s: string) {
  return parseFloat(s.replace(/,/g, '')) || 0;
}

function formatInput(raw: string) {
  const clean = raw.replace(/[^0-9.]/g, '');
  const parts = clean.split('.');
  const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.length > 1 ? `${int}.${parts[1].slice(0, 2)}` : int;
}

/** Monthly payment using standard amortisation formula */
function amortise(principal: number, annualRate: number, months: number): number {
  if (!principal || !months) return 0;
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

// ─── Reusable field components ────────────────────────────────────────────────

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1">
      <label className="text-xs font-medium text-muted-foreground">{children}</label>
      {hint && (
        <span title={hint}>
          <Info className="w-3 h-3 text-muted-foreground/60 cursor-help" />
        </span>
      )}
    </div>
  );
}

function TextInput({
  value, onChange, placeholder, type = 'text', prefix, required,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; prefix?: string; required?: boolean;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
          {prefix}
        </span>
      )}
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(type === 'text' ? e.target.value : formatInput(e.target.value))}
        className={`w-full h-10 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all ${prefix ? 'pl-7 pr-3' : 'px-3'}`}
      />
    </div>
  );
}

function NativeSelect({
  value, onChange, options, placeholder,
}: {
  value: string; onChange: (v: string) => void;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ─── Summary row in the breakdown panel ──────────────────────────────────────

function SummaryRow({ label, value, bold, accent }: {
  label: string; value: string; bold?: boolean; accent?: 'blue' | 'green' | 'red';
}) {
  const color = accent === 'blue' ? 'text-blue-600' : accent === 'green' ? 'text-green-600' : accent === 'red' ? 'text-red-600' : '';
  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
      <span className={`text-xs ${bold ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{label}</span>
      <span className={`text-xs font-medium ${color || (bold ? 'text-foreground' : 'text-muted-foreground')}`}>{value}</span>
    </div>
  );
}

// ─── Eligibility checklist ────────────────────────────────────────────────────

const LOAN_ELIGIBILITY = [
  'Min. age 18 years',
  'Regular income source',
  'Valid government ID',
  'Credit score 600+',
];
const MORTGAGE_ELIGIBILITY = [
  'Min. 10% down payment',
  'Debt-to-income below 43%',
  'Stable employment (2+ yrs)',
  'Property appraisal required',
];

function EligibilityChecklist({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map(item => (
        <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabButton({
  active, onClick, icon, label, sublabel,
}: {
  active: boolean; onClick: () => void;
  icon: React.ReactNode; label: string; sublabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
        active
          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
          : 'border-border bg-background hover:bg-muted/40'
      }`}
    >
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-blue-100 text-blue-600' : 'bg-muted text-muted-foreground'}`}>
        {icon}
      </span>
      <div>
        <p className={`text-sm font-medium ${active ? 'text-blue-800' : ''}`}>{label}</p>
        <p className="text-[11px] text-muted-foreground">{sublabel}</p>
      </div>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = 'loan' | 'mortgage';
type Stage = 'form' | 'processing' | 'success';

export default function LoansAndMortgages() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('loan');
  const [stage, setStage] = useState<Stage>('form');

  // ── Loan state ──
  const [lFullName,    setLFullName]    = useState('');
  const [lEmail,       setLEmail]       = useState('');
  const [lPhone,       setLPhone]       = useState('');
  const [lAmount,      setLAmount]      = useState('');
  const [lDuration,    setLDuration]    = useState('12');
  const [lPurpose,     setLPurpose]     = useState('');
  const [lEmployment,  setLEmployment]  = useState('');
  const [lCredit,      setLCredit]      = useState('');
  const [lIncome,      setLIncome]      = useState('');

  // ── Mortgage state ──
  const [mFullName,    setMFullName]    = useState('');
  const [mEmail,       setMEmail]       = useState('');
  const [mPhone,       setMPhone]       = useState('');
  const [mValue,       setMValue]       = useState('');
  const [mDown,        setMDown]        = useState('');
  const [mDuration,    setMDuration]    = useState('30');
  const [mEmployment,  setMEmployment]  = useState('');
  const [mCredit,      setMCredit]      = useState('');
  const [mIncome,      setMIncome]      = useState('');

  // ── Loan calcs ──
  const lPrincipal   = parseNum(lAmount);
  const lRate        = LOAN_RATES[Number(lDuration)] ?? 0.099;
  const lMonths      = Number(lDuration);
  const lMonthly     = amortise(lPrincipal, lRate, lMonths);
  const lTotalRepay  = lMonthly * lMonths;
  const lTotalInterest = lTotalRepay - lPrincipal;
  const lDTI = lIncome ? (lMonthly / (parseNum(lIncome) / 12)) * 100 : 0;

  // ── Mortgage calcs ──
  const mPropValue   = parseNum(mValue);
  const mDownAmt     = parseNum(mDown);
  const mPrincipal   = Math.max(0, mPropValue - mDownAmt);
  const mDownPct     = mPropValue > 0 ? (mDownAmt / mPropValue) * 100 : 0;
  const mRate        = MORTGAGE_RATES[Number(mDuration)] ?? 0.0699;
  const mMonths      = Number(mDuration) * 12;
  const mMonthly     = amortise(mPrincipal, mRate, mMonths);
  const mTotalRepay  = mMonthly * mMonths;
  const mTotalInterest = mTotalRepay - mPrincipal;
  const mDTI = mIncome ? (mMonthly / (parseNum(mIncome) / 12)) * 100 : 0;
  const mLTV = mPropValue > 0 ? (mPrincipal / mPropValue) * 100 : 0;
  const mNeedsPMI = mDownPct < 20;
  const mPMI = mNeedsPMI ? (mPrincipal * 0.008) / 12 : 0;

  // ── Warnings ──
  const lAmountWarning  = lPrincipal > 100000 ? 'Amounts over $100,000 may require additional documentation.' : '';
  const lDTIWarning     = lDTI > 43 ? `Debt-to-income ratio of ${fmt(lDTI, 0)}% exceeds the recommended 43%. Approval may be difficult.` : '';
  const mDownWarning    = mDownPct > 0 && mDownPct < 10 ? 'Most lenders require at least 10% down payment.' : '';
  const mDownExceed     = mDownAmt >= mPropValue && mPropValue > 0 ? 'Down payment cannot equal or exceed property value.' : '';

  const lValid = lFullName && lAmount && lPurpose && lEmployment && lCredit && !mDownExceed;
  const mValid = mFullName && mValue && mDown && mEmployment && mCredit && !mDownExceed && mDownPct >= 10;

  const submit = async (type: Tab) => {
    setStage('processing');
    await new Promise(r => setTimeout(r, 2500));
    const ok = Math.random() > 0.2;
    if (ok) {
      setStage('success');
      toast.success(`${type === 'loan' ? 'Loan' : 'Mortgage'} application submitted`, {
        description: 'Our team will review your application and contact you within 2–3 business days.',
        duration: 8000,
      });
      setTimeout(() => router.push('/dashboard'), 3500);
    } else {
      setStage('form');
      toast.error('Submission failed', {
        description: 'We could not submit your application. Please try again or call 1-800-555-0199.',
        duration: 9000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 py-10 px-4 pb-10 md:pb-18 lg:pt-0 p-4 lg:p-8 pt-20 md:pt-0">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-xl font-medium">Loans & mortgages</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Apply for a personal loan or home mortgage. Competitive rates, fast decisions.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-3">
          <TabButton
            active={tab === 'loan'}
            onClick={() => { setTab('loan'); setStage('form'); }}
            icon={<BadgeDollarSign className="w-4 h-4" />}
            label="Personal loan"
            sublabel="Up to $100,000 · 6–36 months"
          />
          <TabButton
            active={tab === 'mortgage'}
            onClick={() => { setTab('mortgage'); setStage('form'); }}
            icon={<Home className="w-4 h-4" />}
            label="Home mortgage"
            sublabel="10–30 year terms · fixed rate"
          />
        </div>

        <AnimatePresence mode="wait">

          {/* ── Processing ── */}
          {stage === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-background border border-border rounded-2xl p-16 flex flex-col items-center gap-4"
            >
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-muted-foreground">Submitting your application…</p>
              <div className="w-64 bg-muted rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2.4, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          )}

          {/* ── Success ── */}
          {stage === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-background border border-border rounded-2xl p-16 flex flex-col items-center gap-3 text-center"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="font-medium">Application submitted</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                We've received your {tab === 'loan' ? 'loan' : 'mortgage'} application. Expect a response within 2–3 business days.
              </p>
              <p className="text-xs text-muted-foreground">Redirecting to dashboard…</p>
            </motion.div>
          )}

          {/* ── Loan form ── */}
          {stage === 'form' && tab === 'loan' && (
            <motion.div
              key="loan-form"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-5"
            >
              {/* Form */}
              <div className="lg:col-span-2 bg-background border border-border rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <BadgeDollarSign className="w-4 h-4 text-blue-600" />
                    Personal loan application
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    256-bit encrypted
                  </span>
                </div>

                <form
                  onSubmit={e => { e.preventDefault(); if (lValid) submit('loan'); }}
                  className="p-5 space-y-4"
                >
                  {/* Personal */}
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Personal details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Full name</FieldLabel>
                      <TextInput value={lFullName} onChange={setLFullName} placeholder="Jane Doe" required />
                    </div>
                    <div>
                      <FieldLabel>Email address</FieldLabel>
                      <TextInput value={lEmail} onChange={setLEmail} placeholder="jane@example.com" type="text" />
                    </div>
                    <div>
                      <FieldLabel>Phone number</FieldLabel>
                      <TextInput value={lPhone} onChange={setLPhone} placeholder="+1 (555) 000-0000" />
                    </div>
                    <div>
                      <FieldLabel>Employment status</FieldLabel>
                      <NativeSelect
                        value={lEmployment} onChange={setLEmployment}
                        placeholder="Select..."
                        options={EMPLOYMENT_TYPES.map(e => ({ value: e, label: e }))}
                      />
                    </div>
                    <div>
                      <FieldLabel hint="Used to calculate debt-to-income ratio">Monthly gross income ($)</FieldLabel>
                      <TextInput value={lIncome} onChange={setLIncome} placeholder="5,000.00" prefix="$" />
                    </div>
                    <div>
                      <FieldLabel hint="Helps us offer the best rate">Credit score range</FieldLabel>
                      <NativeSelect
                        value={lCredit} onChange={setLCredit}
                        placeholder="Select..."
                        options={CREDIT_BANDS.map(c => ({ value: c, label: c }))}
                      />
                    </div>
                  </div>

                  {/* Loan details */}
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide pt-1">Loan details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Loan amount</FieldLabel>
                      <TextInput value={lAmount} onChange={setLAmount} placeholder="10,000.00" prefix="$" required />
                      {lAmountWarning && (
                        <p className="flex items-center gap-1 text-[11px] text-amber-600 mt-1">
                          <AlertTriangle className="w-3 h-3" />{lAmountWarning}
                        </p>
                      )}
                    </div>
                    <div>
                      <FieldLabel>Repayment period</FieldLabel>
                      <NativeSelect
                        value={lDuration} onChange={setLDuration}
                        options={Object.keys(LOAN_RATES).map(k => ({ value: k, label: `${k} months` }))}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <FieldLabel>Loan purpose</FieldLabel>
                      <NativeSelect
                        value={lPurpose} onChange={setLPurpose}
                        placeholder="Select purpose..."
                        options={LOAN_PURPOSES.map(p => ({ value: p, label: p }))}
                      />
                    </div>
                  </div>

                  {/* DTI warning */}
                  <AnimatePresence>
                    {lDTIWarning && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="flex gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs"
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        {lDTIWarning}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={!lValid}
                    className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    Submit loan application
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-[11px] text-muted-foreground">
                    Applying does not affect your credit score. A soft check is performed initially.
                  </p>
                </form>
              </div>

              {/* Right panel */}
              <div className="space-y-4">
                {/* Live calculator */}
                <div className="bg-background border border-border rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Calculator className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium">Live estimate</p>
                  </div>
                  {lPrincipal > 0 ? (
                    <>
                      <SummaryRow label="Principal"            value={`$${fmt(lPrincipal)}`} />
                      <SummaryRow label={`Rate (${lMonths}mo)`} value={`${(lRate * 100).toFixed(1)}% APR`} />
                      <SummaryRow label="Monthly payment"      value={`$${fmt(lMonthly)}`} bold accent="blue" />
                      <SummaryRow label="Total interest"       value={`$${fmt(lTotalInterest)}`} accent="red" />
                      <SummaryRow label="Total repayment"      value={`$${fmt(lTotalRepay)}`} bold />
                      {lDTI > 0 && (
                        <SummaryRow
                          label="Debt-to-income ratio"
                          value={`${fmt(lDTI, 1)}%`}
                          accent={lDTI > 43 ? 'red' : lDTI > 30 ? undefined : 'green'}
                        />
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Enter a loan amount to see your estimate.</p>
                  )}
                </div>

                {/* Rate table */}
                <div className="bg-background border border-border rounded-2xl p-4">
                  <p className="text-xs font-medium mb-3 flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 text-green-500" />
                    Current loan rates
                  </p>
                  <div className="space-y-1">
                    {Object.entries(LOAN_RATES).map(([mo, rate]) => (
                      <div
                        key={mo}
                        className={`flex justify-between text-xs px-2 py-1.5 rounded-lg transition-colors ${
                          lDuration === mo ? 'bg-blue-50 text-blue-800 font-medium' : 'text-muted-foreground'
                        }`}
                      >
                        <span>{mo} months</span>
                        <span>{(rate * 100).toFixed(1)}% APR</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Eligibility */}
                <div className="bg-background border border-border rounded-2xl p-4">
                  <p className="text-xs font-medium mb-3">Eligibility requirements</p>
                  <EligibilityChecklist items={LOAN_ELIGIBILITY} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Mortgage form ── */}
          {stage === 'form' && tab === 'mortgage' && (
            <motion.div
              key="mortgage-form"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-5"
            >
              {/* Form */}
              <div className="lg:col-span-2 bg-background border border-border rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Home className="w-4 h-4 text-blue-600" />
                    Mortgage application
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    256-bit encrypted
                  </span>
                </div>

                <form
                  onSubmit={e => { e.preventDefault(); if (mValid) submit('mortgage'); }}
                  className="p-5 space-y-4"
                >
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Personal details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Full name</FieldLabel>
                      <TextInput value={mFullName} onChange={setMFullName} placeholder="Jane Doe" required />
                    </div>
                    <div>
                      <FieldLabel>Email address</FieldLabel>
                      <TextInput value={mEmail} onChange={setMEmail} placeholder="jane@example.com" />
                    </div>
                    <div>
                      <FieldLabel>Phone number</FieldLabel>
                      <TextInput value={mPhone} onChange={setMPhone} placeholder="+1 (555) 000-0000" />
                    </div>
                    <div>
                      <FieldLabel>Employment status</FieldLabel>
                      <NativeSelect
                        value={mEmployment} onChange={setMEmployment}
                        placeholder="Select..."
                        options={EMPLOYMENT_TYPES.map(e => ({ value: e, label: e }))}
                      />
                    </div>
                    <div>
                      <FieldLabel hint="Annual income helps calculate affordability">Annual gross income ($)</FieldLabel>
                      <TextInput value={mIncome} onChange={setMIncome} placeholder="80,000.00" prefix="$" />
                    </div>
                    <div>
                      <FieldLabel>Credit score range</FieldLabel>
                      <NativeSelect
                        value={mCredit} onChange={setMCredit}
                        placeholder="Select..."
                        options={CREDIT_BANDS.map(c => ({ value: c, label: c }))}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide pt-1">Property details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Property value</FieldLabel>
                      <TextInput value={mValue} onChange={setMValue} placeholder="350,000.00" prefix="$" required />
                    </div>
                    <div>
                      <FieldLabel hint="Minimum 10% of property value">Down payment</FieldLabel>
                      <TextInput value={mDown} onChange={setMDown} placeholder="70,000.00" prefix="$" required />
                    </div>
                    <div className="sm:col-span-2">
                      <FieldLabel>Loan term</FieldLabel>
                      <NativeSelect
                        value={mDuration} onChange={setMDuration}
                        options={Object.keys(MORTGAGE_RATES).map(k => ({ value: k, label: `${k} years` }))}
                      />
                    </div>
                  </div>

                  {/* Down payment warnings */}
                  <AnimatePresence>
                    {(mDownWarning || mDownExceed) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="flex gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs"
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        {mDownExceed || mDownWarning}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* PMI notice */}
                  <AnimatePresence>
                    {mNeedsPMI && mPropValue > 0 && mDownPct >= 10 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="flex gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs"
                      >
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                          Your down payment is below 20% (LTV {fmt(mLTV, 1)}%). Private mortgage insurance (PMI) of approximately{' '}
                          <strong>${fmt(mPMI)}/mo</strong> will apply until you reach 20% equity.
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* DTI warning */}
                  <AnimatePresence>
                    {mDTI > 43 && mIncome && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="flex gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs"
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        Debt-to-income ratio of {fmt(mDTI, 1)}% exceeds the 43% threshold. Approval may be difficult. Consider a larger down payment or longer term.
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={!mValid}
                    className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    Submit mortgage application
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-[11px] text-muted-foreground">
                    A soft credit inquiry is performed first and does not affect your score.
                  </p>
                </form>
              </div>

              {/* Right panel */}
              <div className="space-y-4">
                <div className="bg-background border border-border rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Calculator className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium">Live estimate</p>
                  </div>
                  {mPrincipal > 0 ? (
                    <>
                      <SummaryRow label="Property value"       value={`$${fmt(mPropValue)}`} />
                      <SummaryRow label="Down payment"         value={`$${fmt(mDownAmt)} (${fmt(mDownPct, 1)}%)`} />
                      <SummaryRow label="Loan principal"       value={`$${fmt(mPrincipal)}`} />
                      <SummaryRow label={`Rate (${mDuration}yr)`} value={`${(mRate * 100).toFixed(2)}% APR`} />
                      <SummaryRow label="Monthly payment"      value={`$${fmt(mMonthly)}`} bold accent="blue" />
                      {mNeedsPMI && <SummaryRow label="+ PMI est."  value={`$${fmt(mPMI)}/mo`} accent="red" />}
                      <SummaryRow label="Total interest"       value={`$${fmt(mTotalInterest)}`} accent="red" />
                      <SummaryRow label="Total repayment"      value={`$${fmt(mTotalRepay)}`} bold />
                      {mDTI > 0 && (
                        <SummaryRow
                          label="Debt-to-income"
                          value={`${fmt(mDTI, 1)}%`}
                          accent={mDTI > 43 ? 'red' : mDTI > 28 ? undefined : 'green'}
                        />
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Enter property and down payment values to see your estimate.</p>
                  )}
                </div>

                <div className="bg-background border border-border rounded-2xl p-4">
                  <p className="text-xs font-medium mb-3 flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 text-green-500" />
                    Current mortgage rates
                  </p>
                  <div className="space-y-1">
                    {Object.entries(MORTGAGE_RATES).map(([yr, rate]) => (
                      <div
                        key={yr}
                        className={`flex justify-between text-xs px-2 py-1.5 rounded-lg transition-colors ${
                          mDuration === yr ? 'bg-blue-50 text-blue-800 font-medium' : 'text-muted-foreground'
                        }`}
                      >
                        <span>{yr} years</span>
                        <span>{(rate * 100).toFixed(2)}% APR</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-background border border-border rounded-2xl p-4">
                  <p className="text-xs font-medium mb-3">Eligibility requirements</p>
                  <EligibilityChecklist items={MORTGAGE_ELIGIBILITY} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}