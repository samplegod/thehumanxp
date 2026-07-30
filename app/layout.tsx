import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

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
      <head>
        <script src="https://cdn.brevo.com/js/sdk-loader.js" async />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Version: 2.0
              window.Brevo = window.Brevo || [];
              Brevo.push([
                "init",
                {
                  client_key: "ls90rn84xittl4e1y1frn359"
                }
              ]);
            `,
          }}
        />
      </head>
      <body className="font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
