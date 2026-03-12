const { PrismaClient, UnitType } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);

  await prisma.user.upsert({
    where: { email: 'cliente@demo.cl' },
    update: {},
    create: {
      name: 'Cliente Demo',
      email: 'cliente@demo.cl',
      phone: '+56 9 1111 1111',
      password,
    },
  });

  const products = [
    {
      name: 'Tomate',
      description: 'Tomate fresco de temporada',
      price: 1890,
      unitType: UnitType.KG,
      imageUrl: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=80'
    },
    {
      name: 'Papa',
      description: 'Papa lavada lista para cocinar',
      price: 1290,
      unitType: UnitType.KG,
      imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80'
    },
    {
      name: 'Lechuga',
      description: 'Lechuga fresca y crujiente',
      price: 990,
      unitType: UnitType.UNIT,
      imageUrl: 'https://images.unsplash.com/photo-1622205313162-be1d5712a43d?auto=format&fit=crop&w=900&q=80'
    },
    {
      name: 'Palta',
      description: 'Palta hass',
      price: 2490,
      unitType: UnitType.KG,
      imageUrl: 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?auto=format&fit=crop&w=900&q=80'
    },
    {
      name: 'Cilantro',
      description: 'Atado de cilantro fresco',
      price: 700,
      unitType: UnitType.BUNDLE,
      imageUrl: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=900&q=80'
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.name.toLowerCase().replace(/\s+/g, '-') },
      update: {
        description: product.description,
        price: product.price,
        unitType: product.unitType,
        imageUrl: product.imageUrl,
        isActive: true,
      },
      create: {
        id: product.name.toLowerCase().replace(/\s+/g, '-'),
        ...product,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
