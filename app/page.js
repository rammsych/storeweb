import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-700 to-green-900 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-green-100">Prototipo MVP</p>
          <h1 className="mb-6 text-4xl font-bold md:text-6xl">Verdulería online con login, catálogo y solicitud por correo</h1>
          <p className="mb-8 text-lg text-green-50">
            Este proyecto te deja crear usuarios, iniciar sesión, ver productos, armar un carrito y enviar una solicitud de compra al correo del vendedor.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/register" className="rounded-xl bg-white px-6 py-3 font-semibold text-green-800 hover:bg-green-50">
              Crear cuenta
            </Link>
            <Link href="/login" className="rounded-xl border border-white px-6 py-3 font-semibold hover:bg-white/10">
              Iniciar sesión
            </Link>
            <Link href="/catalog" className="rounded-xl bg-green-500 px-6 py-3 font-semibold hover:bg-green-400">
              Ver catálogo
            </Link>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
              <h2 className="mb-2 text-xl font-semibold">1. Login</h2>
              <p>Acceso con email y contraseña para que cada cliente tenga su cuenta.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
              <h2 className="mb-2 text-xl font-semibold">2. Catálogo</h2>
              <p>Productos visibles con precio, unidad y carrito simple.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
              <h2 className="mb-2 text-xl font-semibold">3. Solicitud</h2>
              <p>Se guarda el pedido y se envía un email al vendedor con el detalle.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
