import { pgTable, foreignKey, text, integer, timestamp, date, boolean, jsonb, unique, real, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const activityAction = pgEnum("activity_action", ['REQUEST_SENT', 'REQUEST_ACCEPTED', 'REQUEST_REJECTED', 'PAYMENT_MADE', 'DELIVERY_STARTED', 'DELIVERY_MARKED', 'DELIVERY_CONFIRMED', 'PAYMENT_RELEASED', 'REQUEST_CANCELLED'])
export const deliveryRequestStatus = pgEnum("delivery_request_status", ['REQUESTED', 'ACCEPTED', 'PAID', 'IN_TRANSIT', 'DELIVERED', 'CONFIRMED', 'COMPLETED', 'REJECTED', 'CANCELLED'])
export const idType = pgEnum("id_type", ['PASSPORT', 'NID', 'DRIVING_LICENSE'])
export const notificationType = pgEnum("notification_type", ['REQUEST_RECEIVED', 'REQUEST_ACCEPTED', 'REQUEST_REJECTED', 'PAYMENT_RECEIVED', 'DELIVERY_STARTED', 'DELIVERY_MARKED', 'DELIVERY_CONFIRMED', 'PAYMENT_RELEASED', 'NEW_MESSAGE'])
export const transactionStatus = pgEnum("transaction_status", ['PENDING', 'HELD', 'RELEASED', 'REFUNDED'])
export const travelPostStatus = pgEnum("travel_post_status", ['OPEN', 'LOCKED', 'COMPLETED', 'CANCELLED'])
export const verificationStatus = pgEnum("verification_status", ['IDLE', 'PENDING', 'APPROVED', 'REJECTED'])


export const transactions = pgTable("transactions", {
	id: text().primaryKey().notNull(),
	deliveryRequestId: text("delivery_request_id").notNull(),
	amount: integer().notNull(),
	currency: text().default('USD').notNull(),
	status: transactionStatus().default('PENDING').notNull(),
	paidAt: timestamp("paid_at", { mode: 'string' }),
	releasedAt: timestamp("released_at", { mode: 'string' }),
	refundedAt: timestamp("refunded_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	stripePaymentIntentId: text("stripe_payment_intent_id"),
	stripeTransferId: text("stripe_transfer_id"),
	platformFee: integer("platform_fee"),
	travelerPayout: integer("traveler_payout"),
}, (table) => [
	foreignKey({
			columns: [table.deliveryRequestId],
			foreignColumns: [deliveryRequests.id],
			name: "transactions_delivery_request_id_delivery_requests_id_fk"
		}),
]);

export const travelPosts = pgTable("travel_posts", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	departureCity: text("departure_city").notNull(),
	departureCountry: text("departure_country").notNull(),
	destinationCity: text("destination_city").notNull(),
	destinationCountry: text("destination_country").notNull(),
	travelDate: date("travel_date").notNull(),
	availableWeight: text("available_weight"),
	availableSpace: text("available_space"),
	ticketImageUrl: text("ticket_image_url").notNull(),
	notes: text(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	travelType: text("travel_type").notNull(),
	transportMode: text("transport_mode").notNull(),
	airlineName: text("airline_name"),
	flightNumber: text("flight_number"),
	seatClass: text("seat_class"),
	departureTime: text("departure_time"),
	arrivalTime: text("arrival_time"),
	departureGate: text("departure_gate"),
	arrivalGate: text("arrival_gate"),
	departureTerminal: text("departure_terminal"),
	arrivalTerminal: text("arrival_terminal"),
	originAirport: text("origin_airport"),
	destinationAirport: text("destination_airport"),
	departureStation: text("departure_station"),
	destinationStation: text("destination_station"),
	departureState: text("departure_state"),
	destinationState: text("destination_state"),
	departureTimezone: text("departure_timezone"),
	arrivalTimezone: text("arrival_timezone"),
	arrivalDate: date("arrival_date"),
	postStatus: travelPostStatus("post_status").default('OPEN').notNull(),
	numericWeight: integer("numeric_weight"),
	remainingWeight: integer("remaining_weight"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "travel_posts_user_id_users_id_fk"
		}),
]);

export const deliveryRequests = pgTable("delivery_requests", {
	id: text().primaryKey().notNull(),
	travelPostId: text("travel_post_id").notNull(),
	travellerId: text("traveller_id").notNull(),
	customerId: text("customer_id").notNull(),
	status: deliveryRequestStatus().default('REQUESTED').notNull(),
	packageDescription: text("package_description").notNull(),
	offeredPrice: integer("offered_price").notNull(),
	offeredWeight: integer("offered_weight").notNull(),
	currency: text().default('USD').notNull(),
	message: text(),
	rejectionReason: text("rejection_reason"),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.travelPostId],
			foreignColumns: [travelPosts.id],
			name: "delivery_requests_travel_post_id_travel_posts_id_fk"
		}),
	foreignKey({
			columns: [table.travellerId],
			foreignColumns: [users.id],
			name: "delivery_requests_traveller_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [users.id],
			name: "delivery_requests_customer_id_users_id_fk"
		}),
]);

