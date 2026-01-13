import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import "./stream-chat.css";
import { ClerkProvider } from "@clerk/nextjs";
import { VerificationChecker } from "@/components/verification/verification-checker";
import { Toaster } from "sonner";
import { ChatProvider } from "@/components/chat/chat-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Porta | Global Crowd-Shipping Marketplace",
  description: "Send items faster and cheaper with travelers already flying there. Monetize your extra bag space securely. Join 50,000+ users saving up to 70% on international shipping.",
  keywords: ["crowd shipping", "peer to peer shipping", "international delivery", "luggage space", "travelers", "package delivery", "global logistics"],
  authors: [{ name: "Porta" }],
  creator: "Porta",
  publisher: "Porta",
  robots: "index, follow",
  
  // Open Graph for social sharing
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://porta.sbs",
    siteName: "Porta",
    title: "Porta | Global Crowd-Shipping Marketplace",
    description: "Send items faster and cheaper with travelers already flying there. Monetize your extra bag space securely.",
    images: [
      {
        url: "/aerial-view-container-cargo-ship-sea.jpg",
        width: 1200,
        height: 630,
        alt: "Porta - Global Crowd-Shipping Marketplace",
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Porta | Global Crowd-Shipping Marketplace",
    description: "Send items faster and cheaper with travelers already flying there. Monetize your extra bag space securely.",
    images: ["/aerial-view-container-cargo-ship-sea.jpg"],
    creator: "@porta",
  },
  
  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
  },
  
  // Manifest
  manifest: "/manifest.json",
  
  // Theme color
  themeColor: "#0a0a0c",
  
  // Viewport
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* Additional meta tags for social sharing */}
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" href="/icon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/icon.svg" />
        </head>
        <body
          className={`${inter.variable} ${robotoMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
        >
          <ChatProvider>
            {children}
            <VerificationChecker />
            <Toaster position="top-center" richColors />
          </ChatProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
