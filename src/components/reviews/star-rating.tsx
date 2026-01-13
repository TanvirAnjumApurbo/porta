"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: "sm" | "md" | "lg";
    interactive?: boolean;
    onChange?: (rating: number) => void;
    showValue?: boolean;
}

export function StarRating({
    rating,
    maxRating = 5,
    size = "md",
    interactive = false,
    onChange,
    showValue = false,
}: StarRatingProps) {
    const sizeClasses = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5",
    };

    const handleClick = (starIndex: number) => {
        if (interactive && onChange) {
            onChange(starIndex);
        }
    };

    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: maxRating }, (_, i) => {
                const starIndex = i + 1;
                const isFilled = starIndex <= rating;
                const isHalf = !isFilled && starIndex - 0.5 <= rating;

                return (
                    <button
                        key={starIndex}
                        type="button"
                        disabled={!interactive}
                        onClick={() => handleClick(starIndex)}
                        className={cn(
                            "transition-colors",
                            interactive && "cursor-pointer hover:scale-110",
                            !interactive && "cursor-default"
                        )}
                    >
                        <Star
                            className={cn(
                                sizeClasses[size],
                                isFilled
                                    ? "fill-amber-400 text-amber-400"
                                    : isHalf
                                    ? "fill-amber-400/50 text-amber-400"
                                    : "fill-transparent text-zinc-600"
                            )}
                        />
                    </button>
                );
            })}
            {showValue && (
                <span className="text-sm text-zinc-400 ml-1">
                    {rating > 0 ? rating.toFixed(1) : "—"}
                </span>
            )}
        </div>
    );
}

// Compact inline star rating display
export function StarRatingInline({
    rating,
    totalReviews,
    size = "sm",
}: {
    rating: number;
    totalReviews?: number;
    size?: "sm" | "md";
}) {
    const sizeClasses = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
    };

    return (
        <div className="flex items-center gap-1">
            <Star
                className={cn(
                    sizeClasses[size],
                    rating > 0 ? "fill-amber-400 text-amber-400" : "fill-transparent text-zinc-600"
                )}
            />
            <span className={cn(
                "text-zinc-400",
                size === "sm" ? "text-xs" : "text-sm"
            )}>
                {rating > 0 ? rating.toFixed(1) : "New"}
                {totalReviews !== undefined && totalReviews > 0 && (
                    <span className="text-zinc-500 ml-0.5">({totalReviews})</span>
                )}
            </span>
        </div>
    );
}
