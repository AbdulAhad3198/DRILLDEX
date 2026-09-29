import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'DRILLDEX | eRTMAC-NWIS — Offset Well Knowledge & Drilling Decision Support',
  description: 'AI-Powered Offset Well Knowledge and Decision Support Platform for Drilling Operations (SIH 2026 - Problem Statement 26121).',
  openGraph: {
    title: 'DRILLDEX | eRTMAC-NWIS — Offset Well Knowledge & Decision Support',
    description: 'eRTMAC tells what is happening now; NWIS tells what happened before and what may matter now.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DRILLDEX | eRTMAC-NWIS',
    description: 'AI-Powered Offset Well Knowledge and Decision Support Platform for Drilling Operations.',
  },
};

import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
