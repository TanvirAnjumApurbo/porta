"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Truck, CheckCircle2, Package, Clock } from "lucide-react";
import { startDelivery, completeDelivery } from "@/server/actions/delivery";

interface DeliveryStatusWidgetProps {
    requestId: string;
    status: string;
    isTraveler: boolean;
    isCustomer: boolean;
}

export function DeliveryStatusWidget({
    requestId,
    status,
    isTraveler,
    isCustomer
}: DeliveryStatusWidgetProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(status);

    const handleStartDelivery = async () => {
        try {
            setIsLoading(true);
            const result = await startDelivery(requestId);
            if (result.success) {
                setCurrentStatus("IN_PROGRESS");
            }
        } catch (error) {
            console.error("Error starting delivery:", error);
            alert("Failed to start delivery. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteDelivery = async () => {
        try {
            setIsLoading(true);
            const result = await completeDelivery(requestId);
            if (result.success) {
                setCurrentStatus("COMPLETED");
            }
        } catch (error) {
            console.error("Error completing delivery:", error);
            alert("Failed to complete delivery. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const steps = [
        { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle2, color: "text-blue-400" },
        { key: "IN_PROGRESS", label: "In Transit", icon: Truck, color: "text-amber-400" },
        { key: "COMPLETED", label: "Delivered", icon: Package, color: "text-green-400" },
    ];

    const currentStepIndex = steps.findIndex(s => s.key === currentStatus);

    return (
        <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800 rounded-xl p-5 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Clock className="w-4 h-4 text-primary" />
                    </div>
                    Delivery Status
                </h3>
                {currentStatus === "COMPLETED" && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-medium">
                        Complete
                    </span>
                )}
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Connector Line Background */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-zinc-800 z-0" />
                {/* Connector Line Progress */}
                <div
                    className="absolute top-5 left-5 h-0.5 bg-primary z-0 transition-all duration-500"
                    style={{ width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%`, maxWidth: 'calc(100% - 40px)' }}
                />

                <div className="relative z-10 flex justify-between">
                    {steps.map((step, index) => {
                        const isActive = currentStepIndex >= index;
                        const isCurrent = currentStatus === step.key;
                        const Icon = step.icon;

                        return (
                            <div key={step.key} className="flex flex-col items-center">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center 
                                    transition-all duration-300 border-2
                                    ${isActive
                                        ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20'
                                        : 'bg-zinc-900 border-zinc-700 text-zinc-500'}
                                    ${isCurrent ? 'scale-110' : ''}
                                `}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <span className={`text-[11px] mt-2 font-medium ${isActive ? 'text-zinc-200' : 'text-zinc-500'}`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Action Buttons */}
            {currentStatus === "CONFIRMED" && isTraveler && (
                <Button
                    onClick={handleStartDelivery}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all"
                    size="lg"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                        <Truck className="w-4 h-4 mr-2" />
                    )}
                    Start Delivery
                </Button>
            )}

            {currentStatus === "CONFIRMED" && isCustomer && (
                <div className="text-center py-2 text-zinc-400 text-sm">
                    Waiting for traveler to start delivery...
                </div>
            )}

            {currentStatus === "IN_PROGRESS" && isCustomer && (
                <Button
                    onClick={handleCompleteDelivery}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-500 shadow-lg shadow-green-500/20 transition-all"
                    size="lg"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Confirm Delivery Received
                </Button>
            )}

            {currentStatus === "IN_PROGRESS" && isTraveler && (
                <div className="text-center py-2 text-amber-400 text-sm font-medium flex items-center justify-center gap-2">
                    <Truck className="w-4 h-4" />
                    Package in transit...
                </div>
            )}

            {currentStatus === "COMPLETED" && (
                <div className="text-center py-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-green-400 text-sm font-medium flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Delivery Successfully Completed
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">Thank you for using Porta!</p>
                </div>
            )}
        </div>
    );
}
