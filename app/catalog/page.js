import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/serialize';

import CatalogClient from '@/components/CatalogClient';

export default async function CatalogPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/catalog');
  }

  let products = [];
  let categories = [];

  try {
    const sessionCompanyId = session.user.companyId
      ? BigInt(session.user.companyId)
      : null;

    const where =
      session.user.role === 'SUPER_ADMIN'
        ? {
            isActive: true,
          }
        : {
            isActive: true,
            companyId: sessionCompanyId,
          };

    categories = await prisma.productCategory.findMany({
      where:
        session.user.role === 'SUPER_ADMIN'
          ? {}
          : {
              companyId: sessionCompanyId,
            },
      orderBy: {
        name: 'asc',
      },
    });

    products = await prisma.product.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    console.log(
      'Catalog products loaded:',
      products.length,
      'company:',
      session.user.companyId
    );
  } catch (error) {
    console.error('Error loading catalog products:', error);
    products = [];
    categories = [];
  }

  return (
    <CatalogClient
      products={serializeBigInt(products)}
      categories={serializeBigInt(categories)}
      user={serializeBigInt(session.user)}
    />
  );
}
