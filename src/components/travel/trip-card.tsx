import { Plane, Calendar, Package, ArrowRight, Bus, Clock, MapPin, Terminal, DoorOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TripCardProps {
  post: any; // Type flexibility for now
  isOwnPost?: boolean;
}

export function TripCard({ post, isOwnPost }: TripCardProps) {
  const isFlight = post.transportMode === 'FLIGHT';
  const depDate = new Date(post.travelDate);
  const arrDate = post.arrivalDate ? new Date(post.arrivalDate) : depDate;
  
  const formatDate = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    // If it's a full ISO string (contains T), parse it
    if (timeStr.includes('T')) {
        const d = new Date(timeStr);
        if (!isNaN(d.getTime())) {
            return d.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit' });
        }
    }
    // If it's HH:MM (24h), convert to 12h
    if (/^\d{2}:\d{2}$/.test(timeStr)) {
       const [h, m] = timeStr.split(':').map(Number);
       const ampm = h >= 12 ? 'PM' : 'AM';
       const h12 = h % 12 || 12;
       return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
    }
    return timeStr;
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="glass-card p-4 sm:p-6 rounded-xl hover:border-primary/50 transition-colors cursor-pointer group h-full flex flex-col relative overflow-hidden">
          {/* Int'l / Domestic Badge */}
          {post.travelType === 'INTERNATIONAL' ? (
             <div className="absolute top-4 right-4">
                 <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full border border-purple-500/20">International</span>
             </div>
          ) : (
             <div className="absolute top-4 right-4">
                 <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">Domestic</span>
             </div>
          )}

          {/* Header: Mode & Route */}
          <div className="flex items-start gap-3 mb-4 pr-16">
            <div className={`p-2 rounded-lg shrink-0 ${isFlight ? 'bg-sky-500/10 text-sky-400' : 'bg-orange-500/10 text-orange-400'}`}>
              {isFlight ? <Plane className="w-5 h-5" /> : <Bus className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2 text-sm font-semibold truncate text-zinc-200">
                  <span className="truncate">{isFlight && post.originAirport ? post.originAirport.split(' - ')[0] : post.departureCity}</span>
                  <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />
                  <span className="truncate">{isFlight && post.destinationAirport ? post.destinationAirport.split(' - ')[0] : post.destinationCity}</span>
               </div>
               <p className="text-xs text-zinc-500 truncate">
                 {post.departureCountry} → {post.destinationCountry}
               </p>
            </div>
          </div>

          {/* Flight Details Row */}
          {isFlight && (
             <div className="mb-4 flex flex-wrap gap-2 text-xs">
                 {(post.airlineName || post.flightNumber) && (
                     <div className="px-2 py-1 rounded-md bg-white/5 text-zinc-300 border border-white/5">
                         {post.airlineName} <span className="font-mono text-zinc-400 ml-1">{post.flightNumber}</span>
                         {post.seatClass && <span className="text-zinc-500 ml-1">• {post.seatClass}</span>}
                     </div>
                 )}
             </div>
          )}

          {/* Terminals & Gates (Dense) */}
          {isFlight && (post.departureTerminal || post.departureGate || post.arrivalTerminal || post.arrivalGate) && (
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  {(post.departureTerminal || post.departureGate) && (
                      <div className="flex items-center gap-1.5 text-zinc-400 bg-zinc-900/50 p-1.5 rounded">
                          <div className="text-[10px] font-bold text-zinc-500 uppercase">DEP</div>
                          {post.departureTerminal && <span className="text-zinc-300">T{post.departureTerminal}</span>}
                          {post.departureGate && <span className="text-zinc-300">G{post.departureGate}</span>}
                      </div>
                  )}
                  {(post.arrivalTerminal || post.arrivalGate) && (
                      <div className="flex items-center gap-1.5 text-zinc-400 bg-zinc-900/50 p-1.5 rounded">
                          <div className="text-[10px] font-bold text-zinc-500 uppercase">ARR</div>
                          {post.arrivalTerminal && <span className="text-zinc-300">T{post.arrivalTerminal}</span>}
                          {post.arrivalGate && <span className="text-zinc-300">G{post.arrivalGate}</span>}
                      </div>
                  )}
              </div>
          )}
          
          {/* Timings */}
          <div className="space-y-2 mb-4">
              <div className="flex items-center gap-3 text-sm">
                 <Calendar className="w-4 h-4 text-zinc-600" />
                 <div className="flex flex-col">
                     <span className="text-zinc-300">{formatDate(depDate)}</span>
                     {post.departureTime && (
                        <span className="text-xs text-zinc-500">
                            {formatTime(post.departureTime)} {post.departureTimezone && <span className="opacity-50">({post.departureTimezone.split('/')[1] || post.departureTimezone})</span>}
                        </span>
                     )}
                 </div>
              </div>
              
              {(post.arrivalDate || post.arrivalTime) && (
                 <div className="flex items-center gap-3 text-sm">
                     <MapPin className="w-4 h-4 text-zinc-600" />
                     <div className="flex flex-col">
                         <span className="text-zinc-300">{formatDate(arrDate)}</span>
                         {post.arrivalTime && (
                            <span className="text-xs text-zinc-500">
                                {formatTime(post.arrivalTime)} {post.arrivalTimezone && <span className="opacity-50">({post.arrivalTimezone.split('/')[1] || post.arrivalTimezone})</span>}
                            </span>
                         )}
                     </div>
                 </div>
              )}
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Capacity & Notes */}
          {(post.availableWeight || post.availableSpace) && (
            <div className="flex items-center gap-2 mb-3 text-sm pt-3 border-t border-white/5">
              <Package className="w-4 h-4 text-zinc-500" />
              <span className="text-zinc-400">
                {post.availableWeight ? `${post.availableWeight}kg` : ''} 
                {post.availableWeight && post.availableSpace ? ' • ' : ''}
                {post.availableSpace}
              </span>
            </div>
          )}
          
          {/* Notes (Truncated) */}
          {post.notes && (
              <p className="text-xs text-zinc-500 line-clamp-2 mb-4 italic px-2 border-l-2 border-zinc-800">
                  "{post.notes}"
              </p>
          )}

          {/* Footer: User Info */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
               <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${isOwnPost ? 'bg-primary/20 text-primary' : 'bg-zinc-700 text-zinc-300'}`}>
                  {isOwnPost ? 'ME' : (post.travelerName || 'A').charAt(0)}
               </div>
               <span className={`text-xs ${isOwnPost ? 'text-primary font-medium' : 'text-zinc-400'}`}>
                 {isOwnPost ? 'My Trip' : post.travelerName || 'Anonymous'}
               </span>
            </div>
            {!isOwnPost && (
                <div role="button" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "bg-primary/10 hover:bg-primary/20 text-primary h-7 text-xs font-medium cursor-pointer z-10")}>
                    Contact
                </div>
            )}
          </div>
        </div>
      </DialogTrigger>
      
      {/* FULL DETAILS DIALOG */}
      <DialogContent className="sm:max-w-lg bg-zinc-950 border-zinc-800 text-zinc-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
             {isFlight ? <Plane className="w-5 h-5 text-sky-400" /> : <Bus className="w-5 h-5 text-orange-400" />}
             {isFlight ? "Flight Details" : "Trip Details"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
             {/* Large Route */}
             <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1 mt-1">
                        <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary"></div>
                        <div className="w-0.5 flex-1 bg-zinc-800 min-h-[40px]"></div>
                        <div className="w-3 h-3 rounded-full bg-zinc-700 border border-zinc-600"></div>
                    </div>
                    <div className="flex-1 space-y-6">
                        {/* DEPARTURE */}
                        <div>
                            <h3 className="font-bold text-lg text-white">
                                {isFlight && post.originAirport ? post.originAirport : post.departureCity}
                            </h3>
                            <p className="text-sm text-zinc-400">
                                {post.departureCity}, {post.departureState ? `${post.departureState}, ` : ''}{post.departureCountry}
                            </p>
                            <div className="mt-1 flex items-center gap-4 text-sm text-zinc-300">
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(depDate)}</span>
                                {post.departureTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(post.departureTime)}</span>}
                            </div>
                            {post.departureTimezone && <p className="text-xs text-zinc-500 mt-0.5">{post.departureTimezone}</p>}
                        </div>
                        
                        {/* ARRIVAL */}
                        <div>
                            <h3 className="font-bold text-lg text-white">
                                {isFlight && post.destinationAirport ? post.destinationAirport : post.destinationCity}
                            </h3>
                            <p className="text-sm text-zinc-400">
                                {post.destinationCity}, {post.destinationState ? `${post.destinationState}, ` : ''}{post.destinationCountry}
                            </p>
                            <div className="mt-1 flex items-center gap-4 text-sm text-zinc-300">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {formatDate(arrDate)}</span>
                                {post.arrivalTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(post.arrivalTime)}</span>}
                            </div>
                            {post.arrivalTimezone && <p className="text-xs text-zinc-500 mt-0.5">{post.arrivalTimezone}</p>}
                        </div>
                    </div>
                </div>
             </div>

             {/* Flight Specifics */}
             {isFlight && (post.airlineName || post.flightNumber) && (
                 <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 grid grid-cols-2 gap-4 text-sm">
                     <div>
                         <span className="text-xs text-zinc-500 uppercase font-bold">Airline</span>
                         <p>{post.airlineName || '-'}</p>
                     </div>
                     <div>
                         <span className="text-xs text-zinc-500 uppercase font-bold">Flight No.</span>
                         <p className="font-mono">{post.flightNumber || '-'}</p>
                     </div>
                     {(post.departureTerminal || post.departureGate) && (
                         <div>
                             <span className="text-xs text-zinc-500 uppercase font-bold">Departure</span>
                             <p>Term {post.departureTerminal || '-'}, Gate {post.departureGate || '-'}</p>
                         </div>
                     )}
                     {(post.arrivalTerminal || post.arrivalGate) && (
                         <div>
                             <span className="text-xs text-zinc-500 uppercase font-bold">Arrival</span>
                             <p>Term {post.arrivalTerminal || '-'}, Gate {post.arrivalGate || '-'}</p>
                         </div>
                     )}
                 </div>
             )}

             {/* Capacity & Notes */}
             <div className="space-y-3 pt-2">
                 <div className="flex items-center gap-2 text-sm text-zinc-300">
                     <Package className="w-4 h-4 text-primary" />
                     <span className="font-medium">Capacity:</span>
                     <span>
                         {post.availableWeight ? `${post.availableWeight}kg` : 'No weight specified'}
                         {post.availableSpace ? ` • ${post.availableSpace}` : ''}
                     </span>
                 </div>
                 
                 {post.notes && (
                     <div className="bg-zinc-900/50 p-3 rounded-lg border-l-2 border-primary">
                         <h4 className="text-xs uppercase font-bold text-zinc-500 mb-1">Traveler Notes</h4>
                         <p className="text-sm italic text-zinc-300 whitespace-pre-wrap">{post.notes}</p>
                     </div>
                 )}
             </div>
             
             {/* Footer Actions */}
             <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${isOwnPost ? 'bg-primary/20 text-primary' : 'bg-zinc-700 text-zinc-300'}`}>
                        {isOwnPost ? 'ME' : (post.travelerName || 'A').charAt(0)}
                     </div>
                     <div>
                         <p className="text-sm font-bold text-white">{post.travelerName || 'Anonymous'}</p>
                         <p className="text-xs text-zinc-500">Traveler</p>
                     </div>
                 </div>
                 
                 {!isOwnPost && (
                     <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer">
                         Contact Traveler
                     </Button>
                 )}
             </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
