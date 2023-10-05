import type { Metadata } from "next";

import Providers from "@/components/Providers";

import "./globals.css";

export const metadata: Metadata = {
    title: "Task Manager"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <Providers>
                <body>{children}</body>
            </Providers>
        </html>
    );
}
