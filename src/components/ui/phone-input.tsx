"use client";

import dynamic from "next/dynamic";
import "intl-tel-input/styles";
import { cn } from "@/lib/utils";

const IntlTelInput = dynamic(() => import("intl-tel-input/reactWithUtils"), {
  ssr: false,
});

interface PhoneInputProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  placeholder?: string;
}

export function PhoneInput({ value, onChange, disabled, className, error, placeholder }: PhoneInputProps) {
  return (
    <div className={cn("relative", className)}>
      <IntlTelInput
        initialValue={value}
        onChangeNumber={(number) => {
          onChange(number);
        }}
        initOptions={{
          initialCountry: "auto",
          geoIpLookup: (callback) => {
            fetch("https://ipapi.co/json")
              .then((res) => res.json())
              .then((data) => callback(data.country_code))
              .catch(() => callback("us"));
          },
          strictMode: true,
          separateDialCode: true,
        }}
        disabled={disabled}
        inputProps={{
          className: cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive"
          ),
          placeholder: placeholder
        }}
      />
      {error && <p className="text-destructive text-xs mt-1">{error}</p>}
    </div>
  );
}

