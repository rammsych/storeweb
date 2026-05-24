'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState, Suspense } from 'react';
import AdminShell from '@/components/AdminShell';
import {
  ShoppingBag,
  CalendarDays,
  Users,
  Banknote,
  TrendingUp,
  Package,
  AlertTriangle,
  Loader2,
  ArrowUpRight,
} from 'lucide-react';

function AdminHomePageContent() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams(window.location.search);

      const companyId = params.get('companyId');

      const ordersUrl = companyId
        ? `/api/admin/orders?companyId=${encodeURIComponent(companyId)}`
        : '/api/admin/orders';

      const customersUrl = companyId
        ? `/api/admin/customers?companyId=${encodeURIComponent(companyId)}`
        : '/api/admin/customers';

      const [ordersRes, customersRes] = await Promise.all([
        fetch(ordersUrl, { cache: 'no-store' }),
        fetch(customersUrl, { cache: 'no-store' }),
      ]);

      const ordersData = await ordersRes.json();
      const customersData = await customersRes.json();

      setOrders(ordersData.orders || []);
      setCustomers(customersData.customers || []);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    const todayOrders = orders.filter((order) =>
      String(order.createdAt || '').startsWith(today)
    );

    const todaySales = todayOrders.reduce(
      (sum, order) => sum + Number(order.totalEstimated || 0),
      0
    );

    const pendingOrders = orders.filter((order) =>
      String(order.status || '').toLowerCase().includes('pend')
    );

    const scheduledOrders = orders.filter(
      (order) => order.deliveryType === 'PROGRAMADO'
    );

    const activeCustomers = customers.filter((customer) => customer.isActive);

    const averageTicket =
      orders.length > 0
        ? orders.reduce(
          (sum, order) => sum + Number(order.totalEstimated || 0),
          0
        ) / orders.length
        : 0;

    return {
      todaySales,
      pendingOrders: pendingOrders.length,
      scheduledOrders: scheduledOrders.length,
      activeCustomers: activeCustomers.length,
      averageTicket,
    };
  }, [orders, customers]);

  const lastSevenDays = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const key = date.toISOString().slice(0, 10);

      const total = orders
        .filter((order) => String(order.createdAt || '').startsWith(key))
        .reduce((sum, order) => sum + Number(order.totalEstimated || 0), 0);

      days.push({
        label: date.toLocaleDateString('es-CL', { weekday: 'short' }),
        value: total,
      });
    }

    return days;
  }, [orders]);

  const topProducts = useMemo(() => {
    const map = {};

    orders.forEach((order) => {
      order.items?.forEach((item) => {
        if (!map[item.productName]) {
          map[item.productName] = 0;
        }

        map[item.productName] += Number(item.quantity || 0);
      });
    });

    return Object.entries(map)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4);
  }, [orders]);

  if (loading) {
    return (
      <AdminShell>
        <div className="flex h-[70vh] flex-col items-center justify-center gap-3 font-['Montserrat',system-ui,sans-serif] text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm font-medium">Cargando dashboard...</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6 font-['Montserrat',system-ui,sans-serif]">
        <section className="rounded-[30px] border border-orange-100 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
            Dashboard Bitrineo
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Resumen del negocio
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Vista rápida para entender ventas, pedidos pendientes, clientes y comportamiento reciente.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Ventas hoy"
            value={`$${Number(stats.todaySales).toLocaleString('es-CL')}`}
            subtitle="Ingresos estimados del día"
            icon={Banknote}
          />

          <KpiCard
            title="Pedidos pendientes"
            value={stats.pendingOrders}
            subtitle="Requieren revisión"
            icon={ShoppingBag}
          />

          <KpiCard
            title="Clientes activos"
            value={stats.activeCustomers}
            subtitle="Clientes habilitados"
            icon={Users}
          />

          <KpiCard
            title="Ticket promedio"
            value={`$${Number(stats.averageTicket).toLocaleString('es-CL')}`}
            subtitle="Promedio por pedido"
            icon={TrendingUp}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-[30px] border border-orange-100 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Ventas últimos 7 días
                </h2>
                <p className="text-sm text-slate-500">
                  Evolución simple para detectar tendencia.
                </p>
              </div>

              <div className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
                7 días
              </div>
            </div>

            <SimpleLineChart data={lastSevenDays} />
          </div>

          <div className="rounded-[30px] border border-orange-100 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
            <h2 className="text-lg font-semibold text-slate-950">
              Productos más vendidos
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Ideal para saber qué reponer primero.
            </p>

            <div className="mt-5 space-y-3">
              {topProducts.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  Aún no hay productos vendidos.
                </p>
              ) : (
                topProducts.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-sm font-semibold text-orange-600">
                        {index + 1}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-950">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {product.quantity} unidades
                        </p>
                      </div>
                    </div>

                    <Package className="h-4 w-4 text-orange-500" />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <InsightCard
            icon={AlertTriangle}
            title="Pedidos pendientes"
            text={`${stats.pendingOrders} pedido(s) necesitan seguimiento.`}
          />

          <InsightCard
            icon={CalendarDays}
            title="Pedidos programados"
            text={`${stats.scheduledOrders} pedido(s) agendados para entrega.`}
          />

          <InsightCard
            icon={ArrowUpRight}
            title="Acción sugerida"
            text="Revisa primero pedidos pendientes y productos más vendidos."
          />
        </section>
      </div>
    </AdminShell>
  );
}

function KpiCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="rounded-[28px] border border-orange-100 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        <Icon className="h-6 w-6" />
      </div>

      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}

function InsightCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-[28px] border border-orange-100 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">{text}</p>
    </div>
  );
}

function SimpleLineChart({ data }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  const points = data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (item.value / max) * 80 - 10;

      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="overflow-hidden rounded-[24px] bg-orange-50/50 p-5">
      <svg viewBox="0 0 100 100" className="h-56 w-full">
        <polyline
          points={points}
          fill="none"
          stroke="#ff5a00"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - (item.value / max) * 80 - 10;

          return (
            <circle
              key={item.label}
              cx={x}
              cy={y}
              r="2.5"
              fill="#ff5a00"
            />
          );
        })}
      </svg>

      <div className="mt-3 grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-500">
        {data.map((item) => (
          <span key={item.label} className="capitalize">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AdminHomePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Cargando...</div>}>
      <AdminHomePageContent />
    </Suspense>
  );
}