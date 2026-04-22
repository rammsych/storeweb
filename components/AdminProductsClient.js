'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminProductsClient({ products: initialProducts, user }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    unitType: 'KG',
    imageUrl: '',
    isActive: true,
  });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Error al crear producto');
        setSaving(false);
        return;
      }

      setProducts([data.product, ...products]);
      setForm({
        name: '',
        description: '',
        price: '',
        unitType: 'KG',
        imageUrl: '',
        isActive: true,
      });
      setMessage('Producto creado correctamente');
    } catch (error) {
      console.error(error);
      setMessage('Error de conexión');
    } finally {
      setSaving(false);
    }
  }

  async function toggleProduct(productId, currentState) {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !currentState,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Error al actualizar producto');
        return;
      }

      setProducts((current) =>
        current.map((p) =>
          p.id === productId ? { ...p, isActive: data.product.isActive } : p
        )
      );
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 rounded-2xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold text-green-800">Panel Administrador</h1>
        <p className="text-slate-600">Hola {user.name}, aquí puedes administrar productos.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Administración de Productos</h2>

        <button
          onClick={() => router.push('/catalog')}
          style={{
            padding: '8px 14px',
            backgroundColor: '#f5f5f5',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          ← Volver al Catálogo
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold text-green-800">Crear producto</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full rounded-lg border p-2"
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <textarea
              className="w-full rounded-lg border p-2"
              placeholder="Descripción"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <input
              className="w-full rounded-lg border p-2"
              placeholder="Precio"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <select
              className="w-full rounded-lg border p-2"
              value={form.unitType}
              onChange={(e) => setForm({ ...form, unitType: e.target.value })}
            >
              <option value="KG">KG</option>
              <option value="UNIT">UNIT</option>
              <option value="BUNDLE">BUNDLE</option>
            </select>

            <input
              className="w-full rounded-lg border p-2"
              placeholder="URL imagen"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Producto activo
            </label>

            <button
              className="w-full rounded-lg bg-green-700 p-2 text-white"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Crear producto'}
            </button>
          </form>

          {message ? <p className="mt-4 text-sm font-medium">{message}</p> : null}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold text-green-800">Listado de productos</h2>

          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">{product.name}</p>
                    <p className="text-sm text-slate-600">{product.description}</p>
                    <p className="mt-2 font-medium">${product.price}</p>
                    <p className="text-sm text-slate-500">Unidad: {product.unitType}</p>
                    <p className="text-sm">
                      Estado:{' '}
                      <span className={product.isActive ? 'text-green-700' : 'text-red-600'}>
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => toggleProduct(product.id, product.isActive)}
                    className={`rounded-lg px-4 py-2 text-white ${
                      product.isActive ? 'bg-red-600' : 'bg-green-700'
                    }`}
                  >
                    {product.isActive ? 'Dar de baja' : 'Habilitar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}