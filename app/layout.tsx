import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "The Human Experience Podcast Membership",
  description:
    "A premium membership platform for seekers exploring consciousness, science, healing, and human potential.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <body className="font-sans">{children}</body>
    </html>
  );
}
