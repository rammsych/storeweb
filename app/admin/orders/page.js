'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  ShoppingBag,
  CalendarDays,
  Clock,
  UserRound,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Eye,
  X,
  Loader2,
  Package,
  Truck,
  Banknote,
} from 'lucide-react';
import AdminShell from '@/components/AdminShell';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  const loadOrders = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams(window.location.search);
      const companyId = params.get('companyId');

      const url = companyId
        ? `/api/admin/orders?companyId=${encodeURIComponent(companyId)}`
        : '/api/admin/orders';

      const res = await fetch(url, {
        cache: 'no-store',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al cargar pedidos');
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
      showMessage('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const normalizeText = (value) =>
    String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const filteredOrders = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return orders.filter((order) => {
      const itemsText = order.items
        ?.map((item) => `${item.productName || ''} ${item.unitType || ''}`)
        .join(' ');

      const searchableText = normalizeText(`
      ${order.id || ''}
      ${order.customerName || ''}
      ${order.customerEmail || ''}
      ${order.customerPhone || ''}
      ${order.address || ''}
      ${order.notes || ''}
      ${order.status || ''}
      ${order.deliveryType || ''}
      ${order.scheduledDeliveryDate || ''}
      ${order.scheduledDeliveryTime || ''}
      ${itemsText || ''}
    `);

      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === 'all' || order.status === statusFilter;

      const matchesDelivery =
        deliveryFilter === 'all' || order.deliveryType === deliveryFilter;

      return matchesSearch && matchesStatus && matchesDelivery;
    });
  }, [orders, search, statusFilter, deliveryFilter]);
  const totalEstimated = filteredOrders.reduce(
    (sum, order) => sum + Number(order.totalEstimated || 0),
    0
  );

  const programmedOrders = orders.filter(
    (order) => order.deliveryType === 'PROGRAMADO'
  ).length;

  const immediateOrders = orders.filter(
    (order) => order.deliveryType !== 'PROGRAMADO'
  ).length;

  const statuses = useMemo(() => {
    return Array.from(new Set(orders.map((order) => order.status).filter(Boolean)));
  }, [orders]);

  const openWhatsApp = (order) => {
    if (!order.customerPhone) {
      showMessage('Este pedido no tiene teléfono registrado');
      return;
    }

    let cleanPhone = order.customerPhone.replace(/\D/g, '');

    if (cleanPhone.length === 9) {
      cleanPhone = `56${cleanPhone}`;
    }

    const text = encodeURIComponent(
      `Hola ${order.customerName || ''}, te contactamos desde Bitrineo por tu pedido #${String(order.id).slice(0, 8)}.`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <AdminShell>
      <div className="space-y-6 font-['Montserrat',system-ui,sans-serif]">
        {message ? (
          <div className="fixed left-4 right-4 top-4 z-[300] rounded-2xl bg-slate-950 px-4 py-3.5 text-center text-sm font-medium text-white shadow-xl md:left-auto md:right-6 md:w-96">
            {message}
          </div>
        ) : null}

        <section className="rounded-[28px] border border-orange-100 bg-white px-5 py-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)] md:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                Pedidos Bitrineo
              </p>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                Pedidos
              </h1>

              <p className="mt-1 max-w-2xl text-sm font-normal leading-relaxed text-slate-500">
                Visualiza las solicitudes realizadas, revisa productos, cliente, fecha, tipo de entrega y contacto.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <KpiCard label="Total" value={orders.length} icon={ShoppingBag} />
              <KpiCard label="Programados" value={programmedOrders} icon={CalendarDays} />
              <KpiCard label="Inmediatos" value={immediateOrders} icon={Truck} />
              <KpiCard
                label="Monto"
                value={`$${Number(totalEstimated || 0).toLocaleString('es-CL')}`}
                icon={Banknote}
              />
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-orange-100 bg-white p-4 shadow-[0_10px_35px_rgba(15,23,42,0.04)] md:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por cliente, correo, teléfono, dirección o ID..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
              />
            </div>

            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-700 outline-none transition focus:border-orange-300 focus:bg-white"
            >
              <option value="all">Todos los tipos</option>
              <option value="PROGRAMADO">Programados</option>
              <option value="INMEDIATO">Inmediatos</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-700 outline-none transition focus:border-orange-300 focus:bg-white"
            >
              <option value="all">Todos los estados</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="rounded-[28px] border border-orange-100 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 md:px-6">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Listado de pedidos
              </h2>

              <p className="text-sm font-normal text-slate-500">
                {filteredOrders.length} pedido(s) encontrados
              </p>
            </div>

            <div className="hidden rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600 sm:block">
              Bitrineo
            </div>
          </div>

          {loading ? (
            <div className="flex h-72 flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
              <p className="text-sm font-medium">Cargando pedidos...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <Search className="h-6 w-6" />
              </div>

              <p className="text-sm font-medium text-slate-800">
                No encontramos pedidos
              </p>

              <p className="mt-1 text-sm font-normal text-slate-500">
                Intenta buscar con otro dato o cambia los filtros.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <article
                  key={order.id}
                  className="group flex flex-col gap-4 px-5 py-4 transition hover:bg-orange-50/35 md:flex-row md:items-center md:justify-between md:px-6"
                >
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                      <ShoppingBag className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-[15px] font-medium text-slate-950">
                          Pedido #{String(order.id).slice(0, 8)}
                        </h3>

                        <StatusBadge status={order.status} />

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                          {order.deliveryType === 'PROGRAMADO'
                            ? 'Programado'
                            : 'Inmediato'}
                        </span>
                      </div>

                      <div className="mt-2 grid gap-2 text-sm font-normal text-slate-500 md:grid-cols-2">
                        <InfoMini icon={UserRound} value={order.customerName || 'Cliente sin nombre'} />
                        <InfoMini icon={Mail} value={order.customerEmail || 'Sin correo'} />
                        <InfoMini
                          icon={Phone}
                          value={order.customerPhone || 'Sin teléfono'}
                          href={
                            order.customerPhone
                              ? `tel:${order.customerPhone.replace(/\D/g, '')}`
                              : null
                          }
                        />
                        <InfoMini
                          icon={MapPin}
                          value={order.address || 'Sin dirección'}
                          href={
                            order.address
                              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                order.address
                              )}`
                              : null
                          }
                          external
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-orange-600">
                          Total: ${Number(order.totalEstimated || 0).toLocaleString('es-CL')}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          {order.items?.length || 0} producto(s)
                        </span>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          {formatOrderDate(order)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:flex md:items-center">
                    <ActionButton
                      icon={Eye}
                      label="Detalle"
                      onClick={() => setSelectedOrder(order)}
                    />

                    <ActionButton
                      icon={MessageCircle}
                      label="WhatsApp"
                      onClick={() => openWhatsApp(order)}
                      variant="whatsapp"
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {selectedOrder ? (
          <OrderModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onWhatsApp={() => openWhatsApp(selectedOrder)}
          />
        ) : null}
      </div>
    </AdminShell>
  );
}

function KpiCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl bg-orange-50 px-4 py-3">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>

      <p className="text-xs font-medium text-orange-600">{label}</p>
      <p className="text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || '').toLowerCase();

  let className = 'bg-slate-100 text-slate-600';

  if (normalized.includes('pend') || normalized.includes('pending')) {
    className = 'bg-yellow-50 text-yellow-700';
  }

  if (normalized.includes('aprob') || normalized.includes('confirm')) {
    className = 'bg-emerald-50 text-emerald-600';
  }

  if (normalized.includes('cancel') || normalized.includes('rechaz')) {
    className = 'bg-red-50 text-red-500';
  }

  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${className}`}>
      {status || 'Sin estado'}
    </span>
  );
}

function InfoMini({ icon: Icon, value, href, external = false }) {
  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      <span className="truncate">{value}</span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className="flex min-w-0 items-center gap-2 underline-offset-2 transition hover:text-orange-600 hover:underline"
      >
        {content}
      </a>
    );
  }

  return <div className="flex min-w-0 items-center gap-2">{content}</div>;
}

