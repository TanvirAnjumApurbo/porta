"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { IKUpload, ImageKitProvider } from "imagekitio-next";
import { Loader2, UploadCloud, X, Plane, Calendar, Package, ArrowRight, Bus, MapPin, Globe, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTravelPost, searchFlight, type TravelPostInput } from "@/server/actions/travel";
import * as AviationStack from "@/server/services/aviationstack";
import * as LocationService from "@/server/services/location";
import { AirportSearch } from "./airport-search";

type FlightSearchResult = {
  flight: { number: string; icao: string; airline: string; airlineIata: string; airlineIcao: string; date: string; status: string };
  departure: { iata: string; icao: string; airport: string; terminal: string; gate: string; scheduled: string; estimated: string; actual: string; timezone: string; delay: number; city: string; country: string; };
  arrival: { iata: string; icao: string; airport: string; terminal: string; gate: string; scheduled: string; estimated: string; actual: string; timezone: string; delay: number; city: string; country: string; };
};

const getTimezones = () => {
  try {
    if (typeof Intl !== 'undefined' && Intl.supportedValuesOf) {
      return Intl.supportedValuesOf('timeZone');
    }
  } catch (e) {}
  return ["UTC", "America/New_York", "Europe/London", "Asia/Tokyo", "Asia/Dubai", "Asia/Dhaka"]; 
};
const timezones = getTimezones();

const travelPostSchema = z.object({
  travelType: z.enum(["DOMESTIC", "INTERNATIONAL"]),
  transportMode: z.enum(["FLIGHT", "OTHER"]),
  
  departureCity: z.string().min(1, "Required"),
  departureCountry: z.string().min(1, "Required"),
  destinationCity: z.string().min(1, "Required"),
  destinationCountry: z.string().min(1, "Required"),
  
  // Other Mode Specific
  departureStation: z.string().optional(),
  destinationStation: z.string().optional(),
  departureState: z.string().optional(),
  destinationState: z.string().optional(),

  // Flight Specific
  airlineName: z.string().optional(),
  flightNumber: z.string().optional(),
  seatClass: z.string().optional(),
  departureTime: z.string().optional(),
  arrivalTime: z.string().optional(),
  departureGate: z.string().optional(),
  arrivalGate: z.string().optional(),
  departureTerminal: z.string().optional(),
  arrivalTerminal: z.string().optional(),
  departureTimezone: z.string().optional(),
  arrivalTimezone: z.string().optional(),
  originAirport: z.string().optional(),
  destinationAirport: z.string().optional(),
  arrivalDate: z.string().optional(),

  // Common
  travelDate: z.string().refine((val) => {
    const date = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    return !isNaN(date.getTime()) && date >= today;
  }, "Date must be today or in the future"),
  availableWeight: z.string().min(1, "Available weight is required").regex(/^\d+$/, "Weight must be a whole number (kg)"),
  availableSpace: z.string().max(50, "Max 50 characters").optional(),
  ticketImageUrl: z.string().url("Ticket image is required"),
  notes: z.string().max(300, "Max 300 characters").optional(),
});

type TravelPostFormValues = z.infer<typeof travelPostSchema>;

