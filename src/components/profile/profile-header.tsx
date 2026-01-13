import { StarRating } from "@/components/reviews/star-rating";
import { CheckCircle, Shield, Calendar, LayoutDashboard } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
    profile: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        isVerified: boolean;
        userPhotoUrl: string | null;
        averageRating: number | null;
        totalReviews: number;
        createdAt: Date;
    };
    isOwner: boolean;
}

export function ProfileHeader({ profile, isOwner }: ProfileHeaderProps) {
    const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Anonymous";
    const initials = fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                    {profile.userPhotoUrl ? (
                        <img
                            src={profile.userPhotoUrl}
                            alt={fullName}
                            className="w-20 h-20 rounded-full object-cover border-2 border-zinc-700"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center text-2xl font-bold text-zinc-300">
                            {initials}
                        </div>
                    )}
                    {profile.isVerified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-zinc-900">
                            <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-bold text-white">{fullName}</h1>
                        {profile.isVerified && (
                            <span className="flex items-center gap-1 text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
                                <Shield className="w-3 h-3" />
                                Verified
                            </span>
                        )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mt-2">
                        <StarRating 
                            rating={profile.averageRating || 0} 
                            size="md" 
                            showValue 
                        />
                        {profile.totalReviews > 0 && (
                            <span className="text-sm text-zinc-500">
                                ({profile.totalReviews} {profile.totalReviews === 1 ? "review" : "reviews"})
                            </span>
                        )}
                    </div>

                    {/* Member since */}
                    <div className="flex items-center gap-1 mt-2 text-sm text-zinc-500">
                        <Calendar className="w-3 h-3" />
                        <span>Member since {format(new Date(profile.createdAt), "MMMM yyyy")}</span>
                    </div>
                </div>

                {/* Edit button for owner */}
                {isOwner && (
                    <Link href="/dashboard">
                        <Button variant="outline" size="sm" className="border-zinc-700">
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Dashboard
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
