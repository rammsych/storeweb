'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Users,
  ArrowLeft,
} from 'lucide-react';

const menuItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Productos',
    href: '/admin/products',
    icon: Package,
  },
  {
    label: 'Clientes',
    href: '/admin/customers',
    icon: Users,
  },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl gap-6 p-4">
        <aside className="hidden w-64 shrink-0 rounded-3xl bg-white p-4 shadow-sm md:block">
          <div className="mb-6">
            <h1 className="text-xl font-black text-slate-900">
              STOREWEB
            </h1>

            <p className="text-sm text-slate-500">
              Panel Administrador
            </p>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    active
                      ? 'bg-green-100 text-green-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}

{/* 
            <Link
              href="/catalog"
              className="flex flex-col items-center justify-center rounded-2xl py-2 text-xs font-bold text-slate-500"
            >
              <ArrowLeft className="mb-1 h-5 w-5" />
              Volver
            </Link> */}






          </nav>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <Link
              href="/catalog"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver al catálogo
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>



{/* 
      <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-slate-200 bg-white/95 backdrop-blur p-3 shadow-2xl md:hidden">
        <div className="grid grid-cols-4 gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-2xl py-2 text-xs font-bold ${
                  active
                    ? 'bg-green-100 text-green-700'
                    : 'text-slate-500'
                }`}
              >
                <Icon className="mb-1 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div> */}




      <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-slate-200 bg-white/95 backdrop-blur p-3 shadow-2xl md:hidden">
        <div className="grid grid-cols-4 gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-2xl py-2 text-xs font-bold ${
                  active
                    ? 'bg-green-100 text-green-700'
                    : 'text-slate-500'
                }`}
              >
                <Icon className="mb-1 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/catalog"
            className="flex flex-col items-center justify-center rounded-2xl py-2 text-xs font-bold text-slate-500"
          >
            <ArrowLeft className="mb-1 h-5 w-5" />
            Volver
          </Link>
        </div>
      </div>




    </div>
  );
}