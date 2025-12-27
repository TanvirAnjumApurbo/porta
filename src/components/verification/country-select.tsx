"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CountrySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function CountrySelect({ value, onValueChange, placeholder = "Select Country" }: CountrySelectProps) {
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://countriesnow.space/api/v0.1/countries/positions");
        const data = await response.json();
        if (data.data) {
          const countryNames = data.data.map((c: { name: string }) => c.name).sort();
          setCountries(countryNames);
        }
      } catch (error) {
        console.error("Failed to fetch countries", error);
        // Fallback to a minimal list
        setCountries([
          "Afghanistan", "Australia", "Bangladesh", "Brazil", "Canada", "China", 
          "Egypt", "France", "Germany", "India", "Indonesia", "Italy", "Japan", 
          "Malaysia", "Mexico", "Nepal", "Netherlands", "Nigeria", "Pakistan", 
          "Philippines", "Russia", "Saudi Arabia", "Singapore", "South Africa",
          "South Korea", "Spain", "Thailand", "Turkey", "United Arab Emirates",
          "United Kingdom", "United States", "Vietnam"
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={loading}>
      <SelectTrigger>
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country} value={country}>
            {country}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