export const activityLogs = pgTable("activity_logs", {
	id: text().primaryKey().notNull(),
	deliveryRequestId: text("delivery_request_id").notNull(),
	action: activityAction().notNull(),
	performedBy: text("performed_by").notNull(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.deliveryRequestId],
			foreignColumns: [deliveryRequests.id],
			name: "activity_logs_delivery_request_id_delivery_requests_id_fk"
		}),
	foreignKey({
			columns: [table.performedBy],
			foreignColumns: [users.id],
			name: "activity_logs_performed_by_users_id_fk"
		}),
]);

export const notifications = pgTable("notifications", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	type: notificationType().notNull(),
	title: text().notNull(),
	message: text().notNull(),
	relatedRequestId: text("related_request_id"),
	isRead: boolean("is_read").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.relatedRequestId],
			foreignColumns: [deliveryRequests.id],
			name: "notifications_related_request_id_delivery_requests_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	clerkId: text("clerk_id").notNull(),
	email: text().notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	legalName: text("legal_name"),
	isVerified: boolean("is_verified").default(false).notNull(),
	verificationStatus: verificationStatus("verification_status").default('IDLE').notNull(),
	phone: text(),
	nationality: text(),
	permanentAddress: text("permanent_address"),
	gender: text(),
	dob: date(),
	emergencyContactName: text("emergency_contact_name"),
	emergencyContactPhone: text("emergency_contact_phone"),
	idType: idType("id_type"),
	idNumber: text("id_number"),
	issuingCountry: text("issuing_country"),
	idImageUrl: text("id_image_url"),
	userPhotoUrl: text("user_photo_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	stripeConnectAccountId: text("stripe_connect_account_id"),
	stripeConnectOnboardingComplete: boolean("stripe_connect_onboarding_complete").default(false).notNull(),
	averageRating: real("average_rating").default(0),
	totalReviews: integer("total_reviews").default(0).notNull(),
	completedDeliveriesAsTraveler: integer("completed_deliveries_as_traveler").default(0).notNull(),
	totalEarnings: integer("total_earnings").default(0).notNull(),
}, (table) => [
	unique("users_clerk_id_unique").on(table.clerkId),
]);

export const reviews = pgTable("reviews", {
	id: text().primaryKey().notNull(),
	deliveryRequestId: text("delivery_request_id").notNull(),
	reviewerId: text("reviewer_id").notNull(),
	revieweeId: text("reviewee_id").notNull(),
	rating: integer().notNull(),
	comment: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.deliveryRequestId],
			foreignColumns: [deliveryRequests.id],
			name: "reviews_delivery_request_id_delivery_requests_id_fk"
		}),
	foreignKey({
			columns: [table.reviewerId],
			foreignColumns: [users.id],
			name: "reviews_reviewer_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.revieweeId],
			foreignColumns: [users.id],
			name: "reviews_reviewee_id_users_id_fk"
		}),
]);
