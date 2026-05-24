import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import {
  Building2,
  Store,
  Users,
  ArrowRight,
  LogOut,
} from 'lucide-react';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/serialize';
import Link from 'next/link';

import SuperAdminCompaniesClient from '@/components/SuperAdminCompaniesClient';

export default async function SuperAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'SUPER_ADMIN') {
    redirect('/catalog');
  }

  const companies = await prisma.company.findMany({
    orderBy: {
      created_at: 'desc',
    },
    include: {
      _count: {
        select: {
          users: true,
          products: true,
          orders: true,
        },
      },
    },
  });

  return (
    <main className="min-h-screen bg-[#faf7f4] px-4 py-6 font-['Montserrat',system-ui,sans-serif] text-slate-950 md:px-10 md:py-8">
      <section className="mx-auto max-w-7xl space-y-6">
        {/* <div className="rounded-[30px] border border-orange-100 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
            Súper administrador
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Empresas Bitrineo
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Administra las empresas habilitadas en la plataforma, revisa su estado
            y prepara la creación de nuevos negocios dentro del sistema.
          </p>
        </div> */}

        <div className="rounded-[30px] border border-orange-100 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center">
                <img
                  src="/logotipo-navbar.png"
                  alt="Bitrineo"
                  className="h-20 w-auto drop-shadow-[0_10px_25px_rgba(249,115,22,0.35)]"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                  Súper administrador
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  Empresas Bitrineo
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  Administra las empresas habilitadas en la plataforma,
                  revisa su estado y prepara la creación de nuevos
                  negocios dentro del sistema.
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <KpiCard
            title="Empresas"
            value={companies.length}
            subtitle="Negocios registrados"
            icon={Building2}
          />

          <KpiCard
            title="Empresas activas"
            value={companies.filter((company) => company.status).length}
            subtitle="Disponibles para operar"
            icon={Store}
          />

          <KpiCard
            title="Usuarios"
            value={companies.reduce(
              (sum, company) => sum + company._count.users,
              0
            )}
            subtitle="Usuarios asociados"
            icon={Users}
          />
        </section>

        <SuperAdminCompaniesClient companies={serializeBigInt(companies)} />

      </section>
    </main>
  );
}

function KpiCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="rounded-[28px] border border-orange-100 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        <Icon className="h-6 w-6" />
      </div>

      <p className="text-sm font-medium text-slate-500">{title}</p>

      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}