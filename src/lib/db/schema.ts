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
