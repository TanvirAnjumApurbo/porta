import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/roles";

export default async function AuthCallbackPage() {
  // 1. Check if user is Admin
  const isUserAdmin = await isAdmin();

  // 2. Redirect accordingly
  if (isUserAdmin) {
    redirect("/admin/dashboard");
  } else {
    redirect("/dashboard");
  }

  // This part is unreachable but satisfies Typescript
  return null;
}
