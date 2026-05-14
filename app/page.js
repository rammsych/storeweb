// import Link from 'next/link';
// import { redirect } from 'next/navigation';

// export default function HomePage() {
//   return (
//     <main className="min-h-screen bg-green-800 px-6 py-10 text-white">
//       <div className="mx-auto max-w-6xl">
//         <p className="mb-8 text-sm uppercase tracking-[0.35em] text-green-100">
//           StoreWeb MVP 1.7
//         </p>

//         <h1 className="max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
//           Verdulería online con login, catálogo y solicitud por correo
//         </h1>

//         <p className="mt-8 max-w-4xl text-xl leading-relaxed text-green-50">
//           Este proyecto te deja crear usuarios, iniciar sesión, ver productos, armar un carrito y enviar una solicitud de compra al correo del vendedor.
//         </p>

//         <div className="mt-10 flex flex-wrap gap-4">
//           <Link
//             href="/register"
//             className="rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-green-800 transition hover:bg-green-50"
//           >
//             Crear cuenta
//           </Link>

//           <Link
//             href="/login"
//             className="rounded-2xl border border-white px-8 py-4 text-lg font-semibold text-white transition hover:bg-green-700"
//           >
//             Iniciar sesión
//           </Link>

//           <Link
//             href="/catalog"
//             className="rounded-2xl bg-lime-400 px-8 py-4 text-lg font-semibold text-green-900 transition hover:bg-lime-300"
//           >
//             Ver catálogo
//           </Link>
//         </div>

//         <div className="mt-14 grid gap-5 md:grid-cols-3">
//           <div className="rounded-3xl bg-green-700/80 p-6">
//             <h2 className="mb-3 text-3xl font-bold">1. Login</h2>
//             <p className="text-lg leading-relaxed text-green-50">
//               Acceso con email y contraseña para que cada cliente tenga su cuenta.
//             </p>
//           </div>

//           <div className="rounded-3xl bg-green-700/80 p-6">
//             <h2 className="mb-3 text-3xl font-bold">2. Catálogo</h2>
//             <p className="text-lg leading-relaxed text-green-50">
//               Productos visibles con precio, unidad y carrito simple.
//             </p>
//           </div>

//           <div className="rounded-3xl bg-green-700/80 p-6">
//             <h2 className="mb-3 text-3xl font-bold">3. Solicitud</h2>
//             <p className="text-lg leading-relaxed text-green-50">
//               Se guarda el pedido y se envía un email al vendedor con el detalle.
//             </p>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }

import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/login');
}