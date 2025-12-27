import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure admin preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Admin Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16 text-muted-foreground">
            <Settings className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Coming Soon</p>
            <p className="text-sm mt-1">Admin settings and configuration will be available here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
