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
                            .concat(" grid-rows-[min-content,1fr] grid-cols-[min-content_min-content_1fr]")
                            .concat(" grid-areas-['header_header_header''nav_resize_content']")}
                    >
                        <Header />

                        <NavPanel />

                        <LayoutResizeButton />

                        <main className="grid-area-[content] overflow-y-auto p-2">
                            {children}
                        </main>
                    </div>
                </body>
            </html>
        </Providers>
    );
}
