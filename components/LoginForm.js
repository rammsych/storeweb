'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget);

    const email = formData.get('email');
    const password = formData.get('password');
    const store = searchParams.get('store');

    const result = await signIn('credentials', {
      email,
      password,
      store,
      redirect: false,
    });

    if (result?.error) {
      console.log('LOGIN ERROR:', result.error);

      if (result.error === 'USER_DISABLED') {
        setError('Tu cuenta fue deshabilitada. Contacta al administrador.');
      } else if (result.error === 'USER_NOT_IN_STORE') {
        setError('Este usuario no pertenece a esta tienda.');
      } else {
        setError('No fue posible iniciar sesión. Revisa tus datos.');
      }

      setLoading(false);
      return;
    }

    const session = await getSession();
    const role = session?.user?.role;

    const callbackUrl = searchParams.get('callbackUrl');

    if (store) {
      router.push(`/tienda/${store}`);
    } else if (callbackUrl && callbackUrl !== '/catalog') {
      router.push(callbackUrl);
    } else if (role === 'SUPER_ADMIN') {
      router.push('/super-admin');
    } else if (role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/catalog');
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-9">
      <div>
        <label className="mb-2 block text-[15px] font-semibold text-white">
          Correo
        </label>

        <input
          name="email"
          type="email"
          required
          placeholder="Ingresa tu correo"
          autoComplete="off"
          className="login-bank-input w-full"
        />
      </div>

      <div>
        <label className="mb-2 block text-[15px] font-semibold text-white">
          Clave
        </label>

        <div className="flex items-center border-b border-white/85">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Ingresa tu clave"
            autoComplete="new-password"
            className="login-bank-input-no-border flex-1"
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="ml-3 flex h-9 w-9 items-center justify-center text-white/80 hover:text-white"
            aria-label="Mostrar clave"
          >
            {showPassword ? (
              <EyeOff size={19} strokeWidth={1.6} />
            ) : (
              <Eye size={19} strokeWidth={1.6} />
            )}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl bg-red-600/90 px-4 py-3 text-sm text-white">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-8 w-full rounded-full bg-white py-5 text-[20px] font-medium text-[#222] shadow-xl transition hover:bg-white/95 active:scale-[0.99] disabled:opacity-60"
      >
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
}