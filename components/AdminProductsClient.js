'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Pencil,
  Eye,
  EyeOff,
  ImageIcon,
  X,
} from 'lucide-react';

import MobileToast from '@/components/MobileToast';
import AdminShell from '@/components/AdminShell';

export default function AdminProductsClient({
  products: initialProducts,
  categories = [],
  user,
  companyId,
}) {
  const [products, setProducts] = useState(initialProducts || []);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [editSelectedImage, setEditSelectedImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');

  const [editingProduct, setEditingProduct] = useState(null);

  const [toast, setToast] = useState({
    open: false,
    message: '',
    type: 'success',
  });

  const normalizedCategories = useMemo(
    () =>
      (categories || []).map((category) => ({
        id: category.id,
        label: category.label || category.name,
      })),
    [categories]
  );

  const getDefaultCategoryId = () => normalizedCategories?.[0]?.id || '';

  const emptyForm = {
    name: '',
    description: '',
    price: '',
    unitType: 'KG',
    categoryId: getDefaultCategoryId(),
    imageUrl: '',
    isActive: true,
  };

  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => {
    if (!form.categoryId && normalizedCategories.length > 0) {
      setForm((current) => ({
        ...current,
        categoryId: normalizedCategories[0].id,
      }));
    }
  }, [normalizedCategories, form.categoryId]);

  useEffect(() => {
    if (!toast.open) return;

    const timer = setTimeout(() => {
      setToast((current) => ({ ...current, open: false }));
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.open]);

  const showToast = (message, type = 'success') => {
    setToast({
      open: true,
      message,
      type,
    });
  };

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesName =
        !term ||
        product.name?.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term);

      const matchesCategory =
        categoryFilter === 'all' || product.categoryId === categoryFilter;

      return matchesName && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      showToast('Solo se permiten imágenes JPG, PNG o WEBP', 'error');
      return;
    }

    if (file.size > maxSize) {
      showToast('La imagen no debe superar 5MB', 'error');
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      showToast('Solo se permiten imágenes JPG, PNG o WEBP', 'error');
      return;
    }

    if (file.size > maxSize) {
      showToast('La imagen no debe superar 5MB', 'error');
      return;
    }

    setEditSelectedImage(file);
    setEditImagePreview(URL.createObjectURL(file));
  };

  const uploadImageFile = async (file) => {
    if (!file) return '';

    const formData = new FormData();
    formData.append('file', file);

    const uploadUrl = companyId
      ? `/api/admin/upload-product-image?companyId=${encodeURIComponent(companyId)}`
      : '/api/admin/upload-product-image';

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'No se pudo subir la imagen');
    }

    return data.imageUrl;
  };

  const resetCreateForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      unitType: 'KG',
      categoryId: getDefaultCategoryId(),
      imageUrl: '',
      isActive: true,
    });
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    resetCreateForm();
    setSelectedImage(null);
    setImagePreview('');
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    setEditSelectedImage(null);
    setEditImagePreview('');
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name.trim() || !form.price || !form.unitType || !form.categoryId) {
      showToast('Nombre, precio, unidad y categoría son obligatorios', 'error');
      return;
    }

    try {
      setSaving(true);

      let finalImageUrl = '';

      if (selectedImage) {
        setUploadingImage(true);
        finalImageUrl = await uploadImageFile(selectedImage);
      }

      const productUrl = companyId
        ? `/api/admin/products?companyId=${encodeURIComponent(companyId)}`
        : '/api/admin/products';

      const res = await fetch(productUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          imageUrl: finalImageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear producto');
      }

      setProducts([data.product, ...products]);
      closeCreateModal();
      showToast('Producto creado correctamente', 'success');
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Error de conexión', 'error');
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  }

  async function toggleProduct(productId, currentState) {
    try {
      const patchUrl = companyId
        ? `/api/admin/products/${productId}?companyId=${encodeURIComponent(companyId)}`
        : `/api/admin/products/${productId}`;

      const res = await fetch(patchUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !currentState,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Error al actualizar producto', 'error');
        return;
      }

      setProducts((current) =>
        current.map((p) =>
          p.id === productId ? { ...p, isActive: data.product.isActive } : p
        )
      );
    } catch (error) {
      console.error(error);
      showToast('Error de conexión', 'error');
    }
  }

  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      unitType: product.unitType || 'KG',
      categoryId: product.categoryId || getDefaultCategoryId(),
      imageUrl: product.imageUrl || '',
      isActive: product.isActive ?? true,
    });
    setEditSelectedImage(null);
    setEditImagePreview(product.imageUrl || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    if (
      !editForm.name.trim() ||
      !editForm.price ||
      !editForm.unitType ||
      !editForm.categoryId
    ) {
      showToast('Nombre, precio, unidad y categoría son obligatorios', 'error');
      return;
    }

    try {
      setIsSavingEdit(true);

      let finalImageUrl = editForm.imageUrl || '';

      if (editSelectedImage) {
        setUploadingEditImage(true);
        finalImageUrl = await uploadImageFile(editSelectedImage);
      }

      const updateUrl = companyId
        ? `/api/admin/products/${editingProduct.id}?companyId=${encodeURIComponent(companyId)}`
        : `/api/admin/products/${editingProduct.id}`;

      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          price: Number(editForm.price),
          unitType: editForm.unitType,
          categoryId: editForm.categoryId,
          imageUrl: finalImageUrl,
          isActive: editForm.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar producto');
      }

      setProducts((current) =>
        current.map((p) =>
          p.id === editingProduct.id
            ? {
              ...p,
              name: editForm.name,
              description: editForm.description,
              price: Number(editForm.price),
              unitType: editForm.unitType,
              categoryId: editForm.categoryId,
              imageUrl: finalImageUrl,
              isActive: editForm.isActive,
            }
            : p
        )
      );

      closeEditModal();
      showToast('Producto actualizado correctamente', 'success');
    } catch (error) {
      console.error(error);
      showToast(error.message || 'No se pudo actualizar el producto', 'error');
    } finally {
      setIsSavingEdit(false);
      setUploadingEditImage(false);
    }
  };

  return (
    <AdminShell>
      <MobileToast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />

      <div className="space-y-6">
        <section className="rounded-[28px] border border-orange-100 bg-white px-5 py-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)] md:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                Administración
              </p>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                Productos
              </h1>

              <p className="mt-1 text-sm font-normal leading-relaxed text-slate-500">
                Gestiona tu catálogo, busca productos y controla qué se muestra en tu vitrina digital.
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ff5a00] px-5 py-3 text-sm font-medium text-white shadow-[0_10px_24px_rgba(255,90,0,0.22)] transition hover:bg-[#f04f00] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Crear producto
            </button>
          </div>
        </section>

        <section className="rounded-[28px] border border-orange-100 bg-white p-4 shadow-[0_10px_35px_rgba(15,23,42,0.04)] md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o descripción..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal text-slate-700 outline-none transition focus:border-orange-300 focus:bg-white"
            >
              <option value="all">Todas las categorías</option>
              {normalizedCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="rounded-[28px] border border-orange-100 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 md:px-6">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Listado de productos
              </h2>

              <p className="text-sm font-normal text-slate-500">
                {filteredProducts.length} producto(s) encontrados
              </p>
            </div>

            <div className="hidden rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600 sm:block">
              Bitrineo
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredProducts.map((product) => {
              const categoryLabel =
                normalizedCategories.find((c) => c.id === product.categoryId)
                  ?.label ||
                product.categoryId ||
                'Sin categoría';

              return (
                <article
                  key={product.id}
                  className="group flex flex-col gap-4 px-5 py-4 transition hover:bg-orange-50/35 md:flex-row md:items-center md:justify-between md:px-6"
                >
                  <div className="flex min-w-0 gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-[15px] font-medium text-slate-950">
                          {product.name}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${product.isActive
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-red-50 text-red-500'
                            }`}
                        >
                          {product.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-1 text-sm font-normal text-slate-500">
                        {product.description || 'Sin descripción'}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-normal text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                          ${Number(product.price || 0).toLocaleString('es-CL')}
                        </span>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1">
                          {product.unitType}
                        </span>

                        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-orange-600">
                          {categoryLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => openEditModal(product)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:border-orange-200 hover:text-orange-600"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </button>

                    <button
                      onClick={() => toggleProduct(product.id, product.isActive)}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-medium transition ${product.isActive
                        ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                    >
                      {product.isActive ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          Ocultar
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          Mostrar
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <Search className="h-6 w-6" />
                </div>

                <p className="text-sm font-medium text-slate-800">
                  No encontramos productos
                </p>

                <p className="mt-1 text-sm font-normal text-slate-500">
                  Intenta buscar con otro nombre o cambia la categoría.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {isCreateModalOpen && (
        <ProductModal
          title="Crear producto"
          subtitle="Agrega un nuevo producto a tu catálogo"
          form={form}
          setForm={setForm}
          categories={normalizedCategories}
          imagePreview={imagePreview}
          uploadingImage={uploadingImage}
          saving={saving}
          onImageChange={handleImageChange}
          onClose={closeCreateModal}
          onSubmit={handleSubmit}
          submitText="Crear producto"
        />
      )}

      {isEditModalOpen && (
        <ProductModal
          title="Editar producto"
          subtitle="Actualiza la información del producto"
          form={editForm}
          setForm={setEditForm}
          categories={normalizedCategories}
          imagePreview={editImagePreview}
          uploadingImage={uploadingEditImage}
          saving={isSavingEdit}
          onImageChange={handleEditImageChange}
          onClose={closeEditModal}
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateProduct();
          }}
          submitText="Guardar cambios"
        />
      )}
    </AdminShell>
  );
}

function ProductModal({
  title,
  subtitle,
  form,
  setForm,
  categories = [],
  imagePreview,
  uploadingImage,
  saving,
  onImageChange,
  onClose,
  onSubmit,
  submitText,
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[30px] bg-white p-5 shadow-2xl sm:rounded-[30px] sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
              Bitrineo
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {title}
            </h2>

            <p className="mt-1 text-sm font-normal text-slate-500">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-orange-50 hover:text-orange-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none transition focus:border-orange-300 focus:bg-white"
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <textarea
            className="min-h-[100px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none transition focus:border-orange-300 focus:bg-white"
            placeholder="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none transition focus:border-orange-300 focus:bg-white"
              placeholder="Precio"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none transition focus:border-orange-300 focus:bg-white"
              value={form.unitType}
              onChange={(e) => setForm({ ...form, unitType: e.target.value })}
            >
              <option value="KG">KG</option>
              <option value="UNIT">UNIT</option>
              <option value="BUNDLE">BUNDLE</option>
            </select>

            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-normal outline-none transition focus:border-orange-300 focus:bg-white"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              disabled={categories.length === 0}
            >
              {categories.length === 0 ? (
                <option value="">Sin categorías disponibles</option>
              ) : (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/40 p-4">
            <div className="mb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-orange-500" />
              <p className="text-sm font-medium text-slate-700">
                Imagen del producto
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="cursor-pointer rounded-xl bg-orange-500 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-orange-600">
                Tomar foto
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={onImageChange}
                  className="hidden"
                />
              </label>

              <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-600 transition hover:border-orange-200 hover:text-orange-600">
                Elegir imagen
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Vista previa"
                className="mt-4 h-40 w-full rounded-2xl object-cover"
              />
            )}

            {uploadingImage && (
              <p className="mt-3 text-sm font-normal text-slate-500">
                Subiendo imagen...
              </p>
            )}
          </div>

          <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">
                Producto activo
              </p>

              <p className="text-xs font-normal text-slate-500">
                Visible en el catálogo
              </p>
            </div>

            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-5 w-5 accent-orange-500"
            />
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving || uploadingImage || categories.length === 0}
              className="flex-1 rounded-2xl bg-orange-500 py-3 text-sm font-medium text-white shadow-[0_10px_24px_rgba(255,90,0,0.22)] transition hover:bg-orange-600 disabled:opacity-60"
            >
              {saving || uploadingImage ? 'Guardando...' : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}