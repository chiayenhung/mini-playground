import './globals.css'
import type { Metadata } from 'next'
import { clsx } from 'clsx'

export const metadata: Metadata = {
  title: 'Mini Model Playground',
  description: 'Chat with Fireworks models',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={clsx('h-full bg-neutral-950 text-neutral-100')}>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}


