import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dumb Funny Shit 💩",
  description: "The home of dumb, funny short videos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
