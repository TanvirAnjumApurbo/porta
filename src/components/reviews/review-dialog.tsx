"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { StarRating } from "./star-rating";
import { submitReview } from "@/server/actions/reviews";
import { Loader2, CheckCircle } from "lucide-react";

interface ReviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deliveryRequestId: string;
    travelerName: string;
    onSuccess?: () => void;
}

export function ReviewDialog({
    open,
    onOpenChange,
    deliveryRequestId,
    travelerName,
    onSuccess,
}: ReviewDialogProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            setError("Please select a rating");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const result = await submitReview({
                deliveryRequestId,
                rating,
                comment: comment.trim() || undefined,
            });

            if (result.success) {
                setSubmitted(true);
                setTimeout(() => {
                    onOpenChange(false);
                    onSuccess?.();
                }, 1500);
            } else {
                setError(result.error || "Failed to submit review");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onOpenChange(false);
            // Reset state after close animation
            setTimeout(() => {
                setRating(0);
                setComment("");
                setError(null);
                setSubmitted(false);
            }, 200);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800">
                <DialogHeader>
                    <DialogTitle>Rate Your Experience</DialogTitle>
                    <DialogDescription>
                        How was your delivery experience with {travelerName}?
                    </DialogDescription>
                </DialogHeader>

                {submitted ? (
                    <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h3 className="font-semibold text-lg text-white">Thank You!</h3>
                        <p className="text-zinc-400 text-sm">
                            Your review has been submitted.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6 py-4">
                        {/* Star Rating */}
                        <div className="text-center">
                            <p className="text-sm text-zinc-400 mb-3">
                                Tap a star to rate
                            </p>
                            <div className="flex justify-center">
                                <StarRating
                                    rating={rating}
                                    size="lg"
                                    interactive
                                    onChange={setRating}
                                />
                            </div>
                            {rating > 0 && (
                                <p className="text-sm text-zinc-300 mt-2">
                                    {rating === 5 && "Excellent!"}
                                    {rating === 4 && "Great!"}
                                    {rating === 3 && "Good"}
                                    {rating === 2 && "Fair"}
                                    {rating === 1 && "Poor"}
                                </p>
                            )}
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="text-sm text-zinc-400 mb-2 block">
                                Comment (optional)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience..."
                                className="w-full h-24 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                                maxLength={500}
                            />
                            <p className="text-xs text-zinc-500 text-right mt-1">
                                {comment.length}/500
                            </p>
                        </div>

                        {error && (
                            <p className="text-sm text-red-400 text-center">{error}</p>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 border-zinc-700"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Skip
                            </Button>
                            <Button
                                className="flex-1 bg-primary hover:bg-primary/90"
                                onClick={handleSubmit}
                                disabled={isSubmitting || rating === 0}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : null}
                                Submit Review
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
