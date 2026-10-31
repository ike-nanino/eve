"use client";

import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import type { E164Number } from "libphonenumber-js/core";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// ─── Field type enum ─────────────────────────────────────

export enum FormFieldType {
  INPUT = "input",
  PHONE_INPUT = "phoneInput",
  TEXTAREA = "textarea",
  SKELETON = "skeleton",
}

// ─── Props ───────────────────────────────────────────────

interface CustomFormFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  fieldType: FormFieldType;
  name: Path<TFieldValues>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  renderSkeleton?: (field: unknown) => React.ReactNode;
}

// ─── Component ───────────────────────────────────────────

function CustomFormField<TFieldValues extends FieldValues>({
  control,
  fieldType,
  name,
  label,
  placeholder,
  disabled,
  renderSkeleton,
}: CustomFormFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field
          error={fieldState.error?.message}
          className="flex-1 space-y-1"
        >
           <label className="text-sm font-medium">{label}</label>
          {fieldType === FormFieldType.INPUT && (
            <Input
              placeholder={placeholder}
              disabled={disabled}
              {...field}
            />
          )}

          {fieldType === FormFieldType.PHONE_INPUT && (
            <PhoneInput
              defaultCountry="US"
              placeholder={placeholder}
              international
              withCountryCallingCode
              value={field.value as E164Number | undefined}
              onChange={field.onChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          )}

          {fieldType === FormFieldType.TEXTAREA && (
            <Textarea
              placeholder={placeholder}
              disabled={disabled}
              className="resize-none"
              {...field}
            />
          )}

          {fieldType === FormFieldType.SKELETON &&
            renderSkeleton?.(field)}
        </Field>
      )}
    />
  );
}

export default CustomFormField;