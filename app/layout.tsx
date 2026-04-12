import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'King Grab Dashboard',
  description: 'Dashboard สำหรับแสดงยอดขายสินค้า',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fdf2f8',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={`${inter.className} min-h-[100dvh] min-h-screen overflow-x-hidden antialiased`}>
        {children}
      </body>
    </html>
  )
}
