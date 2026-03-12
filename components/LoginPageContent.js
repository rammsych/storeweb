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
        <p className="mb-6 text-sm text-slate-600">Demo incluida: cliente@demo.cl / 123456</p>

        {error ? (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            No fue posible iniciar sesión. Revisa tus datos.
          </p>
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