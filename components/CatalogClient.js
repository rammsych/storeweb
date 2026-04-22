'use client';

import { useMemo, useState } from 'react';
import { formatPrice, getUnitLabel } from '@/lib/format';
import SignOutButton from '@/components/SignOutButton';
import FloatingCartButton from '@/components/FloatingCartButton';

export default function CatalogClient({ products, user }) {
  const [cart, setCart] = useState([]);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);


  function addToCart(product) {
    setMessage('');
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Number((item.quantity + 1).toFixed(2)) }
            : item
        );
      }

      return [
        ...current,
        {
          productId: product.id,
          productName: product.name,
          unitType: product.unitType,
          unitPrice: product.price,
          quantity: 1,
        },
      ];
    });
  }

  function updateQuantity(productId, quantity) {
    const parsed = Number(quantity);
    setCart((current) =>
      current
        .map((item) => (item.productId === productId ? { ...item, quantity: parsed } : item))
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(productId) {
    setCart((current) => current.filter((item) => item.productId !== productId));
  }

  const total = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0),
    [cart]
  );

  async function submitOrder() {
    if (cart.length === 0) {
      setMessage('Debes agregar al menos un producto.');
      return;
    }

    setSending(true);
    setMessage('');

   const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: cart,
        notes: note,
      }),
    });

    // const data = await response.json();

    // setSending(false);

    // if (!response.ok) {
    //   setMessage(data.error || 'No se pudo enviar la solicitud.');
    //   return;
    // }

    let data = {};
    const text = await response.text();

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: 'La respuesta del servidor no vino en JSON válido' };
    }

    setSending(false);

    if (!response.ok) {
      alert(data.error || 'No se pudo enviar la solicitud');
      return;
    }

    setCart([]);
    setNote('');
    setMessage(`Solicitud enviada correctamente. ID pedido: ${data.orderId}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Catálogo de verdulería</h1>
          <p className="text-slate-600">
            Hola {user.name}. Agrega productos y envía tu solicitud al vendedor.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {user.role === 'ADMIN' ? (
            <a
              href="/admin/products"
              className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600"
            >
              Administrar
            </a>
          ) : null}

          <SignOutButton />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-2xl bg-white shadow">
              <img src={product.imageUrl} alt={product.name} className="h-48 w-full object-cover" />
              <div className="p-5">
                <h2 className="text-xl font-semibold">{product.name}</h2>
                <p className="mb-3 text-sm text-slate-600">{product.description}</p>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-green-700">{formatPrice(product.price)}</span>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    por {getUnitLabel(product.unitType)}
                  </span>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800"
                >
                  Agregar
                </button>
              </div>
            </article>
          ))}
        </section>

        <aside  id="tu-solicitud"  className="h-fit rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold text-green-800">Tu solicitud</h2>
          <div className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-sm text-slate-500">Todavía no agregas productos.</p>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="rounded-xl border border-slate-200 p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{item.productName}</p>
                      <p className="text-sm text-slate-500">{formatPrice(item.unitPrice)} por {getUnitLabel(item.unitType)}</p>
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="text-sm font-semibold text-red-600">
                      Quitar
                    </button>
                  </div>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.productId, e.target.value)}
                  />
                </div>
              ))
            )}
          </div>

          <div className="mt-5">
            <label className="mb-1 block text-sm font-medium">Comentario para el vendedor</label>
            <textarea
              rows="4"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ejemplo: ojalá las paltas maduras"
            />
          </div>

          <div className="mt-5 rounded-xl bg-slate-100 p-4">
            <p className="text-sm text-slate-600">Cliente</p>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-slate-600">{user.email}</p>
            <p className="mt-3 text-lg font-bold">Total estimado: {formatPrice(total)}</p>
          </div>

          {message ? <p className="mt-4 text-sm font-medium text-green-700">{message}</p> : null}

          <button
            onClick={submitOrder}
            disabled={sending}
            className="mt-5 w-full rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {sending ? 'Enviando solicitud...' : 'Enviar solicitud de compra'}
          </button>
        </aside>
      </div>
      <FloatingCartButton itemCount={itemCount} />
    </div>
  );
}
