import type { Metadata, Viewport } from 'next';
import './globals.css';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { PWAProvider } from '@/components/PWAProvider';
import AuthProvider from '@/components/AuthProvider';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'AdriSu Kids - WMS',
  description: 'Sistema de Gestion de Almacen para AdriSu Kids',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WMS',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (stored === 'light') {
                  document.documentElement.classList.remove('dark');
                } else if (!stored && !prefersDark) {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-gray-950 text-gray-100 antialiased dark:bg-gray-950 dark:text-gray-100 bg-white text-gray-900">
        <ThemeProvider>
          <AuthProvider>
            <PWAProvider>
              <ErrorBoundary>{children}</ErrorBoundary>
            </PWAProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
