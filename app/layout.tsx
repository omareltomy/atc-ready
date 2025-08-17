import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Traffic Info Quiz',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
