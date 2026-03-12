'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('No fue posible iniciar sesión. Revisa tus datos.');
      return;
    }

    router.push(searchParams.get('callbackUrl') || '/catalog');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Correo</label>
        <input name="email" type="email" required placeholder="cliente@demo.cl" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Contraseña</label>
        <input name="password" type="password" required placeholder="******" />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
      >
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
}
