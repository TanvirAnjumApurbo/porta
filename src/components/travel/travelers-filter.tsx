"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TripCard } from "./trip-card";
import { Search, Filter, X, ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";

interface TravelersFilterProps {
  posts: any[];
}

export function TravelersFilter({ posts }: TravelersFilterProps) {
  // Search State
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  
  // Filter State
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [minWeight, setMinWeight] = useState<string>("");
  const [maxWeight, setMaxWeight] = useState<string>("");
  
  // Sort State
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // asc = nearest first
  
  // UI State
  const [showFilters, setShowFilters] = useState(false);

  // Derive unique countries from posts
  const countries = useMemo(() => {
    const allCountries = new Set<string>();
    posts.forEach(p => {
      if (p.departureCountry) allCountries.add(p.departureCountry);
      if (p.destinationCountry) allCountries.add(p.destinationCountry);
    });
    return Array.from(allCountries).sort();
  }, [posts]);

  // Filter & Sort Logic
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Text Search: From
    if (fromSearch.trim()) {
      const q = fromSearch.toLowerCase();
      result = result.filter(p => 
        p.departureCity?.toLowerCase().includes(q) ||
        p.departureCountry?.toLowerCase().includes(q) ||
        p.originAirport?.toLowerCase().includes(q)
      );
    }

    // Text Search: To
    if (toSearch.trim()) {
      const q = toSearch.toLowerCase();
      result = result.filter(p => 
        p.destinationCity?.toLowerCase().includes(q) ||
        p.destinationCountry?.toLowerCase().includes(q) ||
        p.destinationAirport?.toLowerCase().includes(q)
      );
    }

    // Country Filter
    if (countryFilter && countryFilter !== "all") {
      result = result.filter(p => 
        p.departureCountry === countryFilter || p.destinationCountry === countryFilter
      );
    }

    // Type Filter
    if (typeFilter && typeFilter !== "all") {
      result = result.filter(p => p.travelType === typeFilter);
    }

    // Weight Range
    const minW = parseFloat(minWeight);
    const maxW = parseFloat(maxWeight);
    if (!isNaN(minW)) {
      result = result.filter(p => parseFloat(p.availableWeight) >= minW);
    }
    if (!isNaN(maxW)) {
      result = result.filter(p => parseFloat(p.availableWeight) <= maxW);
    }

    // Sorting: By Travel Date (nearest first by default)
    result.sort((a, b) => {
      const aDate = new Date(a.travelDate).getTime();
      const bDate = new Date(b.travelDate).getTime();
      return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
    });

    return result;
  }, [posts, fromSearch, toSearch, countryFilter, typeFilter, minWeight, maxWeight, sortOrder]);

  const clearFilters = () => {
    setFromSearch("");
    setToSearch("");
    setCountryFilter("all");
    setTypeFilter("all");
    setMinWeight("");
    setMaxWeight("");
  };

  const hasActiveFilters = fromSearch || toSearch || countryFilter !== "all" || typeFilter !== "all" || minWeight || maxWeight;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="glass-card p-4 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              placeholder="From (City, Country, Airport)" 
              value={fromSearch}
              onChange={(e) => setFromSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              placeholder="To (City, Country, Airport)" 
              value={toSearch}
              onChange={(e) => setToSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Toggle Filters Button */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="text-zinc-400 hover:text-white"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? "Hide Filters" : "More Filters"}
            {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4 mr-1" /> Clear
              </Button>
            )}
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <ArrowUpDown className="w-3 h-3" />
              <span>Sort:</span>
              <Button 
                variant={sortOrder === "asc" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setSortOrder("asc")}
                className="h-7 text-xs"
              >
                Nearest First
              </Button>
              <Button 
                variant={sortOrder === "desc" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setSortOrder("desc")}
                className="h-7 text-xs"
              >
                Farthest First
              </Button>
            </div>
          </div>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 mt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Country */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-500 font-medium">Country</label>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger><SelectValue placeholder="Any Country" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Country</SelectItem>
                  {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-500 font-medium">Travel Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger><SelectValue placeholder="Any Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Type</SelectItem>
                  <SelectItem value="DOMESTIC">Domestic</SelectItem>
                  <SelectItem value="INTERNATIONAL">International</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Weight Range */}
            <div className="space-y-1 sm:col-span-2 lg:col-span-2">
              <label className="text-xs text-zinc-500 font-medium">Weight Range (kg)</label>
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  placeholder="Min" 
                  value={minWeight}
                  onChange={(e) => setMinWeight(e.target.value)}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-zinc-500">—</span>
                <Input 
                  type="number" 
                  placeholder="Max" 
                  value={maxWeight}
                  onChange={(e) => setMaxWeight(e.target.value)}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-zinc-500">
        Showing {filteredPosts.length} of {posts.length} travelers
      </div>

      {/* Results Grid */}
      {filteredPosts.length === 0 ? (
        <div className="glass-card p-12 rounded-xl text-center">
          <Search className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Matching Travelers</h2>
          <p className="text-zinc-500 mb-4">Try adjusting your search or filters.</p>
          <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredPosts.map((post) => (
            <TripCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
