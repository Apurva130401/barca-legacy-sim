import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Barca Sporting Director Simulator",
  description: "A dramatic FC Barcelona sporting director simulator under Hansi Flick."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
