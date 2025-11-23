import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Auth0ProviderWithConfig from "./auth0-provider";

const interSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PitchPoint",
    template: "%s | PitchPoint",
  },
  description: "PitchPoint streamlines your pitch creation, practice, and feedback.",
  icons: {
    icon: "/pitchpoint.ico",
    shortcut: "/pitchpoint.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${interSans.variable} antialiased`}
      >
        <Auth0ProviderWithConfig>
          {children}
        </Auth0ProviderWithConfig>
      </body>
    </html>
  );
}
