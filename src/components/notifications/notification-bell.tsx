"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Package, CreditCard, Truck, CheckCircle, XCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/server/actions/notifications";
import { formatDistanceToNow } from "date-fns";

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

export function NotificationBell() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

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

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
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

        setIsOpen(false);

        if (notification.relatedRequestId) {
            router.push(`/requests/${notification.relatedRequestId}`);
        } else {
            router.push("/notifications");
        }
    };

    const handleMarkAllRead = async () => {
        await markAllNotificationsAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 text-zinc-400 hover:text-white"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-80 bg-zinc-950 border-zinc-800 p-0"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                    <h3 className="font-semibold text-zinc-200">Notifications</h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                        >
                            <Check className="w-3 h-3" />
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-zinc-500 text-sm">
                            Loading...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                            <p className="text-zinc-500 text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.slice(0, 10).map((notification) => {
                            const Icon = notificationIcons[notification.type] || Bell;
                            const colorClass = notificationColors[notification.type] || "text-zinc-400 bg-zinc-500/10";

                            return (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={cn(
                                        "flex items-start gap-3 p-3 cursor-pointer focus:bg-zinc-900",
                                        !notification.isRead && "bg-zinc-900/50"
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className={cn("p-2 rounded-lg shrink-0", colorClass.split(" ")[1])}>
                                        <Icon className={cn("w-4 h-4", colorClass.split(" ")[0])} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={cn(
                                                "text-sm truncate",
                                                notification.isRead ? "text-zinc-400" : "text-zinc-200 font-medium"
                                            )}>
                                                {notification.title}
                                            </p>
                                            {!notification.isRead && (
                                                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-zinc-600 mt-1">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </DropdownMenuItem>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <div className="p-2">
                            <Button
                                variant="ghost"
                                className="w-full text-sm text-zinc-400 hover:text-white"
                                onClick={() => {
                                    setIsOpen(false);
                                    router.push("/notifications");
                                }}
                            >
                                View all notifications
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
