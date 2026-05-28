import type { Metadata } from 'next'
import { Noto_Sans_Thai } from 'next/font/google'
import './globals.css'

const notoSansThai = Noto_Sans_Thai({ subsets: ['thai', 'latin'] })

export const metadata: Metadata = {
  title: 'DD Computer - Chat Commerce',
  description: 'Shop computers via chat',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body className={notoSansThai.className}>{children}</body>
    </html>
  )
}
