import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage all registered users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16 text-muted-foreground">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Coming Soon</p>
            <p className="text-sm mt-1">User management features will be available here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
