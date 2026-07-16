import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-6xl font-extrabold text-gray-200 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pagina no encontrada</h2>
          <p className="text-gray-500 mb-8">Lo sentimos, la pagina que buscas no existe o fue movida.</p>
          <Link href="/" className="inline-block bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-600 transition-colors">
            Volver al inicio
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
