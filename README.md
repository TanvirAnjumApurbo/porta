This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.





# **Project Title: Porta – The Global Crowd-Shipping Marketplace**

**Tagline:** *Turning empty luggage space into global logistics.*

## **1. Executive Summary**

**Porta** is a peer-to-peer (P2P) logistics platform that connects people who need items from abroad with travelers already flying to that destination. By utilizing the empty luggage space of international travelers, Porta offers a shipping solution that is significantly faster and cheaper than traditional couriers (like DHL or FedEx), while allowing travelers to earn money to subsidize their trip costs. The platform uses a secure "Escrow" financial model to ensure trust and safety for both parties.

## **2. The Problem**

In the current global landscape, two major inefficiencies exist:

* **For Shoppers (The Receiver):** Ordering products from abroad is painful. International courier services are prohibitively expensive (often costing more than the item itself) and slow. Many specific items (electronics, specialized medicines, local fashion) are simply unavailable in local markets.
* **For Travelers (The Carrier):** Millions of people fly daily with partially empty suitcases. This luggage allowance is a valuable asset that currently goes wasted, generating no value for the traveler despite the high cost of their flight ticket.

## **3. The Solution**

**Porta** acts as a secure middleman to solve both problems simultaneously.

* **For the Shopper:** They get their desired international item delivered personally by a traveler, often within days, for a fraction of the shipping cost.
* **For the Traveler:** They monetize their unused luggage space, earning cash rewards that help pay for their flight.
* **The "Traveler-Buy" Safety Model:** To prevent security risks (like carrying unknown packages), the traveler purchases the requested item themselves at the origin city. This ensures they know exactly what they are carrying.

---

## **4. How It Works (The Safe Workflow)**

The system relies on a "Trustless" architecture, meaning users do not need to trust strangers; they only need to trust the platform's protocol.

### **Phase 1: The Agreement**

1. **Request:** A user in Dhaka posts: *"I need an IKEA Lamp from London. Item cost $50. I will pay a $20 reward."*
2. **Match:** A traveler flying from London to Dhaka accepts the request.
3. **Escrow Payment:** The Shopper pays the full amount ($75 total: Cost + Reward + Fees) to **Porta**. The money is **FROZEN** in a secure holding account. The traveler cannot touch it yet, but they can see the funds are secured.

### **Phase 2: The Purchase**

1. **Acquisition:** The Traveler buys the lamp in London using their own money ($50). This serves as a security check—since they bought it, they know it's safe (no illegal items).
2. **Verification:** The Traveler uploads a photo of the receipt and the open item to the app chat.
3. **Lock-in:** The Shopper approves the photo. The order is now "Locked." If the Shopper cancels now, the Traveler is reimbursed from the frozen funds.

### **Phase 3: The Handover**

1. **Transit:** The Traveler flies to Dhaka.
2. **Meeting:** The two parties meet at a public location (e.g., Airport or Café).
3. **Inspection:** The Shopper inspects the item.
4. **OTP Release:** The Shopper provides a secret 4-digit One-Time Password (OTP) found in their app.
5. **Payment:** The Traveler enters the OTP into the Traveler App. The frozen funds are instantly released to the Traveler’s bank account.

---

## **5. Functional Requirements**

*These are the specific behaviors and features the system will perform.*

**A. User & Profile Management**

* **Identity Verification:** Users must verify email/phone. Optional ID verification (Passport/NID) for high-value transactions.
* **Reviews & Ratings:** A dual-sided rating system (Travelers rate Shoppers and vice versa) to build community reputation.

**B. Marketplace Operations**

* **Search & Filter:** Shoppers can search for travelers by "Route" (e.g., London -> Dhaka) and "Date."
* **Item Request Posting:** Ability to post requests with images, links, and estimated prices.
* **Currency Conversion:** Automatic display of prices in both the Shopper's and Traveler's local currencies.

**C. Financial System (The Core)**

* **Escrow Wallet:** A system to hold funds securely until transaction completion.
* **Payout Logic:** Automated transfer of funds upon successful OTP entry.
* **Refund Mechanism:** Automatic refunds to the Shopper if the Traveler cancels or fails to deliver.

**D. Security & Communication**

* **In-App Chat:** Secure messaging for coordination.
* **Image Proofing:** Feature to upload receipts and product photos within the chat.
* **OTP Generation:** Random 4-digit code generation for every confirmed order.

---

## **6. Non-Functional Requirements**

*These define the quality and performance attributes of the system.*

**A. Trust & Safety**

* **Data Privacy:** User's exact home address is never revealed publicly. Meeting points are suggested as public landmarks.
* **Fraud Detection:** System should flag users who repeatedly cancel after locking funds.

**B. Usability**

* **Mobile-First Design:** The platform must be fully responsive on mobile devices, as travelers will use it on the go.
* **Language Support:** The interface should support translation or be intuitive enough for cross-language interaction.

**C. Reliability & Performance**

* **Real-Time Updates:** Status changes (Payment Received, Item Bought) must update instantly without refreshing the page.
* **Scalability:** The database must handle thousands of active requests without slowing down search results.

---

## **7. Business Potential & Impact**

* **Revenue Model:** The platform charges a small service fee (e.g., 5-7%) on top of the transaction value.
* **Social Impact:** Reduces carbon footprint by utilizing existing flights rather than dedicated cargo planes. Connects cultures by facilitating the exchange of goods.