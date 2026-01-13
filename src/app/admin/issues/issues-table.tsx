"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { 
    AlertTriangle, 
    CheckCircle, 
    Clock, 
    Eye,
    Loader2,
    User,
    Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateIssueStatus } from "@/server/actions/issues";
import { toast } from "sonner";

interface Issue {
    id: string;
    deliveryRequestId: string;
    reporterId: string;
    reporterRole: string;
    issueType: string;
    description: string;
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    adminNotes: string | null;
    createdAt: Date;
    deliveryRequest: {
        id: string;
        packageDescription: string;
        customer: { firstName: string | null; lastName: string | null } | null;
        traveller: { firstName: string | null; lastName: string | null } | null;
    };
    reporter: { firstName: string | null; lastName: string | null } | null;
}

interface IssuesTableProps {
    issues: Issue[];
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
    OPEN: { label: "Open", color: "text-red-400", bgColor: "bg-red-500/10", icon: AlertTriangle },
    IN_PROGRESS: { label: "In Progress", color: "text-amber-400", bgColor: "bg-amber-500/10", icon: Clock },
    RESOLVED: { label: "Resolved", color: "text-green-400", bgColor: "bg-green-500/10", icon: CheckCircle },
    CLOSED: { label: "Closed", color: "text-zinc-400", bgColor: "bg-zinc-500/10", icon: CheckCircle },
};

const issueTypeLabels: Record<string, string> = {
    DELAY: "Delivery Delay",
    NO_RESPONSE: "No Response",
    DAMAGED: "Damaged Package",
    WRONG_ITEM: "Wrong Item",
    FRAUD: "Suspected Fraud",
    OTHER: "Other Issue",
};

export function IssuesTable({ issues }: IssuesTableProps) {
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [adminNotes, setAdminNotes] = useState("");

    const handleStatusUpdate = async (status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED") => {
        if (!selectedIssue) return;
        
        setIsUpdating(true);
        try {
            await updateIssueStatus({
                issueId: selectedIssue.id,
                status,
                adminNotes: adminNotes || undefined,
            });
            toast.success(`Issue marked as ${status.toLowerCase()}`);
            setSelectedIssue(null);
            setAdminNotes("");
        } catch (error) {
            toast.error("Failed to update issue");
        } finally {
            setIsUpdating(false);
        }
    };

    if (issues.length === 0) {
        return (
            <div className="text-center py-16">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-zinc-300">No Issues</h3>
                <p className="text-zinc-500">All clear! No issues have been reported.</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-zinc-800/50 text-left text-sm text-zinc-400">
                            <th className="px-4 py-3 font-medium">Issue</th>
                            <th className="px-4 py-3 font-medium">Reporter</th>
                            <th className="px-4 py-3 font-medium">Delivery</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Date</th>
                            <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {issues.map((issue) => {
                            const config = statusConfig[issue.status];
                            const reporterName = issue.reporter 
                                ? `${issue.reporter.firstName || ''} ${issue.reporter.lastName || ''}`.trim() || 'Unknown'
                                : 'Unknown';
                            
                            return (
                                <tr key={issue.id} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="font-medium text-zinc-200">
                                            {issueTypeLabels[issue.issueType] || issue.issueType}
                                        </div>
                                        <div className="text-sm text-zinc-500 truncate max-w-xs">
                                            {issue.description}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-zinc-500" />
                                            <div>
                                                <div className="text-zinc-300">{reporterName}</div>
                                                <div className="text-xs text-zinc-500">{issue.reporterRole}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-zinc-500" />
                                            <span className="text-zinc-400 text-sm truncate max-w-[150px]">
                                                {issue.deliveryRequest?.packageDescription || 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-xs font-medium",
                                            config.bgColor,
                                            config.color
                                        )}>
                                            {config.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-zinc-400">
                                        {format(new Date(issue.createdAt), "MMM d, yyyy")}
                                    </td>
                                    <td className="px-4 py-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedIssue(issue);
                                                setAdminNotes(issue.adminNotes || "");
                                            }}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                        </Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Issue Detail Dialog */}
            <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
                <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            Issue Details
                        </DialogTitle>
                        <DialogDescription>
                            Review and manage this issue report
                        </DialogDescription>
                    </DialogHeader>

                    {selectedIssue && (
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-zinc-500">Type:</span>
                                    <p className="font-medium">{issueTypeLabels[selectedIssue.issueType]}</p>
                                </div>
                                <div>
                                    <span className="text-zinc-500">Reporter:</span>
                                    <p className="font-medium">
                                        {selectedIssue.reporter?.firstName} {selectedIssue.reporter?.lastName}
                                        <span className="text-zinc-500 ml-1">({selectedIssue.reporterRole})</span>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <span className="text-zinc-500 text-sm">Description:</span>
                                <p className="bg-zinc-800 rounded-lg p-3 mt-1">{selectedIssue.description}</p>
                            </div>

                            <div>
                                <label className="text-zinc-500 text-sm block mb-1">Admin Notes:</label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="w-full h-20 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 resize-none"
                                    placeholder="Add notes about resolution..."
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusUpdate("IN_PROGRESS")}
                                    disabled={isUpdating}
                                    className="flex-1"
                                >
                                    In Progress
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleStatusUpdate("RESOLVED")}
                                    disabled={isUpdating}
                                    className="flex-1 bg-green-600 hover:bg-green-500"
                                >
                                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Resolve"}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusUpdate("CLOSED")}
                                    disabled={isUpdating}
                                    className="flex-1"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
