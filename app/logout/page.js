'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Image from 'next/image';

function LogoutContent() {
  const searchParams = useSearchParams();
  const store = searchParams.get('store') || '';
  const [loading, setLoading] = useState(false);

  const cleanBrowserSession = () => {
    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  };

  const handleLogout = async () => {
    setLoading(true);

    cleanBrowserSession();

    await signOut({
      callbackUrl: store ? `/login?store=${store}` : '/login',
      redirect: true,
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff8f8] px-6 font-[Montserrat]">
      <section className="w-full max-w-md rounded-[32px] border border-orange-100 bg-white p-8 text-center shadow-[0_18px_60px_rgba(15,23,42,0.12)]">
        <div className="mb-4 flex justify-center">
          <Image
            src="/logo-navbar.png"
            alt="Bitrineo"
            width={260}
            height={90}
            priority
            className="h-auto w-[220px] object-contain"
          />
        </div>

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Cerrar sesión
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          ¿Seguro que quieres salir de esta tienda?
        </p>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="mt-7 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-pink-600 to-orange-500 text-sm font-medium text-white shadow-lg shadow-pink-100 transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? 'Cerrando sesión...' : 'Sí, cerrar sesión'}
        </button>

        <button
          type="button"
          onClick={() => {
            window.location.href = store ? `/tienda/${store}` : '/catalog';
          }}
          className="mt-3 h-12 w-full rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Volver a la tienda
        </button>
      </section>
    </main>
  );
}

export default function LogoutPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Cargando...</div>}>
      <LogoutContent />
    </Suspense>
  );
}