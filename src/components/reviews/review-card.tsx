import { StarRating } from "./star-rating";
import { format } from "date-fns";
import { MapPin } from "lucide-react";

interface ReviewCardProps {
    review: {
        rating: number;
        comment: string | null;
        createdAt: Date;
        reviewer?: {
            firstName: string | null;
            lastName: string | null;
            userPhotoUrl?: string | null;
        };
        deliveryRequest?: {
            travelPost?: {
                departureCity: string;
                destinationCity: string;
            };
        };
    };
}

export function ReviewCard({ review }: ReviewCardProps) {
    const reviewerName = review.reviewer
        ? `${review.reviewer.firstName || ""} ${review.reviewer.lastName || ""}`.trim() || "Anonymous"
        : "Anonymous";

    // Get initials for avatar
    const initials = reviewerName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const route = review.deliveryRequest?.travelPost
        ? `${review.deliveryRequest.travelPost.departureCity} → ${review.deliveryRequest.travelPost.destinationCity}`
        : null;

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden flex items-center justify-center text-sm font-medium text-zinc-300 shrink-0">
                    {review.reviewer?.userPhotoUrl ? (
                         <img src={review.reviewer.userPhotoUrl} alt="Reviewer" className="w-full h-full object-cover" />
                    ) : (
                        initials
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-white truncate">
                            {reviewerName}
                        </span>
                        <span className="text-xs text-zinc-500 shrink-0">
                            {format(new Date(review.createdAt), "MMM d, yyyy")}
                        </span>
                    </div>

                    {/* Rating */}
                    <div className="mt-1">
                        <StarRating rating={review.rating} size="sm" />
                    </div>

                    {/* Route */}
                    {route && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-zinc-500">
                            <MapPin className="w-3 h-3" />
                            <span>{route}</span>
                        </div>
                    )}

                    {/* Comment */}
                    {review.comment && (
                        <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
                            "{review.comment}"
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
