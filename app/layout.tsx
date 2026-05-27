import type { Metadata } from 'next';
import './globals.css';
import EmbedWrapper from '@/components/layout/EmbedWrapper';
import ProgressSync from '@/components/layout/ProgressSync';

export const metadata: Metadata = {
  title: 'StudentLearnX Games — Smarter Learning for Grades 1–12',
  description: 'Interactive quiz games for Grades 1–12. Physics, Chemistry, Biology, Math, and English.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ProgressSync />
        <EmbedWrapper>{children}</EmbedWrapper>
      </body>
    </html>
  );
}
