"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { createIssueReport } from "@/server/actions/issues";
import { toast } from "sonner";

interface ReportIssueDialogProps {
    deliveryRequestId: string;
}

const issueTypes = [
    { value: "DELAY", label: "Delivery Delay", description: "Package taking too long" },
    { value: "NO_RESPONSE", label: "No Response", description: "Other party not responding" },
    { value: "DAMAGED", label: "Damaged Package", description: "Package arrived damaged" },
    { value: "WRONG_ITEM", label: "Wrong Item", description: "Received wrong item" },
    { value: "FRAUD", label: "Suspected Fraud", description: "Suspicious activity" },
    { value: "OTHER", label: "Other Issue", description: "Something else" },
];

export function ReportIssueDialog({ deliveryRequestId }: ReportIssueDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<string>("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!selectedType || !description.trim()) {
            toast.error("Please select an issue type and provide a description");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createIssueReport({
                deliveryRequestId,
                issueType: selectedType,
                description: description.trim(),
            });

            if (result.success) {
                toast.success("Issue reported successfully. Our team will review it.");
                setIsOpen(false);
                setSelectedType("");
                setDescription("");
            } else {
                toast.error(result.error || "Failed to submit report");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Report Issue
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-zinc-100">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        Report an Issue
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Having a problem with this delivery? Let us know and we'll help resolve it.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {/* Issue Type Selection */}
                    <div>
                        <label className="text-sm font-medium text-zinc-300 mb-2 block">
                            What's the issue?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {issueTypes.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setSelectedType(type.value)}
                                    className={`p-3 rounded-lg border text-left transition-all ${
                                        selectedType === type.value
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-zinc-700 hover:border-zinc-600 text-zinc-300"
                                    }`}
                                >
                                    <div className="text-sm font-medium">{type.label}</div>
                                    <div className="text-xs text-zinc-500 mt-0.5">{type.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm font-medium text-zinc-300 mb-2 block">
                            Describe the issue
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please provide details about the issue..."
                            className="w-full h-24 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                            maxLength={500}
                        />
                        <div className="text-xs text-zinc-500 mt-1 text-right">
                            {description.length}/500
                        </div>
                    </div>

                    {/* Submit */}
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedType || !description.trim()}
                        className="w-full bg-red-600 hover:bg-red-500"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Report"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
