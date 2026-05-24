'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatPrice, getUnitLabel } from '@/lib/format';
import FloatingCartButton from '@/components/FloatingCartButton';
import MobileToast from '@/components/MobileToast';
import Image from 'next/image';
import { CalendarDays, Trash2 } from 'lucide-react';

function GiftMinimalIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4 10h7v10H4V10Zm9 0h7v10h-7V10ZM3 7h8v2H3V7Zm10 0h8v2h-8V7Z" />
      <path d="M11 4.4C10.35 3.55 9.48 3 8.45 3 6.97 3 6 3.98 6 5.2 6 6.4 7.02 7 8.35 7H11V4.4Zm-2.55.1c.66 0 1.22.43 1.6 1.15V6H8.45C7.78 6 7.3 5.76 7.3 5.2c0-.43.36-.7 1.15-.7ZM13 4.4C13.65 3.55 14.52 3 15.55 3 17.03 3 18 3.98 18 5.2 18 6.4 16.98 7 15.65 7H13V4.4Zm2.55.1c-.66 0-1.22.43-1.6 1.15V6h1.6c.67 0 1.15-.24 1.15-.8 0-.43-.36-.7-1.15-.7Z" />
    </svg>
  );
}

export default function CatalogClient({ products, categories = [], user, company }) {
  const [cart, setCart] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [lastOrderForWhatsApp, setLastOrderForWhatsApp] = useState(null);
  const [likedProducts, setLikedProducts] = useState([]);

  const [toast, setToast] = useState({
    open: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    if (company) {
      localStorage.setItem('currentCompany', JSON.stringify(company));
    }
  }, [company]);

  function handleLogout() {
    const storeSlug = company?.slug || '';

    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    window.location.replace(`/logout?store=${encodeURIComponent(storeSlug)}`);
  }

  const dynamicCategories = [
    { id: 'todas', label: 'Todas' },
    ...(categories || []).map((category) => ({
      id: category.id,
      label: category.label || category.name,
    })),
  ];

  const timeSlots = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'];

  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const total = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0),
    [cart]
  );

  const toggleLike = (productId) => {
    setLikedProducts((prev) => {
      const updatedLikes = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];

      localStorage.setItem('likedProducts', JSON.stringify(updatedLikes));
      return updatedLikes;
    });
  };

  useEffect(() => {
    const savedLikes = localStorage.getItem('likedProducts');
    if (savedLikes) setLikedProducts(JSON.parse(savedLikes));
  }, []);

  useEffect(() => {
    if (!toast.open) return;

    const timer = setTimeout(() => {
      setToast((current) => ({ ...current, open: false }));
    }, 2500);

    return () => clearTimeout(timer);
  }, [toast.open]);

  const getMinScheduledDate = () => {
    const now = new Date();
    const minDate = new Date(now);
    minDate.setDate(now.getDate() + 1);

    const year = minDate.getFullYear();
    const month = String(minDate.getMonth() + 1).padStart(2, '0');
    const day = String(minDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  function changeProductQty(productId, action) {
    setProductQuantities((current) => {
      const currentQty = Number(current[productId] || 1);

      return {
        ...current,
        [productId]: action === 'minus' ? Math.max(1, currentQty - 1) : currentQty + 1,
      };
    });
  }

  function addToCart(product) {
    const selectedQuantity = Number(productQuantities[product.id] || 1);

    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);

      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Number((item.quantity + selectedQuantity).toFixed(2)) }
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

    setToast({
      open: true,
      message: 'Producto agregado al pedido',
      type: 'success',
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

  const buildWhatsAppMessage = (order) => {
    const productsText = order.items
      .map((item) => `- ${item.productName} x ${item.quantity}`)
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

    if (!phone) {
      alert('No está configurado NEXT_PUBLIC_SELLER_WHATSAPP');
      return;
    }

    const message = buildWhatsAppMessage(order);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  async function submitOrder() {
    if (cart.length === 0) {
      setToast({ open: true, message: 'Debes agregar al menos un producto.', type: 'error' });
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      setToast({ open: true, message: 'Debes seleccionar fecha y horario del pedido.', type: 'error' });
      return;
    }

    const minScheduledDate = getMinScheduledDate();

    if (scheduledDate < minScheduledDate) {
      setToast({ open: true, message: 'Solo puedes seleccionar fechas desde el próximo día disponible.', type: 'error' });
      return;
    }

    if (scheduledTime < '14:00' || scheduledTime > '18:30') {
      setToast({ open: true, message: 'Solo puedes seleccionar horarios entre 14:00 y 18:30 hrs.', type: 'error' });
      return;
    }

    const currentCompany = JSON.parse(localStorage.getItem('currentCompany'));

    if (!currentCompany?.id) {
      setToast({ open: true, message: 'No se pudo identificar la tienda del pedido.', type: 'error' });
      return;
    }

    setSending(true);

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: currentCompany.id,
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

    setLastOrderForWhatsApp({
      customerName: user.name,
      customerEmail: user.email,
      items: cart,
      total,
      deliveryDate: scheduledDate,
      deliveryTime: scheduledTime,
      note,
    });

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

  const filteredProducts = products.filter((product) => {
    const text = searchText.toLowerCase().trim();
    const productCategory = product.categoryId?.toLowerCase();

    const matchesText =
      text === '' ||
      product.name?.toLowerCase().includes(text) ||
      product.description?.toLowerCase().includes(text) ||
      productCategory?.includes(text);

    const matchesCategory = selectedCategory === 'todas' || productCategory === selectedCategory;

    return matchesText && matchesCategory;
  });

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#fff8f8] px-3 pb-24 pt-4 font-[Montserrat] text-slate-900 antialiased sm:px-5 lg:px-8 lg:pb-8">
      <MobileToast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />

      <section className="mx-auto w-full max-w-[1400px] overflow-x-hidden">
        <header className="mb-4 w-full rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Image
                src="/logo-navbar.png"
                alt="Bitrineo"
                width={720}
                height={180}
                priority
                className="h-auto w-[170px] object-contain sm:w-[220px] lg:w-[260px]"
              />
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-white px-1">
              <button
                type="button"
                title={user.name}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-900 transition hover:bg-slate-50"
                aria-label="Usuario"
              >
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="8" r="4" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-pink-500 transition hover:bg-pink-50"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <path d="M10 17l5-5-5-5" />
                  <path d="M15 12H3" />
                </svg>
              </button>

              {user.role === 'ADMIN' ? (
                <a
                  href="/admin"
                  title="Panel administrador"
                  aria-label="Panel administrador"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-900 transition hover:bg-slate-50"
                >
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="7" width="18" height="13" rx="2" />
                    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </a>
              ) : null}
            </div>
          </div>
        </header>

        <div className="grid w-full max-w-full gap-5 overflow-x-hidden xl:grid-cols-[1fr_350px]">
          <section className="w-full min-w-0 overflow-x-hidden rounded-[28px] border border-slate-200 bg-white/75 px-3 pb-3 pt-1 shadow-[0_2px_10px_rgba(0,0,0,0.04)] sm:p-4 lg:p-5">
            <div className="mb-3 flex h-12 w-full items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20L16.5 16.5" />
                </svg>
              </div>

              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="-mx-1 mb-5 flex max-w-full gap-2 overflow-x-auto border-b border-slate-200 px-1 pb-4">
              {dynamicCategories.map((category) => {
                const active = selectedCategory === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex h-10 shrink-0 items-center gap-2 rounded-2xl border px-4 text-xs transition ${active
                      ? 'border-pink-300 bg-pink-50 text-pink-600'
                      : 'border-slate-100 bg-white text-slate-500'
                      }`}
                  >
                    <GiftMinimalIcon className="h-3.5 w-3.5" />
                    {category.label}
                  </button>
                );
              })}
            </div>

            <div className="mb-4">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Productos</h2>
              <p className="mt-1 text-xs text-slate-400">{filteredProducts.length} productos disponibles</p>
            </div>

            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <article key={product.id} className="relative overflow-hidden rounded-2xl bg-white shadow">
                  <div className="relative w-full overflow-hidden bg-slate-50">
                    <img
                      src={product.imageUrl || '/placeholder-product.png'}
                      alt={product.name}
                      className="h-[190px] w-full object-cover sm:h-[165px] lg:h-[145px]"
                    />

                    <button
                      type="button"
                      onClick={() => toggleLike(product.id)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '38px',
                        height: '38px',
                        borderRadius: '999px',
                        border: '1px solid rgba(255,255,255,0.75)',
                        background: 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)',
                        color: likedProducts.includes(product.id) ? '#ec407a' : '#64748b',
                        fontSize: '18px',
                        transition: 'all 0.2s ease',
                        zIndex: 20,
                      }}
                      aria-label="Me gusta"
                    >
                      {likedProducts.includes(product.id) ? '♥' : '♡'}
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="line-clamp-1 text-base font-medium text-slate-950">{product.name}</h3>

                    {product.description ? (
                      <p className="mt-1 line-clamp-1 text-xs text-slate-400">{product.description}</p>
                    ) : null}

                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-2xl font-medium text-pink-600">{formatPrice(product.price)}</span>
                      <span className="text-xs text-slate-400">/{getUnitLabel(product.unitType)}</span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex h-10 min-w-[120px] items-center justify-center rounded-full border border-slate-200 bg-pink-50">
                        <button type="button" onClick={() => changeProductQty(product.id, 'minus')} className="flex h-10 w-10 items-center justify-center text-sm text-slate-500">
                          −
                        </button>

                        <div className="flex h-10 w-8 items-center justify-center text-sm text-slate-800">
                          {productQuantities[product.id] || 1}
                        </div>

                        <button type="button" onClick={() => changeProductQty(product.id, 'plus')} className="flex h-10 w-10 items-center justify-center text-sm text-slate-500">
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-500 text-2xl leading-none text-white shadow-md shadow-pink-100 active:scale-95"
                        aria-label={`Agregar ${product.name}`}
                      >
                        +
                      </button>
                    </div>

                    <span className="mt-3 inline-flex rounded-full bg-pink-50 px-3 py-1 text-[11px] text-pink-500">
                      por {getUnitLabel(product.unitType)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside id="tu-solicitud" className="h-fit w-full min-w-0 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_14px_45px_rgba(15,23,42,0.065)] xl:sticky xl:top-5">
            <div className="mb-4 border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Tu pedido</h2>
              <p className="mt-1 text-xs text-slate-400">
                {itemCount > 0
                  ? `${itemCount} producto${itemCount === 1 ? '' : 's'} en tu pedido`
                  : 'Todavía no agregas productos'}
              </p>
            </div>

            <div className="space-y-2.5">
              {cart.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
                  Agrega productos desde el catálogo.
                </div>
              ) : (
                cart.map((item) => {
                  const productInfo = products.find((p) => p.id === item.productId);

                  return (
                    <div key={item.productId} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                      <img
                        src={productInfo?.imageUrl || '/placeholder-product.png'}
                        alt={item.productName}
                        className="h-11 w-11 rounded-xl object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-1 text-xs font-medium text-slate-900">{item.productName}</h3>
                        <p className="mt-0.5 text-xs font-medium text-pink-600">{formatPrice(item.unitPrice)}</p>
                      </div>

                      <div className="flex h-8 items-center rounded-full border border-slate-200 bg-slate-50">
                        <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="h-8 w-7 text-sm text-slate-500">
                          −
                        </button>

                        <div className="flex h-8 w-6 items-center justify-center text-xs font-medium">{item.quantity}</div>

                        <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="h-8 w-7 text-sm text-slate-500">
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 size={16} strokeWidth={1.9} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 rounded-[24px] border border-orange-100 bg-gradient-to-br from-orange-50 to-pink-50 p-4">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm ring-1 ring-orange-100">
                  <CalendarDays size={18} strokeWidth={1.8} />
                </div>

                <h3 className="text-base font-medium text-orange-600">Entrega programada</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">Fecha de entrega</label>

                  <input
                    type="date"
                    min={getMinScheduledDate()}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-pink-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">Horario de entrega</label>

                  <select
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-pink-400"
                  >
                    <option value="">Selecciona un horario</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time} hrs
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Comentario para el pedido</label>

              <textarea
                rows="3"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ejemplo: ojalá maduro el palta 😊"
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-pink-400"
              />
            </div>

            <div className="mt-4 rounded-[22px] bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Cliente</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>

              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-sm font-medium text-slate-700">Total estimado</span>
                <span className="text-2xl font-medium text-pink-600">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={submitOrder}
              disabled={sending}
              className="mt-4 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-pink-600 to-orange-500 text-sm font-medium text-white shadow-lg shadow-pink-100 transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {sending ? 'Enviando...' : 'Realizar pedido'}
              <span className="ml-2 text-lg">→</span>
            </button>

            {lastOrderForWhatsApp ? (
              <button
                type="button"
                onClick={() => sendOrderToWhatsApp(lastOrderForWhatsApp)}
                className="mt-3 h-12 w-full rounded-2xl bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-700"
              >
                Enviar pedido por WhatsApp
              </button>
            ) : null}
          </aside>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-[80] border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">
        <div className="flex justify-between gap-3">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-pink-100 bg-white text-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition hover:-translate-y-0.5 hover:bg-pink-50"
            aria-label="Ir al buscador"
          >
            <div className="relative">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20L16.5 16.5" />
              </svg>

              <span className="absolute -top-2 left-5 text-[10px] font-bold text-pink-500">↑</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              const section = document.getElementById('tu-solicitud');
              if (section) section.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-600 to-orange-500 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-pink-100"
          >
            Ver pedido · {formatPrice(total)}
          </button>
        </div>
      </div>

      <FloatingCartButton itemCount={itemCount} />
    </main>
  );
}