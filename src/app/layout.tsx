import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SnapMenu",
    description: "Visualise your Menu with AI",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${inter.className} antialiased bg-gradient-from-slate-50 bg-gradient-to-slate-100 `}
            >
                {children}
            </body>
        </html>
    );
}
