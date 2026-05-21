'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Eye,
  Power,
  PowerOff,
  MessageCircle,
  ShoppingBag,
  Search,
  UserRound,
  MapPin,
  Mail,
  Phone,
  X,
  Loader2,
  ShieldCheck,
  Users,
  CalendarDays,
  Package,
} from 'lucide-react';
import AdminShell from '@/components/AdminShell';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [modalMode, setModalMode] = useState('detail');
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [message, setMessage] = useState('');

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const res = await fetch('/api/admin/customers', {
        cache: 'no-store',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al cargar clientes');
      }

      setCustomers(data.customers || []);
    } catch (error) {
      console.error(error);
      showMessage('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !normalized ||
        `${customer.name || ''} ${customer.email || ''} ${customer.phone || ''} ${customer.address || ''}`
          .toLowerCase()
          .includes(normalized);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && customer.isActive) ||
        (statusFilter === 'inactive' && !customer.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const activeCustomers = customers.filter((customer) => customer.isActive).length;
  const inactiveCustomers = customers.length - activeCustomers;

  const toggleStatus = async (customer) => {
    try {
      const newStatus = !customer.isActive;

      const res = await fetch(`/api/admin/customers/${customer.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar cliente');
      }

      setCustomers((current) =>
        current.map((item) =>
          item.id === customer.id ? { ...item, isActive: newStatus } : item
        )
      );

      showMessage(
        newStatus
          ? 'Cliente habilitado correctamente'
          : 'Cliente deshabilitado correctamente'
      );
    } catch (error) {
      console.error(error);
      showMessage('No se pudo actualizar el cliente');
    }
  };

  const openWhatsApp = (customer) => {
    if (!customer.phone) {
      showMessage('Este cliente no tiene teléfono registrado');
      return;
    }

    let cleanPhone = customer.phone.replace(/\D/g, '');

    if (cleanPhone.length === 9) {
      cleanPhone = `56${cleanPhone}`;
    }

    const text = encodeURIComponent(
      `Hola ${customer.name || ''}, te contactamos desde Bitrineo.`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const openDetail = (customer) => {
    setSelectedCustomer(customer);
    setOrders([]);
    setModalMode('detail');
  };

  const openOrders = async (customer) => {
    try {
      setSelectedCustomer(customer);
      setModalMode('orders');
      setOrders([]);
      setOrdersLoading(true);

      const res = await fetch(`/api/admin/customers/${customer.id}/orders`, {
        cache: 'no-store',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al cargar pedidos');
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
      showMessage('No se pudieron cargar los pedidos');
    } finally {
      setOrdersLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedCustomer(null);
    setOrders([]);
    setModalMode('detail');
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
                Clientes Bitrineo
              </p>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                Clientes
              </h1>

              <p className="mt-1 max-w-2xl text-sm font-normal leading-relaxed text-slate-500">
                Administra clientes registrados, estado de acceso, contacto por WhatsApp y pedidos realizados.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <KpiCard label="Total" value={customers.length} icon={Users} />
              <KpiCard label="Activos" value={activeCustomers} icon={ShieldCheck} />
              <KpiCard label="Inactivos" value={inactiveCustomers} icon={PowerOff} />
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-orange-100 bg-white p-4 shadow-[0_10px_35px_rgba(15,23,42,0.04)] md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, correo, teléfono o dirección..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-700 outline-none transition focus:border-orange-300 focus:bg-white"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Solo activos</option>
              <option value="inactive">Solo inactivos</option>
            </select>
          </div>
        </section>

        <section className="rounded-[28px] border border-orange-100 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 md:px-6">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Listado de clientes
              </h2>

              <p className="text-sm font-normal text-slate-500">
                {filteredCustomers.length} cliente(s) encontrados
              </p>
            </div>

            <div className="hidden rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600 sm:block">
              Bitrineo
            </div>
          </div>

          {loading ? (
            <div className="flex h-72 flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
              <p className="text-sm font-medium">Cargando clientes...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                <Search className="h-6 w-6" />
              </div>

              <p className="text-sm font-medium text-slate-800">
                No encontramos clientes
              </p>

              <p className="mt-1 text-sm font-normal text-slate-500">
                Intenta buscar con otro dato o cambia el filtro de estado.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <article
                  key={customer.id}
                  className="group flex flex-col gap-4 px-5 py-4 transition hover:bg-orange-50/35 md:flex-row md:items-center md:justify-between md:px-6"
                >
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                      <UserRound className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-[15px] font-medium text-slate-950">
                          {customer.name || 'Cliente sin nombre'}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            customer.isActive
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-red-50 text-red-500'
                          }`}
                        >
                          {customer.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      <div className="mt-2 grid gap-2 text-sm font-normal text-slate-500 md:grid-cols-2">
                        <InfoMini icon={Mail} value={customer.email || 'Sin correo'} />

                        <InfoMini
                          icon={Phone}
                          value={customer.phone || 'Sin teléfono'}
                          href={
                            customer.phone
                              ? `tel:${customer.phone.replace(/\D/g, '')}`
                              : null
                          }
                        />

                        <InfoMini
                          icon={MapPin}
                          value={customer.address || 'Sin dirección'}
                          href={
                            customer.address
                              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                  customer.address
                                )}`
                              : null
                          }
                          external
                          wide
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:flex md:items-center">
                    <ActionButton
                      icon={Eye}
                      label="Detalle"
                      onClick={() => openDetail(customer)}
                    />

                    <ActionButton
                      icon={customer.isActive ? PowerOff : Power}
                      label={customer.isActive ? 'Deshabilitar' : 'Habilitar'}
                      onClick={() => toggleStatus(customer)}
                      variant={customer.isActive ? 'warning' : 'success'}
                    />

                    <ActionButton
                      icon={MessageCircle}
                      label="WhatsApp"
                      onClick={() => openWhatsApp(customer)}
                      variant="whatsapp"
                    />

                    <ActionButton
                      icon={ShoppingBag}
                      label="Pedidos"
                      onClick={() => openOrders(customer)}
                      variant="orange"
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {selectedCustomer ? (
          <CustomerModal
            customer={selectedCustomer}
            modalMode={modalMode}
            orders={orders}
            ordersLoading={ordersLoading}
            onClose={closeModal}
            onWhatsApp={() => openWhatsApp(selectedCustomer)}
            onOrders={() => openOrders(selectedCustomer)}
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
      <p className="text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function InfoMini({ icon: Icon, value, href, external = false, wide = false }) {
  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      <span className="truncate">{value}</span>
    </>
  );

  const className = `flex min-w-0 items-center gap-2 ${wide ? 'md:col-span-2' : ''}`;

  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={`${className} underline-offset-2 transition hover:text-orange-600 hover:underline`}
      >
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}

function ActionButton({ icon: Icon, label, onClick, variant = 'default' }) {
  const styles = {
    default:
      'border border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:text-orange-600',
    warning: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    success: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
    whatsapp: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
    orange: 'bg-orange-500 text-white hover:bg-orange-600',
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

function CustomerModal({
  customer,
  modalMode,
  orders,
  ordersLoading,
  onClose,
  onWhatsApp,
  onOrders,
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[30px] bg-white p-5 shadow-2xl sm:rounded-[30px] sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
              {modalMode === 'orders' ? 'Historial de pedidos' : 'Detalle cliente'}
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {modalMode === 'orders' ? 'Pedidos del cliente' : 'Detalle del cliente'}
            </h2>

            <p className="mt-1 text-sm font-normal text-slate-500">
              {customer.name || customer.email || 'Cliente'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-orange-50 hover:text-orange-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {modalMode === 'detail' ? (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard icon={UserRound} label="Nombre" value={customer.name} />
              <InfoCard icon={Mail} label="Correo" value={customer.email} />
              <InfoCard icon={Phone} label="Teléfono" value={customer.phone} />
              <InfoCard icon={MapPin} label="Dirección" value={customer.address} />
              <InfoCard
                icon={ShieldCheck}
                label="Estado"
                value={customer.isActive ? 'Activo' : 'Inactivo'}
                accent={customer.isActive}
              />
              <InfoCard icon={Users} label="Rol" value={customer.role} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onWhatsApp}
                className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-600"
              >
                WhatsApp
              </button>

              <button
                onClick={onOrders}
                className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-medium text-white shadow-[0_10px_24px_rgba(255,90,0,0.22)] transition hover:bg-orange-600"
              >
                Ver pedidos
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {ordersLoading ? (
              <div className="flex h-40 flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                <p className="text-sm font-medium">Cargando pedidos...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-[24px] bg-slate-50 p-6 text-center">
                <ShoppingBag className="mx-auto mb-3 h-7 w-7 text-orange-500" />
                <p className="text-sm font-medium text-slate-800">
                  Este cliente no tiene pedidos registrados.
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        Pedido #{String(order.id).slice(0, 8)}
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString('es-CL')
                          : 'Sin fecha'}
                      </p>
                    </div>

                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
                      {order.status || 'Sin estado'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <Package className="h-4 w-4 shrink-0 text-orange-500" />
                          <span className="truncate text-slate-600">
                            {item.productName} x {item.quantity} {item.unitType}
                          </span>
                        </div>

                        <span className="shrink-0 font-medium text-slate-950">
                          ${Number(item.subtotal || 0).toLocaleString('es-CL')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3 text-right">
                    <p className="text-xs font-medium text-slate-400">
                      Total estimado
                    </p>
                    <p className="text-lg font-semibold text-slate-950">
                      ${Number(order.totalEstimated || 0).toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, accent = false }) {
  return (
    <div
      className={`rounded-[22px] border p-4 ${
        accent
          ? 'border-orange-100 bg-orange-50/60'
          : 'border-slate-100 bg-slate-50'
      }`}
    >
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