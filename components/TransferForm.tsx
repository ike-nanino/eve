"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/toast";
import { Loader2, ArrowRight, Landmark } from "lucide-react";

import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import CustomFormField, { FormFieldType } from "./CustomFormField";

// ─── Schema ─────────────────────────────────────────────

const formSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount is required" })
    .min(1, "Amount must be at least $1")
    .max(1_000_000, "Amount cannot exceed $1,000,000"),

  recipientName: z
    .string()
    .min(2, "Recipient name must be at least 2 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),

  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[1-9]\d{7,14}$/.test(val.replace(/[\s\-().]/g, "")),
      "Enter a valid phone number"
    ),

  bankName: z
    .string()
    .min(2, "Bank name must be at least 2 characters")
    .regex(/^[a-zA-Z\s&'-]+$/, "Bank name can only contain letters and basic punctuation"),

  accountNumber: z
    .string()
    .min(6, "Account number must be at least 6 digits")
    .max(17, "Account number cannot exceed 17 digits")
    .regex(/^\d+$/, "Account number must contain digits only"),

  routingNumber: z
    .string()
    .length(9, "Routing number must be exactly 9 digits")
    .regex(/^\d+$/, "Routing number must contain digits only"),

  accountType: z.string().min(1, "Please select an account type"),

  swiftCode: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(val.toUpperCase()),
      "Enter a valid SWIFT/BIC code (e.g. BOFAUS3N)"
    ),

  note: z
    .string()
    .max(200, "Note cannot exceed 200 characters")
    .optional(),

  saveBeneficiary: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Amount Input ────────────────────────────────────────

function AmountInput({
  value,
  onChange,
  error,
}: {
  value: number;
  onChange: (val: number) => void;
  error?: string;
}) {
  const [display, setDisplay] = useState(value > 0 ? value.toLocaleString("en-US") : "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip everything except digits and one decimal point
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    const parts = raw.split(".");
    const sanitized = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : raw;

    const numeric = parseFloat(sanitized);
    if (sanitized === "" || sanitized === ".") {
      setDisplay(sanitized);
      onChange(0);
      return;
    }
    if (!isNaN(numeric)) {
      // Format with commas for display but preserve raw for editing
      const [intPart, decPart] = sanitized.split(".");
      const formattedInt = parseInt(intPart || "0").toLocaleString("en-US");
      setDisplay(decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt);
      onChange(numeric);
    }
  };

  const handleBlur = () => {
    if (value > 0) {
      setDisplay(
        value.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } else {
      setDisplay("");
    }
  };

  const handleFocus = () => {
    if (value > 0) {
      setDisplay(value.toString());
    }
  };

  return (
    <Field className="space-y-1" error={error}>
      <label className="text-sm font-medium">Amount</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium select-none">
          $
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={display}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder="0.00"
          className="flex h-10 w-full rounded-md border border-input bg-background pl-7 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </Field>
  );
}

// ─── Digits-only Input ───────────────────────────────────

function DigitsOnlyInput({
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, "");
        onChange(digits);
      }}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    />
  );
}

// ─── Component ──────────────────────────────────────────

export default function TransferForm({ type }: { type: "domestic" | "wire" }) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange", // validate on every change so the button disables in real time
    defaultValues: {
      amount: 0,
      recipientName: "",
      phoneNumber: "",
      bankName: "",
      accountNumber: "",
      routingNumber: "",
      accountType: "",
      swiftCode: "",
      note: "",
      saveBeneficiary: false,
    },
  });

  const { formState } = form;
  const isFormValid = formState.isValid && form.watch("amount") >= 1;

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    // Simulate an API call — randomly resolves or rejects
    const success = Math.random() > 0.4;

    await new Promise<void>((resolve) => setTimeout(resolve, 2000));

    if (success) {
      toast.success("Transaction pending", {
        description: `Your transfer of $${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} to ${data.recipientName} is being processed. You will be notified once it clears.`,
        duration: 6000,
      });
    } else {
      toast.error("Issue with your account", {
        description:
          "We encountered a problem processing your transfer. Please contact customer service at 1-800-XXX-XXXX or visit your nearest branch for assistance.",
        duration: 8000,
      });
    }

    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Landmark className="w-6 h-6" />
          {type === "wire" ? "Wire Transfer" : "Domestic Transfer"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Amount */}
          <Controller
            control={form.control}
            name="amount"
            render={({ field, fieldState }) => (
              <AmountInput
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          {/* Recipient */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              name="recipientName"
              label="Recipient Name"
            />

            {type === "wire" && (
              <CustomFormField
                control={form.control}
                fieldType={FormFieldType.PHONE_INPUT}
                name="phoneNumber"
                label="Phone Number"
              />
            )}
          </div>

          {/* Bank details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              name="bankName"
              label="Bank Name"
            />

            {/* Account Number — digits only */}
            <Controller
              control={form.control}
              name="accountNumber"
              render={({ field, fieldState }) => (
                <Field className="space-y-1" error={fieldState.error?.message}>
                  <label className="text-sm font-medium">Account Number</label>
                  <DigitsOnlyInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="e.g. 123456789"
                    maxLength={17}
                  />
                </Field>
              )}
            />

            {/* Routing Number — digits only, exactly 9 */}
            <Controller
              control={form.control}
              name="routingNumber"
              render={({ field, fieldState }) => (
                <Field className="space-y-1" error={fieldState.error?.message}>
                  <label className="text-sm font-medium">Routing Number</label>
                  <DigitsOnlyInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="9-digit routing number"
                    maxLength={9}
                  />
                </Field>
              )}
            />

            {/* Account Type */}
            <Controller
              control={form.control}
              name="accountType"
              render={({ field, fieldState }) => (
                <Field className="space-y-1" error={fieldState.error?.message}>
                  <label className="text-sm font-medium">Account Type</label>
                  <Select onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>

          {/* SWIFT code — wire only */}
          {type === "wire" && (
            <CustomFormField
              control={form.control}
              fieldType={FormFieldType.INPUT}
              name="swiftCode"
              label="SWIFT / BIC Code"
            />
          )}

          {/* Note */}
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.TEXTAREA}
            name="note"
            label="Note (optional)"
          />

          {/* Save Beneficiary */}
          <Controller
            control={form.control}
            name="saveBeneficiary"
            render={({ field }) => (
              <Field>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">Save Beneficiary</span>
                </div>
              </Field>
            )}
          />

          {/* Submit — disabled until form is fully valid */}
          <motion.div whileHover={isFormValid ? { scale: 1.01 } : {}}>
            <Button
              type="submit"
              className="w-full"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 w-4 h-4" />
                  Processing...
                </>
              ) : (
                <>
                  Confirm Transfer
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </CardContent>
    </Card>
  );
}