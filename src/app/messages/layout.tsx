import { ChatProvider } from "@/components/chat/chat-provider";
import { Navbar } from "@/components/navbar";
import "@/app/stream-chat.css";

export default function MessagesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen bg-[var(--background)]">
            <Navbar />
            <ChatProvider>
                <div className="pt-16 h-screen">
                    {children}
                </div>
            </ChatProvider>
        </main>
    );
}
