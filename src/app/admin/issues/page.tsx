import { Suspense } from "react";
import { getIssueReports } from "@/server/actions/issues";
import { IssuesTable } from "./issues-table";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function AdminIssuesPage() {
    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-500/10 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Issue Reports</h1>
                    <p className="text-zinc-400 text-sm">Manage user-reported issues and disputes</p>
                </div>
            </div>

            <Suspense fallback={<IssuesLoadingSkeleton />}>
                <IssuesTableWrapper />
            </Suspense>
        </div>
    );
}

async function IssuesTableWrapper() {
    const issues = await getIssueReports();
    return <IssuesTable issues={issues} />;
}

function IssuesLoadingSkeleton() {
    return (
        <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
        </div>
    );
}
