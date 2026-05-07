'use client';

import { useState, useEffect  } from 'react';
import { useRouter } from 'next/navigation';
import MobileToast from '@/components/MobileToast';
import AdminShell from '@/components/AdminShell';


export default function AdminProductsClient({ products: initialProducts, user }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    unitType: 'KG',
    imageUrl: '',
    isActive: true,
  });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);


  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    unitType: 'KG',
    imageUrl: '',
    isActive: true,
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [editSelectedImage, setEditSelectedImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [uploadingEditImage, setUploadingEditImage] = useState(false);


  const [toast, setToast] = useState({
    open: false,
    message: '',
    type: 'success',
  });
  



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

    const response = await fetch('/api/admin/upload-product-image', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'No se pudo subir la imagen');
    }

    return data.imageUrl;
  };



  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      let finalImageUrl = '';

      if (!form.name.trim() || !form.price || !form.unitType) {
        showToast('Nombre, precio y unidad son obligatorios', 'error');
        setSaving(false);
        return;
      }

  

      if (selectedImage) {
        setUploadingImage(true);
        finalImageUrl = await uploadImageFile(selectedImage);
        setUploadingImage(false);
      }

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          imageUrl: finalImageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Error al crear producto');
        setSaving(false);
        return;
      }

      setProducts([data.product, ...products]);
      setForm({
        name: '',
        description: '',
        price: '',
        unitType: 'KG',
        imageUrl: '',
        isActive: true,
      });
      setSelectedImage(null);
      setImagePreview('');
      setMessage('Producto creado correctamente');
      showToast('Producto creado correctamente', 'success');
    } catch (error) {
      console.error(error);
      setMessage('Error de conexión');
      showToast(error.message || 'Error de conexión', 'error');
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  }




  async function toggleProduct(productId, currentState) {
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
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

  // const openEditModal = (product) => {
  //   setEditingProduct(product);
  //   setEditForm({
  //     name: product.name || '',
  //     description: product.description || '',
  //     price: product.price || '',
  //     unitType: product.unitType || 'KG',
  //     imageUrl: product.imageUrl || '',
  //     isActive: product.isActive ?? true,
  //   });
  //   setIsEditModalOpen(true);
  // };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      unitType: product.unitType || 'KG',
      imageUrl: product.imageUrl || '',
      isActive: product.isActive ?? true,
    });
    setEditSelectedImage(null);
    setEditImagePreview(product.imageUrl || '');
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };


  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      setIsSavingEdit(true);

      let finalImageUrl = editForm.imageUrl || '';

      if (editSelectedImage) {
        setUploadingEditImage(true);
        finalImageUrl = await uploadImageFile(editSelectedImage);
        setUploadingEditImage(false);
      }

      const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          price: Number(editForm.price),
          unitType: editForm.unitType,
          imageUrl: finalImageUrl,
          isActive: editForm.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar producto');
      }

      setToast({
        open: true,
        message: 'Producto actualizado correctamente',
        type: 'success',
      });
      setIsEditModalOpen(false);
      setEditingProduct(null);
      setEditSelectedImage(null);
      setEditImagePreview('');

      setProducts((current) =>
        current.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: editForm.name,
                description: editForm.description,
                price: Number(editForm.price),
                unitType: editForm.unitType,
                imageUrl: finalImageUrl,
                isActive: editForm.isActive,
              }
            : p
        )
      );
    } catch (error) {
      console.error(error);
      setToast({
        open: true,
        message: error.message || 'No se pudo actualizar el producto',
        type: 'error',
      });
    } finally {
      setIsSavingEdit(false);

      if (!editForm.name.trim() || !editForm.price || !editForm.unitType) {
        showToast('Nombre, precio y unidad son obligatorios', 'error');
        setIsSavingEdit(false);
        return;
      }
      setUploadingEditImage(false);
    }
  };

  

  return (
    <AdminShell>
    <main className="mx-auto max-w-6xl px-4 py-8">

      <MobileToast
      open={toast.open}
      message={toast.message}
      type={toast.type}
      onClose={() => setToast((current) => ({ ...current, open: false }))}
    />

      <div className="mb-6 rounded-2xl bg-white p-6 shadow">
        <h1 className="text-3xl font-bold text-green-800">Panel Administrador</h1>
        <p className="text-slate-600">Hola {user.name}, aquí puedes administrar productos.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Administración de Productos</h2>

        <button
          onClick={() => router.push('/catalog')}
          style={{
            padding: '8px 14px',
            backgroundColor: '#f5f5f5',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          ← Volver al Catálogo
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold text-green-800">Crear producto</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full rounded-lg border p-2"
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <textarea
              className="w-full rounded-lg border p-2"
              placeholder="Descripción"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <input
              className="w-full rounded-lg border p-2"
              placeholder="Precio"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <select
              className="w-full rounded-lg border p-2"
              value={form.unitType}
              onChange={(e) => setForm({ ...form, unitType: e.target.value })}
            >
              <option value="KG">KG</option>
              <option value="UNIT">UNIT</option>
              <option value="BUNDLE">BUNDLE</option>
            </select>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Imagen del producto
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="cursor-pointer rounded-lg bg-sky-500 px-4 py-2 text-center text-white hover:bg-sky-600">
                  Tomar foto
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                <label className="cursor-pointer rounded-lg bg-slate-600 px-4 py-2 text-center text-white hover:bg-slate-700">
                  Elegir imagen
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="h-32 w-32 rounded-lg border object-cover"
                  />
                </div>
              )}

              {uploadingImage && (
                <p className="text-sm text-slate-500">Subiendo imagen...</p>
              )}
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Producto activo
            </label>

           <button
            className="w-full rounded-lg bg-green-700 p-2 text-white disabled:opacity-60"
            type="submit"
            disabled={saving || uploadingImage}
          >
            {saving || uploadingImage ? 'Guardando...' : 'Crear producto'}
          </button>
          </form>

          {message ? <p className="mt-4 text-sm font-medium">{message}</p> : null}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold text-green-800">Listado de productos</h2>

          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">{product.name}</p>
                    <p className="text-sm text-slate-600">{product.description}</p>
                    <p className="mt-2 font-medium">${product.price}</p>
                    <p className="text-sm text-slate-500">Unidad: {product.unitType}</p>
                    <p className="text-sm">
                      Estado:{' '}
                      <span className={product.isActive ? 'text-green-700' : 'text-red-600'}>
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </p>
                  </div>

                  {/* <button
                    onClick={() => toggleProduct(product.id, product.isActive)}
                    className={`rounded-lg px-4 py-2 text-white ${
                      product.isActive ? 'bg-red-600' : 'bg-green-700'
                    }`}
                  >
                    {product.isActive ? 'Dar de baja' : 'Habilitar'}
                  </button> */}


                 {/* <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="rounded bg-blue-600 px-3 py-1 text-white"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => toggleProduct(product.id, product.isActive)}
                      className={`rounded px-3 py-1 text-white ${
                        product.isActive ? 'bg-red-600' : 'bg-green-700'
                      }`}
                    >
                      {product.isActive ? 'Deshabilitar' : 'Habilitar'}
                    </button>
                  </div> */}

                 <div className="flex flex-col gap-2 sm:flex-row">
  <button
    onClick={() => openEditModal(product)}
    className="rounded bg-sky-500 px-3 py-1 text-white hover:bg-sky-600"
  >
    Editar
  </button>

  <button
    onClick={() => toggleProduct(product.id, product.isActive)}
    className={`rounded px-3 py-1 text-white ${
      product.isActive
        ? 'bg-orange-500 hover:bg-orange-600'
        : 'bg-green-600 hover:bg-green-700'
    }`}
  >
    {product.isActive ? 'Deshabilitar' : 'Habilitar'}
  </button>
</div>




                </div>
              </div>
            ))}
          </div>
        </section>

        {isEditModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-xl">
      <h2 className="mb-4 text-lg font-bold">Editar producto</h2>

      <div className="space-y-3">
        <input
          type="text"
          name="name"
          value={editForm.name}
          onChange={handleEditChange}
          placeholder="Nombre"
          className="w-full border rounded px-3 py-2"
        />

        <textarea
          name="description"
          value={editForm.description}
          onChange={handleEditChange}
          placeholder="Descripción"
          className="w-full border rounded px-3 py-2"
        />  

        <input
          type="number"
          name="price"
          value={editForm.price}
          onChange={handleEditChange}
          placeholder="Precio"
          className="w-full border rounded px-3 py-2"
        />

        <select
          name="unitType"
          value={editForm.unitType}
          onChange={handleEditChange}
          className="w-full rounded border px-3 py-2"
        >
          <option value="KG">KG</option>
          <option value="UNIT">UNIT</option>
          <option value="BUNDLE">BUNDLE</option>
        </select>

       <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Imagen del producto
          </label>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="cursor-pointer rounded-lg bg-sky-500 px-4 py-2 text-center text-white hover:bg-sky-600">
              Tomar foto
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleEditImageChange}
                className="hidden"
              />
            </label>

            <label className="cursor-pointer rounded-lg bg-slate-600 px-4 py-2 text-center text-white hover:bg-slate-700">
              Elegir imagen
              <input
                type="file"
                accept="image/*"
                onChange={handleEditImageChange}
                className="hidden"
              />
            </label>
          </div>

          {editImagePreview && (
            <div className="mt-2">
              <img
                src={editImagePreview}
                alt="Vista previa"
                className="h-32 w-32 rounded-lg border object-cover"
              />
            </div>
          )}

          {uploadingEditImage && (
            <p className="text-sm text-slate-500">Subiendo imagen...</p>
          )}
        </div>

  

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={editForm.isActive}
            onChange={handleEditChange}
          />
          Activo
        </label>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => {
            setIsEditModalOpen(false);
            setEditingProduct(null);
            setEditSelectedImage(null);
            setEditImagePreview('');
          }}
          className="px-4 py-2 rounded border"
        >
          Cancelar
        </button>

        <button
          onClick={handleUpdateProduct}
          disabled={isSavingEdit || uploadingEditImage}
          className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-60"
        >
          {isSavingEdit || uploadingEditImage ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </main>
    </AdminShell>
  );
}