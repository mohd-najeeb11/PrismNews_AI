import type { Metadata } from 'next';
import './globals.css';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'PrismNews AI — News Bias & Transparency Engine',
  description: 'AI-powered platform comparing news framing, explainable bias, missing perspectives, and chronological timeline shifts across global outlets.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans antialiased selection:bg-purple-500 selection:text-white">
        <NavBar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
