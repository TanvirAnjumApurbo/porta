"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { travelPosts, users } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as AviationStack from "@/server/services/aviationstack";

const travelPostSchema = z.object({
  // Trip Details
  travelType: z.enum(["DOMESTIC", "INTERNATIONAL"]),
  transportMode: z.enum(["FLIGHT", "OTHER"]),
  
  // Location
  departureCity: z.string().min(1, "Departure city is required"),
  departureCountry: z.string().min(1, "Departure country is required"),
  destinationCity: z.string().min(1, "Destination city is required"),
  destinationCountry: z.string().min(1, "Destination country is required"),
  
  // Other Mode Specific (Optional)
  departureStation: z.string().optional(),
  destinationStation: z.string().optional(),
  departureState: z.string().optional(),
  destinationState: z.string().optional(),
  
  // Flight Specific (Optional)
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

  // Common
  travelDate: z.string().refine((val) => {
    const date = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !isNaN(date.getTime()) && date >= today;
  }, "Date must be today or in the future"),
  arrivalDate: z.string().optional(),
  availableWeight: z.string().min(1, "Available weight is required").regex(/^\d+$/, "Weight must be a whole number (kg)"),
  availableSpace: z.string().optional(),
  ticketImageUrl: z.string().url("Ticket image is required"),
  notes: z.string().optional(),
});

export type TravelPostInput = z.infer<typeof travelPostSchema>;

export async function createTravelPost(formData: TravelPostInput) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check if user is verified
  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, user.id),
    columns: {
      id: true,
      isVerified: true,
    },
  });

  if (!dbUser || !dbUser.isVerified) {
    return { error: "You must be verified to post a trip" };
  }

  const validatedFields = travelPostSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { error: "Invalid fields", details: validatedFields.error.flatten() };
  }

  const data = validatedFields.data;

  // Sanitize Times: Check if HH:MM format and convert to ISO with Travel Date
  let finalDepartureTime = data.departureTime;
  let finalArrivalTime = data.arrivalTime;

  if (finalDepartureTime && finalDepartureTime.length === 5 && finalDepartureTime.includes(":")) {
    finalDepartureTime = `${data.travelDate}T${finalDepartureTime}:00`;
  }
  if (finalArrivalTime && finalArrivalTime.length === 5 && finalArrivalTime.includes(":")) {
     // Use arrivalDate if provided, otherwise fallback to travelDate (Departure Date)
    const targetDate = data.arrivalDate || data.travelDate;
    finalArrivalTime = `${targetDate}T${finalArrivalTime}:00`;
  }

  await db.insert(travelPosts).values({
    userId: dbUser.id,
    
    travelType: data.travelType,
    transportMode: data.transportMode,
    
    departureCity: data.departureCity,
    departureCountry: data.departureCountry,
    destinationCity: data.destinationCity,
    destinationCountry: data.destinationCountry,
    originAirport: data.originAirport,
    destinationAirport: data.destinationAirport,
    
    departureStation: data.departureStation,
    destinationStation: data.destinationStation,
    departureState: data.departureState,
    destinationState: data.destinationState,
    
    travelDate: data.travelDate,
    
    airlineName: data.airlineName,
    flightNumber: data.flightNumber,
    seatClass: data.seatClass,
    departureTime: finalDepartureTime ? new Date(finalDepartureTime).toISOString() : null,
    arrivalTime: finalArrivalTime ? new Date(finalArrivalTime).toISOString() : null,
    departureGate: data.departureGate,
    arrivalGate: data.arrivalGate,
    departureTerminal: data.departureTerminal,
    arrivalTerminal: data.arrivalTerminal,
    departureTimezone: data.departureTimezone,
    arrivalTimezone: data.arrivalTimezone,
    arrivalDate: data.arrivalDate,
    
    availableWeight: data.availableWeight,
    availableSpace: data.availableSpace,
    ticketImageUrl: data.ticketImageUrl,
    notes: data.notes,
  });

  revalidatePath("/travelers");
  revalidatePath("/travel");
  return { success: true };
}

