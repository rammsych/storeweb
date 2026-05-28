import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import CatalogClient from '@/components/CatalogClient';

function serializeBigInt(value) {
  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeBigInt);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        serializeBigInt(val),
      ])
    );
  }

  return value;
}

export default async function StorePage({ params }) {
  const { slug } = params;

  const company = await prisma.company.findUnique({
    where: {
      slug,
    },
  });

  if (!company || company.status === false) {
    notFound();
  }

  if (company.maintenanceMode) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f4] px-6 font-['Montserrat',system-ui,sans-serif]">
        <div className="w-full max-w-lg rounded-[32px] border border-orange-100 bg-white p-10 text-center shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 text-5xl">
            🛠️
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
            Bitrineo
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Tienda en mantención
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-500">
            Estamos realizando mejoras en esta tienda para entregarte una mejor experiencia.
          </p>

          <p className="mt-2 text-sm leading-7 text-slate-500">
            Por favor vuelve a intentarlo más tarde.
          </p>

          <div className="mt-8 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700">
            {company.name}
          </div>
        </div>
      </main>
    );
  }

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/login?store=${company.slug}`);
  }

  if (
    session?.user &&
    session.user.role !== 'SUPER_ADMIN' &&
    session.user.companyId !== String(company.id)
  ) {
    redirect(`/logout?store=${company.slug}`);
  }

  if (
    session.user.role !== 'SUPER_ADMIN' &&
    session.user.companyId !== String(company.id)
  ) {
    redirect(`/login?store=${company.slug}`);
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        companyId: company.id,
      },
      orderBy: {
        name: 'asc',
      },
    }),

    prisma.productCategory.findMany({
      where: {
        companyId: company.id,
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ]);

  const companyData = {
    id: String(company.id),
    slug: company.slug,
    name: company.name,
    display_name: company.display_name,
    slogan: company.slogan,
    logo_url: company.logo_url,
    primary_color: company.primary_color || '#FF7A00',
    secondary_color: company.secondary_color || '#FFF3E8',
    maintenanceMode: company.maintenanceMode,
  };

  return (
    <CatalogClient
      products={serializeBigInt(products)}
      categories={serializeBigInt(categories)}
      user={serializeBigInt(session.user)}
      company={companyData}
    />
  );
}