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

  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [lastOrderForWhatsApp, setLastOrderForWhatsApp] = useState(null);

  const categories = [
    { id: 'todas', label: 'Todas', icon: '🛒' },
    { id: 'verduras', label: 'Verduras', icon: '🥬' },
    { id: 'frutas', label: 'Frutas', icon: '🍎' },
    { id: 'limpieza', label: 'Limpieza', icon: '🧴' },
    { id: 'abarrotes', label: 'Abarrotes', icon: '🥫' },
  ];


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




  const buildWhatsAppMessage = (order) => {
    const productsText = order.items
      .map(
        (item) =>
          `- ${item.productName} x ${item.quantity}`
      )
      .join('\n');

    return `
    🛒 Nuevo pedido BITRINEO

    Cliente: ${order.customerName}

    Email: ${order.customerEmail}

    Productos:
    ${productsText}

    Total: $${order.total}

    Entrega:
    ${order.deliveryDate} - ${order.deliveryTime}

    Comentario:
    ${order.note || 'Sin comentarios'}
    `;
  };

  const sendOrderToWhatsApp = (order) => {
    const phone = process.env.NEXT_PUBLIC_SELLER_WHATSAPP;

    console.log('WHATSAPP PHONE:', phone);
    console.log('ORDER WHATSAPP:', order);

    if (!phone) {
      alert('No está configurado NEXT_PUBLIC_SELLER_WHATSAPP');
      return;
    }

    const message = buildWhatsAppMessage(order);

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    console.log('WHATSAPP URL:', url);

    window.open(url, '_blank');
  };









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

    setLastOrderForWhatsApp({
      customerName: user.name,
      customerEmail: user.email,
      items: cart,
      total: total,
      deliveryDate: scheduledDate,
      deliveryTime: scheduledTime,
      note: note,
    });

    setToast({
      open: true,
      message: `Solicitud enviada correctamente. ID pedido: ${data.orderId}`,
      type: 'success',
    });
  }

  const filteredProducts = products.filter((product) => {
    const text = searchText.toLowerCase().trim();

    const productCategory = product.categoryId?.toLowerCase();

    const matchesText =
      text === '' ||
      product.name?.toLowerCase().includes(text) ||
      product.description?.toLowerCase().includes(text) ||
      productCategory?.includes(text);

    const matchesCategory =
      selectedCategory === 'todas' ||
      productCategory === selectedCategory;

    return matchesText && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <MobileToast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />
      <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow md:flex-row md:items-center md:justify-between">



        <div style={styles.searchSection}>
          <div style={styles.searchRow}>
            <div style={styles.searchBox}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <button
              type="button"
              style={styles.filterButton}
              onClick={() => {
                setSearchText('');
                setSelectedCategory('todas');
              }}
            >
              ⚙️
            </button>
          </div>

          <div style={styles.categoryRow}>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  ...styles.categoryButton,
                  ...(selectedCategory === category.id
                    ? styles.categoryButtonActive
                    : {}),
                }}
              >
                <span>{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>




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

          {filteredProducts.map((product) => (
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

       <aside id="tu-solicitud" className="h-fit rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-green-800">
              Tu pedido ({itemCount})
            </h2>

            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-sm font-bold text-red-500 hover:text-red-700"
              >
                Vaciar
              </button>
            )}
          </div>
          <div className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-sm text-slate-500">Todavía no agregas productos.</p>
            ) : (
              cart.map((item) => {
                const productInfo = products.find((p) => p.id === item.productId);

                return (
                  <div
                    key={item.productId}
                    className="border-b border-slate-100 py-4 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={productInfo?.imageUrl || '/placeholder-product.png'}
                        alt={item.productName}
                        className="h-14 w-14 rounded-xl object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-[15px] font-medium text-slate-800">
                              {item.productName}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              {formatPrice(item.unitPrice)} / {getUnitLabel(item.unitType)}
                            </p>
                          </div>

                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-red-400 hover:text-red-600"
                          >
                            🗑️
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="h-8 w-9 text-lg font-normal text-slate-600 hover:bg-slate-50"
                            >
                              −
                            </button>

                            <div className="flex h-8 w-9 items-center justify-center text-sm font-normal text-slate-700">
                              {item.quantity}
                            </div>

                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="h-8 w-9 text-lg font-normal text-slate-600 hover:bg-slate-50"
                            >
                              +
                            </button>
                          </div>

                          <p className="text-base font-semibold text-slate-900">
                            {formatPrice(item.quantity * item.unitPrice)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
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
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <span className="text-lg font-semibold text-slate-600">
                Total
              </span>

              <span className="text-3xl font-extrabold text-slate-900">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <button
            onClick={submitOrder}
            disabled={sending}
            className="mt-5 w-full rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >

            {sending ? 'Enviando solicitud...' : 'Enviar solicitud de compra'}
          </button>

          {lastOrderForWhatsApp ? (
            <button
              type="button"
              onClick={() => sendOrderToWhatsApp(lastOrderForWhatsApp)}
              className="mt-3 mb-24 w-full rounded-xl bg-green-600 px-4 py-4 text-base font-bold text-white shadow-lg hover:bg-green-700"
            >
              Enviar pedido por WhatsApp al vendedor
            </button>
          ) : null}







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

const styles = {
  searchSection: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: '18px',
    padding: '16px',
    marginBottom: '18px',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
    border: '1px solid #e5e7eb',
  },

  searchRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '14px',
  },

  searchBox: {
    flex: 1,
    height: '52px',
    borderRadius: '14px',
    border: '1px solid #d1d5db',
    display: 'flex',
    alignItems: 'center',
    padding: '0 14px',
    backgroundColor: '#f9fafb',
  },

  searchIcon: {
    fontSize: '22px',
    marginRight: '10px',
    color: '#64748b',
  },

  searchInput: {
    width: '100%',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: '16px',
    color: '#0f172a',
  },

  filterButton: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    fontSize: '22px',
    cursor: 'pointer',
  },

  categoryRow: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },

  categoryButton: {
    minWidth: '120px',
    height: '48px',
    borderRadius: '14px',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    color: '#64748b',
    fontSize: '15px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  categoryButtonActive: {
    border: '2px solid #16a34a',
    backgroundColor: '#f0fdf4',
    color: '#15803d',
    boxShadow: '0 6px 18px rgba(22, 163, 74, 0.16)',
  },
};
