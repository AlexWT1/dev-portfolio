import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'sonner';
import { SessionProvider } from 'next-auth/react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Dev Portfolio — AI-Powered Development Journey',
  description:
    'Interactive portfolio showcasing development projects built through AI-agent sessions. Track metrics, tokens, costs, and code changes across every session.',
  keywords: ['portfolio', 'developer', 'AI', 'sessions', 'code', 'metrics'],
  openGraph: {
    title: 'Dev Portfolio',
    description: 'AI-powered development journey',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SessionProvider>
          <Navbar />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'dark:bg-zinc-900 dark:text-zinc-50 dark:border-zinc-800',
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
