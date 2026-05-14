'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Autocomplete, LoadScript } from '@react-google-maps/api';

const libraries = ['places'];

export default function RegisterPage() {
  const autocompleteRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    latitude: null,
    longitude: null,
    password: '',
  });

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();

    if (!place?.geometry?.location) {
      return;
    }

    setForm((current) => ({
      ...current,
      address: place.formatted_address || current.address,
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
        <h1 className="mb-2 text-3xl font-bold text-[#ff6b2c]">Crear cuenta</h1>
        <p className="mb-6 text-sm text-gray-600">
          Registro básico para el prototipo
        </p>

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

          <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            libraries={libraries}
          >
            <Autocomplete
              onLoad={(autocomplete) => {
                autocompleteRef.current = autocomplete;
              }}
              onPlaceChanged={handlePlaceChanged}
              options={{
                componentRestrictions: { country: 'cl' },
                fields: ['formatted_address', 'geometry'],
              }}
            >
              <input
                id="address"
                name="address"
                type="text"
                autoComplete="off"
                className="w-full rounded-lg border p-2"
                placeholder="Busca y selecciona tu dirección"
                value={form.address}
                onChange={(e) =>
                  setForm({
                    ...form,
                    address: e.target.value,
                    latitude: null,
                    longitude: null,
                  })
                }
              />
            </Autocomplete>
          </LoadScript>

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
            className="w-full rounded-lg bg-[#ff6b2c] p-3 font-semibold text-white shadow-md transition hover:bg-[#ff5a14]"
            type="submit"
          >
            Crear cuenta
          </button>
        </form>

        <p className="mt-5 text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold text-[#ff6b2c]">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}