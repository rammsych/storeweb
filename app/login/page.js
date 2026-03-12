'use client';

import Link from 'next/link';
import { SessionProvider } from 'next-auth/react';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <SessionProvider>
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="mb-2 text-3xl font-bold text-green-800">Iniciar sesión</h1>
          <p className="mb-6 text-sm text-slate-600">Demo incluida: cliente@demo.cl / 123456</p>
          <LoginForm />
          <p className="mt-5 text-sm text-slate-600">
            ¿No tienes cuenta?{' '}
            <Link className="font-semibold text-green-700" href="/register">
              Crear cuenta
            </Link>
          </p>
        </div>
      </main>
    </SessionProvider>
  );
}
