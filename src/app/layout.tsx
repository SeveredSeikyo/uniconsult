import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
// Removed: import { GeistMono } from 'geist/font/mono'; - Not found and not explicitly used. Sans will be default.
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'UniConsult - University Consultation Scheduler',
  description: 'Schedule and manage academic consultations seamlessly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} font-sans antialiased bg-[#2C3136]`}> {/* Removed GeistMono variable */}
        <AuthProvider>
          <Header />
          <main className="container mx-auto p-4 pt-20"> {/* Add pt-20 for fixed header */}
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
