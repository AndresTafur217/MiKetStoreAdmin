import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { getPurchasingData, savePurchasingData } from "./data/adminData";
import { categories as catalogCategories, getCatalogChangeEvent, products as catalogProducts, saveCatalogCategories, saveCatalogProducts } from "./data/catalog";

export function Categories({ compact = false }) {
  const [categories, setCategories] = useState(() => catalogCategories);
  const [products, setProducts] = useState(() => catalogProducts);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", icon: "" });

  useEffect(() => {
    const refreshCatalog = () => {
      setCategories(catalogCategories);
      setProducts(catalogProducts);
    };
    window.addEventListener(getCatalogChangeEvent(), refreshCatalog);
    return () => window.removeEventListener(getCatalogChangeEvent(), refreshCatalog);
  }, []);

  const openEditor = (category = null) => {
    setEditingCategory(category);
    setForm(category ? { nombre: category.nombre, descripcion: category.descripcion || "", icon: category.icon || "" } : { nombre: "", descripcion: "", icon: "" });
    setEditorOpen(true);
  };

  const saveCategory = (event) => {
    event.preventDefault();
    const category = {
      ...editingCategory,
      id: editingCategory?.id || Math.max(0, ...categories.map((item) => Number(item.id) || 0)) + 1,
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      icon: form.icon.trim(),
    };
    const nextCategories = editingCategory
      ? categories.map((item) => item.id === category.id ? category : item)
      : [...categories, category];
    const nextProducts = catalogProducts.map((product) => ({
      ...product,
      categorias: (product.categorias || []).map((item) => item.id === category.id ? { ...item, nombre: category.nombre } : item),
    }));
    saveCatalogProducts(nextProducts);
    saveCatalogCategories(nextCategories);
    setProducts(nextProducts);
    setCategories(nextCategories);
    setEditorOpen(false);
  };

  const deleteCategory = (category) => {
    if (!window.confirm(`¿Eliminar la categoría ${category.nombre}? Los productos conservarán sus demás categorías.`)) return;
    const nextCategories = categories.filter((item) => item.id !== category.id);
    const nextProducts = catalogProducts.map((product) => ({
      ...product,
      categorias: (product.categorias || []).filter((item) => item.id !== category.id),
    }));
    const purchasingData = getPurchasingData();
    saveCatalogProducts(nextProducts);
    saveCatalogCategories(nextCategories);
    savePurchasingData({
      ...purchasingData,
      supplierCategories: purchasingData.supplierCategories.filter((relation) => relation.id_categoria !== category.id),
    });
    setProducts(nextProducts);
    setCategories(nextCategories);
  };

  return (
    <section className={compact ? "w-full overflow-x-auto scrollbar flex flex-col gap-5" : "mx-auto w-full flex flex-col gap-5"}>
      <section className="w-full h-20 p-2.5 overflow-hidden border shadow-md bg-surface-alt border-border-gray rounded-3xl flex flex-row items-center">
        <article className="rounded-1xl size-[56px] flex justify-center items-center shadow-md bg-accent">
          <svg className="size-7">
            <use xlinkHref="/sprite.svg#categories" />
          </svg>
        </article>
        <span className="flex-1 px-2 font-bold transition-all duration-300">Categorias</span>
        <button type="button" onClick={() => openEditor()}
          className="bg-store-items px-4 py-2 font-semibold text-white  bg-primary rounded-xl shadow-md transition-all duration-300 
            hover:scale-105 hover:bg-primary/60">Agregar categoría</button>
      </section>
      <div className={compact ? "flex gap-3 min-w-max pb-2" : "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3"}>
        {categories.map((category) => {
          const productCount = products.filter((product) => (product.categorias || []).some((item) => item.id === category.id)).length;

          return (
            <article key={category.id} className={`flex flex-col justify-between border border-gray-300 bg-white/70 rounded-2xl transition-all duration-300 
              hover:scale-105 ${compact ? "w-52 min-h-24" : "min-h-32"}`}>
              <Link to={`/products?category=${category.id}`} className="flex flex-1 flex-col p-4 transition-colors hover:bg-store-items2">
                <span className="font-semibold">{category.nombre}</span>
                <span className="mt-2 text-sm text-gray-600">{category.descripcion}</span>
                <span className="mt-3 text-xs text-gray-500">{productCount} {productCount === 1 ? "producto" : "productos"}</span>
              </Link>
              {!compact &&
                <footer className="flex justify-end gap-3 border-t border-gray-200 px-4 py-2 text-sm">
                  <button type="button" onClick={() => openEditor(category)} className="underline transition-all duration-300 
                    hover:scale-105 rounded-full hover:bg-black/50">
                    <svg className="size-7">
                      <use xlinkHref="/sprite.svg#edit" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => deleteCategory(category)} className="text-red-700 underline transition-all duration-300 
                    hover:scale-105 rounded-full hover:bg-red-700/50">
                    <svg className="size-7">
                      <use xlinkHref="/sprite.svg#delete" />
                    </svg>
                  </button>
                </footer>
              }
            </article>
          );
        })}
      </div>
      {editorOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4"
          onClick={(event) => { if (event.target === event.currentTarget) setEditorOpen(false); }}>
          <form onSubmit={saveCategory} className="w-full max-w-lg space-y-4 bg-white p-6 shadow-2xl rounded-3xl">
            <h2 className="text-xl font-bold">{editingCategory ? "Editar categoría" : "Agregar categoría"}</h2>
            <label className="block text-sm font-medium">Nombre
              <input required value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })}
                className="mt-1 w-full border border-gray-300 p-2" />
            </label>
            <label className="block text-sm font-medium">Descripción
              <textarea rows="3" value={form.descripcion} onChange={(event) => setForm({ ...form, descripcion: event.target.value })}
                className="mt-1 w-full border border-gray-300 p-2" />
            </label>
            <label className="block text-sm font-medium">Identificador de icono
              <input value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })}
                className="mt-1 w-full border border-gray-300 p-2" />
            </label>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setEditorOpen(false)} className="border border-gray-400 px-4 py-2 rounded-xl 
                hover:shadow-md transition-all duration-300 hover:scale-105 hover:bg-primary-dark/60 hover:text-white">Cancelar</button>
              <button type="submit" className="bg-store-items px-4 py-2 font-semibold text-white  bg-primary rounded-xl shadow-md 
                transition-all duration-300 hover:scale-105 hover:bg-primary/60">Guardar categoría</button>
            </div>
          </form>
        </div>, document.body
      )}
    </section>
  );
}