import { ReviewCard } from "@/components/reviews/review-card";
import { MessageSquare } from "lucide-react";

interface ProfileReviewsProps {
    reviews: Array<{
        id: string;
        rating: number;
        comment: string | null;
        createdAt: Date;
        reviewer: {
            firstName: string | null;
            lastName: string | null;
        } | null;
        deliveryRequest: {
            travelPost: {
                departureCity: string;
                destinationCity: string;
            } | null;
        } | null;
    }>;
}

export function ProfileReviews({ reviews }: ProfileReviewsProps) {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Reviews ({reviews.length})
            </h2>

            {reviews.length === 0 ? (
                <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500">No reviews yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.slice(0, 5).map((review) => (
                        <ReviewCard
                            key={review.id}
                            review={{
                                rating: review.rating,
                                comment: review.comment,
                                createdAt: review.createdAt,
                                reviewer: review.reviewer || undefined,
                                deliveryRequest: review.deliveryRequest
                                    ? {
                                        travelPost: review.deliveryRequest.travelPost || undefined,
                                      }
                                    : undefined,
                            }}
                        />
                    ))}
                    {reviews.length > 5 && (
                        <p className="text-sm text-zinc-500 text-center">
                            + {reviews.length - 5} more reviews
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