export async function getTravelPosts() {
  // Public action - returns all active travel posts WITHOUT ticket image
  const posts = await db.query.travelPosts.findMany({
    where: eq(travelPosts.isActive, true),
    orderBy: [desc(travelPosts.createdAt)],
    columns: {
      id: true,
      travelType: true,
      transportMode: true,
      departureCity: true,
      departureCountry: true,
      destinationCity: true,
      destinationCountry: true,
      travelDate: true,
      availableWeight: true,
      availableSpace: true,
      notes: true,
      createdAt: true,
      userId: true,
      
      // Flight Details
      airlineName: true,
      flightNumber: true,
      seatClass: true,
      departureTime: true,
      arrivalTime: true,
      originAirport: true,
      destinationAirport: true,
      departureStation: true,
      destinationStation: true,
      departureState: true,
      destinationState: true,
      
      // Detailed Flight Info
      departureTerminal: true,
      departureGate: true,
      arrivalTerminal: true,
      arrivalGate: true,
      departureTimezone: true,
      arrivalTimezone: true,
      arrivalDate: true,
    },
  });

  // Get user info for each post
  const postsWithUser = await Promise.all(
    posts.map(async (post) => {
      const postUser = await db.query.users.findFirst({
        where: eq(users.id, post.userId),
        columns: {
          firstName: true,
          lastName: true,
        },
      });
      return {
        ...post,
        travelerName: postUser ? `${postUser.firstName || ''} ${postUser.lastName || ''}`.trim() || 'Anonymous' : 'Anonymous',
      };
    })
  );

  return postsWithUser;
}

export async function getMyTravelPosts() {
  const { userId } = await auth();
  if (!userId) {
    return [];
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    columns: { id: true },
  });

  if (!dbUser) {
    return [];
  }

  const posts = await db.query.travelPosts.findMany({
    where: eq(travelPosts.userId, dbUser.id),
    orderBy: [desc(travelPosts.createdAt)],
  });

  return posts;
}

export async function searchFlight(flightCode: string) {
  const flightRes = await AviationStack.getFlight(flightCode);
  
  if (!flightRes.success || !flightRes.data) {
    return { success: false, error: flightRes.error || "Flight not found" };
  }

  const flight = flightRes.data as any; // Type assertion if needed or update interface
  
  // Parallel fetch for airports details to get City/Country
  // Note: API might fail if key limit reached, handle gracefully
  let depAirport = null;
  let destAirport = null;

  try {
     const [depRes, destRes] = await Promise.all([
        AviationStack.getAirportByIata(flight.departure.iata),
        AviationStack.getAirportByIata(flight.arrival.iata)
     ]);
     if (depRes.success) depAirport = depRes.data;
     if (destRes.success) destAirport = destRes.data;
  } catch (e) { console.error("Airport fetch failed", e); }

  return {
    success: true,
    data: {
      flight: {
        number: flight.flight.iata,
        icao: flight.flight.icao,
        airline: flight.airline.name,
        airlineIata: flight.airline.iata,
        airlineIcao: flight.airline.icao,
        date: flight.flight_date,
        status: flight.flight_status,
      },
      departure: {
        iata: flight.departure.iata,
        icao: flight.departure.icao,
        airport: flight.departure.airport,
        terminal: flight.departure.terminal,
        gate: flight.departure.gate,
        scheduled: flight.departure.scheduled,
        estimated: flight.departure.estimated,
        actual: flight.departure.actual,
        timezone: flight.departure.timezone,
        delay: flight.departure.delay,
        city: depAirport?.city_name || flight.departure.timezone?.split('/')[1]?.replace(/_/g, ' ') || "", 
        country: depAirport?.country_name || "",
      },
      arrival: {
        iata: flight.arrival.iata,
        icao: flight.arrival.icao,
        airport: flight.arrival.airport,
        terminal: flight.arrival.terminal,
        gate: flight.arrival.gate,
        scheduled: flight.arrival.scheduled,
        estimated: flight.arrival.estimated,
        actual: flight.arrival.actual,
        timezone: flight.arrival.timezone,
        delay: flight.arrival.delay,
        city: destAirport?.city_name || flight.arrival.timezone?.split('/')[1]?.replace(/_/g, ' ') || "",
        country: destAirport?.country_name || "",
      }
    }
  };
}