function ActionButton({ icon: Icon, label, onClick, variant = 'default' }) {
  const styles = {
    default:
      'border border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:text-orange-600',
    whatsapp: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-medium transition ${styles[variant]}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function OrderModal({ order, onClose, onWhatsApp }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[30px] bg-white p-5 shadow-2xl sm:rounded-[30px] sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
              Detalle del pedido
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Pedido #{String(order.id).slice(0, 8)}
            </h2>

            <p className="mt-1 text-sm font-normal text-slate-500">
              {formatOrderDate(order)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-orange-50 hover:text-orange-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoCard icon={UserRound} label="Cliente" value={order.customerName} />
          <InfoCard icon={Mail} label="Correo" value={order.customerEmail} />
          <InfoCard icon={Phone} label="Teléfono" value={order.customerPhone} />
          <InfoCard icon={MapPin} label="Dirección" value={order.address} />
          <InfoCard icon={Truck} label="Tipo entrega" value={order.deliveryType} />
          <InfoCard icon={Clock} label="Estado" value={order.status} />
        </div>

        {order.notes ? (
          <div className="mt-5 rounded-[24px] border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-400">Comentario</p>
            <p className="mt-1 text-sm text-slate-700">{order.notes}</p>
          </div>
        ) : null}

        <div className="mt-5 rounded-[24px] border border-orange-100 bg-orange-50/60 p-4">
          <p className="text-xs font-medium text-orange-600">Total estimado</p>
          <p className="mt-1 text-3xl font-semibold text-slate-950">
            ${Number(order.totalEstimated || 0).toLocaleString('es-CL')}
          </p>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-950">
              Productos
            </h3>

            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
              {order.items?.length || 0} item(s)
            </span>
          </div>

          <div className="space-y-3">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                    <Package className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-950">
                      {item.productName}
                    </p>

                    <div className="mt-2 grid gap-2 text-xs font-normal text-slate-500 sm:grid-cols-3">
                      <span>
                        Cantidad: {item.quantity} {item.unitType}
                      </span>

                      <span>
                        Unitario: $
                        {Number(item.unitPrice || 0).toLocaleString('es-CL')}
                      </span>

                      <span className="font-semibold text-orange-600">
                        Subtotal: $
                        {Number(item.subtotal || 0).toLocaleString('es-CL')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {!order.items?.length && (
              <div className="rounded-[22px] border border-slate-100 bg-slate-50 p-5 text-center text-sm text-slate-500">
                Este pedido no tiene productos asociados.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Cerrar
          </button>

          <button
            onClick={onWhatsApp}
            className="rounded-2xl bg-emerald-500 py-3 text-sm font-medium text-white transition hover:bg-emerald-600"
          >
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[22px] border border-slate-100 bg-slate-50 p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>

      <p className="text-xs font-medium text-slate-500">{label}</p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-950">
        {value || 'Sin información'}
      </p>
    </div>
  );
}

function formatOrderDate(order) {
  if (order.deliveryType === 'PROGRAMADO' && order.scheduledDeliveryDate) {
    return `${formatDate(order.scheduledDeliveryDate)} ${order.scheduledDeliveryTime ? `· ${order.scheduledDeliveryTime} hrs` : ''
      }`;
  }

  if (order.createdAt) {
    return new Date(order.createdAt).toLocaleString('es-CL');
  }

  return 'Sin fecha';
}

function formatDate(dateValue) {
  try {
    return new Date(dateValue).toLocaleDateString('es-CL');
  } catch {
    return dateValue;
  }
}