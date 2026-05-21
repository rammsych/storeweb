'use client';

import { useEffect, useState } from 'react';
import AdminShell from '@/components/AdminShell';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale/es';
import {
  CalendarDays,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Package,
  X,
  Loader2,
} from 'lucide-react';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function ScheduledOrdersPage() {
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
      <div className="space-y-6 font-['Montserrat',system-ui,sans-serif]">
        <section className="rounded-[28px] border border-orange-100 bg-white px-5 py-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)] md:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                Agenda Bitrineo
              </p>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                Pedidos Programados
              </h1>

              <p className="mt-1 max-w-2xl text-sm font-normal leading-relaxed text-slate-500">
                Calendario de solicitudes agendadas por fecha y horario.
                Revisa cada pedido haciendo clic sobre la agenda.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex">
              <div className="rounded-2xl bg-orange-50 px-4 py-3">
                <p className="text-xs font-medium text-orange-600">
                  Pedidos
                </p>
                <p className="text-xl font-semibold text-slate-950">
                  {events.length}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium text-slate-500">
                  Vista
                </p>
                <p className="text-xl font-semibold capitalize text-slate-950">
                  {calendarView}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-orange-100 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
          {loading ? (
            <div className="flex h-[560px] flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
              <p className="text-sm font-medium">
                Cargando calendario...
              </p>
            </div>
          ) : (
            <div className="calendar-mobile-wrapper p-3 md:p-5">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                culture="es"
                views={['month', 'week', 'day', 'agenda']}
                view={calendarView}
                date={calendarDate}
                onView={(view) => setCalendarView(view)}
                onNavigate={(date) => setCalendarDate(date)}
                min={new Date(2026, 0, 1, 14, 0)}
                max={new Date(2026, 0, 1, 18, 30)}
                style={{ height: calendarView === 'month' ? 620 : 660 }}
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
                  noEventsInRange:
                    'No hay pedidos programados en este rango.',
                }}
                onSelectEvent={(event) => setSelectedOrder(event)}
              />
            </div>
          )}
        </section>

        {selectedOrder && (
          <OrderModal
            selectedOrder={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}

        <style jsx global>{`
          .rbc-calendar {
            font-family: 'Montserrat', system-ui, sans-serif;
            color: #0f172a;
          }

          .rbc-toolbar {
            gap: 12px;
            margin-bottom: 18px;
            align-items: center;
          }

          .rbc-toolbar-label {
            font-size: 16px;
            font-weight: 600;
            color: #0f172a;
            text-transform: capitalize;
          }

          .rbc-btn-group {
            border: 1px solid #fed7aa;
            border-radius: 16px;
            overflow: hidden;
            background: #fff7ed;
          }

          .rbc-btn-group button {
            border: none !important;
            background: transparent;
            color: #64748b;
            font-size: 13px;
            font-weight: 500;
            padding: 10px 14px;
            box-shadow: none !important;
          }

          .rbc-btn-group button:hover {
            background: #ffedd5;
            color: #f97316;
          }

          .rbc-btn-group button.rbc-active {
            background: #ff5a00 !important;
            color: white !important;
          }

          .rbc-month-view,
          .rbc-time-view,
          .rbc-agenda-view {
            border: 1px solid #f1f5f9;
            border-radius: 22px;
            overflow: hidden;
          }

          .rbc-header {
            padding: 12px 6px;
            border-color: #f1f5f9;
            font-size: 12px;
            font-weight: 600;
            color: #475569;
            background: #fffaf5;
          }

          .rbc-month-row,
          .rbc-day-bg,
          .rbc-date-cell,
          .rbc-time-content,
          .rbc-time-header-content {
            border-color: #f1f5f9 !important;
          }

          .rbc-off-range-bg {
            background: #fafafa;
          }

          .rbc-today {
            background: #fff7ed !important;
          }

          .rbc-date-cell {
            padding: 8px;
            font-size: 12px;
            font-weight: 500;
            color: #334155;
          }

          .rbc-event {
            border: none !important;
            border-radius: 10px !important;
            background: linear-gradient(135deg, #ff5a00, #ff8a1f) !important;
            padding: 4px 8px !important;
            font-size: 12px;
            font-weight: 500;
            box-shadow: 0 8px 18px rgba(255, 90, 0, 0.2);
          }

          .rbc-event-content {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .rbc-show-more {
            color: #f97316;
            font-size: 12px;
            font-weight: 600;
            background: #fff7ed;
            border-radius: 999px;
            padding: 2px 8px;
          }

          .rbc-agenda-table {
            border-color: #f1f5f9 !important;
          }

          .rbc-agenda-table th {
            padding: 12px;
            background: #fff7ed;
            color: #475569;
            font-size: 12px;
            font-weight: 600;
          }

          .rbc-agenda-table td {
            padding: 14px 12px;
            border-color: #f1f5f9 !important;
            font-size: 13px;
          }

          @media (max-width: 768px) {
            .calendar-mobile-wrapper {
              width: 100%;
              overflow: hidden;
            }

            .rbc-calendar {
              width: 100% !important;
              min-width: 0 !important;
              font-size: 12px;
            }

            .rbc-toolbar {
              display: grid;
              grid-template-columns: 1fr;
              gap: 10px;
              align-items: stretch;
              margin-bottom: 14px;
            }

            .rbc-toolbar-label {
              order: -1;
              width: 100%;
              text-align: center;
              font-size: 22px;
              line-height: 1.1;
              font-weight: 700;
              color: #0f172a;
              padding: 8px 0;
            }

            .rbc-btn-group {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              width: 100%;
              overflow: hidden;
              border-radius: 14px;
            }

            .rbc-btn-group button {
              width: 100%;
              min-width: 0;
              padding: 9px 6px;
              font-size: 12px;
              white-space: nowrap;
            }

            .rbc-month-view,
            .rbc-time-view,
            .rbc-agenda-view {
              width: 100% !important;
              min-width: 0 !important;
              border-radius: 18px;
            }

            .rbc-header {
              padding: 10px 2px;
              font-size: 12px;
            }

            .rbc-date-cell {
              padding: 5px 4px;
              font-size: 12px;
            }

            .rbc-month-row {
              min-height: 92px;
            }

            .rbc-event {
              max-width: 100%;
              padding: 2px 5px !important;
              border-radius: 999px !important;
              font-size: 10px;
              line-height: 1.2;
              box-shadow: 0 6px 12px rgba(255, 90, 0, 0.16);
            }

            .rbc-event-content {
              max-width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .rbc-show-more {
              display: inline-block;
              max-width: 100%;
              font-size: 10px;
              padding: 1px 6px;
            }
          }
        `}</style>
      </div>
    </AdminShell>
  );
}

