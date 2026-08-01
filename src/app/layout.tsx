import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
})

export const metadata: Metadata = {
  title: 'Sole Outlet — أحذية أصلية بأسعار لا تصدق',
  description: 'أحذية أصلية 100% بأقل من نص السعر. Nike, Adidas, New Balance وأكتر.',
  openGraph: {
    title: 'Sole Outlet',
    description: 'أحذية أصلية بأقل من نص السعر في مصر',
    locale: 'ar_EG',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.className} style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
