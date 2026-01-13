import { DollarSign, Clock, TrendingUp } from "lucide-react";
import { StripeConnectSetup } from "@/components/stripe/stripe-connect-setup";

interface ProfileFinancialsProps {
    financials: {
        totalEarned: number;
        pendingPayout: number;
        totalTransactions: number;
    };
}

export function ProfileFinancials({ financials }: ProfileFinancialsProps) {
    return (
        <div className="space-y-4 mb-6">
            {/* Stripe Connect Status */}
            <StripeConnectSetup />

            {/* Earnings Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase">Total Earned</p>
                            <p className="text-xl font-bold text-green-400">
                                ${(financials.totalEarned / 100).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase">Pending</p>
                            <p className="text-xl font-bold text-amber-400">
                                ${(financials.pendingPayout / 100).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase">Transactions</p>
                            <p className="text-xl font-bold text-white">
                                {financials.totalTransactions}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
