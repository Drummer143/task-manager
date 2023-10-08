import type { Metadata } from "next";

import Header from "@/components/Header";
import NavPanel from "@/components/NavPanel";
import Providers from "@/components/Providers";

import "./globals.css";
import LayoutResizeButton from "@/components/LayoutResizeButton";

export const metadata: Metadata = {
    title: "Task Manager"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <Providers>
            <html lang="en">
                <body className="h-screen overflow-hidden bg-[rgb(40,40,40)] text-white">
                    <Header />

                    <div className="grid grid-cols-[min-content_min-content_1fr] h-full">
                        <NavPanel />

                        <LayoutResizeButton />

                        {children}
                    </div>
                </body>
            </html>
        </Providers>
    );
}
