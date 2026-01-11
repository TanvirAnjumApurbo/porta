"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { proposeDeal, acceptDeal } from "@/server/actions/delivery";
import { CheckCircle, DollarSign, Weight, ArrowRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface DealWidgetProps {
    channel: any; // Stream Chat Channel
    activeDeal?: {
        id: string;
        price: number;
        weight: number;
        currency: string;
        proposedBy: string;
        status: string;
    };
    travelerId: string;
    deliveryRequestId: string;
}

export function DealWidget({ channel, activeDeal, travelerId, deliveryRequestId }: DealWidgetProps) {
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [price, setPrice] = useState("");
    const [weight, setWeight] = useState("");
    const [loading, setLoading] = useState(false);

    const isTraveler = user?.id === travelerId;
    const isProposer = activeDeal?.proposedBy === user?.id;

    // Handles proposing a new deal
    const handlePropose = async () => {
        if (!price || !weight) return;
        setLoading(true);
        try {
            await proposeDeal({
                requestId: deliveryRequestId,
                price: parseFloat(price) * 100, // Convert to cents
                weight: parseInt(weight),
                currency: "USD",
            });
            setIsOpen(false);
            setPrice("");
            setWeight("");
        } catch (error) {
            console.error(error);
            alert("Failed to propose deal");
        } finally {
            setLoading(false);
        }
    };

    // Handles active deal acceptance
    const handleAccept = async () => {
        if (!activeDeal) return;
        setLoading(true);
        try {
            await acceptDeal({ dealId: activeDeal.id });
        } catch (error) {
            console.error(error);
            alert("Failed to accept deal");
        } finally {
            setLoading(false);
        }
    };

    // 1. If Deal Locked / Confirmed -> Show Status
    if (activeDeal?.status === "ACCEPTED" || activeDeal?.status === "CONFIRMED") {
        return (
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-500 w-5 h-5" />
                    <div>
                        <p className="font-semibold text-green-400">Deal Confirmed</p>
                        <p className="text-xs text-zinc-400">
                            {activeDeal.weight}kg for {activeDeal.currency} {activeDeal.price / 100}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Active Proposal View
    if (activeDeal && activeDeal.status === "PROPOSED") {
        return (
            <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wide font-semibold">Current Proposal</p>
                        <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1.5 text-zinc-200">
                                <Weight className="w-4 h-4 text-blue-400" />
                                <span className="font-mono font-medium">{activeDeal.weight}kg</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-zinc-200">
                                <DollarSign className="w-4 h-4 text-green-400" />
                                <span className="font-mono font-medium">
                                    {(activeDeal.price / 100).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                    {isProposer ? (
                        <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">Waiting for response</span>
                    ) : (
                        <Button
                            onClick={handleAccept}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-500 text-white"
                        >
                            Accept Deal
                        </Button>
                    )}
                </div>

                {/* Always allow countering by proposing new */}
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full text-zinc-400 hover:text-white border-zinc-700">
                            Propose Different Terms
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
                        <DialogHeader>
                            <DialogTitle>Propose New Deal</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400">Weight (kg)</label>
                                    <Input
                                        type="number"
                                        placeholder="e.g 5"
                                        className="bg-zinc-900 border-zinc-700"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-zinc-400">Price ($)</label>
                                    <Input
                                        type="number"
                                        placeholder="e.g 100"
                                        className="bg-zinc-900 border-zinc-700"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button className="w-full bg-blue-600 hover:bg-blue-500" onClick={handlePropose} disabled={loading}>
                                {loading ? "Send Proposal" : "Send Proposal"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    // 3. No Active Deal -> "Start Negotiation"
    return (
        <div className="mb-4">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Propose a Deal
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Propose a Deal</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-zinc-400">Weight (kg)</label>
                                <Input
                                    type="number"
                                    placeholder="e.g 5"
                                    className="bg-zinc-900 border-zinc-700"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-zinc-400">Price ($)</label>
                                <Input
                                    type="number"
                                    placeholder="e.g 100"
                                    className="bg-zinc-900 border-zinc-700"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button className="w-full bg-blue-600 hover:bg-blue-500" onClick={handlePropose} disabled={loading}>
                            Send Proposal
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
