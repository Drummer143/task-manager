import type { Metadata } from "next";

import Header from "@/components/Header";
import NavPanel from "@/components/NavPanel";
import Providers from "@/components/Providers";
import LayoutResizeButton from "@/components/LayoutResizeButton";

import "./globals.scss";

export const metadata: Metadata = {
    title: "Task Manager"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <Providers>
            <html lang="en">
                <body>
                    <div
                        className={"grid h-screen overflow-hidden bg-[rgb(40,40,40)] text-white"
                            .concat(" grid-rows-[min-content,1fr]")}
                    >
                        <Header />

                        <div className="flex relative overflow-auto">
                            <NavPanel />

                            <LayoutResizeButton />

                            <main className="relative p-2">
                                {children}
                            </main>
                        </div>
                    </div>
                </body>
            </html>
        </Providers>
    );
}
