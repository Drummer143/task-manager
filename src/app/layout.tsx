import type { Metadata } from "next";

import Header from "@/components/Header";
import NavPanel from "@/components/NavPanel";
import Providers from "@/components/Providers";

import "./globals.css";

export const metadata: Metadata = {
    title: "Task Manager"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <Providers>
                <body className="flex flex-wrap">
                    <Header />

                    <NavPanel />

                    {children}
                </body>
            </Providers>
        </html>
    );
}
