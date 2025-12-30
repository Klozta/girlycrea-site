import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Toaster from '@/components/Toaster'
import BackendStatus from '@/components/BackendStatus'

export const metadata = {
  title: 'GirlyCrea - Boutique en ligne bijoux, mode, beauté',
  description: 'Découvrez notre sélection de bijoux, accessoires mode, produits de beauté et créations crochet. Des produits élégants et tendance pour toutes les occasions.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <BackendStatus />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}
