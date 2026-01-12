"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Package, DollarSign, Weight, Send, Loader2, AlertCircle } from "lucide-react";
import { createDeliveryRequest } from "@/server/actions/delivery";

interface SendRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    travelPostId: string;
    travelerId: string;
    travelerName: string;
    tripRoute: string;
    tripDate: string;
    maxWeight: number; // in kg
}

export function SendRequestModal({
    isOpen,
    onClose,
    travelPostId,
    travelerId,
    travelerName,
    tripRoute,
    tripDate,
    maxWeight,
}: SendRequestModalProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [packageDescription, setPackageDescription] = useState("");
    const [weight, setWeight] = useState("");
    const [price, setPrice] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!packageDescription.trim()) {
            setError("Please describe what you want to send");
            return;
        }

        const weightNum = parseFloat(weight);
        if (isNaN(weightNum) || weightNum <= 0) {
            setError("Please enter a valid weight");
            return;
        }

        if (weightNum > maxWeight) {
            setError(`Weight cannot exceed ${maxWeight}kg (trip's available capacity)`);
            return;
        }

        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) {
            setError("Please enter a valid price");
            return;
        }

        try {
            setIsSubmitting(true);

            const result = await createDeliveryRequest({
                travelPostId,
                travelerId,
                packageDescription: packageDescription.trim(),
                offeredWeight: Math.round(weightNum * 1000), // Convert kg to grams
                offeredPrice: Math.round(priceNum * 100), // Convert to cents
                message: message.trim() || undefined,
            });

            if (result.success) {
                // Reset form
                setPackageDescription("");
                setWeight("");
                setPrice("");
                setMessage("");
                onClose();
                
                // Redirect to requests page
                router.push("/requests?tab=sent");
                router.refresh();
            } else {
                setError(result.error || "Failed to send request. Please try again.");
            }
        } catch (err) {
            console.error("Error sending request:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setError(null);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg bg-zinc-950 border-zinc-800 text-zinc-200">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Package className="w-5 h-5 text-primary" />
                        Send Delivery Request
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Request <span className="text-zinc-200 font-medium">{travelerName}</span> to carry your package on their trip.
                    </DialogDescription>
                </DialogHeader>

                {/* Trip Info Banner */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-sm">
                    <div className="text-zinc-400">Trip Details</div>
                    <div className="text-zinc-200 font-medium">{tripRoute}</div>
                    <div className="text-zinc-500 text-xs">{tripDate} • Up to {maxWeight}kg available</div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Package Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">
                            What do you want to send? <span className="text-red-400">*</span>
                        </label>
                        <Textarea
                            placeholder="Describe your package (e.g., Electronics, documents, gifts...)"
                            value={packageDescription}
                            onChange={(e) => setPackageDescription(e.target.value)}
                            className="bg-zinc-900 border-zinc-700 focus:border-primary min-h-[80px] resize-none"
                            maxLength={500}
                        />
                        <div className="text-xs text-zinc-500 text-right">{packageDescription.length}/500</div>
                    </div>

                    {/* Weight and Price */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                                <Weight className="w-3.5 h-3.5 text-blue-400" />
                                Weight (kg) <span className="text-red-400">*</span>
                            </label>
                            <Input
                                type="number"
                                step="0.1"
                                min="0.1"
                                max={maxWeight}
                                placeholder={`Max ${maxWeight}`}
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="bg-zinc-900 border-zinc-700 focus:border-primary"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5 text-green-400" />
                                Your Offer ($) <span className="text-red-400">*</span>
                            </label>
                            <Input
                                type="number"
                                step="1"
                                min="1"
                                placeholder="e.g. 50"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="bg-zinc-900 border-zinc-700 focus:border-primary"
                            />
                        </div>
                    </div>

                    {/* Optional Message */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">
                            Message to Traveler <span className="text-zinc-500">(optional)</span>
                        </label>
                        <Textarea
                            placeholder="Any special instructions or notes..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="bg-zinc-900 border-zinc-700 focus:border-primary min-h-[60px] resize-none"
                            maxLength={300}
                        />
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-red-300">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="flex-1 border-zinc-700 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-primary hover:bg-primary/90"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Request
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
