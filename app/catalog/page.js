import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CatalogClient from '@/components/CatalogClient';

export default async function CatalogPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/catalog');
  }

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  return <CatalogClient products={products} user={session.user} />;
}
