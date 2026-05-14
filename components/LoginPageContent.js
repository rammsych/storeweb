'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/LoginForm';

function LoginInner() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <main className="relative min-h-screen overflow-hidden">
      <img
        src="/fondo.png"
        alt="Fondo StoreWeb"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-black/25" />

      <div className="relative z-10 flex min-h-screen items-start justify-center px-6 pt-24">
        <div className="w-full max-w-sm">




          <div className="mb-1 text-center">

            <div className="flex flex-col items-center">

              <div className="relative overflow-hidden">

                <img
                  src="/logoBitrineoWhite.png"
                  alt="Bitrineo"
                  className="w-[468px] max-w-none drop-shadow-2xl"
                  style={{
                    marginTop: '-45px',
                    marginBottom: '-45px',
                  }}
                />

                <p
                  className="
        absolute
        left-1/2
        top-[72%]
        -translate-x-1/2
        text-[10px]
        tracking-wide
        text-white/60
      "
                >
                  Versión 1.7.1
                </p>

              </div>

            </div>

          </div>






          {error ? (
            <div
              className={`mb-4 rounded-xl p-4 text-sm font-medium ${error === 'USER_DISABLED'
                ? 'border border-orange-200 bg-orange-50 text-orange-700'
                : 'border border-red-200 bg-red-50 text-red-600'
                }`}
            >
              {error === 'USER_DISABLED'
                ? 'Tu cuenta fue deshabilitada. Contacta al administrador.'
                : 'No fue posible iniciar sesión. Revisa tus datos.'}
            </div>
          ) : null}

          <LoginForm />

          <p className="mt-6 text-center text-sm text-white/80">
            ¿No tienes cuenta?{' '}
            <Link className="font-bold text-white underline" href="/register">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </main>
  );


}

export default function LoginPageContent() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Cargando...</div>}>
      <LoginInner />
    </Suspense>
  );
}