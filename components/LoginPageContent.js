'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/LoginForm';

function LoginInner() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-green-800">Iniciar sesión</h1>
        <p className="mb-6 text-sm text-slate-600">Storeweb@ Pulsoft 1.5.0 </p>

        {error ? (
          <div
            className={`mb-4 rounded-xl p-4 text-sm font-medium ${
              error === 'USER_DISABLED'
                ? 'bg-orange-50 text-orange-700 border border-orange-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}
          >
            {error === 'USER_DISABLED'
              ? 'Tu cuenta fue deshabilitada. Contacta al administrador.'
              : 'No fue posible iniciar sesión. Revisa tus datos.'}
          </div>
        ) : null}

        <LoginForm />

        <p className="mt-5 text-sm text-slate-600">
          ¿No tienes cuenta?{' '}
          <Link className="font-semibold text-green-700" href="/register">
            Crear cuenta
          </Link>
        </p>
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