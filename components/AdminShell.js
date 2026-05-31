'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  ArrowLeft,
  CalendarDays,
  LogOut,
  Store,
} from 'lucide-react';

const menuItems = [
  {
    label: 'Inicio',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Productos',
    href: '/admin/products',
    icon: Package,
  },
  {
    label: 'Programados',
    href: '/admin/scheduled-orders',
    icon: CalendarDays,
  },
  {
    label: 'Pedidos',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    label: 'Clientes',
    href: '/admin/customers',
    icon: Users,
  },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const companyId = searchParams.get('companyId');
  const companyName =
    searchParams.get('companyName') ||
    searchParams.get('storeName');

  const storeSlug = searchParams.get('store');

  const fromSuperAdmin =
    searchParams.get('fromSuperAdmin') === '1';

  const exitHref = fromSuperAdmin
    ? '/super-admin'
    : storeSlug
      ? `/tienda/${storeSlug}`
      : '/';

  // const getAdminHref = (href) => {
  //   if (!fromSuperAdmin || !companyId || !companyName) {
  //     return href;
  //   }

  //   const params = new URLSearchParams({
  //     companyId,
  //     companyName,
  //     fromSuperAdmin: '1',
  //   });

  //   return `${href}?${params.toString()}`;
  // };


  const getAdminHref = (href) => {
    const params = new URLSearchParams();

    if (companyId) {
      params.set('companyId', companyId);
    }

    if (companyName) {
      params.set('companyName', companyName);
    }

    if (storeSlug) {
      params.set('store', storeSlug);
    }

    if (fromSuperAdmin) {
      params.set('fromSuperAdmin', '1');
    }

    const query = params.toString();

    return query ? `${href}?${query}` : href;
  };




  return (
    <div className="min-h-screen bg-[#faf7f4] text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-[280px] shrink-0 border-r border-orange-100 bg-white px-6 py-7 shadow-[8px_0_30px_rgba(15,23,42,0.04)] md:flex md:flex-col">
          <Link href={getAdminHref('/admin')} className="mb-10 flex items-center gap-3">
            <img
              src="/logo-navbar.png"
              alt="Bitrineo"
              className="h-14 w-auto object-contain"
            />
          </Link>

          <nav className="space-y-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={getAdminHref(item.href)}
                  className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-[15px] font-semibold transition-all ${active
                    ? 'bg-gradient-to-r from-[#ff6a00] to-[#ff8a1f] text-white shadow-lg shadow-orange-500/25'
                    : 'text-slate-600 hover:bg-orange-50 hover:text-orange-600'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-3xl border border-orange-100 bg-orange-50/70 p-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white">
              <Package className="h-5 w-5" />
            </div>

            <p className="text-sm font-bold text-slate-900">
              Panel Bitrineo
            </p>

            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Administra productos, pedidos y clientes desde una vitrina digital inteligente.
            </p>

            <Link
              href={exitHref}
              className="mt-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-orange-600 shadow-sm transition hover:bg-orange-500 hover:text-white"
            >
              Salir
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1 pb-24 md:pb-0">
          <header className="sticky top-0 z-40 border-b border-orange-100/70 bg-white/95 px-4 py-3 backdrop-blur-xl md:px-10 md:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Link
                  href={exitHref}
                  aria-label="Salir del administrador"
                  title="Salir del administrador"
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-500 transition hover:bg-orange-100 md:hidden"
                >
                  <LogOut className="h-5 w-5" />
                </Link>

                <div className="flex min-w-0 items-center md:hidden">
                  <img
                    src="/logo-navbar.png"
                    alt="Bitrineo"
                    className="h-14 w-auto max-w-[160px] object-contain"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(255,90,0,0.25)]">
                  B
                </div>
              </div>
            </div>
          </header>

          {companyName && (
            <section className="border-b border-orange-100 bg-orange-50/60 px-4 py-4 md:px-10">
              <div className="flex flex-col gap-4 rounded-[28px] border border-orange-100 bg-white px-5 py-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white">
                    <Store className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                      Empresa administrada
                    </p>

                    <h2 className="mt-1 text-xl font-semibold text-slate-950">
                      {companyName}
                    </h2>
                  </div>
                </div>

                <Link
                  href="/super-admin"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-medium text-orange-600 transition hover:bg-orange-500 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Salir
                </Link>
              </div>
            </section>
          )}

          <main className="px-4 py-6 md:px-10 md:py-8">
            {children}
          </main>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-orange-100 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">
        <div className="grid grid-cols-5 gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={getAdminHref(item.href)}
                className={`flex flex-col items-center justify-center rounded-2xl py-2 text-[11px] font-semibold ${active
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-500'
                  }`}
              >
                <Icon className="mb-1 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}