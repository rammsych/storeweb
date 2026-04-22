'use client';

export default function MobileToast({ open, message, type = 'success', onClose }) {
  if (!open || !message) return null;

  const bgClass =
    type === 'success'
      ? 'bg-green-600'
      : type === 'error'
      ? 'bg-red-600'
      : 'bg-slate-800';

  return (
    <div className="fixed inset-x-0 top-4 z-[9999] flex justify-center px-4">
      <div
        className={`w-full max-w-sm rounded-2xl ${bgClass} px-4 py-3 text-white shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold">{message}</p>
          </div>

          <button
            onClick={onClose}
            className="text-white/90 hover:text-white"
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}