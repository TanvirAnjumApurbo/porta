"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Bell,
    Check,
    Package,
    CreditCard,
    Truck,
    CheckCircle,
    XCircle,
    MessageCircle,
    Trash2,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
} from "@/server/actions/notifications";
import { formatDistanceToNow, format } from "date-fns";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    relatedRequestId?: string | null;
}

const notificationIcons: Record<string, typeof Bell> = {
    REQUEST_RECEIVED: Package,
    REQUEST_ACCEPTED: CheckCircle,
    REQUEST_REJECTED: XCircle,
    PAYMENT_RECEIVED: CreditCard,
    DELIVERY_STARTED: Truck,
    DELIVERY_MARKED: Package,
    DELIVERY_CONFIRMED: CheckCircle,
    PAYMENT_RELEASED: CreditCard,
    NEW_MESSAGE: MessageCircle,
};

const notificationColors: Record<string, string> = {
    REQUEST_RECEIVED: "text-blue-400 bg-blue-500/10",
    REQUEST_ACCEPTED: "text-green-400 bg-green-500/10",
    REQUEST_REJECTED: "text-red-400 bg-red-500/10",
    PAYMENT_RECEIVED: "text-emerald-400 bg-emerald-500/10",
    DELIVERY_STARTED: "text-purple-400 bg-purple-500/10",
    DELIVERY_MARKED: "text-cyan-400 bg-cyan-500/10",
    DELIVERY_CONFIRMED: "text-green-400 bg-green-500/10",
    PAYMENT_RELEASED: "text-amber-400 bg-amber-500/10",
    NEW_MESSAGE: "text-blue-400 bg-blue-500/10",
};

export function NotificationsList() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await getNotifications();
                setNotifications(data as Notification[]);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await markNotificationAsRead(notification.id);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notification.id ? { ...n, isRead: true } : n
                )
            );
        }

        if (notification.relatedRequestId) {
            router.push(`/requests/${notification.relatedRequestId}`);
        }
    };

    const handleMarkAllRead = async () => {
        await markAllNotificationsAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation();
        setDeletingId(notificationId);
        try {
            await deleteNotification(notificationId);
            setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        } catch (error) {
            console.error("Error deleting notification:", error);
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="text-center py-16 px-4">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-300 mb-2">No notifications</h3>
                <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                    When you receive notifications about your requests and deliveries, they'll appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header Actions */}
            {unreadCount > 0 && (
                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-zinc-700 text-zinc-400 hover:text-white"
                        onClick={handleMarkAllRead}
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Mark all as read
                    </Button>
                </div>
            )}

            {/* Notifications */}
            <div className="space-y-3">
                {notifications.map((notification) => {
                    const Icon = notificationIcons[notification.type] || Bell;
                    const colorClass = notificationColors[notification.type] || "text-zinc-400 bg-zinc-500/10";

                    return (
                        <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={cn(
                                "bg-zinc-900/50 border rounded-xl p-4 cursor-pointer transition-all hover:border-zinc-700",
                                notification.isRead ? "border-zinc-800" : "border-primary/30 bg-zinc-900"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className={cn("p-2.5 rounded-lg shrink-0", colorClass.split(" ")[1])}>
                                    <Icon className={cn("w-5 h-5", colorClass.split(" ")[0])} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className={cn(
                                                    "font-medium",
                                                    notification.isRead ? "text-zinc-300" : "text-white"
                                                )}>
                                                    {notification.title}
                                                </h3>
                                                {!notification.isRead && (
                                                    <span className="w-2 h-2 rounded-full bg-primary" />
                                                )}
                                            </div>
                                            <p className="text-sm text-zinc-500 mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-zinc-600 mt-2">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                {" · "}
                                                {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                                            </p>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="shrink-0 h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                                            onClick={(e) => handleDelete(e, notification.id)}
                                            disabled={deletingId === notification.id}
                                        >
                                            {deletingId === notification.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
