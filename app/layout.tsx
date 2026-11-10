import type { Metadata } from 'next';
import './globals.css';
import { Navigation, Sidebar } from '@/components/Navigation';
import { CelebrationModal } from '@/components/CelebrationModal';

export const metadata: Metadata = {
  title: 'FocusSprout 🌱 | Mindful Productivity & Focus Timer',
  description: 'Cultivate deep focus, build consistent habits, nurture your digital sprout, and minimize distractions across mobile, web, and Chrome extension.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#F6F9F6] dark:bg-[#0F1813] text-[#14261C] dark:text-[#F0F7F2] font-sans antialiased selection:bg-[#52B788]/20">
        <Navigation />
        <div className="flex w-full max-w-[1600px] mx-auto">
          <Sidebar />
          <main className="flex-1 min-w-0 p-4 md:p-8 pb-20 md:pb-12">
            {children}
          </main>
        </div>
        <CelebrationModal />
      </body>
    </html>
  );
}
