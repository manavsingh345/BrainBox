import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import "./globals.css";
import "@mysecondbrain/ui/index.css";
import "@mysecondbrain/ui/App.css";
import "@mysecondbrain/ui/pages/Bot.css";
import "@mysecondbrain/ui/pages/Chat1.css";
import "@mysecondbrain/ui/pages/chat.css";
import "@mysecondbrain/ui/pages/ChatWindow.css";
import "@mysecondbrain/ui/pages/Dashboard.css";
import "@mysecondbrain/ui/pages/Sidebar1.css";
import "highlight.js/styles/atom-one-dark.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "BrainBox",
  description: "AI-powered second brain built with Next.js, Express, MongoDB, and background workers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon-brain.svg" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css"
          integrity="sha512-2SwdPD6INVrV/lHTZbO2nodKhrnDdJK9/kg2XD1r9uGqPo1cUbujc+IYdlYdEErWNu69gVcYgdxlmVmzTWnetw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Script
          src="https://platform.twitter.com/widgets.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
