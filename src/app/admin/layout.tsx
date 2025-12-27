import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const adminId = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
  if (!adminId || userId !== adminId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
