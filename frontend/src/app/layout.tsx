import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "錯題管理系統",
  description: "一個幫助學生管理和複習錯題的系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