function OrderModal({ selectedOrder, onClose }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[30px] bg-white p-5 shadow-2xl sm:rounded-[30px] sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
              Pedido programado
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Detalle del pedido
            </h2>

            <p className="mt-1 text-sm font-normal text-slate-500">
              Pedido #{selectedOrder.id}
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
          <InfoCard
            icon={CalendarDays}
            label="Fecha"
            value={selectedOrder.scheduledDeliveryDate || '-'}
            accent
          />

          <InfoCard
            icon={Clock}
            label="Horario"
            value={`${selectedOrder.scheduledDeliveryTime || '-'} hrs`}
            accent
          />
        </div>

        <div className="mt-5 rounded-[24px] border border-slate-100 bg-slate-50/70 p-4">
          <h3 className="mb-4 text-sm font-semibold text-slate-950">
            Datos del cliente
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoLine icon={User} label="Cliente" value={selectedOrder.customerName || '-'} />
            <InfoLine icon={Mail} label="Email" value={selectedOrder.customerEmail || '-'} />
            <InfoLine icon={Phone} label="Teléfono" value={selectedOrder.customerPhone || '-'} />
            <InfoLine icon={MapPin} label="Dirección" value={selectedOrder.address || '-'} />
          </div>

          <div className="mt-3">
            <InfoLine icon={MessageSquare} label="Comentario" value={selectedOrder.notes || '-'} />
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-orange-100 bg-orange-50/60 p-4">
          <p className="text-xs font-medium text-orange-600">
            Total estimado
          </p>

          <p className="mt-1 text-3xl font-semibold text-slate-950">
            ${Number(selectedOrder.totalEstimated || 0).toLocaleString('es-CL')}
          </p>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-950">
              Productos
            </h3>

            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
              {selectedOrder.items?.length || 0} item(s)
            </span>
          </div>

          <div className="space-y-3">
            {selectedOrder.items?.map((item) => (
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
                        Unitario: ${Number(item.unitPrice || 0).toLocaleString('es-CL')}
                      </span>

                      <span className="font-semibold text-orange-600">
                        Subtotal: ${Number(item.subtotal || 0).toLocaleString('es-CL')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {!selectedOrder.items?.length && (
              <div className="rounded-[22px] border border-slate-100 bg-slate-50 p-5 text-center text-sm text-slate-500">
                Este pedido no tiene productos asociados.
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-orange-500 py-3 text-sm font-medium text-white shadow-[0_10px_24px_rgba(255,90,0,0.22)] transition hover:bg-orange-600"
        >
          Cerrar detalle
        </button>
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

      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function InfoLine({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-white p-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>

        <p className="break-words text-sm font-normal text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}