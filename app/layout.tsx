import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Foundwell — Find the scholarship that's actually meant for you",
  description:
    "Tell Foundwell about yourself. It searches live for real, current scholarships and opportunities, and explains exactly why each one fits.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {children}
      </body>
    </html>
  );
}
