import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider"; // 🌟 引入
import type { Viewport } from 'next'

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9fafb' }, // Light Mode 背景色
    { media: '(prefers-color-scheme: dark)', color: '#111827' },  // Dark Mode 背景色
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // 🌟 防止 iPhone 用家誤觸放大了畫面
}

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "你的終極習慣與財務追蹤神器",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 🌟 必須加 suppressHydrationWarning
    <html lang="zh-HK" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
