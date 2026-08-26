import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Source_Serif_4 } from 'next/font/google'
import { Suspense } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import './globals.css'

// Two families only: an editorial serif display voice plus a legible sans for
// navigation, search, filters, metadata and cards (Visual Reference §4).
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-serif',
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'COURSES | AustinGolf',
    template: '%s | AustinGolf',
  },
  description:
    'Choose the right Austin golf course with less effort. Structured course data, real geography and explainable editorial judgment across the Austin metro.',
  generator: 'v0.app',
  openGraph: {
    title: 'COURSES | AustinGolf',
    description:
      'Choose the right Austin golf course with less effort — structured data, geography and explainable editorial judgment.',
    type: 'website',
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/apple-icon.png',
  },
}

// Light only. Dark mode is an explicit anti-pattern in the Visual Reference (§14).
export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fdfcf9',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // EXPERIMENT 03: the canvas is declared with bg-cream (White Sand) rather
    // than bg-background. --background has reverted to white because 25 of its
    // 26 usages are functional control surfaces, not the page field; naming the
    // canvas explicitly keeps White Sand dominant while letting white read as a
    // deliberate working surface. Colour declaration only — no layout change.
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable} bg-cream`}>
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-background"
        >
          Skip to content
        </a>
        <div className="flex min-h-dvh flex-col">
          <Suspense fallback={<div className="h-16 border-b border-border" />}>
            <SiteHeader />
          </Suspense>
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
