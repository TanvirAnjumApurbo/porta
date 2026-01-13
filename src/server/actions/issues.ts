"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { issueReports, deliveryRequests, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createIssueReport({
    deliveryRequestId,
    issueType,
    description,
}: {
    deliveryRequestId: string;
    issueType: string;
    description: string;
}) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Get the delivery request to determine reporter role
    const request = await db.query.deliveryRequests.findFirst({
        where: eq(deliveryRequests.id, deliveryRequestId),
    });

    if (!request) {
        return { success: false, error: "Delivery request not found" };
    }

    // Determine reporter role
    let reporterRole: "CUSTOMER" | "TRAVELER";
    if (request.customerId === userId) {
        reporterRole = "CUSTOMER";
    } else if (request.travellerId === userId) {
        reporterRole = "TRAVELER";
    } else {
        return { success: false, error: "You are not part of this delivery" };
    }

    // Create the issue report
    await db.insert(issueReports).values({
        deliveryRequestId,
        reporterId: userId,
        reporterRole,
        issueType,
        description,
    });

    revalidatePath(`/requests/${deliveryRequestId}`);
    return { success: true };
}

export async function getIssueReports() {
    // Admin only - fetch all issues
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check if user is admin (you may want to add proper admin check here)
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    // For now, we'll allow any authenticated user to see issues
    // In production, add proper admin role check

    const issues = await db.query.issueReports.findMany({
        with: {
            deliveryRequest: {
                with: {
                    customer: true,
                    traveller: true,
                },
            },
            reporter: true,
        },
        orderBy: [desc(issueReports.createdAt)],
    });

    return issues;
}

export async function updateIssueStatus({
    issueId,
    status,
    adminNotes,
}: {
    issueId: string;
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    adminNotes?: string;
}) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.update(issueReports)
        .set({
            status,
            adminNotes,
            resolvedAt: status === "RESOLVED" || status === "CLOSED" ? new Date() : null,
            updatedAt: new Date(),
        })
        .where(eq(issueReports.id, issueId));

    revalidatePath("/admin/issues");
    return { success: true };
}
