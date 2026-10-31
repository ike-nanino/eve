"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { toast } from "@/components/ui/toast";
import {
  CreditCard, Landmark, Upload, CheckCircle,
  ArrowUpCircle, ShieldCheck, Clock, AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DepositMethod = "card" | "ach" | "check";
type FileWithPreview = File & { preview: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatAmount(raw: string): string {
  const digits = raw.replace(/[^0-9.]/g, "");
  const parts = digits.split(".");
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.length > 1 ? `${intPart}.${parts[1].slice(0, 2)}` : intPart;
}

function parseAmount(formatted: string): number {
  return parseFloat(formatted.replace(/,/g, "")) || 0;
}

function formatCardNumber(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1  ").trim();
}

function formatExpiry(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  return digits;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MethodTab({
  active, onClick, icon, label, sublabel,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all cursor-pointer ${
        active
          ? "border-blue-600 bg-blue-50 text-blue-800"
          : "border-border bg-background text-muted-foreground hover:bg-muted/50"
      }`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
        active ? "bg-blue-100" : "bg-muted"
      }`}>
        {icon}
      </div>
      <span className="text-xs font-medium leading-tight">{label}</span>
      <span className="text-[10px] text-muted-foreground leading-tight">{sublabel}</span>
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-muted-foreground mb-1">
      {children}
    </label>
  );
}

function FormInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DepositPage() {
  const [method, setMethod] = useState<DepositMethod>("card");
  const [account, setAccount] = useState<string>("checking");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [currency, setCurrency] = useState("USD");

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  // ACH fields
  const [routingNumber, setRoutingNumber] = useState("");
  const [achAccountNumber, setAchAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");

  // Check
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const mapped = accepted.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    ) as FileWithPreview[];
    setFiles(mapped);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [], "application/pdf": [] },
    maxFiles: 1,
    onDrop,
  });

  // Dropzone spreads its own props — motion.div conflicts with its onDrag type.
  // Solution: wrap in a plain div for dropzone, animate a child div instead.
  const dropRootProps = getRootProps();

  useEffect(() => {
    return () => files.forEach((f) => URL.revokeObjectURL(f.preview));
  }, [files]);

  const amount = parseAmount(amountDisplay);

  const isValid = (() => {
    if (!account || amount < 1) return false;
    if (method === "card") {
      return (
        cardNumber.replace(/\s/g, "").length === 16 &&
        cardExpiry.replace(/\s/g, "").length >= 4 &&
        cardCvv.length >= 3 &&
        cardName.trim().length >= 2
      );
    }
    if (method === "ach") {
      return (
        routingNumber.length === 9 &&
        achAccountNumber.length >= 6 &&
        bankName.trim().length >= 2
      );
    }
    if (method === "check") return files.length > 0;
    return false;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);

    await new Promise((r) => setTimeout(r, 2200));

    const ok = Math.random() > 0.35;
    setLoading(false);

    if (ok) {
      setSuccess(true);
      toast.success("Deposit initiated", {
        description: `$${amountDisplay} is being deposited into your ${
          account === "checking" ? "Checking" : "Savings"
        } account. Funds are typically available within minutes.`,
        duration: 7000,
      });
      setTimeout(() => {
        setSuccess(false);
        setAmountDisplay("");
        setCardNumber("");
        setCardExpiry("");
        setCardCvv("");
        setCardName("");
        setRoutingNumber("");
        setAchAccountNumber("");
        setBankName("");
        setFiles([]);
      }, 3000);
    } else {
      toast.error("Deposit could not be processed", {
        description:
          "There may be an issue with your account or payment method. Please contact customer support at 1-800-555-0199.",
        duration: 9000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 py-10 px-4 pb-10 md:pb-18 lg:pt-0 p-4 lg:p-8 pt-20 md:pt-0">
      <div className="max-w-lg mx-auto">

        {/* Balance strip */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Checking", value: "$4,231.00", sub: "••4821" },
            { label: "Savings", value: "$12,540.50", sub: "••9302" },
            { label: "Daily limit", value: "$10,000", sub: "remaining" },
          ].map((b) => (
            <div
              key={b.label}
              className="bg-background border border-border rounded-xl p-3"
            >
              <p className="text-[11px] text-muted-foreground">{b.label}</p>
              <p className="text-sm font-medium mt-0.5">{b.value}</p>
              <p className="text-[10px] text-muted-foreground">{b.sub}</p>
            </div>
          ))}
        </div>

        {/* Main card */}
        <div className="bg-background border border-border rounded-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm">Deposit funds</span>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" />
              256-bit encrypted
            </span>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 flex flex-col items-center gap-3 text-center px-6"
              >
                <CheckCircle className="w-12 h-12 text-green-500" />
                <p className="font-medium">Deposit submitted</p>
                <p className="text-sm text-muted-foreground">
                  ${amountDisplay} is being processed. You&apos;ll receive a confirmation shortly.
                </p>
              </motion.div>
            ) : loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 flex flex-col items-center gap-4 px-6"
              >
                <Clock className="w-8 h-8 text-blue-500 animate-pulse" />
                <p className="text-sm text-muted-foreground">Processing your deposit…</p>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="p-5 space-y-5"
              >
                {/* Method tabs */}
                <div className="grid grid-cols-3 gap-2">
                  <MethodTab
                    active={method === "card"}
                    onClick={() => setMethod("card")}
                    icon={<CreditCard className={`w-4 h-4 ${method === "card" ? "text-blue-600" : "text-muted-foreground"}`} />}
                    label="Debit / Credit"
                    sublabel="Instant"
                  />
                  <MethodTab
                    active={method === "ach"}
                    onClick={() => setMethod("ach")}
                    icon={<Landmark className={`w-4 h-4 ${method === "ach" ? "text-blue-600" : "text-muted-foreground"}`} />}
                    label="Bank transfer"
                    sublabel="1–3 business days"
                  />
                  <MethodTab
                    active={method === "check"}
                    onClick={() => setMethod("check")}
                    icon={<Upload className={`w-4 h-4 ${method === "check" ? "text-blue-600" : "text-muted-foreground"}`} />}
                    label="Check deposit"
                    sublabel="2–5 business days"
                  />
                </div>

                {/* Destination & currency */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Destination account</FieldLabel>
                    {/* Fix: onValueChange can return null — cast it */}
                    <select
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    >
                      <option value="checking">Checking ••4821</option>
                      <option value="savings">Savings ••9302</option>
                    </select>
                  </div>
                  <div>
                    <FieldLabel>Currency</FieldLabel>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    >
                      <option value="USD">USD — US Dollar</option>
                      <option value="GBP">GBP — British Pound</option>
                      <option value="EUR">EUR — Euro</option>
                    </select>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <FieldLabel>Amount</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">$</span>
                    <FormInput
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={amountDisplay}
                      style={{ paddingLeft: "1.5rem" }}
                      onChange={(e) => setAmountDisplay(formatAmount(e.target.value))}
                    />
                    {amount > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                        {currency}
                      </span>
                    )}
                  </div>
                  {amount > 10000 && (
                    <p className="flex items-center gap-1 text-[11px] text-amber-600 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      Amounts over $10,000 may require additional verification.
                    </p>
                  )}
                </div>

                {/* ── Card fields ── */}
                <AnimatePresence mode="wait">
                  {method === "card" && (
                    <motion.div
                      key="card-fields"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="space-y-3"
                    >
                      <div>
                        <FieldLabel>Name on card</FieldLabel>
                        <FormInput
                          placeholder="Jane Doe"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                        />
                      </div>
                      <div>
                        <FieldLabel>Card number</FieldLabel>
                        <FormInput
                          placeholder="0000  0000  0000  0000"
                          value={cardNumber}
                          inputMode="numeric"
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <FieldLabel>Expiry date</FieldLabel>
                          <FormInput
                            placeholder="MM / YY"
                            value={cardExpiry}
                            inputMode="numeric"
                            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          />
                        </div>
                        <div>
                          <FieldLabel>CVV</FieldLabel>
                          <FormInput
                            placeholder="•••"
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            inputMode="numeric"
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={saveCard}
                          onChange={(e) => setSaveCard(e.target.checked)}
                          className="rounded border-border"
                        />
                        <span className="text-xs text-muted-foreground">Save card for future deposits</span>
                      </label>
                    </motion.div>
                  )}

                  {/* ── ACH fields ── */}
                  {method === "ach" && (
                    <motion.div
                      key="ach-fields"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="space-y-3"
                    >
                      <div>
                        <FieldLabel>Bank name</FieldLabel>
                        <FormInput
                          placeholder="e.g. Chase, Wells Fargo"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                        />
                      </div>
                      <div>
                        <FieldLabel>Routing number (9 digits)</FieldLabel>
                        <FormInput
                          placeholder="021000021"
                          inputMode="numeric"
                          maxLength={9}
                          value={routingNumber}
                          onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                      <div>
                        <FieldLabel>Account number</FieldLabel>
                        <FormInput
                          placeholder="Your bank account number"
                          inputMode="numeric"
                          maxLength={17}
                          value={achAccountNumber}
                          onChange={(e) => setAchAccountNumber(e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground bg-muted rounded-lg px-3 py-2">
                        ACH transfers take 1–3 business days. A $0.01 micro-deposit may be sent for verification.
                      </p>
                    </motion.div>
                  )}

                  {/* ── Check fields ── */}
                  {method === "check" && (
                    <motion.div
                      key="check-fields"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="space-y-3"
                    >
                      {/* Plain div for dropzone — no motion.div to avoid onDrag type clash */}
                      <div
                        {...dropRootProps}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                          isDragActive
                            ? "border-blue-400 bg-blue-50"
                            : "border-border hover:border-blue-300 hover:bg-muted/30"
                        }`}
                      >
                        <input {...getInputProps()} />
                        <Upload className="mx-auto mb-2 w-6 h-6 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {isDragActive ? "Drop your check here" : "Upload check image"}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Front and back of check · JPG, PNG, or PDF
                        </p>
                      </div>

                      {files[0] && (
                        <div className="relative rounded-lg overflow-hidden border border-border">
                          <Image
                            src={files[0].preview}
                            alt="Check preview"
                            width={480}
                            height={200}
                            className="w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setFiles([])}
                            className="absolute top-2 right-2 bg-background border border-border rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      <p className="text-[11px] text-muted-foreground bg-muted rounded-lg px-3 py-2">
                        Write &quot;For mobile deposit only&quot; on the back before uploading. Keep the physical check for 14 days.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!isValid || loading}
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  {amount > 0
                    ? `Confirm deposit — $${amountDisplay}`
                    : "Enter an amount to continue"}
                </button>

                <p className="text-center text-[11px] text-muted-foreground">
                  By confirming you agree to our deposit terms. Deposits are FDIC insured up to $250,000.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}