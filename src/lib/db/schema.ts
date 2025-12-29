import { pgTable, text, boolean, timestamp, pgEnum, date } from "drizzle-orm/pg-core";

export const verificationStatusEnum = pgEnum("verification_status", [
  "IDLE",
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const idTypeEnum = pgEnum("id_type", [
  "PASSPORT",
  "NID",
  "DRIVING_LICENSE",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(), // We'll use the Clerk User ID as the primary key
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  
  // Verification Fields
  legalName: text("legal_name"), // As on ID
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationStatus: verificationStatusEnum("verification_status").default("IDLE").notNull(),
  
  phone: text("phone"),
  nationality: text("nationality"),
  permanentAddress: text("permanent_address"),
  gender: text("gender"),
  dob: date("dob"),
  
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  
  idType: idTypeEnum("id_type"),
  idNumber: text("id_number"),
  issuingCountry: text("issuing_country"),
  
  idImageUrl: text("id_image_url"),
  userPhotoUrl: text("user_photo_url"), // Real photo for verification
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const travelPosts = pgTable("travel_posts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  
  // Trip Details
  travelType: text("travel_type").notNull(), // DOMESTIC, INTERNATIONAL
  transportMode: text("transport_mode").notNull(), // FLIGHT, OTHER
  
  // Flight Specific Details (Detailed Ticket Info)
  airlineName: text("airline_name"),
  flightNumber: text("flight_number"),
  seatClass: text("seat_class"), // Economy, Business, First
  departureTime: text("departure_time"), // Specific time HH:mm
  arrivalTime: text("arrival_time"),
  departureGate: text("departure_gate"),
  arrivalGate: text("arrival_gate"),
  departureTerminal: text("departure_terminal"),
  arrivalTerminal: text("arrival_terminal"),
  departureTimezone: text("departure_timezone"),
  arrivalTimezone: text("arrival_timezone"),

  // Location Details (Enhanced)
  originAirport: text("origin_airport"),      // Full string: "LHR - London Heathrow"
  destinationAirport: text("destination_airport"),
  
  departureStation: text("departure_station"), // For Train/Bus
  destinationStation: text("destination_station"),
  
  departureState: text("departure_state"), // State/Province/District
  destinationState: text("destination_state"),
  
  departureCity: text("departure_city").notNull(),
  departureCountry: text("departure_country").notNull(),
  destinationCity: text("destination_city").notNull(),
  destinationCountry: text("destination_country").notNull(),
  travelDate: date("travel_date").notNull(),
  arrivalDate: date("arrival_date"),
  
  // Capacity
  availableWeight: text("available_weight"), // e.g., "5kg"
  availableSpace: text("available_space"),   // e.g., "Carry-on sized items"
  
  // Private ticket - stored but never shown publicly
  ticketImageUrl: text("ticket_image_url").notNull(),
  
  // Additional info
  notes: text("notes"),
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
