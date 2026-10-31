// components/VirtualCreditCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Unlock, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { toast } from '@/components/ui/toast';

type CardType = 'visa' | 'mastercard';

interface VirtualCardProps {
  cardType: CardType;
  cardHolder: string;
  lastFour: string;
  fullNumber?: string; // e.g. "4532 1234 5678 6420"
  expiry: string;
  cvv?: string;
  limit: number;
  available: number;
  bgGradient?: string;
  pin?: string; // hardcoded PIN
}

// ─── PIN modal ───────────────────────────────────────────────────────────────

function PinModal({
  mode,
  correctPin,
  onSuccess,
  onClose,
}: {
  mode: 'reveal' | 'lock' | 'unlock';
  correctPin: string;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error,  setError]  = useState('');
  const [shake,  setShake]  = useState(false);

  const refs = Array.from({ length: 4 }, () => null) as (HTMLInputElement | null)[];
  const inputRefs = useState<(HTMLInputElement | null)[]>(refs)[0];

  const handleDigit = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next  = [...digits];
    next[i]     = digit;
    setDigits(next);
    setError('');
    if (digit && i < 3) inputRefs[i + 1]?.focus();

    // Auto-submit when 4th digit entered
    if (i === 3 && digit) {
      const code = [...next].join('');
      setTimeout(() => verify(code), 80);
    }
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs[i - 1]?.focus();
    }
  };

  const verify = (code: string) => {
    if (code === correctPin) {
      onSuccess();
    } else {
      setShake(true);
      setError('Incorrect PIN. Please try again.');
      setDigits(['', '', '', '']);
      inputRefs[0]?.focus();
      setTimeout(() => setShake(false), 500);
    }
  };

  const titles = {
    reveal: 'Enter PIN to reveal card details',
    lock:   'Enter PIN to lock card',
    unlock: 'Enter PIN to unlock card',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={shake
          ? { x: [-8, 8, -6, 6, -4, 4, 0] }
          : { opacity: 1, scale: 1 }}
        transition={{ duration: shake ? 0.4 : 0.2 }}
        className="bg-background border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{titles[mode]}</p>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PIN boxes */}
        <div className="flex justify-center gap-3">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { inputRefs[i] = el; }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKey(i, e)}
              autoFocus={i === 0}
              style={{ fontSize: '16px' }}
              className="w-12 h-14 text-center text-xl font-medium rounded-xl border-2 border-border bg-background focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          ))}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-xs text-red-500 text-center flex items-center justify-center gap-1"
            >
              <ShieldAlert className="w-3 h-3" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <p className="text-[11px] text-muted-foreground text-center">
          Never share your PIN with anyone. SecureBank will never ask for it.
        </p>
      </motion.div>
    </div>
  );
}

// ─── Main card component ──────────────────────────────────────────────────────

