import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/serialize';
import AdminProductsClient from '@/components/AdminProductsClient';

export default async function AdminProductsPage({ searchParams }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    redirect('/catalog');
  }

  const params = await searchParams;

  const companyIdFromUrl =
    typeof params?.companyId === 'string'
      ? params.companyId
      : Array.isArray(params?.companyId)
        ? params.companyId[0]
        : null;

  const companyId =
    session.user.role === 'SUPER_ADMIN'
      ? companyIdFromUrl
        ? BigInt(companyIdFromUrl)
        : null
      : session.user.companyId
        ? BigInt(session.user.companyId)
        : null;

  if (!companyId) {
    if (session.user.role === 'SUPER_ADMIN') {
      redirect('/super-admin');
    }

    redirect('/catalog');
  }

  let products = [];
  let categories = [];

  try {
    const where = {
      companyId,
    };

    categories = await prisma.productCategory.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error loading admin products:', error);
    products = [];
    categories = [];
  }

  return (
    <AdminProductsClient
      products={serializeBigInt(products)}
      categories={serializeBigInt(categories)}
      user={serializeBigInt(session.user)}
      companyId={companyId.toString()}
    />
  );
}
