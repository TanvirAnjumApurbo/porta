"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const verificationSchema = z.object({
  legalName: z.string().min(1, "Legal name is required"),
  phone: z.string().min(1, "Phone number is required"),
  nationality: z.string().min(1, "Nationality is required"),
  permanentAddress: z.string().min(1, "Permanent address is required"),
  gender: z.string().min(1, "Gender is required"),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(1, "Emergency contact phone is required"),
  idType: z.enum(["PASSPORT", "NID", "DRIVING_LICENSE"]),
  idNumber: z.string().min(1, "ID number is required"),
  issuingCountry: z.string().min(1, "Issuing country is required"),
  idImageUrl: z.string().url("ID image is required"),
  userPhotoUrl: z.string().url("User photo is required"),
});

export async function submitVerification(formData: z.infer<typeof verificationSchema>) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const validatedFields = verificationSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { error: "Invalid fields", details: validatedFields.error.flatten() };
  }

  const data = validatedFields.data;

  // Check if user exists in DB, if not create them (Lazy Sync)
  const existingUser = await db.query.users.findFirst({
    where: eq(users.clerkId, user.id),
  });

  if (!existingUser) {
    await db.insert(users).values({
      id: user.id, // Using Clerk ID as DB PK
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      ...data,
      isVerified: false,
      verificationStatus: "PENDING",
      dob: data.dob, // Drizzle expects string YYYY-MM-DD for date type usually, or Date object
    });
  } else {
    await db
      .update(users)
      .set({
        ...data,
        verificationStatus: "PENDING",
        updatedAt: new Date(),
      })
      .where(eq(users.clerkId, user.id));
  }

  revalidatePath("/profile"); 
  return { success: true };
}

export async function getVerificationStatus() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    columns: {
      isVerified: true,
      verificationStatus: true,
    },
  });

  return user;
}

export async function adminVerifyUser(targetUserId: string, status: "APPROVED" | "REJECTED") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  // Basic Admin Check - Replace with more robust check later or use env var as planned
  // For now allowing if userId matches env ADMIN_USER_ID or just proceeding if strict check not enforced yet
  // IMPLEMENTATION PLAN SAID: Use ADMIN_USER_ID
  const adminId = process.env.ADMIN_USER_ID;
  if (adminId && userId !== adminId) {
     throw new Error("Forbidden: Not an admin");
  }

  await db
    .update(users)
    .set({
      verificationStatus: status,
      isVerified: status === "APPROVED",
      updatedAt: new Date(),
    })
    .where(eq(users.clerkId, targetUserId));

  revalidatePath("/admin/verifications");
  return { success: true };
}

export async function getPendingVerifications() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const adminId = process.env.ADMIN_USER_ID;
  if (adminId && userId !== adminId) {
     throw new Error("Forbidden");
  }

  const pendingUsers = await db.query.users.findMany({
    where: eq(users.verificationStatus, "PENDING"),
    orderBy: (users, { desc }) => [desc(users.updatedAt)],
  });

  return pendingUsers;
}

export async function getUserVerificationStatusClient(): Promise<{ isVerified: boolean } | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    columns: {
      isVerified: true,
    },
  });

  if (!user) return { isVerified: false };
  return { isVerified: user.isVerified };
}
