import { Package, Star, MessageSquare, Truck } from "lucide-react";

interface ProfileStatsProps {
    completedDeliveries: number;
    activeDeliveries: number;
    averageRating: number;
    totalReviews: number;
}

export function ProfileStats({
    completedDeliveries,
    activeDeliveries,
    averageRating,
    totalReviews,
}: ProfileStatsProps) {
    const stats = [
        {
            label: "Completed",
            value: completedDeliveries,
            icon: Package,
            color: "text-emerald-400",
            bgColor: "bg-emerald-500/10",
        },
        {
            label: "In Progress",
            value: activeDeliveries,
            icon: Truck,
            color: "text-blue-400",
            bgColor: "bg-blue-500/10",
        },
        {
            label: "Rating",
            value: averageRating > 0 ? averageRating.toFixed(1) : "—",
            icon: Star,
            color: "text-amber-400",
            bgColor: "bg-amber-500/10",
        },
        {
            label: "Reviews",
            value: totalReviews,
            icon: MessageSquare,
            color: "text-purple-400",
            bgColor: "bg-purple-500/10",
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={stat.label}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center"
                    >
                        <div
                            className={`w-10 h-10 rounded-full ${stat.bgColor} flex items-center justify-center mx-auto mb-2`}
                        >
                            <Icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">
                            {stat.label}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
