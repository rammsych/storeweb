'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShoppingCart, ShoppingBag, Users, Package, ShieldCheck, ArrowLeft, ChevronLeft } from 'lucide-react';

import LoginForm from '@/components/LoginForm';

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[22px] bg-white/90 px-3 py-4 text-center shadow-[0_12px_30px_rgba(15,23,42,0.07)] ring-1 ring-slate-900/5 backdrop-blur-md">
      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
        <Icon size={18} strokeWidth={1.55} />
      </div>

      <p className="mt-2 text-[11px] font-medium text-slate-500">{label}</p>

      <p className="mt-1 text-[13px] font-semibold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

function LoginInner() {
  const searchParams = useSearchParams();

  const error = searchParams.get('error');
  const store = searchParams.get('store');

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fafc] font-sans text-slate-950">
      <div className="absolute inset-x-0 top-0 h-[520px] overflow-hidden">
        <img
          src="/login-sales-bg.png"
          alt="Fondo Bitrineo"
          className="h-full w-full object-cover object-center opacity-80"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/35 to-[#f8fafc]" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10" />
      </div>

      <div className="absolute -left-24 top-72 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />
      <div className="absolute -right-28 top-36 h-80 w-80 rounded-full bg-orange-100/70 blur-3xl" />
      <div className="absolute right-[-130px] top-[455px] h-[520px] w-[520px] rounded-full border border-orange-200/45" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-8 pt-12">
        <section className="text-center">
          <img
            src="/logo-navbar.png"
            alt="Bitrineo"
            className="mx-auto w-[230px] drop-shadow-sm"
          />

          <h1 className="mt-8 text-[30px] font-semibold tracking-[-0.03em] text-[#0f172a]">
            ¡Bienvenido!
          </h1>

          <p className="mt-2 text-[16px] font-normal tracking-[-0.01em] text-slate-500">
            Inicia sesión para continuar
          </p>
        </section>

        {error ? (
          <div
            className={`mt-6 rounded-2xl p-4 text-sm font-medium ${error === 'USER_DISABLED'
                ? 'border border-orange-200 bg-orange-50 text-orange-700'
                : 'border border-red-200 bg-red-50 text-red-600'
              }`}
          >
            {error === 'USER_DISABLED'
              ? 'Tu cuenta fue deshabilitada. Contacta al administrador.'
              : 'No fue posible iniciar sesión. Revisa tus datos.'}
          </div>
        ) : null}


        

        <section className="mt-8 rounded-[30px] bg-white/95 p-6 shadow-[0_28px_75px_rgba(15,23,42,0.10)] ring-1 ring-slate-900/5 backdrop-blur-xl">
          <LoginForm />

     {store ? (
  <div className="mt-5 flex justify-center">
    <Link
      href={`/tienda/${store}`}
      className="
        inline-flex
        items-center
        gap-2
        text-[14px]
        font-medium
        text-slate-500
        transition
        hover:text-orange-600
      "
    >
      <ArrowLeft size={16} strokeWidth={1.8} />
      Seguir explorando
    </Link>
  </div>
) : null}

          <p className="mt-7 text-center text-[14px] font-normal text-slate-500">
            ¿No tienes cuenta?{' '}
            <Link
              className="font-medium text-orange-600 underline underline-offset-4"
              href={store ? `/register?store=${store}` : '/register'}
            >
              Crear cuenta
            </Link>
          </p>
        </section>

        <section className="mt-7 rounded-[28px] bg-gradient-to-r from-orange-50 via-white to-slate-50 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5">
          <div className="grid grid-cols-[1.05fr_0.95fr] gap-4">
            <div>
              <h2 className="text-[19px] font-semibold leading-tight tracking-[-0.03em] text-[#0f172a]">
                Tu negocio, más inteligente que nunca
              </h2>

              <div className="mt-4 h-[2px] w-9 rounded-full bg-orange-500" />

              <p className="mt-4 text-[14px] leading-relaxed text-slate-500">
                Gestiona, analiza y escala tu negocio desde un solo lugar.
              </p>
            </div>

            <div className="relative rounded-[22px] bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.09)] ring-1 ring-slate-900/5">
              <p className="text-[11px] font-medium text-slate-400">
                Ventas hoy
              </p>

              <p className="mt-1 text-[15px] font-semibold text-[#0f172a]">
                $4.520.000
              </p>

              <div className="mt-4 h-16 rounded-2xl bg-gradient-to-tr from-orange-100 via-orange-50 to-white">
                <svg viewBox="0 0 160 64" className="h-full w-full">
                  <path
                    d="M8 48 C 28 22, 42 52, 60 30 S 92 42, 108 22 S 132 34, 152 10"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="absolute -bottom-3 -right-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/5">
                <div className="h-9 w-9 rounded-full border-[7px] border-orange-400 border-r-orange-100" />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-4 gap-3">
          <MetricCard icon={ShoppingCart} label="Ventas" value="$4.520.000" />
          <MetricCard icon={ShoppingBag} label="Pedidos" value="125" />
          <MetricCard icon={Users} label="Clientes" value="1.250" />
          <MetricCard icon={Package} label="Productos" value="320" />
        </section>

        <footer className="mt-auto pt-8 text-center">
          <div className="mx-auto mb-4 flex h-9 w-9 items-center justify-center rounded-full text-orange-500">
            <ShieldCheck size={23} strokeWidth={1.6} />
          </div>

          <p className="text-[13px] font-normal leading-relaxed text-slate-400">
            © 2024 Bitrineo
            <br />
            Todos los derechos reservados.
          </p>
        </footer>
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