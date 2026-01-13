import { pgTable, text, boolean, timestamp, pgEnum, date, integer, jsonb, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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

// Updated delivery request status flow:
// REQUESTED → ACCEPTED → PAID → IN_TRANSIT → DELIVERED → CONFIRMED → COMPLETED
// Also: REJECTED, CANCELLED
export const deliveryRequestStatusEnum = pgEnum("delivery_request_status", [
  "REQUESTED",   // Shopper sent request, waiting for traveler
  "ACCEPTED",    // Traveler accepted, waiting for payment
  "PAID",        // Shopper paid, money in escrow
  "PURCHASED",   // Traveler confirmed product purchase (New)
  "IN_TRANSIT",  // Traveler started delivery
  "DELIVERED",   // Traveler marked as delivered
  "CONFIRMED",   // Shopper confirmed receipt
  "COMPLETED",   // Transaction complete, money released
  "REJECTED",    // Traveler rejected request
  "CANCELLED",   // Either party cancelled
]);

// Transaction status for payment tracking
export const transactionStatusEnum = pgEnum("transaction_status", [
  "PENDING",   // Payment initiated
  "HELD",      // Money in escrow
  "RELEASED",  // Money released to traveler
  "REFUNDED",  // Money refunded to shopper
]);

// Notification types
export const notificationTypeEnum = pgEnum("notification_type", [
  "REQUEST_RECEIVED",
  "REQUEST_ACCEPTED",
  "REQUEST_REJECTED",
  "PAYMENT_RECEIVED",
  "PRODUCT_PURCHASED",
  "OTP_GENERATED",
  "DELIVERY_STARTED",
  "DELIVERY_MARKED",
  "DELIVERY_CONFIRMED",
  "PAYMENT_RELEASED",
  "NEW_MESSAGE",
]);

// Activity log action types
export const activityActionEnum = pgEnum("activity_action", [
  "REQUEST_SENT",
  "REQUEST_ACCEPTED",
  "REQUEST_REJECTED",
  "PAYMENT_MADE",
  "PRODUCT_PURCHASED",
  "OTP_GENERATED",
  "DELIVERY_STARTED",
  "DELIVERY_MARKED",
  "DELIVERY_CONFIRMED",
  "PAYMENT_RELEASED",
  "REQUEST_CANCELLED",
]);

export const travelPostStatusEnum = pgEnum("travel_post_status", [
  "OPEN",
  "LOCKED", // Capacity full
  "COMPLETED",
  "CANCELLED",
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

  // Stripe Connect fields (for travelers to receive payments)
  stripeConnectAccountId: text("stripe_connect_account_id"),
  stripeConnectOnboardingComplete: boolean("stripe_connect_onboarding_complete").default(false).notNull(),

  // Rating and stats (cached for performance)
  averageRating: real("average_rating").default(0),
  totalReviews: integer("total_reviews").default(0).notNull(),
  completedDeliveriesAsTraveler: integer("completed_deliveries_as_traveler").default(0).notNull(),
  totalEarnings: integer("total_earnings").default(0).notNull(), // in cents

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

  // Model B: Capacity Based Locking
  postStatus: travelPostStatusEnum("post_status").default("OPEN").notNull(),
  numericWeight: integer("numeric_weight"), // Total capacity in grams
  remainingWeight: integer("remaining_weight"), // Remaining capacity in grams
});

export const deliveryRequests = pgTable("delivery_requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  travelPostId: text("travel_post_id").notNull().references(() => travelPosts.id),
  travellerId: text("traveller_id").notNull().references(() => users.id),
  customerId: text("customer_id").notNull().references(() => users.id),
  status: deliveryRequestStatusEnum("status").default("REQUESTED").notNull(),
  
  // Request details - what shopper wants to send
  packageDescription: text("package_description").notNull(),
  offeredPrice: integer("offered_price").notNull(), // Price in cents
  offeredWeight: integer("offered_weight").notNull(), // Weight in grams
  currency: text("currency").default("USD").notNull(),
  message: text("message"), // Optional message to traveler
  
  // Rejection reason (if rejected)
  rejectionReason: text("rejection_reason"),
  
  // OTP for delivery verification
  deliveryProofOtp: text("delivery_proof_otp"),

  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Transactions table for payment/escrow tracking
export const transactions = pgTable("transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  deliveryRequestId: text("delivery_request_id").notNull().references(() => deliveryRequests.id),
  
  amount: integer("amount").notNull(), // Amount in cents
  currency: text("currency").default("USD").notNull(),
  status: transactionStatusEnum("status").default("PENDING").notNull(),
  
  // Stripe payment tracking
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeTransferId: text("stripe_transfer_id"),
  platformFee: integer("platform_fee"), // Platform fee in cents (5%)
  travelerPayout: integer("traveler_payout"), // Amount traveler receives in cents
  
  paidAt: timestamp("paid_at"),
  releasedAt: timestamp("released_at"),
  refundedAt: timestamp("refunded_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  
  relatedRequestId: text("related_request_id").references(() => deliveryRequests.id),
  
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity logs for tracking all actions on a request
export const activityLogs = pgTable("activity_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  deliveryRequestId: text("delivery_request_id").notNull().references(() => deliveryRequests.id),
  
  action: activityActionEnum("action").notNull(),
  performedBy: text("performed_by").notNull().references(() => users.id),
  metadata: jsonb("metadata"), // Extra details as JSON
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const travelPostRelations = relations(travelPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [travelPosts.userId],
    references: [users.id],
  }),
  deliveryRequests: many(deliveryRequests),
}));

export const deliveryRequestRelations = relations(deliveryRequests, ({ one, many }) => ({
  travelPost: one(travelPosts, {
    fields: [deliveryRequests.travelPostId],
    references: [travelPosts.id],
  }),
  traveller: one(users, {
    fields: [deliveryRequests.travellerId],
    references: [users.id],
    relationName: "traveller",
  }),
  customer: one(users, {
    fields: [deliveryRequests.customerId],
    references: [users.id],
    relationName: "customer",
  }),
  transaction: one(transactions, {
    fields: [deliveryRequests.id],
    references: [transactions.deliveryRequestId],
  }),
  activityLogs: many(activityLogs),
}));

export const transactionRelations = relations(transactions, ({ one }) => ({
  deliveryRequest: one(deliveryRequests, {
    fields: [transactions.deliveryRequestId],
    references: [deliveryRequests.id],
  }),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  relatedRequest: one(deliveryRequests, {
    fields: [notifications.relatedRequestId],
    references: [deliveryRequests.id],
  }),
}));

export const activityLogRelations = relations(activityLogs, ({ one }) => ({
  deliveryRequest: one(deliveryRequests, {
    fields: [activityLogs.deliveryRequestId],
    references: [deliveryRequests.id],
  }),
  performer: one(users, {
    fields: [activityLogs.performedBy],
    references: [users.id],
  }),
}));

// Reviews table for traveler ratings
export const reviews = pgTable("reviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  deliveryRequestId: text("delivery_request_id").notNull().references(() => deliveryRequests.id),
  reviewerId: text("reviewer_id").notNull().references(() => users.id), // customer who writes review
  revieweeId: text("reviewee_id").notNull().references(() => users.id), // traveler being reviewed
  
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviewRelations = relations(reviews, ({ one }) => ({
  deliveryRequest: one(deliveryRequests, {
    fields: [reviews.deliveryRequestId],
    references: [deliveryRequests.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
    relationName: "reviewsGiven",
  }),
  reviewee: one(users, {
    fields: [reviews.revieweeId],
    references: [users.id],
    relationName: "reviewsReceived",
  }),
}));

// Issue status enum
export const issueStatusEnum = pgEnum("issue_status", [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
]);

// Issue Reports table for dispute/problem reporting
export const issueReports = pgTable("issue_reports", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  deliveryRequestId: text("delivery_request_id").notNull().references(() => deliveryRequests.id),
  reporterId: text("reporter_id").notNull().references(() => users.id),
  reporterRole: text("reporter_role").notNull(), // "CUSTOMER" or "TRAVELER"
  
  issueType: text("issue_type").notNull(), // "DELAY", "NO_RESPONSE", "DAMAGED", "FRAUD", "OTHER"
  description: text("description").notNull(),
  
  status: issueStatusEnum("status").default("OPEN").notNull(),
  adminNotes: text("admin_notes"),
  resolvedAt: timestamp("resolved_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const issueReportRelations = relations(issueReports, ({ one }) => ({
  deliveryRequest: one(deliveryRequests, {
    fields: [issueReports.deliveryRequestId],
    references: [deliveryRequests.id],
  }),
  reporter: one(users, {
    fields: [issueReports.reporterId],
    references: [users.id],
  }),
}));