export function TravelPostForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ticketUploadLoading, setTicketUploadLoading] = useState(false);
    
    // Wizards State
    const [step, setStep] = useState(1);
    const [loadingLocations, setLoadingLocations] = useState(false);
    
    // Flight Search State
    const [flightSearchQuery, setFlightSearchQuery] = useState("");
    const [searchingFlight, setSearchingFlight] = useState(false);
    const [foundFlight, setFoundFlight] = useState<FlightSearchResult | null>(null);
    const [manualFlightMode, setManualFlightMode] = useState(false);

    // Data State
    const [countries, setCountries] = useState<any[]>([]);
    
    // Flight Mode Data
    const [flightDepCities, setFlightDepCities] = useState<AviationStack.City[]>([]);
    const [flightDestCities, setFlightDestCities] = useState<AviationStack.City[]>([]);
    const [depAirports, setDepAirports] = useState<AviationStack.Airport[]>([]);
    const [destAirports, setDestAirports] = useState<AviationStack.Airport[]>([]);

    // Other Mode Data
    const [depStates, setDepStates] = useState<{name: string}[]>([]);
    const [destStates, setDestStates] = useState<{name: string}[]>([]);
    const [depCities, setDepCities] = useState<string[]>([]);
    const [destCities, setDestCities] = useState<string[]>([]);
    
    const todayStr = new Date().toISOString().split('T')[0];
  
    const form = useForm<TravelPostFormValues>({
      resolver: zodResolver(travelPostSchema),
      defaultValues: {
        travelType: "DOMESTIC",
        transportMode: "FLIGHT",
      },
    });
  
    const { register, handleSubmit, setValue, watch, formState: { errors } } = form;
    
    const transportMode = watch("transportMode");
    const travelType = watch("travelType");
    const ticketImageUrl = watch("ticketImageUrl");
    
    const depCountry = watch("departureCountry");
    const destCountry = watch("destinationCountry");
    const depState = watch("departureState");
    const destState = watch("destinationState");
    const depCity = watch("departureCity");
    const destCity = watch("destinationCity");
  
    // Flight Search Handler
    const handleFlightSearch = async () => {
       if (!flightSearchQuery) return;
       setSearchingFlight(true);
       setManualFlightMode(false);
       
       try {
          const res = await searchFlight(flightSearchQuery);
          if (res.success && res.data) {
             const data = res.data as FlightSearchResult;
             setFoundFlight(data);
             
             // Auto-Populate Form
             setValue("airlineName", data.flight.airline || "");
             setValue("flightNumber", data.flight.number || "");
             setValue("travelDate", data.flight.date || todayStr);
             
             setValue("departureTime", data.departure.scheduled ? new Date(data.departure.scheduled).toTimeString().substring(0,5) : "");
             setValue("arrivalTime", data.arrival.scheduled ? new Date(data.arrival.scheduled).toTimeString().substring(0,5) : "");
             
             setValue("departureGate", data.departure.gate || "");
             setValue("departureTerminal", data.departure.terminal || "");
             setValue("arrivalGate", data.arrival.gate || "");
             setValue("arrivalTerminal", data.arrival.terminal || "");
             setValue("departureTimezone", data.departure.timezone || "");
             setValue("arrivalTimezone", data.arrival.timezone || "");
             if (data.arrival.scheduled) {
                setValue("arrivalDate", data.arrival.scheduled.substring(0, 10));
             }
             
             // Location Fields
             setValue("originAirport", `${data.departure.iata} - ${data.departure.airport}`);
             setValue("destinationAirport", `${data.arrival.iata} - ${data.arrival.airport}`);
             
             // City/Country - We might set these even if they are not in the Select list?
             // Since we switched UI to preview card, the Selects are hidden so no visual glitch.
             // But we must ensure the value is set for validation.
             if (data.departure.country) setValue("departureCountry", data.departure.country);
             if (data.departure.city) setValue("departureCity", data.departure.city);
             
             if (data.arrival.country) setValue("destinationCountry", data.arrival.country);
             if (data.arrival.city) setValue("destinationCity", data.arrival.city);
             
          } else {
             alert(res.error || "Flight not found. Please try again or enter manually.");
             setFoundFlight(null);
          }
       } catch (err) {
          console.error(err);
          alert("Error searching flight");
       } finally {
          setSearchingFlight(false);
       }
    };

    const clearFlightSearch = () => {
       setFoundFlight(null);
       setFlightSearchQuery("");
       // Optionally clear form fields or leave them?
       // Might be better to clear details to avoid confusion
    };
    
    const handleAirportSelect = (item: any, isDeparture: boolean) => {
       const prefix = isDeparture ? "departure" : "destination";
       const airportField: any = isDeparture ? "originAirport" : "destinationAirport";
       
       setValue(airportField, item.label || item.name);
       
       if (item.country) {
           const countryName = countries.find(c => c.Iso2 === item.country)?.name;
           if (countryName) setValue(`${prefix}Country` as any, countryName);
       }
       if (item.city) setValue(`${prefix}City` as any, item.city);
       if (item.state) setValue(`${prefix}State` as any, item.state);
    };

    // Load Initial Countries (Universal)
    useEffect(() => {
      const loadCountries = async () => {
        const res = await LocationService.getAllCountries();
        // Returns { name, Iso2, Iso3 }
        if (res.success && res.data) setCountries(res.data);
      };
      loadCountries();
    }, []);
  
    // ================= FLIGHT LOGIC =================
    // Fetch Cities for Flight (Aviationstack)
    // Fetch Cities for Flight (Aviationstack)
    useEffect(() => {
      // Skip if Manual (we use CountriesNow/LocationService logic in manual mode)
      if (transportMode !== "FLIGHT" || !depCountry || manualFlightMode) return;
      const loadCities = async () => {
        setLoadingLocations(true);
        const iso = countries.find(c => c.name === depCountry)?.Iso2;
        if (iso) {
            const res = await AviationStack.getCities(iso);
            if (res.data) setFlightDepCities(res.data);
        }
        setLoadingLocations(false);
      };
      loadCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [depCountry, transportMode, manualFlightMode]);

    useEffect(() => {
        if (transportMode !== "FLIGHT" || !destCountry || manualFlightMode) return;
        const loadCities = async () => {
          setLoadingLocations(true);
          const iso = countries.find(c => c.name === destCountry)?.Iso2;
          if (iso) {
              const res = await AviationStack.getCities(iso);
              if (res.data) setFlightDestCities(res.data);
          }
          setLoadingLocations(false);
        };
        loadCities();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destCountry, transportMode]);

    // Fetch Airports (Aviationstack)
    useEffect(() => {
        if (transportMode !== "FLIGHT" || !depCity) return;
        const loadAirports = async () => {
            const cityObj = flightDepCities.find(c => c.city_name === depCity);
            if (cityObj?.iata_code) {
               const res = await AviationStack.getAirports(cityObj.iata_code);
               if (res.data) setDepAirports(res.data);
            }
        }
        loadAirports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [depCity, transportMode]);

    useEffect(() => {
        if (transportMode !== "FLIGHT" || !destCity) return;
        const loadAirports = async () => {
            const cityObj = flightDestCities.find(c => c.city_name === destCity);
            if (cityObj?.iata_code) {
               const res = await AviationStack.getAirports(cityObj.iata_code);
               if (res.data) setDestAirports(res.data);
            }
        }
        loadAirports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destCity, transportMode]);


    // ================= OTHER LOGIC (CountriesNow) =================
    // Fetch States
    useEffect(() => {
        const shouldLoad = transportMode === "OTHER" || (transportMode === "FLIGHT" && manualFlightMode);
        if (!shouldLoad || !depCountry) return;
        const loadStates = async () => {
            setLoadingLocations(true);
            const res = await LocationService.getStates(depCountry);
            if (res.success && res.data) setDepStates(res.data);
            setLoadingLocations(false);
        };
        loadStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [depCountry, transportMode, manualFlightMode]);

    useEffect(() => {
        const shouldLoad = transportMode === "OTHER" || (transportMode === "FLIGHT" && manualFlightMode);
        if (!shouldLoad || !destCountry) return;
        const loadStates = async () => {
            setLoadingLocations(true);
            const res = await LocationService.getStates(destCountry);
            if (res.success && res.data) setDestStates(res.data);
            setLoadingLocations(false);
        };
        loadStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destCountry, transportMode, manualFlightMode]);

    // Fetch Cities
    useEffect(() => {
        const shouldLoad = transportMode === "OTHER" || (transportMode === "FLIGHT" && manualFlightMode);
        if (!shouldLoad || !depCountry || !depState) return;
        const loadCities = async () => {
            setLoadingLocations(true);
            const res = await LocationService.getCities(depCountry, depState);
            if (res.success && res.data) setDepCities(res.data);
            setLoadingLocations(false);
        };
        loadCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [depState, transportMode]);

    useEffect(() => {
        const shouldLoad = transportMode === "OTHER" || (transportMode === "FLIGHT" && manualFlightMode);
        if (!shouldLoad || !destCountry || !destState) return;
        const loadCities = async () => {
            setLoadingLocations(true);
            const res = await LocationService.getCities(destCountry, destState);
            if (res.success && res.data) setDestCities(res.data);
            setLoadingLocations(false);
        };
        loadCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destState, transportMode, manualFlightMode]);


    const onSubmit = async (data: TravelPostFormValues) => {
      // Validate Constraints
      if (data.transportMode === "OTHER") {
           if (data.travelType === "INTERNATIONAL" && data.departureCountry === data.destinationCountry) {
               alert("For International travel, Departure and Destination countries must be different.");
               return;
           }
      }

      setIsSubmitting(true);
      try {
        const result = await createTravelPost(data as TravelPostInput);
        if (result.success) {
          router.push("/travelers");
          router.refresh();
        } else {
          console.error("Post failed", result);
          alert(result.error || "Failed. Please try again.");
        }
      } catch (error) {
        console.error(error);
        alert("An unexpected error occurred.");
      } finally {
        setIsSubmitting(false);
      }
    };
  
    const onTicketUploadSuccess = (res: any) => {
      setValue("ticketImageUrl", res.url);
      setTicketUploadLoading(false);
    };

    return (
        <ImageKitProvider
          urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
          publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
          authenticator={async () => {
            const response = await fetch("/api/imagekit/auth");
            return await response.json();
          }}
        >
          <form onSubmit={handleSubmit(onSubmit, (errors) => {
              console.error("Form Validation Errors:", errors);
              
              // Auto-navigate to error step
              const errorKeys = Object.keys(errors);
              if (errorKeys.some(k => ["travelType"].includes(k))) setStep(1);
              else if (errorKeys.some(k => ["transportMode"].includes(k))) setStep(2);
              else if (errorKeys.some(k => !["ticketImageUrl"].includes(k))) setStep(3); // Default to Step 3 for details
              
              // Alert User
              alert(`Please fix the following errors:\n${Object.entries(errors).map(([k, v]) => `- ${k}: ${v?.message}`).join("\n")}`);
          })} className="space-y-6">
            
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8 px-2">
                {[1, 2, 3, 4].map((s) => (
                   <div key={s} className={`h-2 rounded-full flex-1 mx-1 transition-colors ${step >= s ? "bg-primary" : "bg-white/10"}`} />
                ))}
            </div>
    
            {/* STEP 1: SCOPE */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Where are you going?</h2>
                    <p className="text-zinc-400">Select your travel scope.</p>
                 </div>
    
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div 
                     onClick={() => { setValue("travelType", "DOMESTIC"); setStep(2); }}
                     className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 cursor-pointer transition-all flex flex-col items-center gap-4 group"
                   >
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                         <MapPin className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-lg">Same Country</h3>
                        <p className="text-sm text-zinc-400">Domestic travel between cities</p>
                      </div>
                   </div>
    
                   <div 
                     onClick={() => { setValue("travelType", "INTERNATIONAL"); setStep(2); }}
                     className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 cursor-pointer transition-all flex flex-col items-center gap-4 group"
                   >
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                         <Globe className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-lg">Different Country</h3>
                        <p className="text-sm text-zinc-400">International travel across borders</p>
                      </div>
                   </div>
                 </div>
              </div>
            )}
    
            {/* STEP 2: MODE */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">How are you traveling?</h2>
                    <p className="text-zinc-400">Select your mode of transport.</p>
                 </div>
    
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div 
                     onClick={() => { setValue("transportMode", "FLIGHT"); setStep(3); }}
                     className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 cursor-pointer transition-all flex flex-col items-center gap-4 group"
                   >
                      <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                         <Plane className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-lg">Flight</h3>
                        <p className="text-sm text-zinc-400">Traveling by airplane</p>
                      </div>
                   </div>
    
                   <div 
                     onClick={() => { setValue("transportMode", "OTHER"); setStep(3); }}
                     className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 cursor-pointer transition-all flex flex-col items-center gap-4 group"
                   >
                      <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                         <Bus className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-bold text-lg">Other</h3>
                        <p className="text-sm text-zinc-400">Bus, Train, Car, etc.</p>
                      </div>
                   </div>
                 </div>
    
                 <div className="flex justify-center mt-8">
                    <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                 </div>
              </div>
            )}
    
            {/* STEP 3: DETAILS */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
                 <div className="flex items-center gap-2 mb-6 text-primary">
                    {transportMode === "FLIGHT" ? <Plane className="w-6 h-6" /> : <Bus className="w-6 h-6" />}
                    <h2 className="text-xl font-bold">Trip Details</h2>
                 </div>
    
                 {/* FLIGHT FORM (Search & Auto-fill) */}
             {transportMode === "FLIGHT" && (
                <div className="space-y-8">
                   {/* Flight Search Section */}
                   {!foundFlight ? (
                     <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex flex-col gap-4">
                           <div className="flex items-end gap-2">
                              <div className="flex-1 space-y-2">
                                 <label className="text-sm font-medium">Flight Number (e.g. UA2402)</label>
                                 <div className="flex gap-2">
                                     <Input 
                                        value={flightSearchQuery} 
                                        onChange={(e) => setFlightSearchQuery(e.target.value.toUpperCase())}
                                        placeholder="Enter Flight Number" 
                                     />
                                     <Button 
                                        onClick={handleFlightSearch} 
                                        disabled={searchingFlight || !flightSearchQuery}
                                        type="button"
                                     >
                                        {searchingFlight ? <Loader2 className="animate-spin w-4 h-4" /> : "Search Flight"}
                                     </Button>
                                 </div>
                              </div>
                           </div>
                           <p className="text-xs text-zinc-500 text-center">- OR -</p>
                           <Button variant="outline" type="button" onClick={() => setManualFlightMode(true)} className="w-full">
                              Enter Details Manually
                           </Button>
                        </div>
                     </div>
                   ) : (
                     /* Enhanced Boarding Pass Preview Card - Aviationstack Style */
                     <div className="rounded-xl border border-white/10 overflow-hidden bg-gradient-to-b from-white/5 to-transparent">
                        {/* Header */}
                        <div className="p-4 bg-sky-500/10 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight text-white">{foundFlight.flight.number}</h3>
                                    <p className="text-sm text-zinc-400">{foundFlight.flight.airline} ({foundFlight.flight.airlineIata})</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                               <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                                  foundFlight.flight.status === 'scheduled' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                  foundFlight.flight.status === 'active' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                  foundFlight.flight.status === 'landed' ? 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30' :
                                  'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                               }`}>
                                  {foundFlight.flight.status.toUpperCase()}
                               </span>
                               <Button variant="ghost" size="sm" onClick={clearFlightSearch} type="button" className="text-zinc-500 hover:text-white">
                                  Change
                               </Button>
                            </div>
                        </div>

                        {/* Main Content: Departure -> Arrival */}
                        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-6 p-6 relative">
                            
                            {/* Departure Section */}
                            <div className="flex flex-col justify-between">
                               <div className="space-y-4">
                                   <div className="flex items-center justify-between">
                                       <span className="px-3 py-1 text-xs font-medium bg-zinc-700 text-zinc-300 rounded-full">Departure</span>
                                       <div className="text-right">
                                            <span className="block text-2xl font-black text-white">{foundFlight.departure.iata}</span>
                                            <span className="text-xs text-zinc-500">{foundFlight.departure.icao}</span>
                                       </div>
                                   </div>
                                   
                                   <div>
                                      <h4 className="text-lg font-bold text-white leading-tight">{foundFlight.departure.airport}</h4>
                                      <p className="text-xs text-zinc-500 mt-1">{foundFlight.departure.city}, {foundFlight.departure.country}</p>
                                   </div>
                                   
                                   <div className="space-y-2">
                                        <div className="flex justify-between text-sm border-b border-white/5 pb-2">
                                            <span className="text-zinc-500">Scheduled</span>
                                            <span className="font-medium text-white">
                                                {foundFlight.departure.scheduled 
                                                ? new Date(foundFlight.departure.scheduled).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) 
                                                : '-'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Estimated</span>
                                            <span className="font-medium text-zinc-300">
                                                {foundFlight.departure.estimated 
                                                ? new Date(foundFlight.departure.estimated).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) 
                                                : '-'}
                                            </span>
                                        </div>
                                   </div>
                               </div>

                               <div className="flex gap-2 mt-4">
                                  {foundFlight.departure.terminal && (
                                     <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-white/10 bg-white/5">
                                        <span className="text-zinc-500">Terminal</span>
                                        <span className="font-bold text-white">{foundFlight.departure.terminal}</span>
                                     </span>
                                  )}
                                  {foundFlight.departure.gate && (
                                     <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-white/10 bg-white/5">
                                        <span className="text-zinc-500">Gate</span>
                                        <span className="font-bold text-white">{foundFlight.departure.gate}</span>
                                     </span>
                                  )}
                               </div>
                            </div>

                            {/* Center Divider with Plane */}
                            <div className="hidden md:flex flex-col items-center justify-center px-4 relative">
                               {/* Horizontal Line representing flight path */}
                               <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent absolute"></div>
                               <Plane className="w-8 h-8 text-sky-500 rotate-90 relative bg-zinc-900 p-1.5 rounded-full ring-4 ring-zinc-900 z-10" />
                            </div>

                            {/* Arrival Section */}
                            <div className="flex flex-col justify-between">
                               <div className="space-y-4">
                                   <div className="flex items-center justify-between">
                                       <span className="px-3 py-1 text-xs font-medium bg-zinc-700 text-zinc-300 rounded-full">Arrival</span>
                                       <div className="text-right">
                                            <span className="block text-2xl font-black text-white">{foundFlight.arrival.iata}</span>
                                            <span className="text-xs text-zinc-500">{foundFlight.arrival.icao}</span>
                                       </div>
                                   </div>
                                   
                                   <div>
                                      <h4 className="text-lg font-bold text-white leading-tight">{foundFlight.arrival.airport}</h4>
                                      <p className="text-xs text-zinc-500 mt-1">{foundFlight.arrival.city}, {foundFlight.arrival.country}</p>
                                   </div>
                                   
                                   <div className="space-y-2">
                                        <div className="flex justify-between text-sm border-b border-white/5 pb-2">
                                            <span className="text-zinc-500">Scheduled</span>
                                            <span className="font-medium text-white">
                                                {foundFlight.arrival.scheduled 
                                                ? new Date(foundFlight.arrival.scheduled).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) 
                                                : '-'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500">Estimated</span>
                                            <span className="font-medium text-zinc-300">
                                                {foundFlight.arrival.estimated 
                                                ? new Date(foundFlight.arrival.estimated).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) 
                                                : '-'}
                                            </span>
                                        </div>
                                   </div>
                               </div>

                               <div className="flex gap-2 mt-4">
                                  {foundFlight.arrival.terminal && (
                                     <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-white/10 bg-white/5">
                                        <span className="text-zinc-500">Terminal</span>
                                        <span className="font-bold text-white">{foundFlight.arrival.terminal}</span>
                                     </span>
                                  )}
                                  {foundFlight.arrival.gate && (
                                     <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded border border-white/10 bg-white/5">
                                        <span className="text-zinc-500">Gate</span>
                                        <span className="font-bold text-white">{foundFlight.arrival.gate}</span>
                                     </span>
                                  )}
                               </div>
                            </div>
                        </div>
                        
                        {/* Timezone + Airline Info Footer */}
                        <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02] text-xs text-zinc-500 flex flex-wrap gap-x-6 gap-y-1">
                           <span>Departure Timezone: <span className="text-zinc-400">{foundFlight.departure.timezone}</span></span>
                           <span>Arrival Timezone: <span className="text-zinc-400">{foundFlight.arrival.timezone}</span></span>
                           <span>Airline IATA: <span className="text-zinc-400">{foundFlight.flight.airlineIata}</span></span>
                           <span>Airline ICAO: <span className="text-zinc-400">{foundFlight.flight.airlineIcao}</span></span>
                        </div>
                        
                        {/* Seat Class Selection */}
                        <div className="p-4 border-t border-white/10">
                           <label className="text-xs font-semibold uppercase text-zinc-500 mb-2 block">Seat Class</label>
                           <Select onValueChange={(val) => setValue("seatClass", val)}>
                                <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                                <SelectContent>
                                   <SelectItem value="Economy">Economy</SelectItem>
                                   <SelectItem value="Business">Business</SelectItem>
                                   <SelectItem value="First">First Class</SelectItem>
                                </SelectContent>
                           </Select>
                        </div>
                     </div>
                   )}
                   {/* Manual Override Form (Visible if manual mode OR no flight found yet and user chose manual) */}
                   {manualFlightMode && !foundFlight && (
                       <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                           <div className="flex justify-between items-center mb-4">
                              <h3 className="font-bold text-zinc-400 text-sm">Manual Entry Details</h3>
                              <Button variant="ghost" size="sm" onClick={() => setManualFlightMode(false)}>Close</Button>
                           </div>
                           
                           {/* DEPARTURE */}
                           <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-700 text-zinc-300 font-bold uppercase">Departure</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                     <label className="text-xs font-semibold uppercase text-zinc-500">Country</label>
                                     <Select onValueChange={(val) => setValue("departureCountry", val)} value={depCountry}>
                                        <SelectTrigger><SelectValue placeholder="Select Country" /></SelectTrigger>
                                        <SelectContent>
                                           {countries.map((c, i) => <SelectItem key={i} value={c.name}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                     </Select>
                                  </div>
                                  <div className="space-y-2">
                                     <label className="text-xs font-semibold uppercase text-zinc-500">State/Province</label>
                                     <Select onValueChange={(val) => setValue("departureState", val)} value={depState} disabled={!depCountry || loadingLocations}>
                                        <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                                        <SelectContent>
                                           {depStates.map((s, i) => <SelectItem key={i} value={s.name}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                     </Select>
                                  </div>
                                  <div className="space-y-2">
                                     <label className="text-xs font-semibold uppercase text-zinc-500">City</label>
                                     <Select onValueChange={(val) => setValue("departureCity", val)} value={depCity} disabled={!depCountry || loadingLocations}>
                                        <SelectTrigger><SelectValue placeholder="Select City" /></SelectTrigger>
                                        <SelectContent>
                                           {depCities.map((c, i) => <SelectItem key={i} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                     </Select>
                                  </div>
                                  <div className="space-y-2 md:col-span-2">
                                     <AirportSearch 
                                        label="Airport Name" 
                                        placeholder="Search Airport (Name/IATA)..."
                                        defaultValue={watch("originAirport")}
                                        onSelect={(item) => handleAirportSelect(item, true)}
                                     />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                      <div className="space-y-2">
                                          <label className="text-xs font-semibold uppercase text-zinc-500">Terminal</label>
                                          <Input {...register("departureTerminal")} placeholder="e.g. 4" />
                                      </div>
                                      <div className="space-y-2">
                                          <label className="text-xs font-semibold uppercase text-zinc-500">Gate</label>
                                          <Input {...register("departureGate")} placeholder="e.g. A12" />
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                                      <div className="space-y-2">
                                          <label className="text-xs font-semibold uppercase text-zinc-500">Scheduled Departure</label>
                                          <div className="flex gap-2">
                                             <Input type="date" min={todayStr} {...register("travelDate")} className="[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
                                             <Input type="time" {...register("departureTime")} />
                                          </div>
                                      </div>
                                      <div className="space-y-2">
                                          <label className="text-xs font-semibold uppercase text-zinc-500">Timezone</label>
                                          <Select onValueChange={(val) => setValue("departureTimezone", val)}>
                                             <SelectTrigger><SelectValue placeholder="Select Timezone" /></SelectTrigger>
                                             <SelectContent>
                                                {timezones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                                             </SelectContent>
                                          </Select>
                                      </div>
                                  </div>
                              </div>
                           </div>
        
                           {/* DESTINATION */}
                           <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-700 text-zinc-300 font-bold uppercase">Arrival</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                     <label className="text-xs font-semibold uppercase text-zinc-500">Country</label>
                                     <Select onValueChange={(val) => setValue("destinationCountry", val)} value={destCountry}>
                                        <SelectTrigger><SelectValue placeholder="Select Country" /></SelectTrigger>
                                        <SelectContent>
                                           {countries.map((c, i) => <SelectItem key={i} value={c.name}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                     </Select>
                                  </div>
                                  <div className="space-y-2">
                                     <label className="text-xs font-semibold uppercase text-zinc-500">State/Province</label>
                                     <Select onValueChange={(val) => setValue("destinationState", val)} value={destState} disabled={!destCountry || loadingLocations}>
                                        <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                                        <SelectContent>
                                           {destStates.map((s, i) => <SelectItem key={i} value={s.name}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                     </Select>
                                  </div>
                                  <div className="space-y-2">
                                     <label className="text-xs font-semibold uppercase text-zinc-500">City</label>
                                     <Select onValueChange={(val) => setValue("destinationCity", val)} value={destCity} disabled={!destCountry || loadingLocations}>
                                        <SelectTrigger><SelectValue placeholder="Select City" /></SelectTrigger>
                                        <SelectContent>
                                           {destCities.map((c, i) => <SelectItem key={i} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                     </Select>
                                  </div>
                                  <div className="space-y-2 md:col-span-2">
                                     <AirportSearch 
                                        label="Airport Name" 
                                        placeholder="Search Airport (Name/IATA)..."
                                        defaultValue={watch("destinationAirport")}
                                        onSelect={(item) => handleAirportSelect(item, false)}
                                     />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                      <div className="space-y-2">
                                          <label className="text-xs font-semibold uppercase text-zinc-500">Terminal</label>
                                          <Input {...register("arrivalTerminal")} placeholder="e.g. 2" />
                                      </div>
                                      <div className="space-y-2">
                                          <label className="text-xs font-semibold uppercase text-zinc-500">Gate</label>
                                          <Input {...register("arrivalGate")} placeholder="e.g. B5" />
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                                      <div className="space-y-2">
                                          <label className="text-xs font-semibold uppercase text-zinc-500">Scheduled Arrival</label>
                                          <div className="flex gap-2">
                                             <Input type="date" min={todayStr} {...register("arrivalDate")} className="[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" />
                                             <Input type="time" {...register("arrivalTime")} />
                                          </div>
                                      </div>
                                      <div className="space-y-2">
                                          <label className="text-xs font-semibold uppercase text-zinc-500">Timezone</label>
                                          <Select onValueChange={(val) => setValue("arrivalTimezone", val)}>
                                              <SelectTrigger><SelectValue placeholder="Select Timezone" /></SelectTrigger>
                                              <SelectContent>
                                                  {timezones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                                              </SelectContent>
                                          </Select>
                                      </div>
                                  </div>
                              </div>
                           </div>

                           {/* FLIGHT INFO MANUAL */}
                           <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Basic Flight Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase text-zinc-500">Airline Name</label>
                                    <Input {...register("airlineName")} placeholder="e.g. Emirates" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase text-zinc-500">Flight Number</label>
                                    <Input {...register("flightNumber")} placeholder="e.g. EK585" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-semibold uppercase text-zinc-500">Seat Class</label>
                                    <Select onValueChange={(val) => setValue("seatClass", val)}>
                                        <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                                        <SelectContent>
                                        <SelectItem value="Economy">Economy</SelectItem>
                                        <SelectItem value="Business">Business</SelectItem>
                                        <SelectItem value="First">First Class</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                           </div>
                       </div>
                   )}
                </div>
             )}
    
                 {/* OTHER FORM (CountriesNow Cascading) */}
                 {transportMode === "OTHER" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           
                           {/* DEPARTURE */}
                           <div className="space-y-2">
                              <label className="text-sm font-medium">
                                  {travelType === 'DOMESTIC' ? 'Country' : 'Departure Country'}
                              </label>
                              <Select onValueChange={(val) => { 
                                  setValue("departureCountry", val); 
                                  if (travelType === 'DOMESTIC') {
                                      setValue("destinationCountry", val);
                                      setValue("departureState", ""); setValue("departureCity", "");
                                      setValue("destinationState", ""); setValue("destinationCity", "");
                                  } else {
                                      setValue("departureState", ""); setValue("departureCity", "");
                                  }
                              }} value={depCountry}>
                                    <SelectTrigger><SelectValue placeholder="Select Country" /></SelectTrigger>
                                    <SelectContent>
                                       {countries.map((c, i) => <SelectItem key={i} value={c.name}>{c.name}</SelectItem>)}
                                    </SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-2">
                               <label className="text-sm font-medium">State / Province</label>
                               <Select onValueChange={(val) => { setValue("departureState", val); setValue("departureCity", ""); }} value={depState} disabled={!depCountry || loadingLocations}>
                                    <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                                    <SelectContent>
                                       {depStates.map((s, i) => <SelectItem key={i} value={s.name}>{s.name}</SelectItem>)}
                                    </SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-sm font-medium">City</label>
                              <Select onValueChange={(val) => setValue("departureCity", val)} value={depCity} disabled={!depState || loadingLocations}>
                                    <SelectTrigger><SelectValue placeholder="Select City" /></SelectTrigger>
                                    <SelectContent>
                                       {depCities.map((c, i) => <SelectItem key={i} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-2">
                                <label className="text-sm font-medium">Station (Optional)</label>
                                <Input {...register("departureStation")} placeholder="Station / Bus Stop" />
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2">
                               <div className="space-y-2">
                                   <label className="text-sm font-medium">Departure Date</label>
                                   <Input 
                                      type="date" 
                                      min={todayStr} 
                                      {...register("travelDate")} 
                                      className="[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" 
                                   />
                                   {errors.travelDate && <p className="text-destructive text-xs">{errors.travelDate.message}</p>}
                               </div>
                               <div className="space-y-2">
                                   <label className="text-sm font-medium">Time</label>
                                   <Input 
                                      type="time" 
                                      {...register("departureTime")} 
                                      className="[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                                   />
                               </div>
                               <div className="space-y-2">
                                   <label className="text-sm font-medium">Timezone</label>
                                   <Select onValueChange={(val) => setValue("departureTimezone", val)}>
                                       <SelectTrigger><SelectValue placeholder="Select Timezone" /></SelectTrigger>
                                       <SelectContent>
                                           {timezones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                                       </SelectContent>
                                   </Select>
                               </div>
                           </div>
    
                           <div className="col-span-1 md:col-span-2 border-t border-white/10 my-2"></div>
    
                           {/* DESTINATION */}
                           {travelType === 'INTERNATIONAL' && (
                               <div className="space-y-2">
                                  <label className="text-sm font-medium">Destination Country</label>
                                  <Select onValueChange={(val) => { setValue("destinationCountry", val); setValue("destinationState", ""); setValue("destinationCity", ""); }} value={destCountry}>
                                        <SelectTrigger><SelectValue placeholder="Select Country" /></SelectTrigger>
                                        <SelectContent>
                                           {countries.map((c, i) => <SelectItem key={i} value={c.name}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                  </Select>
                               </div>
                           )}
                           <div className="space-y-2">
                               <label className="text-sm font-medium">State / Province</label>
                               <Select onValueChange={(val) => { setValue("destinationState", val); setValue("destinationCity", ""); }} value={destState} disabled={!destCountry || loadingLocations}>
                                    <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                                    <SelectContent>
                                       {destStates.map((s, i) => <SelectItem key={i} value={s.name}>{s.name}</SelectItem>)}
                                    </SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-sm font-medium">City</label>
                              <Select onValueChange={(val) => setValue("destinationCity", val)} value={destCity} disabled={!destState || loadingLocations}>
                                    <SelectTrigger><SelectValue placeholder="Select City" /></SelectTrigger>
                                    <SelectContent>
                                       {destCities.map((c, i) => <SelectItem key={i} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                              </Select>
                           </div>
                           <div className="space-y-2">
                                <label className="text-sm font-medium">Station (Optional)</label>
                                <Input {...register("destinationStation")} placeholder="Station / Bus Stop" />
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2">
                               <div className="space-y-2">
                                   <label className="text-sm font-medium">Arrival Date</label>
                                   <Input 
                                      type="date" 
                                      min={watch("travelDate") || todayStr} 
                                      {...register("arrivalDate")} 
                                      className="[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" 
                                   />
                               </div>
                               <div className="space-y-2">
                                   <label className="text-sm font-medium">Time</label>
                                   <Input 
                                      type="time" 
                                      {...register("arrivalTime")} 
                                      className="[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                                   />
                               </div>
                               <div className="space-y-2">
                                   <label className="text-sm font-medium">Timezone</label>
                                   <Select onValueChange={(val) => setValue("arrivalTimezone", val)}>
                                       <SelectTrigger><SelectValue placeholder="Select Timezone" /></SelectTrigger>
                                       <SelectContent>
                                           {timezones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                                       </SelectContent>
                                   </Select>
                               </div>
                           </div>
    

                        </div>
                    </div>
                 )}
                 
                 {/* Common Capacity & Notes */}
                 <div className="space-y-4 pt-4 border-t border-white/10">
                     <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Capacity & Notes</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-sm font-medium">Available Weight (kg) <span className="text-destructive">*</span></label>
                            <Input 
                               type="number" 
                               {...register("availableWeight")} 
                               placeholder="5" 
                               className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                            />
                            {errors.availableWeight && <p className="text-destructive text-xs">{errors.availableWeight.message}</p>}
                         </div>
                          <div className="space-y-2">
                             <div className="flex justify-between">
                                <label className="text-sm font-medium">Available Space</label>
                                <span className="text-xs text-zinc-500">{(watch("availableSpace") || "").length}/50</span>
                             </div>
                             <Input {...register("availableSpace")} maxLength={50} placeholder="e.g. Small bag" />
                          </div>
                     </div>
                      <div className="space-y-2">
                         <div className="flex justify-between">
                            <label className="text-sm font-medium">Notes</label>
                            <span className="text-xs text-zinc-500">{(watch("notes") || "").length}/300</span>
                         </div>
                         <Textarea {...register("notes")} maxLength={300} placeholder="Details about your travel..." />
                      </div>
                 </div>
    
                 <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                    <Button 
                       onClick={() => setStep(4)} 
                       disabled={!watch("departureCity") || !watch("destinationCity") || !watch("travelDate") || !watch("availableWeight")}
                    >
                       Next <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                 </div>
              </div>
            )}
    
            {/* STEP 4: TICKET */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto">
                 <div className="text-center mb-6">
                     <Lock className="w-8 h-8 mx-auto text-primary mb-2" />
                     <h2 className="text-2xl font-bold">Verify Your Trip</h2>
                     <p className="text-zinc-400">Upload your ticket to verify this trip.</p>
                 </div>
    
                 <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm mb-6">
                    <p><strong>Private:</strong> Your ticket will not be shown to other users.</p>
                 </div>
    
                 <div className="space-y-2">
                     <div className="border border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition relative min-h-[200px]">
                        {ticketUploadLoading ? (
                           <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        ) : ticketImageUrl ? (
                           <div className="relative w-full">
                              <img src={ticketImageUrl} alt="Ticket" className="w-full max-h-64 object-contain rounded-md" />
                              <Button 
                                 type="button" variant="destructive" size="icon" className="absolute top-2 right-2" 
                                 onClick={() => setValue("ticketImageUrl", "")}
                              >
                                 <X className="h-4 w-4" />
                              </Button>
                           </div>
                        ) : (
                           <>
                              <UploadCloud className="h-12 w-12 text-zinc-500 mb-4" />
                              <span className="text-zinc-400 font-medium">Click to upload ticket</span>
                              <span className="text-xs text-zinc-600 mt-1">PNG, JPG, PDF up to 5MB</span>
                              <IKUpload
                                 fileName="travel-ticket"
                                 folder="/travel/tickets"
                                 useUniqueFileName={true}
                                 validateFile={(file) => file.size < 5 * 1024 * 1024}
                                 onUploadStart={() => setTicketUploadLoading(true)}
                                 onSuccess={onTicketUploadSuccess}
                                 onError={(err) => { setTicketUploadLoading(false); alert("Upload failed"); console.log(err); }}
                                 className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                           </>
                        )}
                     </div>
                     {errors.ticketImageUrl && <p className="text-destructive text-sm text-center">{errors.ticketImageUrl.message}</p>}
                 </div>
                 
                 <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                    <Button type="submit" disabled={isSubmitting || !ticketImageUrl} className="min-w-[140px]">
                       {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Post Trip"}
                    </Button>
                 </div>
              </div>
            )}
    
          </form>
        </ImageKitProvider>
      );
}
