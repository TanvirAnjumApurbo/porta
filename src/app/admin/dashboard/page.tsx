import { Users, Package, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Total Users", value: "12,304", icon: Users, trend: "+12%" },
  { label: "Active Requests", value: "1,432", icon: Package, trend: "+8%" },
  { label: "Pending Verifications", value: "24", icon: AlertTriangle, trend: "-5%" },
  { label: "Revenue (MTD)", value: "$45,200", icon: TrendingUp, trend: "+23%" },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-500">{stat.trend} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-24 bg-muted rounded animate-pulse mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full py-3 px-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors text-left">
              Review Pending Verifications
            </button>
            <button className="w-full py-3 px-4 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors text-left">
              Manage Users
            </button>
            <button className="w-full py-3 px-4 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors text-left">
              View Reports
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
