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

    // Status Timeline
    const steps = [
        { key: "CONFIRMED", label: "Deal Confirmed", icon: CheckCircle2 },
        { key: "IN_PROGRESS", label: "In Transit", icon: Truck },
        { key: "COMPLETED", label: "Delivered", icon: Package },
    ];

    const currentStepIndex = steps.findIndex(s => s.key === currentStatus);

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Delivery Status
            </h3>

            {/* Timeline */}
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isActive = currentStepIndex >= index;
                    const isCurrent = currentStatus === step.key;
                    const Icon = step.icon;

                    return (
                        <div key={step.key} className="flex flex-col items-center flex-1">
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center 
                                transition-all duration-300
                                ${isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-zinc-800 text-zinc-500'}
                                ${isCurrent ? 'ring-2 ring-primary ring-offset-2 ring-offset-zinc-900' : ''}
                            `}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className={`text-[10px] mt-2 text-center ${isActive ? 'text-zinc-200' : 'text-zinc-500'}`}>
                                {step.label}
                            </span>
                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="absolute left-0 w-full h-0.5 bg-zinc-700 -z-10" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Action Buttons */}
            {currentStatus === "CONFIRMED" && isTraveler && (
                <Button
                    onClick={handleStartDelivery}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                        <Truck className="w-4 h-4 mr-2" />
                    )}
                    Start Delivery
                </Button>
            )}

            {currentStatus === "IN_PROGRESS" && isCustomer && (
                <Button
                    onClick={handleCompleteDelivery}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-500"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Confirm Delivery Received
                </Button>
            )}

            {currentStatus === "COMPLETED" && (
                <div className="text-center py-2 text-green-400 text-sm font-medium">
                    ✅ Delivery Complete
                </div>
            )}
        </div>
    );
}
