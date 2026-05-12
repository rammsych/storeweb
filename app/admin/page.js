'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/AdminShell';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function AdminPage() {
  const [events, setEvents] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calendarView, setCalendarView] = useState('month');
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    loadScheduledOrders();
  }, []);

  const loadScheduledOrders = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/admin/scheduled-orders', {
        cache: 'no-store',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudieron cargar los pedidos');
      }

      const formattedEvents = data.map((event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading scheduled orders:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminShell>
      <main className="mx-auto max-w-6xl px-4 py-8 pb-28 md:pb-8">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow">
          <h1 className="text-3xl font-bold text-green-800">
            Pedidos Programados
          </h1>

          <p className="text-slate-600">
            Calendario de solicitudes agendadas por fecha y horario.
          </p>
        </div>

        <section className="rounded-2xl bg-white p-4 shadow">
          {loading ? (
            <div className="flex h-[500px] items-center justify-center">
              <p className="font-semibold text-slate-500">
                Cargando calendario...
              </p>
            </div>
          ) : (
            // <Calendar
            //   localizer={localizer}
            //   events={events}
            //   startAccessor="start"
            //   endAccessor="end"
            //   style={{ height: 650 }}
            //   culture="es"
            //   views={['month', 'week', 'day', 'agenda']}
            //   defaultView="month"
            //   messages={{
            //     next: 'Siguiente',
            //     previous: 'Anterior',
            //     today: 'Hoy',
            //     month: 'Mes',
            //     week: 'Semana',
            //     day: 'Día',
            //     agenda: 'Agenda',
            //     date: 'Fecha',
            //     time: 'Hora',
            //     event: 'Pedido',
            //     noEventsInRange: 'No hay pedidos programados en este rango.',

            //   }}
            //   onSelectEvent={(event) => setSelectedOrder(event)}
            // />


            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 650 }}
              culture="es"
              views={['month', 'week', 'day', 'agenda']}
              view={calendarView}
              date={calendarDate}
              onView={(view) => setCalendarView(view)}
              onNavigate={(date) => setCalendarDate(date)}
              min={new Date(2026, 0, 1, 14, 0)}
              max={new Date(2026, 0, 1, 18, 30)}
              messages={{
                next: 'Siguiente',
                previous: 'Anterior',
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
                agenda: 'Agenda',
                date: 'Fecha',
                time: 'Hora',
                event: 'Pedido',
                noEventsInRange: 'No hay pedidos programados en este rango.',
              }}
              onSelectEvent={(event) => setSelectedOrder(event)}
            />








          )}
        </section>

        {selectedOrder && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-green-800">
                    Detalle del pedido
                  </h2>

                  <p className="text-sm text-slate-500">
                    Pedido #{selectedOrder.id}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200"
                >
                  Cerrar
                </button>
              </div>

              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                <p className="font-bold text-orange-700">
                  Pedido Programado
                </p>

                <p className="mt-1 text-sm">
                  <strong>Fecha:</strong>{' '}
                  {selectedOrder.scheduledDeliveryDate}
                </p>

                <p className="text-sm">
                  <strong>Horario:</strong>{' '}
                  {selectedOrder.scheduledDeliveryTime} hrs
                </p>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <strong>Cliente:</strong> {selectedOrder.customerName || '-'}
                </p>

                <p>
                  <strong>Email:</strong> {selectedOrder.customerEmail || '-'}
                </p>

                <p>
                  <strong>Teléfono:</strong> {selectedOrder.customerPhone || '-'}
                </p>

                <p>
                  <strong>Dirección:</strong> {selectedOrder.address || '-'}
                </p>

                <p>
                  <strong>Comentario:</strong> {selectedOrder.notes || '-'}
                </p>

                <p>
                  <strong>Total estimado:</strong> $
                  {Number(selectedOrder.totalEstimated || 0).toLocaleString('es-CL')}
                </p>
              </div>

              <div className="mt-5">
                <h3 className="mb-3 text-lg font-bold text-slate-800">
                  Productos
                </h3>

                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <p className="font-semibold text-slate-800">
                        {item.productName}
                      </p>

                      <p className="text-sm text-slate-600">
                        Cantidad: {item.quantity} {item.unitType}
                      </p>

                      <p className="text-sm text-slate-600">
                        Precio unitario: $
                        {Number(item.unitPrice || 0).toLocaleString('es-CL')}
                      </p>

                      <p className="text-sm font-bold text-green-700">
                        Subtotal: $
                        {Number(item.subtotal || 0).toLocaleString('es-CL')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </AdminShell>
  );
}