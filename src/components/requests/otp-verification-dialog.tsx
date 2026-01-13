"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, CheckCircle, Lock } from "lucide-react";
import { generateDeliveryOTP, verifyDeliveryOTP } from "@/server/actions/delivery";
import { toast } from "sonner";

interface OTPVerificationDialogProps {
    requestId: string;
    children: React.ReactNode;
}

export function OTPVerificationDialog({ requestId, children }: OTPVerificationDialogProps) {
    const [open, setOpen] = useState(false);
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [codeSent, setCodeSent] = useState(false);

    const handleSendCode = async () => {
        setIsLoading(true);
        try {
            const result = await generateDeliveryOTP(requestId);
            if (result.success) {
                setCodeSent(true);
                toast.success("Code sent to customer's email!");
            } else {
                console.error(result.error);
                toast.error("Failed to send code: " + result.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!otp || otp.length !== 6) return;
        setIsLoading(true);
        try {
            const result = await verifyDeliveryOTP(requestId, otp);
            if (result.success) {
                setOpen(false);
                setOpen(false);
                toast.success("Delivery Verified & Payment Released!");
            } else {
                toast.error("Verification Failed: " + result.error);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Lock className="w-5 h-5 text-primary" />
                        Verify Delivery
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Ask the customer for the verification code sent to their email to complete the delivery and release payment.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {!codeSent ? (
                        <div className="text-center space-y-4">
                            <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                                <p className="text-sm text-primary-foreground mb-2">
                                    Ready to hand over the item?
                                </p>
                                <Button 
                                    onClick={handleSendCode} 
                                    disabled={isLoading}
                                    className="w-full bg-primary hover:bg-primary/90 font-semibold text-primary-foreground"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                                    Send Code to Customer
                                </Button>
                            </div>
                            <p className="text-xs text-zinc-500">
                                Clicking this will generate a 6-digit code and email it to the customer.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center p-2 text-primary bg-primary/10 rounded-md text-sm mb-4">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Code sent to customer
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Enter Verification Code</label>
                                <Input
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="text-center text-2xl tracking-widest bg-zinc-800 border-zinc-700 h-14"
                                />
                            </div>

                            <div className="flex gap-2 justify-end text-xs text-zinc-500">
                                <button onClick={handleSendCode} disabled={isLoading} className="hover:text-zinc-300 underline">
                                    Resend Code
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {codeSent && (
                        <Button 
                            onClick={handleVerify} 
                            disabled={isLoading || otp.length !== 6}
                            className="w-full bg-primary hover:bg-primary/90 h-11 text-lg text-primary-foreground"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Verify & Complete"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
