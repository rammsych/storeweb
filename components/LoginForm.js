'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ChevronLeft,
  LogOut
} from 'lucide-react';

export default function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const store = searchParams.get('store');

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget);

    const email = formData.get('email');
    const password = formData.get('password');
    // const store = searchParams.get('store');

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-3 block text-[14px] font-medium tracking-[-0.01em] text-slate-900">
          Correo electrónico
        </label>

        <div className="flex h-[58px] w-full items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-100/80">
          <Mail
            size={19}
            strokeWidth={1.65}
            className="mr-3 shrink-0 text-orange-500"
          />

          <input
            name="email"
            type="email"
            required
            placeholder="Ingresa tu correo"
            autoComplete="off"
            className="block h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-[16px] font-normal text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-0 focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      <div>
        <label className="mb-3 block text-[14px] font-medium tracking-[-0.01em] text-slate-900">
          Contraseña
        </label>

        <div className="flex h-[58px] w-full items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-100/80">
          <Lock
            size={19}
            strokeWidth={1.65}
            className="mr-3 shrink-0 text-orange-500"
          />

          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Ingresa tu contraseña"
            autoComplete="new-password"
            className="block h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-[16px] font-normal text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-0 focus:outline-none focus:ring-0"
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center text-slate-400 transition hover:text-slate-700"
            aria-label="Mostrar contraseña"
          >
            {showPassword ? (
              <EyeOff size={19} strokeWidth={1.65} />
            ) : (
              <Eye size={19} strokeWidth={1.65} />
            )}
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          {store ? (
            <button
              type="button"
              onClick={() => router.push(`/tienda/${store}`)}
              className="
        flex
        items-center
        text-slate-400
        transition
        hover:text-orange-500
      "
              aria-label="Volver"
            >
              <LogOut size={17} strokeWidth={1.6} />
            </button>
          ) : (
            <span />
          )}

          <button
            type="button"
            className="
      text-[14px]
      font-normal
      text-slate-500
      transition
      hover:text-orange-600
    "
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="group mt-2 flex h-[58px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-[17px] font-semibold tracking-[-0.01em] text-white shadow-[0_18px_38px_rgba(249,115,22,0.28)] transition hover:translate-y-[-1px] hover:shadow-[0_22px_45px_rgba(249,115,22,0.34)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Ingresando...' : 'Ingresar'}

        {!loading ? (
          <ArrowRight
            size={20}
            strokeWidth={1.75}
            className="ml-3 transition group-hover:translate-x-1"
          />
        ) : null}
      </button>
    </form>
  );
}