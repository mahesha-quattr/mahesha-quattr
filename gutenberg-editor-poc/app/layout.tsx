import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gutenberg Editor POC',
  description: 'A proof of concept for using the Gutenberg editor in a Next.js app.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