export default function VirtualCreditCard({
  cardType,
  cardHolder,
  lastFour,
  fullNumber = '4532 1748 3291 ' + (lastFour ?? '6420'),
  expiry,
  cvv = '357',
  limit,
  available,
  bgGradient,
  pin = '1234',
}: VirtualCardProps) {
  const [revealed,    setRevealed]    = useState(false);
  const [locked,      setLocked]      = useState(false);
  const [flipped,     setFlipped]     = useState(false);
  const [modal,       setModal]       = useState<'reveal' | 'lock' | 'unlock' | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const logo = cardType === 'visa' ? '/images/visa.png' : '/images/mastercard.png';

  const usedCredit = limit - available;
  const usagePct   = Math.round((usedCredit / limit) * 100);

  const copy = (value: string, label: string) => {
    navigator.clipboard.writeText(value.replace(/\s/g, ''));
    setCopiedField(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRevealSuccess = () => {
    setModal(null);
    setRevealed(true);
    toast.success('Card details revealed', { description: 'Details will hide after 30 seconds.' });
    setTimeout(() => setRevealed(false), 30_000);
  };

  const handleLockSuccess = () => {
    setModal(null);
    setLocked(true);
    setRevealed(false);
    toast.error('Card locked', { description: 'All transactions on this card are now blocked.' });
  };

  const handleUnlockSuccess = () => {
    setModal(null);
    setLocked(false);
    toast.success('Card unlocked', { description: 'Your card is now active for transactions.' });
  };

  return (
    <>
      {/* PIN modal */}
      {modal && (
        <PinModal
          mode={modal}
          correctPin={pin}
          onSuccess={
            modal === 'reveal' ? handleRevealSuccess :
            modal === 'lock'   ? handleLockSuccess   :
                                 handleUnlockSuccess
          }
          onClose={() => setModal(null)}
        />
      )}

      <div className="space-y-3 w-full max-w-sm mx-auto">

        {/* ── Card visual ── */}
        <div
          className="relative cursor-pointer select-none"
          style={{ perspective: '1200px' }}
          onClick={() => !locked && setFlipped(f => !f)}
        >
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d', position: 'relative' }}
            className="w-full h-48 sm:h-56"
          >
            {/* FRONT */}
            <div
              className={clsx(
                'absolute inset-0 rounded-2xl overflow-hidden px-5 py-4 flex flex-col justify-between',
                bgGradient || 'bg-gradient-to-br from-blue-700 to-blue-900',
                locked && 'opacity-60 grayscale'
              )}
              style={{ backfaceVisibility: 'hidden' }}
            >
              {/* Locked overlay */}
              {locked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/30 rounded-2xl">
                  <Lock className="w-8 h-8 text-white mb-2" />
                  <p className="text-white text-sm font-medium">Card Locked</p>
                  <p className="text-white/70 text-xs">Tap unlock to resume</p>
                </div>
              )}

              {/* Top row */}
              <div className="flex justify-between items-start">
                <Image src="/images/chip.png" alt="Chip" width={44} height={44} />
                <div className="text-right">
                  <Image src={logo} alt={cardType} width={52} height={32} />
                </div>
              </div>

              {/* Card number */}
              <div
                className="text-white tracking-widest text-base sm:text-xl font-mono flex gap-3"
                onClick={e => {
                  e.stopPropagation();
                  if (revealed && !locked) copy(fullNumber, 'Card number');
                }}
              >
                {revealed ? (
                  fullNumber.split(' ').map((chunk, i) => <span key={i}>{chunk}</span>)
                ) : (
                  <>
                    <span>••••</span>
                    <span>••••</span>
                    <span>••••</span>
                    <span>{lastFour}</span>
                  </>
                )}
                {revealed && copiedField === 'Card number' && (
                  <CheckCircle2 className="w-4 h-4 text-green-300 ml-1 self-center" />
                )}
              </div>

              {/* Bottom row */}
              <div className="flex justify-between items-end text-white text-xs">
                <div>
                  <p className="opacity-60 mb-0.5 text-[10px]">CARD HOLDER</p>
                  <p className="font-medium text-sm">{cardHolder}</p>
                </div>
                <div className="text-right">
                  <p className="opacity-60 mb-0.5 text-[10px]">VALID TILL</p>
                  <p className="font-medium text-sm">{expiry}</p>
                </div>
              </div>
            </div>

            {/* BACK */}
            <div
              className={clsx(
                'absolute inset-0 rounded-2xl overflow-hidden flex flex-col',
                bgGradient || 'bg-gradient-to-br from-blue-700 to-blue-900'
              )}
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              {/* Magnetic stripe */}
              <div className="h-10 bg-black/70 mt-6 w-full" />

              <div className="flex flex-col items-end px-5 mt-4 gap-3">
                {/* Signature strip + CVV */}
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-1 h-8 bg-white/20 rounded flex items-center px-3">
                    <p className="text-white/40 text-xs italic">Authorized Signature</p>
                  </div>
                  <div className="bg-white rounded px-3 py-1.5 min-w-[52px] text-center">
                    <p className="text-[10px] text-gray-500 mb-0.5">CVV</p>
                    <p
                      className="text-gray-800 font-mono font-bold tracking-widest text-sm cursor-pointer"
                      onClick={e => { e.stopPropagation(); if (revealed) copy(cvv, 'CVV'); }}
                    >
                      {revealed ? cvv : '•••'}
                    </p>
                  </div>
                </div>

                <p className="text-white/50 text-[10px] text-center px-4">
                  This card is property of SecureBank. If found, please call 1-800-555-0199.
                </p>

                <Image src={logo} alt={cardType} width={44} height={28} className="opacity-80" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Controls ── */}
        <div className="grid grid-cols-3 gap-2">
          {/* Reveal / Hide */}
          <button
            onClick={() => locked ? toast.error('Unlock your card first') : revealed ? setRevealed(false) : setModal('reveal')}
            className={clsx(
              'flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all',
              revealed
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
            )}
          >
            {revealed
              ? <EyeOff className="w-4 h-4" />
              : <Eye    className="w-4 h-4" />}
            {revealed ? 'Hide details' : 'Reveal details'}
          </button>

          {/* Flip */}
          <button
            onClick={() => locked ? toast.error('Unlock your card first') : setFlipped(f => !f)}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-border bg-background text-muted-foreground text-xs font-medium hover:bg-muted/50 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/>
              <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
            </svg>
            Flip card
          </button>

          {/* Lock / Unlock */}
          <button
            onClick={() => locked ? setModal('unlock') : setModal('lock')}
            className={clsx(
              'flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all',
              locked
                ? 'border-red-300 bg-red-50 text-red-700'
                : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
            )}
          >
            {locked
              ? <Lock   className="w-4 h-4" />
              : <Unlock className="w-4 h-4" />}
            {locked ? 'Unlock card' : 'Lock card'}
          </button>
        </div>

        {/* ── Revealed details strip ── */}
        <AnimatePresence>
          {revealed && !locked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border border-blue-200 bg-blue-50 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-2">
                <p className="text-[10px] font-medium text-blue-600 uppercase tracking-wide">
                  Sensitive details — auto-hides in 30s
                </p>

                {[
                  { label: 'Full card number', value: fullNumber },
                  { label: 'Expiry date',      value: expiry     },
                  { label: 'CVV',               value: cvv        },
                ].map(row => (
                  <div
                    key={row.label}
                    className="flex justify-between items-center py-1.5 border-b border-blue-100 last:border-0 cursor-pointer"
                    onClick={() => copy(row.value, row.label)}
                  >
                    <span className="text-xs text-blue-700">{row.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-blue-900">{row.value}</span>
                      {copiedField === row.label
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        : <span className="text-[10px] text-blue-400">tap to copy</span>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Credit usage bar ── */}
        <div className="rounded-xl border border-border bg-background px-4 py-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Credit used</span>
            <span className="font-medium">${usedCredit.toLocaleString()} of ${limit.toLocaleString()}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className={clsx(
                'h-full rounded-full',
                usagePct > 80 ? 'bg-red-500' : usagePct > 50 ? 'bg-amber-400' : 'bg-blue-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${usagePct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Available: <span className="font-medium text-foreground">${available.toLocaleString()}</span></span>
            <span className={clsx(
              'font-medium',
              usagePct > 80 ? 'text-red-500' : usagePct > 50 ? 'text-amber-500' : 'text-blue-600'
            )}>
              {usagePct}% used
            </span>
          </div>
        </div>

      </div>
    </>
  );
}