import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { getUserProfile, getDeliveryHistoryAsTraveler, getFinancialSummary, getUserStats } from "@/server/actions/profile";
import { getReviewsForUser } from "@/server/actions/reviews";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileStats } from "@/components/profile/profile-stats";
import { ProfileFinancials } from "@/components/profile/profile-financials";
import { ProfileReviews } from "@/components/profile/profile-reviews";
import { ProfileDeliveryHistory } from "@/components/profile/profile-delivery-history";

interface ProfilePageProps {
    params: Promise<{ userId: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { userId: profileUserId } = await params;
    const { userId: currentUserId } = await auth();
    
    const isOwner = currentUserId === profileUserId;

    // Get profile data
    const profile = await getUserProfile(profileUserId);
    
    if (!profile) {
        notFound();
    }

    // Get reviews
    const reviews = await getReviewsForUser(profileUserId);

    // Get stats
    const stats = await getUserStats(profileUserId);

    // Get delivery history
    const deliveryHistory = await getDeliveryHistoryAsTraveler(profileUserId, 5);

    // Get financials (only for owner)
    const financials = isOwner ? await getFinancialSummary() : null;

    return (
        <main className="min-h-screen bg-[var(--background)]">
            <Navbar />
            <div className="pt-24 px-6 max-w-4xl mx-auto pb-12">
                {/* Profile Header */}
                <ProfileHeader 
                    profile={profile} 
                    isOwner={isOwner} 
                />

                {/* Stats Cards */}
                <ProfileStats 
                    completedDeliveries={stats.completedDeliveries}
                    activeDeliveries={stats.activeDeliveries}
                    averageRating={profile.averageRating || 0}
                    totalReviews={profile.totalReviews}
                />

                {/* Financials (Owner only) */}
                {isOwner && financials && (
                    <ProfileFinancials financials={financials} />
                )}

                {/* Reviews Section */}
                <ProfileReviews reviews={reviews} />

                {/* Delivery History */}
                <ProfileDeliveryHistory 
                    deliveries={deliveryHistory} 
                    isOwner={isOwner}
                    userId={profileUserId}
                />
            </div>
        </main>
    );
}
