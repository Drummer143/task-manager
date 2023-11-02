import type { Metadata } from "next";

import Header from "@/components/Header";
import NavPanel from "@/components/NavPanel";
import Providers from "@/components/Providers";
import LayoutResizeButton from "@/components/LayoutResizeButton";
import BodyResizeObserver from "@/components/BodyResizeObserver";
import { settings, useTranslation } from "@/i18n";

import "./globals.scss";

export const metadata: Metadata = {
    title: "Task Manager"
};

export async function generateStaticParams() {
    return settings.locales.map((locale) => ({ lang: locale }));
}

interface RootLayoutProps {
    children: React.ReactNode;
    params: {
        lang: I18NLocale;
    }
}

export default function RootLayout({ children, params: { lang } }: RootLayoutProps) {
    return (
        <Providers>
            <html lang={lang}>
                <body>
                    <div
                        className={"grid h-screen overflow-hidden bg-[rgb(40,40,40)] text-white".concat(
                            " grid-rows-[min-content,1fr]"
                        )}
                    >
                        <Header />

                        <BodyResizeObserver />

                        <div className="flex relative overflow-auto">
                            <NavPanel />

                            <LayoutResizeButton />

                            <main className="relative p-2">{children}</main>
                        </div>
                    </div>
                </body>
            </html>
        </Providers>
    );
}
