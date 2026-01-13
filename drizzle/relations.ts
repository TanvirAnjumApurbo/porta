import { relations } from "drizzle-orm/relations";
import { deliveryRequests, transactions, users, travelPosts, activityLogs, notifications, reviews } from "./schema";

export const transactionsRelations = relations(transactions, ({one}) => ({
	deliveryRequest: one(deliveryRequests, {
		fields: [transactions.deliveryRequestId],
		references: [deliveryRequests.id]
	}),
}));

export const deliveryRequestsRelations = relations(deliveryRequests, ({one, many}) => ({
	transactions: many(transactions),
	travelPost: one(travelPosts, {
		fields: [deliveryRequests.travelPostId],
		references: [travelPosts.id]
	}),
	user_travellerId: one(users, {
		fields: [deliveryRequests.travellerId],
		references: [users.id],
		relationName: "deliveryRequests_travellerId_users_id"
	}),
	user_customerId: one(users, {
		fields: [deliveryRequests.customerId],
		references: [users.id],
		relationName: "deliveryRequests_customerId_users_id"
	}),
	activityLogs: many(activityLogs),
	notifications: many(notifications),
	reviews: many(reviews),
}));

export const travelPostsRelations = relations(travelPosts, ({one, many}) => ({
	user: one(users, {
		fields: [travelPosts.userId],
		references: [users.id]
	}),
	deliveryRequests: many(deliveryRequests),
}));

export const usersRelations = relations(users, ({many}) => ({
	travelPosts: many(travelPosts),
	deliveryRequests_travellerId: many(deliveryRequests, {
		relationName: "deliveryRequests_travellerId_users_id"
	}),
	deliveryRequests_customerId: many(deliveryRequests, {
		relationName: "deliveryRequests_customerId_users_id"
	}),
	activityLogs: many(activityLogs),
	notifications: many(notifications),
	reviews_reviewerId: many(reviews, {
		relationName: "reviews_reviewerId_users_id"
	}),
	reviews_revieweeId: many(reviews, {
		relationName: "reviews_revieweeId_users_id"
	}),
}));

export const activityLogsRelations = relations(activityLogs, ({one}) => ({
	deliveryRequest: one(deliveryRequests, {
		fields: [activityLogs.deliveryRequestId],
		references: [deliveryRequests.id]
	}),
	user: one(users, {
		fields: [activityLogs.performedBy],
		references: [users.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
	deliveryRequest: one(deliveryRequests, {
		fields: [notifications.relatedRequestId],
		references: [deliveryRequests.id]
	}),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	deliveryRequest: one(deliveryRequests, {
		fields: [reviews.deliveryRequestId],
		references: [deliveryRequests.id]
	}),
	user_reviewerId: one(users, {
		fields: [reviews.reviewerId],
		references: [users.id],
		relationName: "reviews_reviewerId_users_id"
	}),
	user_revieweeId: one(users, {
		fields: [reviews.revieweeId],
		references: [users.id],
		relationName: "reviews_revieweeId_users_id"
	}),
}));