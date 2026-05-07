'use client';

import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import AdminShell from '@/components/AdminShell';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [modalMode, setModalMode] = useState('detail');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const res = await fetch('/api/admin/customers');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al cargar clientes');
      }

      setCustomers(data.customers || []);
      setFilteredCustomers(data.customers || []);
    } catch (error) {
      console.error(error);
      showMessage('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const applySearch = (value, source = customers) => {
    setSearch(value);

    const normalized = value.toLowerCase();

    const result = source.filter((customer) =>
      `${customer.name || ''} ${customer.email || ''} ${customer.phone || ''} ${customer.address || ''}`
        .toLowerCase()
        .includes(normalized)
    );

    setFilteredCustomers(result);
  };

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

      const updatedCustomers = customers.map((item) =>
        item.id === customer.id ? { ...item, isActive: newStatus } : item
      );

      setCustomers(updatedCustomers);
      applySearch(search, updatedCustomers);

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
      `Hola ${customer.name || ''}, te contactamos desde STOREWEB.`
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

      const res = await fetch(`/api/admin/customers/${customer.id}/orders`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al cargar pedidos');
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
      showMessage('No se pudieron cargar los pedidos');
    }
  };

  const closeModal = () => {
    setSelectedCustomer(null);
    setOrders([]);
    setModalMode('detail');
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <AdminShell>  
    <div className="min-h-screen bg-slate-50 p-4 pb-28 md:p-6">
      {message ? (
        <div className="fixed left-4 right-4 top-4 z-50 rounded-2xl bg-slate-900 px-4 py-3.5 text-center text-sm font-semibold text-white shadow-xl md:left-auto md:w-96">
          {message}
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500">
            Administra clientes registrados, acceso, contacto y pedidos.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => applySearch(e.target.value)}
              placeholder="Buscar por nombre, correo, teléfono o dirección..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-4 text-sm outline-none focus:border-green-600 focus:bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            Cargando clientes...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            No hay clientes registrados.
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50">
                    <UserRound className="h-6 w-6 text-green-700" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="truncate text-base font-bold text-slate-900">
                          {customer.name || 'Cliente sin nombre'}
                        </h2>
                        <p className="truncate text-sm text-slate-500">
                          {customer.email}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                          customer.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {customer.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-slate-500 md:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {customer.phone ? (
                              <a
                                href={`tel:${customer.phone.replace(/\D/g, '')}`}
                                className="font-medium text-slate-600 underline-offset-2 hover:text-green-700 hover:underline"
                              >
                                {customer.phone}
                              </a>
                            ) : (
                              <span>Sin teléfono</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 md:col-span-2">
                        <MapPin className="h-4 w-4" />
                        {customer.address ? (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              customer.address
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate font-medium text-slate-600 underline-offset-2 hover:text-green-700 hover:underline"
                          >
                            {customer.address}
                          </a>
                        ) : (
                          <span className="truncate">Sin dirección</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <button
                    onClick={() => openDetail(customer)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-3.5 text-sm font-bold text-slate-700"
                  >
                    <Eye className="h-4 w-4" />
                    Detalle
                  </button>

                  <button
                    onClick={() => toggleStatus(customer)}
                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3.5 text-sm font-bold ${
                      customer.isActive
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {customer.isActive ? (
                      <PowerOff className="h-4 w-4" />
                    ) : (
                      <Power className="h-4 w-4" />
                    )}
                    {customer.isActive ? 'Deshabilitar' : 'Habilitar'}
                  </button>

                  <button
                    onClick={() => openWhatsApp(customer)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-100 px-3 py-3.5 text-sm font-bold text-emerald-700"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </button>

                  <button
                    onClick={() => openOrders(customer)}
                    className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-blue-100 px-3 py-3.5 text-sm font-bold text-blue-700 md:col-span-1"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Pedidos
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCustomer ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 md:items-center md:p-4">
          <div className="max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl md:max-w-2xl md:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {modalMode === 'orders'
                    ? 'Pedidos del cliente'
                    : 'Detalle del cliente'}
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedCustomer.name || selectedCustomer.email}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-full bg-slate-100 p-2 text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalMode === 'detail' ? (
              <div className="space-y-3">
                <InfoRow label="Nombre" value={selectedCustomer.name} />
                <InfoRow label="Correo" value={selectedCustomer.email} />
                <InfoRow label="Teléfono" value={selectedCustomer.phone} />
                <InfoRow label="Dirección" value={selectedCustomer.address} />
                <InfoRow
                  label="Estado"
                  value={selectedCustomer.isActive ? 'Activo' : 'Inactivo'}
                />
                <InfoRow label="Rol" value={selectedCustomer.role} />

                <div className="grid grid-cols-2 gap-2 pt-3">
                  <button
                    onClick={() => openWhatsApp(selectedCustomer)}
                    className="rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white"
                  >
                    WhatsApp
                  </button>

                  <button
                    onClick={() => openOrders(selectedCustomer)}
                    className="rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white"
                  >
                    Ver pedidos
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                    Este cliente no tiene pedidos registrados.
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            Pedido #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(order.createdAt).toLocaleString('es-CL')}
                          </p>
                        </div>

                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                          {order.status}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {order.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between gap-3 text-sm"
                          >
                            <span className="text-slate-600">
                              {item.productName} x {item.quantity}{' '}
                              {item.unitType}
                            </span>
                            <span className="font-bold text-slate-900">
                              ${Number(item.subtotal || 0).toLocaleString('es-CL')}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 border-t pt-3 text-right text-sm font-bold text-slate-900">
                        Total estimado: $
                        {Number(order.totalEstimated || 0).toLocaleString(
                          'es-CL'
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
    </AdminShell> 
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value || 'Sin información'}
      </p>
    </div>
  );
}