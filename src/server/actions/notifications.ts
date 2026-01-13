"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
    const { userId } = await auth();
    if (!userId) return [];

    const userNotifications = await db.query.notifications.findMany({
        where: eq(notifications.userId, userId),
        orderBy: [desc(notifications.createdAt)],
        limit: 50,
    });

    return userNotifications;
}

export async function getUnreadNotificationCount() {
    const { userId } = await auth();
    if (!userId) return 0;

    const unreadNotifications = await db.query.notifications.findMany({
        where: and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false)
        ),
    });

    return unreadNotifications.length;
}

export async function markNotificationAsRead(notificationId: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const notification = await db.query.notifications.findFirst({
        where: eq(notifications.id, notificationId),
    });

    if (!notification) return { success: false, error: "Notification not found" };
    if (notification.userId !== userId) return { success: false, error: "Unauthorized" };

    await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, notificationId));

    revalidatePath("/notifications");
    return { success: true };
}

export async function markAllNotificationsAsRead() {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    await db.update(notifications)
        .set({ isRead: true })
        .where(and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false)
        ));

    revalidatePath("/notifications");
    return { success: true };
}

export async function deleteNotification(notificationId: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    const notification = await db.query.notifications.findFirst({
        where: eq(notifications.id, notificationId),
    });

    if (!notification) return { success: false, error: "Notification not found" };
    if (notification.userId !== userId) return { success: false, error: "Unauthorized" };

    await db.delete(notifications)
        .where(eq(notifications.id, notificationId));

    revalidatePath("/notifications");
    return { success: true };
}
