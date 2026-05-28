'use client';

import { useState } from 'react';
import {
  Building2,
  ArrowRight,
  Plus,
  X,
  Wrench,
  Palette,
} from 'lucide-react';

export default function SuperAdminCompaniesClient({
  companies: initialCompanies,
}) {
  const [companies, setCompanies] = useState(initialCompanies || []);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    responsible_name: '',
  });

  const [saving, setSaving] = useState(false);
  const [openAdmin, setOpenAdmin] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [savingAdmin, setSavingAdmin] = useState(false);

  const [openBranding, setOpenBranding] = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);

  const [brandingForm, setBrandingForm] = useState({
    display_name: '',
    slogan: '',
    logo_url: '',
    primary_color: '#E83E8C',
    secondary_color: '#FFF1F7',
  });

  async function createCompany(e) {
    e.preventDefault();

    try {
      setSaving(true);

      const isEditing = !!selectedCompany;

      const response = await fetch(
        isEditing
          ? `/api/super-admin/companies/${selectedCompany.id}`
          : '/api/super-admin/companies',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Error');
        return;
      }

      if (isEditing) {
        setCompanies((prev) =>
          prev.map((company) =>
            company.id === selectedCompany.id
              ? { ...company, ...data.company }
              : company
          )
        );
      } else {
        setCompanies([data.company, ...companies]);
      }

      setForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        responsible_name: '',
      });

      setSelectedCompany(null);
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert('Error inesperado');
    } finally {
      setSaving(false);
    }
  }

  async function createAdmin(e) {
    e.preventDefault();

    try {
      setSavingAdmin(true);

      const response = await fetch('/api/super-admin/company-admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...adminForm,
          companyId: selectedCompany.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Error');
        return;
      }

      alert('Administrador creado correctamente');

      setAdminForm({
        name: '',
        email: '',
        phone: '',
        password: '',
      });

      setOpenAdmin(false);
    } catch (error) {
      console.error(error);
      alert('Error inesperado');
    } finally {
      setSavingAdmin(false);
    }
  }

  async function saveBranding(e) {
    e.preventDefault();

    try {
      setSavingBranding(true);

      const response = await fetch(
        `/api/super-admin/companies/${selectedCompany.id}/branding`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(brandingForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Error guardando branding');
        return;
      }

      setCompanies((prev) =>
        prev.map((company) =>
          company.id === selectedCompany.id
            ? { ...company, ...data.company }
            : company
        )
      );

      setOpenBranding(false);
    } catch (error) {
      console.error(error);
      alert('Error inesperado guardando branding');
    } finally {
      setSavingBranding(false);
    }
  }

  async function toggleMaintenance(company) {
    try {
      const response = await fetch(
        `/api/super-admin/companies/${company.id}/maintenance`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            maintenanceMode: !company.maintenanceMode,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Error');
        return;
      }

      setCompanies((prev) =>
        prev.map((item) =>
          item.id === company.id
            ? { ...item, maintenanceMode: !item.maintenanceMode }
            : item
        )
      );
    } catch (error) {
      console.error(error);
      alert('Error activando modo mantención');
    }
  }

  return (
    <>
      <section className="rounded-[30px] border border-orange-100 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Listado de empresas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Estas empresas ya están registradas en Bitrineo.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedCompany(null);
              setForm({
                name: '',
                email: '',
                phone: '',
                address: '',
                responsible_name: '',
              });
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            Nueva empresa
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {companies.map((company) => (
            <article
              key={company.id}
              className="flex flex-col gap-4 px-5 py-5 transition hover:bg-orange-50/35 md:flex-row md:items-center md:justify-between md:px-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-orange-100 bg-orange-50 text-orange-500">
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={company.name}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <Building2 className="h-6 w-6" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-950">
                      {company.display_name || company.name}
                    </h3>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        company.maintenanceMode
                          ? 'bg-red-50 text-red-600'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {company.maintenanceMode ? 'Mantención' : 'Activa'}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1 text-sm text-slate-500">
                    <p>
                      <span className="font-medium text-slate-700">Email:</span>{' '}
                      {company.email || 'Sin correo'}
                    </p>

                    <p>
                      <span className="font-medium text-slate-700">WhatsApp:</span>{' '}
                      {company.phone || 'Sin teléfono'}
                    </p>

                    <p>
                      <span className="font-medium text-slate-700">Admin:</span>{' '}
                      {company.responsible_name || 'Sin asignar'}
                    </p>

                    <p>
                      <span className="font-medium text-slate-700">Usuarios:</span>{' '}
                      {company._count?.users || 0}
                    </p>

                    <p className="text-xs text-slate-400">{company.slug}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCompany(company);
                    setOpenAdmin(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Crear admin
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCompany(company);

                    setBrandingForm({
                      display_name: company.display_name || company.name || '',
                      slogan: company.slogan || '',
                      logo_url: company.logo_url || '',
                      primary_color: company.primary_color || '#E83E8C',
                      secondary_color: company.secondary_color || '#FFF1F7',
                    });

                    setOpenBranding(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm font-medium text-pink-600 transition hover:bg-pink-500 hover:text-white"
                >
                  <Palette className="h-4 w-4" />
                  Branding
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCompany(company);

                    setForm({
                      name: company.name || '',
                      email: company.email || '',
                      phone: company.phone || '',
                      address: company.address || '',
                      responsible_name: company.responsible_name || '',
                    });

                    setOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-600 transition hover:bg-orange-500 hover:text-white"
                >
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => toggleMaintenance(company)}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    company.maintenanceMode
                      ? 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white'
                      : 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white'
                  }`}
                >
                  <Wrench className="h-4 w-4" />

                  {company.maintenanceMode
                    ? 'Desactivar mantención'
                    : 'Modo mantención'}
                </button>

                <a
                  href={`/admin?companyId=${company.id}&companyName=${encodeURIComponent(
                    company.name || ''
                  )}&fromSuperAdmin=1`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-medium text-orange-600 transition hover:bg-orange-500 hover:text-white"
                >
                  Administrar
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-xl rounded-t-[30px] bg-white p-5 shadow-2xl sm:rounded-[30px] sm:p-7">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                  Bitrineo
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  {selectedCompany ? 'Editar empresa' : 'Nueva empresa'}
                </h2>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={createCompany} className="space-y-4">
              <input
                required
                placeholder="Nombre empresa"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              />

              <input
                placeholder="Correo"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              />

              <input
                placeholder="Teléfono"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              />

              <input
                placeholder="Responsable"
                value={form.responsible_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    responsible_name: e.target.value,
                  })
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              />

              <textarea
                placeholder="Dirección"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="min-h-[100px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              />

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-orange-500 py-3 text-sm font-medium text-white"
              >
                {saving
                  ? selectedCompany
                    ? 'Guardando...'
                    : 'Creando...'
                  : selectedCompany
                    ? 'Guardar cambios'
                    : 'Crear empresa'}
              </button>
            </form>
          </div>
        </div>
      )}

      {openBranding && (
        <div className="fixed inset-0 z-[220] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-[30px] bg-white p-5 shadow-2xl sm:rounded-[30px] sm:p-7">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-pink-500">
                  Identidad visual
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Branding de tienda
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedCompany?.name}
                </p>
              </div>

              <button
                onClick={() => setOpenBranding(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 transition hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={saveBranding}
              className="grid gap-6 lg:grid-cols-[1fr_320px]"
            >
              <div className="space-y-4">
                <input
                  placeholder="Nombre visible de la tienda"
                  value={brandingForm.display_name}
                  onChange={(e) =>
                    setBrandingForm({
                      ...brandingForm,
                      display_name: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-pink-300 focus:bg-white"
                />

                <input
                  placeholder="Lema o frase comercial"
                  value={brandingForm.slogan}
                  onChange={(e) =>
                    setBrandingForm({
                      ...brandingForm,
                      slogan: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-pink-300 focus:bg-white"
                />

                <input
                  placeholder="URL del logo"
                  value={brandingForm.logo_url}
                  onChange={(e) =>
                    setBrandingForm({
                      ...brandingForm,
                      logo_url: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-pink-300 focus:bg-white"
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-medium text-slate-600">
                      Color principal
                    </span>

                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                      <div
                        className="h-10 w-10 shrink-0 rounded-xl border border-white shadow-sm"
                        style={{
                          backgroundColor: brandingForm.primary_color,
                        }}
                      />

                      <input
                        type="text"
                        value={brandingForm.primary_color}
                        onChange={(e) =>
                          setBrandingForm({
                            ...brandingForm,
                            primary_color: e.target.value,
                          })
                        }
                        className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none"
                      />

                      <input
                        type="color"
                        value={brandingForm.primary_color}
                        onChange={(e) =>
                          setBrandingForm({
                            ...brandingForm,
                            primary_color: e.target.value,
                          })
                        }
                        className="h-10 w-10 cursor-pointer rounded-xl border-0 bg-transparent p-0"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-medium text-slate-600">
                      Color secundario
                    </span>

                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                      <div
                        className="h-10 w-10 shrink-0 rounded-xl border border-white shadow-sm"
                        style={{
                          backgroundColor: brandingForm.secondary_color,
                        }}
                      />

                      <input
                        type="text"
                        value={brandingForm.secondary_color}
                        onChange={(e) =>
                          setBrandingForm({
                            ...brandingForm,
                            secondary_color: e.target.value,
                          })
                        }
                        className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none"
                      />

                      <input
                        type="color"
                        value={brandingForm.secondary_color}
                        onChange={(e) =>
                          setBrandingForm({
                            ...brandingForm,
                            secondary_color: e.target.value,
                          })
                        }
                        className="h-10 w-10 cursor-pointer rounded-xl border-0 bg-transparent p-0"
                      />
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={savingBranding}
                  className="w-full rounded-2xl bg-pink-500 py-3 text-sm font-semibold text-white transition hover:bg-pink-600 disabled:opacity-60"
                >
                  {savingBranding ? 'Guardando branding...' : 'Guardar branding'}
                </button>
              </div>

              <aside
                className="rounded-[28px] border border-slate-100 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
                style={{
                  background: `linear-gradient(160deg, ${brandingForm.secondary_color || '#FFF1F7'}, #ffffff)`,
                }}
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Vista previa
                </p>

                <div className="overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-sm">
                  <div
                    className="flex items-center gap-3 px-4 py-4"
                    style={{
                      backgroundColor: brandingForm.secondary_color || '#FFF1F7',
                    }}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm">
                      {brandingForm.logo_url ? (
                        <img
                          src={brandingForm.logo_url}
                          alt="Logo tienda"
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <Building2
                          className="h-6 w-6"
                          style={{
                            color: brandingForm.primary_color || '#E83E8C',
                          }}
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-950">
                        {brandingForm.display_name || selectedCompany?.name}
                      </h3>

                      <p className="truncate text-xs text-slate-500">
                        {brandingForm.slogan || 'Tu tienda personalizada'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-4 h-28 rounded-2xl bg-slate-100" />

                    <div className="h-3 w-3/4 rounded-full bg-slate-200" />
                    <div className="mt-2 h-3 w-1/2 rounded-full bg-slate-100" />

                    <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                      <div className="mb-3 h-24 rounded-xl bg-slate-100" />

                      <div className="h-3 w-3/4 rounded-full bg-slate-200" />
                      <div className="mt-2 h-3 w-1/2 rounded-full bg-slate-100" />

                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <p
                            className="text-sm font-semibold"
                            style={{
                              color: brandingForm.primary_color || '#E83E8C',
                            }}
                          >
                            $3.990
                          </p>

                          <p className="text-[10px] text-slate-400">
                            producto ejemplo
                          </p>
                        </div>

                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-white"
                          style={{
                            backgroundColor:
                              brandingForm.primary_color || '#E83E8C',
                          }}
                        >
                          +
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-1 text-[11px] text-slate-400">
                  Powered by
                  <span className="font-semibold text-orange-500">
                    Bitrineo
                  </span>
                </div>
              </aside>
            </form>
          </div>
        </div>
      )}

      {openAdmin && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-xl rounded-t-[30px] bg-white p-5 shadow-2xl sm:rounded-[30px] sm:p-7">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                  Bitrineo
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Nuevo administrador
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedCompany?.name}
                </p>
              </div>

              <button
                onClick={() => setOpenAdmin(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={createAdmin} className="space-y-4">
              <input
                required
                placeholder="Nombre administrador"
                value={adminForm.name}
                onChange={(e) =>
                  setAdminForm({
                    ...adminForm,
                    name: e.target.value,
                  })
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              />

              <input
                required
                type="email"
                placeholder="Correo"
                value={adminForm.email}
                onChange={(e) =>
                  setAdminForm({
                    ...adminForm,
                    email: e.target.value,
                  })
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              />

              <input
                placeholder="Teléfono"
                value={adminForm.phone}
                onChange={(e) =>
                  setAdminForm({
                    ...adminForm,
                    phone: e.target.value,
                  })
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              />

              <input
                required
                type="password"
                placeholder="Contraseña temporal"
                value={adminForm.password}
                onChange={(e) =>
                  setAdminForm({
                    ...adminForm,
                    password: e.target.value,
                  })
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
              />

              <button
                type="submit"
                disabled={savingAdmin}
                className="w-full rounded-2xl bg-orange-500 py-3 text-sm font-medium text-white"
              >
                {savingAdmin
                  ? 'Creando administrador...'
                  : 'Crear administrador'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}