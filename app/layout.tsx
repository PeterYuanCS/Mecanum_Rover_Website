import type { Metadata } from "next";
import "./globals.css";
import { PageTransition } from '@/components/experience/PageTransition';
export const metadata: Metadata = {
  title: "Mecanum Rover — Small machine. Every direction.",
  description:
    "Take apart an ESP32-powered mecanum rover. An interactive 3D journey through its wheels, motors, electronics and power.",
  icons: {
    icon: { url: "/favicon.png", type: "image/png" },
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
