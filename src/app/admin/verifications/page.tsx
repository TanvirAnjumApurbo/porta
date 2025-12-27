import { getPendingVerifications } from "@/server/actions/verification";
import { VerificationRowActions } from "./verification-row-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShieldCheck } from "lucide-react";

export default async function AdminVerificationsPage() {
  const verifications = await getPendingVerifications();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Verification Requests</h1>
        <p className="text-muted-foreground">Review and approve user identity verifications</p>
      </div>

      {verifications.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <ShieldCheck className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground text-lg font-medium">No pending verifications</p>
          <p className="text-muted-foreground text-sm mt-1">All caught up! Check back later.</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Requests</span>
              <Badge variant="secondary">{verifications.length} pending</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Nationality</TableHead>
                    <TableHead className="hidden sm:table-cell">ID Type</TableHead>
                    <TableHead className="hidden lg:table-cell">Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verifications.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div>
                          <span className="block">{user.legalName}</span>
                          <span className="md:hidden text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{user.email}</TableCell>
                      <TableCell className="hidden lg:table-cell">{user.nationality}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {user.idType}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30 text-xs">
                          {user.verificationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <VerificationRowActions user={user} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
