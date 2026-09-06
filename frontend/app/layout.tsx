import { Montserrat } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: { template: '%s | National Learning Portal', default: 'National Learning Portal' },
  description: 'AI-enabled competency gap analysis and personalized training for India\'s Official Statistical System — Ministry of Statistics & Programme Implementation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body 
        className="font-montserrat text-gray-800 antialiased min-h-screen"
        style={{
          backgroundImage: 'url(/bg-flag.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#F4F6F9'
        }}
      >
        {children}
      </body>
    </html>
  );
}
