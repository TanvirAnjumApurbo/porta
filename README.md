<div align="center">
  <img src="public/readme_banner1.png" alt="Porta Banner" width="100%">
</div>

<div align="center">

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=stripe&logoColor=white)
![Stream](https://img.shields.io/badge/Stream-005FFF?style=for-the-badge&logo=stream&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

</div>

<br />

<div align="center">
  <h1 align="center">Porta – The Global Crowd-Shipping Marketplace</h1>
  <p align="center">
    Turning empty luggage space into global logistics.
    <br />
    <a href="#getting-started"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="#demo">View Demo</a>
    ·
    <a href="#issues">Report Bug</a>
    ·
    <a href="#issues">Request Feature</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#how-it-works">How It Works</a></li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#features">Features</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## 🗺️ About The Project

Porta is a peer-to-peer (P2P) logistics platform that connects people who need items from abroad with travelers already flying to that destination. By utilizing the empty luggage space of international travelers, Porta offers a shipping solution that is significantly faster and cheaper than traditional couriers like DHL or FedEx, while allowing travelers to earn money to subsidize their trip costs. The platform uses a secure "Escrow" financial model to ensure trust and safety for both parties.

### The Problem

In the current global landscape, two major inefficiencies exist:

*   **For Shoppers (The Receiver):** Ordering products from abroad is painful. International courier services are prohibitively expensive and slow. Many specific items are simply unavailable in local markets.
*   **For Travelers (The Carrier):** Millions of people fly daily with partially empty suitcases. This luggage allowance is a valuable asset that currently goes wasted, generating no value for the traveler.

### The Solution

Porta acts as a secure middleman to solve both problems simultaneously.

*   **For the Shopper:** They get their desired international item delivered personally by a traveler, often within days, for a fraction of the shipping cost.
*   **For the Traveler:** They monetize their unused luggage space, earning cash rewards that help pay for their flight.
*   **The Traveler-Buy Safety Model:** To prevent security risks, the traveler purchases the requested item themselves at the origin city. This ensures they know exactly what they are carrying.

## 🔄 How It Works

The system relies on a "Trustless" architecture, meaning users do not need to trust strangers; they only need to trust the platform's protocol.

### Phase 1: The Agreement
1.  **Request:** A user posts a request for an item.
2.  **Match:** A traveler flying to the destination accepts the request.
3.  **Escrow Payment:** The Shopper pays the full amount to Porta. The money is FROZEN in a secure holding account.

### Phase 2: The Purchase
1.  **Acquisition:** The Traveler buys the item using their own money.
2.  **Verification:** The Traveler uploads a photo of the receipt and the item.
3.  **Lock-in:** The Shopper approves the photo. The order is now "Locked."

### Phase 3: The Handover
1.  **Transit:** The Traveler flies to the destination.
2.  **Meeting:** The two parties meet at a public location.
3.  **Inspection:** The Shopper inspects the item.
4.  **OTP Release:** The Shopper provides a secret 4-digit One-Time Password (OTP).
5.  **Payment:** The Traveler enters the OTP, and funds are released.

## 🛠️ Built With

*   Next.js
*   TypeScript
*   Tailwind CSS
*   PostgreSQL
*   Drizzle ORM
*   Clerk (Authentication)
*   Stripe (Payments)
*   Stream (Chat)
*   Lucide React (Icons)
*   Shadcn UI (Components)
*   Zod (Validation)

## ✨ Features

*   **Identity Verification:** Email/phone verification and optional ID checks.
*   **Marketplace Operations:** Search for travelers by route and date. Post item requests with images.
*   **Escrow Wallet:** Funds held securely until transaction completion.
*   **In-App Chat:** Secure messaging with image sharing for receipts and product photos.
*   **OTP Generation:** Secure code exchange for fund release.
*   **Responsive Design:** Fully mobile-first interface for travelers on the go.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Next.js (v15 or higher)
*   npm

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/TanvirAnjumApurbo/porta
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Set up environment variables in `.env.local`
    ```env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
    CLERK_SECRET_KEY=...
    NEXT_PUBLIC_ADMIN_USER_ID=...

    DATABASE_URL=...

    STRIPE_SECRET_KEY=...
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
    STRIPE_CONNECT_CLIENT_ID=...
    STRIPE_WEBHOOK_SECRET=...

    NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=...
    IMAGEKIT_PRIVATE_KEY=...
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=...

    NEXT_PUBLIC_EMAILJS_SERVICE_ID=...
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=...
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=...
    NEXT_PUBLIC_EMAILJS_PRIVATE_KEY=...

    AVIATIONSTACK_API_KEY=...

    STREAM_API_KEY=...
    NEXT_PUBLIC_STREAM_API_KEY=...
    STREAM_SECRET_KEY=...
    ```
4.  Run database migrations
    ```sh
    npx drizzle-kit push
    ```
5.  Start the development server
    ```sh
    npm run dev
    ```

## 💻 Usage

After starting the server, visit `http://localhost:3000`. You can:
1.  Sign up as a new user.
2.  Browse available travelers or post a request.
3.  Simulate the flow using the Stripe test mode.

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👋 Final Thoughts

"The world is a book, and those who do not travel read only one page."

Building Porta isn't just about shipping items; it's about connecting the world, one traveler at a time. We hope this project inspires you to build, explore, and create solutions that bring people closer together.

Happy Coding! 🚀