import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import "./stream-chat.css";
import { ClerkProvider } from "@clerk/nextjs";
import { VerificationChecker } from "@/components/verification/verification-checker";
import { Toaster } from "sonner";

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
  title: "Porta | Global Crowd-Shipping",
  description: "Turning empty luggage space into global logistics.",
};

import { ChatProvider } from "@/components/chat/chat-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
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
