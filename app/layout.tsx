import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "./components/ThemeProvider" // 🌟 引入

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Money Tracker",
  description: "輕鬆記錄每日開支",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
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
  )
}