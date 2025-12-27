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
import { Input } from "@/components/ui/input";

interface AddressSelectionProps {
  onAddressChange: (address: {
    country: string;
    state: string;
    city: string;
    addressLine: string;
    zipCode: string;
  }) => void;
  defaultValues?: {
    country?: string;
    state?: string;
    city?: string;
    addressLine?: string;
    zipCode?: string;
  };
}

interface Country {
  country: string;
  iso2: string;
}

export function AddressSelection({ onAddressChange, defaultValues }: AddressSelectionProps) {
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  
  const [selectedCountry, setSelectedCountry] = useState(defaultValues?.country || "");
  const [selectedState, setSelectedState] = useState(defaultValues?.state || "");
  const [selectedCity, setSelectedCity] = useState(defaultValues?.city || "");
  const [addressLine, setAddressLine] = useState(defaultValues?.addressLine || "");
  const [zipCode, setZipCode] = useState(defaultValues?.zipCode || "");
  
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Update parent when any field changes
  useEffect(() => {
    onAddressChange({
      country: selectedCountry,
      state: selectedState,
      city: selectedCity,
      addressLine,
      zipCode,
    });
  }, [selectedCountry, selectedState, selectedCity, addressLine, zipCode]);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
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
          "Bangladesh", "United States", "United Kingdom", "Canada", "Australia",
          "Germany", "France", "India", "Japan", "China"
        ]);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (!selectedCountry) {
      setStates([]);
      setSelectedState("");
      setCities([]);
      setSelectedCity("");
      return;
    }

    const fetchStates = async () => {
      setLoadingStates(true);
      setStates([]);
      setSelectedState("");
      setCities([]);
      setSelectedCity("");
      
      try {
        const response = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: selectedCountry }),
        });
        const data = await response.json();
        if (data.data?.states) {
          const stateNames = data.data.states.map((s: { name: string }) => s.name).sort();
          setStates(stateNames);
        }
      } catch (error) {
        console.error("Failed to fetch states", error);
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
  }, [selectedCountry]);

  // Fetch cities when state changes
  useEffect(() => {
    if (!selectedCountry || !selectedState) {
      setCities([]);
      setSelectedCity("");
      return;
    }

    const fetchCities = async () => {
      setLoadingCities(true);
      setCities([]);
      setSelectedCity("");
      
      try {
        const response = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: selectedCountry, state: selectedState }),
        });
        const data = await response.json();
        if (data.data) {
          setCities(data.data.sort());
        }
      } catch (error) {
        console.error("Failed to fetch cities", error);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [selectedCountry, selectedState]);

  return (
    <div className="space-y-4">
      {/* Country */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Country</label>
        <Select value={selectedCountry} onValueChange={setSelectedCountry} disabled={loadingCountries}>
          <SelectTrigger>
            {loadingCountries ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading countries...</span>
              </div>
            ) : (
              <SelectValue placeholder="Select Country" />
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
      </div>

      {/* State/Province */}
      <div className="space-y-2">
        <label className="text-sm font-medium">State/Province</label>
        <Select 
          value={selectedState} 
          onValueChange={setSelectedState} 
          disabled={!selectedCountry || loadingStates || states.length === 0}
        >
          <SelectTrigger>
            {loadingStates ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading states...</span>
              </div>
            ) : !selectedCountry ? (
              <span className="text-muted-foreground">Select country first</span>
            ) : states.length === 0 ? (
              <span className="text-muted-foreground">No states available</span>
            ) : (
              <SelectValue placeholder="Select State" />
            )}
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City */}
      <div className="space-y-2">
        <label className="text-sm font-medium">City</label>
        <Select 
          value={selectedCity} 
          onValueChange={setSelectedCity} 
          disabled={!selectedState || loadingCities || cities.length === 0}
        >
          <SelectTrigger>
            {loadingCities ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading cities...</span>
              </div>
            ) : !selectedState ? (
              <span className="text-muted-foreground">Select state first</span>
            ) : cities.length === 0 ? (
              <span className="text-muted-foreground">No cities available</span>
            ) : (
              <SelectValue placeholder="Select City" />
            )}
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Address Line */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Address Line</label>
        <Input 
          value={addressLine} 
          onChange={(e) => setAddressLine(e.target.value)} 
          placeholder="House no, Street, Area"
        />
      </div>

      {/* ZIP/Postal Code */}
      <div className="space-y-2">
        <label className="text-sm font-medium">ZIP/Postal Code</label>
        <Input 
          value={zipCode} 
          onChange={(e) => setZipCode(e.target.value)} 
          placeholder="e.g. 12345"
        />
      </div>
    </div>
  );
}
