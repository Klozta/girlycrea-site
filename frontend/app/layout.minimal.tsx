'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Hydration } from '@/components/Hydration';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <ErrorBoundary>
          <Hydration />
          <main>{children}</main>
        </ErrorBoundary>
      </body>
    </html>
  );
}
