import type { Metadata } from "next";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shopify Editions | Winter '26",
  description:
    "The commerce renaissance is here. Explore 150+ product updates across AI, retail, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-nav-theme="dark"
      data-nav-bg="transparent"
      data-nav-style="default"
      data-sidebar-theme="dark"
      data-title-theme="dark"
    >
      <head>
        <link
          rel="stylesheet"
          href="/assets/fonts/fonts-latin.css"
        />
        <link rel="stylesheet" href="/assets/shopify-source.css" />
      </head>
      <body className="place-items-end">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
