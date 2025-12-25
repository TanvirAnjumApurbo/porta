import { auth } from "@clerk/nextjs/server";

// TODO: In the future, this should use Clerk's publicMetadata.role
// For now, we will use a specific User ID as requested.
// You should set this in your .env.local as NEXT_PUBLIC_ADMIN_USER_ID=<your_clerk_user_id>
// Or we can hardcode it temporarily for testing if you don't have the ID yet.

export const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;

export async function isAdmin() {
  const { userId } = await auth();
  
  if (!userId) return false;
  
  // If no admin ID is set, nobody is admin (security by default)
  if (!ADMIN_USER_ID) return false;

  return userId === ADMIN_USER_ID;
}
