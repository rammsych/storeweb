'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          latitude: null,
          longitude: null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Cuenta creada correctamente');
        window.location.href = '/login';
      } else {
        alert(data.error || 'Error al crear cuenta');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-green-800">Crear cuenta</h1>
        <p className="mb-6 text-sm text-gray-600">Registro básico para el prototipo</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            id="name"
            name="name"
            autoComplete="name"
            className="w-full rounded-lg border p-2"
            placeholder="Nombre completo"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-lg border p-2"
            placeholder="Correo"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="w-full rounded-lg border p-2"
            placeholder="Teléfono"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />


          <input
            id="address"
            name="address"
            type="text"
            autoComplete="street-address"
            className="w-full rounded-lg border p-2"
            placeholder="Dirección"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className="w-full rounded-lg border p-2"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            className="w-full rounded-lg bg-green-700 p-2 text-white"
            type="submit"
          >
            Crear cuenta
          </button>
        </form>

        <p className="mt-5 text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold text-green-700">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}