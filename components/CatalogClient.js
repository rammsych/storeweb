'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatPrice, getUnitLabel } from '@/lib/format';
import SignOutButton from '@/components/SignOutButton';
import FloatingCartButton from '@/components/FloatingCartButton';
import MobileToast from '@/components/MobileToast';


export default function CatalogClient({ products, user }) {
  const [cart, setCart] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [toast, setToast] = useState({
    open: false,
    message: '',
    type: 'success',
  });


  const getMinScheduledDate = () => {
    const now = new Date();
    const minDate = new Date(now);

    minDate.setDate(now.getDate() + 1);

    const year = minDate.getFullYear();
    const month = String(minDate.getMonth() + 1).padStart(2, '0');
    const day = String(minDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const timeSlots = [
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
  ];



  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (!toast.open) return;

    const timer = setTimeout(() => {
      setToast((current) => ({ ...current, open: false }));
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.open]);


  function addToCart(product) {
    setToast((current) => ({ ...current, open: false }));

    const selectedQuantity = Number(productQuantities[product.id] || 1);

    if (selectedQuantity <= 0) {
      setToast({
        open: true,
        message: 'La cantidad debe ser mayor a cero.',
        type: 'error',
      });
      return;
    }

    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);

      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? {
              ...item,
              quantity: Number((item.quantity + selectedQuantity).toFixed(2)),
            }
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
          quantity: selectedQuantity,
        },
      ];
    });

    setProductQuantities((current) => ({
      ...current,
      [product.id]: 1,
    }));
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
      setToast({
        open: true,
        message: 'Debes agregar al menos un producto.',
        type: 'error',
      });
      return;
    }


    if (!scheduledDate || !scheduledTime) {
      setToast({
        open: true,
        message: 'Debes seleccionar fecha y horario del pedido.',
        type: 'error',
      });
      return;
    }

    const minScheduledDate = getMinScheduledDate();

    if (scheduledDate < minScheduledDate) {
      setToast({
        open: true,
        message: 'Solo puedes seleccionar fechas desde el próximo día disponible.',
        type: 'error',
      });
      return;
    }

    if (scheduledTime < '14:00' || scheduledTime > '18:30') {
      setToast({
        open: true,
        message: 'Solo puedes seleccionar horarios entre 14:00 y 18:30 hrs.',
        type: 'error',
      });
      return;
    }
    setSending(true);
    setToast((current) => ({ ...current, open: false }));

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: cart,
        notes: note,
        deliveryType: 'PROGRAMADO',
        scheduledDeliveryDate: scheduledDate,
        scheduledDeliveryTime: scheduledTime,
      }),
    });



    let data = {};
    const text = await response.text();

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: 'La respuesta del servidor no vino en JSON válido' };
    }

    setSending(false);

    if (!response.ok) {
      setToast({
        open: true,
        message: data.error || 'No se pudo enviar la solicitud',
        type: 'error',
      });
      return;
    }

    setCart([]);
    setNote('');


    setScheduledDate('');
    setScheduledTime('');



    setToast({
      open: true,
      message: `Solicitud enviada correctamente. ID pedido: ${data.orderId}`,
      type: 'success',
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <MobileToast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />
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
              href="/admin"
              className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600"
            >
              Administrar
            </a>
          ) : null}

        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-2xl bg-white shadow">
              <img
                src={product.imageUrl || '/placeholder-product.png'}
                alt={product.name}
                className="h-48 w-full object-cover"
              />
              <div className="p-5">
                <h2 className="text-xl font-semibold">{product.name}</h2>
                <p className="mb-3 text-sm text-slate-600">{product.description}</p>

                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="text-lg font-bold text-green-700">
                    {formatPrice(product.price)}
                  </span>

                  <div className="flex items-center gap-2">

                    <select
                      value={productQuantities[product.id] || 1}
                      onChange={(e) =>
                        setProductQuantities((current) => ({
                          ...current,
                          [product.id]: Number(e.target.value),
                        }))
                      }
                      className="h-9 w-16 rounded-xl border-2 border-orange-300 bg-white px-1 text-center text-sm font-bold text-slate-800 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    >
                      {Array.from({ length: 20 }, (_, index) => index + 1).map((qty) => (
                        <option key={qty} value={qty}>
                          {qty}
                        </option>
                      ))}
                    </select>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      por {getUnitLabel(product.unitType)}
                    </span>
                  </div>
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

        <aside id="tu-solicitud" className="h-fit rounded-2xl bg-white p-6 shadow">
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


          <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <h3 className="mb-4 text-xl font-bold text-orange-700">
              Pedido Programado
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Fecha de entrega
                </label>

                <input
                  type="date"
                  min={getMinScheduledDate()}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full rounded-lg border p-2"
                />

                <p className="mt-1 text-xs text-slate-500">
                  Disponible desde el día siguiente.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Horario de entrega
                </label>

                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full rounded-lg border p-2"
                >
                  <option value="">
                    Seleccionar horario
                  </option>

                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time} hrs
                    </option>
                  ))}
                </select>

                <p className="mt-1 text-xs text-slate-500">
                  Horarios disponibles entre 14:00 y 18:30 hrs.
                </p>
              </div>
            </div>
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

          <button
            onClick={submitOrder}
            disabled={sending}
            className="mt-5 mb-20 w-full rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >

            {sending ? 'Enviando solicitud...' : 'Enviar solicitud de compra'}
          </button>
        </aside>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[80] border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">
        <div className="flex justify-start">
          <div className="w-[160px]">
            <SignOutButton />
          </div>
        </div>
      </div>

      <FloatingCartButton itemCount={itemCount} />

    </div>
  );
}
