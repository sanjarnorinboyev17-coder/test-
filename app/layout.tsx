import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BilimArena — bilim bellashuvi",
  description: "O‘rganishni bellashuvga aylantiring.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="uz"><body>{children}</body></html>;
}
