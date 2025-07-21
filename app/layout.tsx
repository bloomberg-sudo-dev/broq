import type { Metadata } from 'next'
import { Inter } from "next/font/google"
import './globals.css'
import "@/styles/blockly.css"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Analytics } from "@vercel/analytics/react"
import { AuthProvider } from "@/contexts/AuthContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'Broq - Visual Flow Builder',
  description: 'Build AI Solutions with Colorful Blocks! Drag, drop, and build AI programs without writing a single line of code.',
  generator: 'Broq',
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  other: {
    // Force color consistency across devices
    'color-scheme': 'light',
    'supported-color-schemes': 'light',
    'color-rendering': 'optimizeQuality',
    'image-rendering': 'optimizeQuality',
  }
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#3B82F6',
    colorScheme: 'light',
    // Force consistent rendering across devices
    userScalable: false,
    maximumScale: 1,
    minimumScale: 1,
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Prevent FOUC by ensuring immediate styling */
              html, body {
                background-color: #ffffff;
                color: #000000;
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              }
              
              /* Force immediate gradient backgrounds */
              .bg-gradient-to-br {
                background: linear-gradient(135deg, #faf5ff 0%, #eff6ff 50%, #f0fdf4 100%);
              }
              
              /* CSS-only fade-in animation to prevent hydration issues */
              body {
                animation: fadeInContent 0.3s ease-out forwards;
              }
              
              @keyframes fadeInContent {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent FOUC and ensure color consistency
              (function() {
                // Set theme immediately
                document.documentElement.className = 'light';
                document.documentElement.style.colorScheme = 'light';
                
                // Mobile Safari gradient fixes
                if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                  document.documentElement.style.webkitTextSizeAdjust = '100%';
                  document.documentElement.style.webkitFontSmoothing = 'antialiased';
                  document.documentElement.style.webkitBackfaceVisibility = 'hidden';
                }
                
                // Android WebView fixes
                if (/Android/i.test(navigator.userAgent)) {
                  document.documentElement.style.textRendering = 'optimizeLegibility';
                  document.documentElement.style.fontSmoothing = 'antialiased';
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
            storageKey="broq-theme"
          >
            <TooltipProvider>
              {children}
              <Toaster />
              <Analytics />
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
