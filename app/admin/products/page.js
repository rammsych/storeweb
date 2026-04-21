import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminProductsClient from '@/components/AdminProductsClient';

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/catalog');
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return <AdminProductsClient products={products} user={session.user} />;
}