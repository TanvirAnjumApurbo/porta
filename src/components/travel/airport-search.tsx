"use client";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { searchAirports } from "@/server/actions/static-data";

interface Airport {
  name: string;
  iata?: string;
  city?: string;
  country?: string;
  state?: string;
  label?: string;
}

interface AirportSearchProps {
  onSelect: (airport: Airport) => void;
  placeholder?: string;
  label?: string;
  defaultValue?: string;
}

export function AirportSearch({ onSelect, placeholder, label, defaultValue }: AirportSearchProps) {
    const [query, setQuery] = useState(defaultValue || "");
    const [results, setResults] = useState<Airport[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Initial value sync (optional)
    useEffect(() => {
        if (defaultValue) setQuery(defaultValue);
    }, [defaultValue]);

    useEffect(() => {
        // Click outside handler
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const handleSearch = (val: string) => {
        setQuery(val);
        // Also call onSelect with partial value so form updates?
        // But we prefer structured data.
        // If user creates custom, they use "Use ...".
        
        if (val.length < 2) {
            setResults([]);
            setOpen(false);
            return;
        }
        setLoading(true);
        setOpen(true);
        
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await searchAirports(val);
                setResults(res);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }, 300);
    };
 
    const handleSelect = (item: Airport) => {
        setQuery(item.label || item.name);
        setOpen(false);
        onSelect(item);
    };

    return (
       <div className="relative" ref={wrapperRef}>
           {label && <label className="text-xs font-semibold uppercase text-zinc-500 mb-2 block">{label}</label>}
           <div className="relative">
              <Input 
                 value={query}
                 onChange={(e) => handleSearch(e.target.value)}
                 placeholder={placeholder || "Search Airport (Name/IATA)..."}
                 onFocus={() => { if (query.length >= 2) setOpen(true); }}
                 className={open ? "rounded-b-none border-b-0" : ""}
              />
              {loading && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-zinc-400" />}
           </div>
           
           {open && (
               <div className="absolute z-50 w-full bg-zinc-950 border border-zinc-800 border-t-0 rounded-b-md shadow-xl max-h-60 overflow-y-auto">
                   {results.length > 0 ? (
                       results.map((item, i) => (
                           <button 
                              key={i}
                              type="button" 
                              className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-900 transition-colors border-b border-zinc-900 last:border-0"
                              onClick={() => handleSelect(item)}
                           >
                              <div className="flex justify-between items-center">
                                  <span className="font-medium text-zinc-200">{item.iata}</span>
                                  <span className="text-xs text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded ml-2">{item.country}</span>
                              </div>
                              <div className="text-sm text-zinc-300 truncate">{item.name}</div>
                              <div className="text-xs text-zinc-500 truncate">{item.city}</div>
                           </button>
                       ))
                   ) : !loading && (
                        <div className="p-3 text-xs text-zinc-500 bg-zinc-950">
                            No matches. 
                            <button type="button" className="text-sky-400 font-medium hover:underline ml-1" onClick={() => handleSelect({ name: query })}>
                                Use "{query}"
                            </button>
                        </div>
                   )}
               </div>
           )}
       </div>
    );
 }
