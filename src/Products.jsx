import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getAdminDataChangeEvent, getAdminSales, getPurchasingData } from "./data/adminData";
import { categories as catalogCategories, getCatalogChangeEvent, products as catalogProducts, saveCatalogProducts } from "./data/catalog";
import { SkeletonImage } from "./Skeletons";

export function Products() {
  const [products, setProducts] = useState(() => catalogProducts);
  const [categories, setCategories] = useState(() => catalogCategories);
  const [suppliers, setSuppliers] = useState(() => getPurchasingData().suppliers);
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [productEditorOpen, setProductEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ nombre: "", descripcion: "", precio: "", descuento: "0", stock: "0", estado: "disponible", proveedor: "", supplierId: "", categoriaId: "", especificaciones: "", imagen: "" });

  const [filters, setFilters] = useState({
    selectedCategories: searchParams.has("category") ? [Number(searchParams.get("category"))] : [],
    selectedSpecs: [],
    selectedVendedor: "",
    minPrice: "",
    maxPrice: "",
    inStock: false,
    estado: ""
  });

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setSelectedImageIndex(0);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  const openProductEditor = (product = null) => {
    setEditingProduct(product);
    setProductForm(product ? {
      nombre: product.nombre,
      descripcion: product.descripcion || "",
      precio: String(product.precio),
      descuento: String(product.descuento || 0),
      stock: String(product.stock),
      estado: product.estado || "disponible",
      proveedor: product.proveedor || "",
      supplierId: product.id_proveedor || "",
      categoriaId: String(product.categorias?.[0]?.id || categories[0]?.id || ""),
      especificaciones: product.especificaciones?.map((item) => item.nombre).join("\n") || "",
      imagen: product.imagenes?.[0]?.url || "",
    } : {
      nombre: "", descripcion: "", precio: "", descuento: "0", stock: "0", estado: "disponible",
      proveedor: "", supplierId: "", categoriaId: String(categories[0]?.id || ""), especificaciones: "", imagen: "",
    });
    setProductEditorOpen(true);
  };

  const saveProduct = (event) => {
    event.preventDefault();
    const category = categories.find((item) => item.id === Number(productForm.categoriaId));
    const supplier = suppliers.find((item) => item.id === productForm.supplierId);
    const product = {
      ...editingProduct,
      id: editingProduct?.id || Math.max(0, ...products.map((item) => Number(item.id) || 0)) + 1,
      nombre: productForm.nombre.trim(),
      descripcion: productForm.descripcion.trim(),
      precio: Number(productForm.precio),
      descuento: Number(productForm.descuento) || 0,
      stock: Number(productForm.stock),
      estado: Number(productForm.stock) === 0 ? "agotado" : productForm.estado,
      proveedor: supplier?.nombre || productForm.proveedor.trim(),
      id_proveedor: supplier?.id || "",
      vendedor: editingProduct?.vendedor || "MiKet Store",
      categorias: category ? [{ id: category.id, nombre: category.nombre }] : [],
      especificaciones: productForm.especificaciones.split("\n").map((nombre) => nombre.trim()).filter(Boolean).map((nombre) => ({ nombre })),
      imagenes: productForm.imagen.trim() ? [{ url: productForm.imagen.trim(), alt: productForm.nombre.trim() }] : [],
      createdAt: editingProduct?.createdAt || new Date().toISOString().slice(0, 10),
    };
    const nextProducts = editingProduct
      ? products.map((item) => item.id === product.id ? product : item)
      : [product, ...products];
    saveCatalogProducts(nextProducts);
    setProducts(nextProducts);
    setProductEditorOpen(false);
  };

  const deleteProduct = (product) => {
    const purchasingData = getPurchasingData();
    const hasPendingPurchase = purchasingData.orderProducts.some((relation) => relation.id_producto === product.id
      && purchasingData.storeOrderDetails.some((detail) => detail.id === relation.id_detalle_pedido && detail.estado !== "Recibido"));
    const hasReceivedLot = purchasingData.lots.some((lot) => lot.id_producto === product.id);
    const hasSaleHistory = getAdminSales().some((sale) => sale.items.some((item) => item.productId === product.id));
    if (hasPendingPurchase || hasReceivedLot || hasSaleHistory) {
      window.alert("No se puede eliminar un producto relacionado con compras, lotes recibidos o ventas históricas.");
      return;
    }
    if (!window.confirm(`¿Eliminar ${product.nombre} del catálogo?`)) return;
    const nextProducts = products.filter((item) => item.id !== product.id);
    saveCatalogProducts(nextProducts);
    setProducts(nextProducts);
  };

  const [showFilters, setShowFilters] = useState(false);

  const productsPerPage = 20;
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";

  useEffect(() => {
    const refreshCatalog = () => {
      setProducts(catalogProducts);
      setCategories(catalogCategories);
    };
    window.addEventListener(getCatalogChangeEvent(), refreshCatalog);
    return () => window.removeEventListener(getCatalogChangeEvent(), refreshCatalog);
  }, []);

  useEffect(() => {
    const refreshSuppliers = () => setSuppliers(getPurchasingData().suppliers);
    window.addEventListener(getAdminDataChangeEvent(), refreshSuppliers);
    return () => window.removeEventListener(getAdminDataChangeEvent(), refreshSuppliers);
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeProductModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProduct]);

  // Obtener especificaciones y vendedores únicos de los productos
  const uniqueSpecs = useMemo(() => {
    const specs = new Set();
    products.forEach(product => {
      product.especificaciones?.forEach(spec => {
        specs.add(spec.nombre);
      });
    });
    return Array.from(specs).sort();
  }, [products]);

  // Aplicar filtros a los productos
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const searchTerm = (searchParams.get("search") || "").trim().toLocaleLowerCase();
      if (searchTerm) {
        const searchableText = [
          product.nombre,
          product.descripcion,
          product.proveedor,
          ...(product.categorias || []).map(category => category.nombre),
          ...(product.especificaciones || []).map(specification => specification.nombre),
        ].join(" ").toLocaleLowerCase();
        if (!searchableText.includes(searchTerm)) return false;
      }

      // Filtro por categorías
      if (filters.selectedCategories.length > 0) {
        const productCategoryIds = product.categorias?.map(category => category.id) || [];
        const hasSelectedCategory = filters.selectedCategories.some(categoryId =>
          productCategoryIds.includes(categoryId)
        );
        if (!hasSelectedCategory) return false;
      }

      // Filtro por especificaciones
      if (filters.selectedSpecs.length > 0) {
        const productSpecNames = product.especificaciones?.map(s => s.nombre) || [];
        const hasSelectedSpec = filters.selectedSpecs.some(specName =>
          productSpecNames.includes(specName)
        );
        if (!hasSelectedSpec) return false;
      }

      // Filtro por vendedor
      if (filters.selectedVendedor && product.vendedor !== filters.selectedVendedor) {
        return false;
      }

      // Filtro por rango de precio
      if (filters.minPrice && product.precio < parseFloat(filters.minPrice)) {
        return false;
      }
      if (filters.maxPrice && product.precio > parseFloat(filters.maxPrice)) {
        return false;
      }

      // Filtro por stock disponible
      if (filters.inStock && product.stock <= 0) {
        return false;
      }

      // Filtro por estado
      if (filters.estado && product.estado !== filters.estado) {
        return false;
      }

      return true;
    });
  }, [products, filters, searchParams]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1); // Resetear a la primera página cuando se aplican filtros
  };

  const clearFilters = () => {
    setFilters({
      selectedCategories: [],
      selectedSpecs: [],
      selectedVendedor: "",
      minPrice: "",
      maxPrice: "",
      inStock: false,
      estado: ""
    });
    setCurrentPage(1);
    if (searchParams.has("search")) navigate("/products", { replace: true });
  };

  const toggleArrayFilter = (filterType, value) => {
    setFilters(prev => {
      const currentArray = prev[filterType];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];

      return {
        ...prev,
        [filterType]: newArray
      };
    });
    setCurrentPage(1);
  };

  // Paginación con productos filtrados
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="flex flex-col gap-4 flex-1 overflow-y-auto scrollbar">
      <section className="w-full h-20 p-2.5 overflow-hidden border shadow-md bg-surface-alt border-border-gray rounded-3xl flex flex-row items-center">
        <article className="rounded-1xl size-[56px] flex justify-center items-center shadow-md bg-accent">
          <svg className="size-7">
            <use xlinkHref="/sprite.svg#tags" />
          </svg>
        </article>
        <span className="flex-1 px-2 font-bold transition-all duration-300">Productos</span>
        <button type="button" onClick={() => openProductEditor()}
          className="bg-store-items px-4 py-2 font-semibold text-white bg-primary rounded-xl shadow-md transition-all duration-300 
            hover:scale-105 hover:bg-primary/60">Agregar producto</button>
      </section>

      {/* Barra de filtros */}
      {!isHome && (
        <div className="w-full h-max flex flex-row flex-wrap gap-2.5 justify-start items-center p-2.5">
          <div
            className={`border border-gray-400 w-max h-max py-1 px-2.5 rounded-xl cursor-pointer 
              transition-all ease-in-out hover:scale-105 hover:border-gray-950 hover:shadow-2xl
              ${showFilters ? 'bg-store-details border-gray-950' : 'hover:bg-store-details'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros {Object.values(filters).some(f =>
              Array.isArray(f) ? f.length > 0 : f !== "" && f !== false
            ) && <span className="ml-1 bg-red-500 text-white rounded-full px-1 text-xs">•</span>}
          </div>

          {/* Filtros rápidos */}
          <div className="border border-gray-400 w-max h-max py-1 px-2.5 rounded-xl cursor-pointer 
            transition-all ease-in-out hover:scale-105 hover:bg-store-items2 hover:border-gray-950 
            hover:shadow-2xl"
            onClick={() => handleFilterChange('inStock', !filters.inStock)}
          >
            Solo en stock {filters.inStock && <span className="ml-1 text-green-600">✓</span>}
          </div>

          <div className="border border-gray-400 w-max h-max py-1 px-2.5 rounded-xl cursor-pointer 
            transition-all ease-in-out hover:scale-105 hover:bg-store-items2 hover:border-gray-950 
            hover:shadow-2xl"
            onClick={clearFilters}
          >
            Limpiar filtros
          </div>

          <div className="ml-auto text-sm text-gray-600">
            {filteredProducts.length} de {products.length} productos
          </div>
        </div>
      )}

      {/* Panel de filtros expandido */}
      {showFilters && !isHome && (
        <div className="w-full bg-white border rounded-lg p-4 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Filtro por categorías */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Categorías</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {categories.map(category => (
                  <label key={category.id} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.selectedCategories.includes(category.id)}
                      onChange={() => toggleArrayFilter('selectedCategories', category.id)}
                      className="rounded border-gray-300"
                    />
                    <span>{category.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtro por especificaciones */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Especificaciones</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {uniqueSpecs.map(spec => (
                  <label key={spec} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.selectedSpecs.includes(spec)}
                      onChange={() => toggleArrayFilter('selectedSpecs', spec)}
                      className="rounded border-gray-300"
                    />
                    <span>{spec}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtro por precio */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Rango de precio</h4>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Mín"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="number"
                  placeholder="Máx"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>

            {/* Filtro por estado */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Estado</h4>
              <select
                value={filters.estado}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="">Todos</option>
                <option value="disponible">Disponible</option>
                <option value="casi agotado">Casi agotado</option>
                <option value="agotado">Agotado</option>
              </select>
            </div>

          </div>
        </div>
      )}

      {/* Grid de productos */}
      <div className="h-max w-full flex flex-row flex-wrap gap-2.5 justify-center items-center overflow-y-auto scrollbar">
        {currentProducts.length === 0 ? (
          <p>No hay productos que coincidan con los filtros seleccionados</p>
        ) : (
          currentProducts.map((product) => {

            let mensajeStock = "";
            if (product.stock === 0) {
              mensajeStock = "agotado";
            } else if (product.stock <= 5) {
              mensajeStock = "Últimas unidades";
            }

            return (
              <div
                key={product.id}
                className="w-60 md:w-product h-100 rounded-4xl p-2.5 flex flex-col gap-1.5 bg-store-bg2/50 shadow-lg cursor-pointer hover:scale-101 transition-all ease-in-out overflow-auto"
                onClick={() => openProductModal(product)}
              >
                <section className="w-full h-3/4 border-b border-b-border-gray rounded-t-3xl bg-store-bg2/70 overflow-hidden relative flex justify-center items-center">
                  {/* Imagen principal */}
                  {product.imagenes?.[0] ? (
                    <SkeletonImage
                      src={product.imagenes[0].url}
                      alt={product.imagenes[0].alt || product.nombre}
                      className="absolute inset-0"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                      Sin imagen
                    </div>
                  )}

                  {mensajeStock && (
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                      {mensajeStock}
                    </div>
                  )}

                  <div className="absolute right-0 bottom-0 p-1 m-3 rounded-full cursor-pointer transition-all duration-300
                      hover:bg-black/50 hover:text-white hover:scale-105">
                    <button type="button" onClick={(event) => { event.stopPropagation(); openProductEditor(product); }} aria-label={`Editar ${product.nombre}`}
                      className="h-full w-full flex justify-center items-center">
                      <svg width="25" height="25">
                        <use xlinkHref="/sprite.svg#edit" />
                      </svg>
                    </button>
                  </div>

                  <div className="absolute right-0 bottom-11 p-1 m-3 rounded-full cursor-pointer text-red-700 transition-all 
                    duration-300 hover:bg-red-700/50 hover:text-white hover:scale-105">
                    <button type="button" onClick={(event) => { event.stopPropagation(); deleteProduct(product); }} aria-label={`Eliminar ${product.nombre}`}
                      className="h-full w-full flex justify-center items-center">
                      <svg width="25" height="25">
                        <use xlinkHref="/sprite.svg#delete" />
                      </svg>
                    </button>
                  </div>
                </section>
                <section className="h-1/3 w-full p-1 rounded-b-3xl bg-store-bg2/70 flex flex-col gap-1 overflow-hidden">
                  <div className="w-full h-max overflow-x-auto scrollbar">
                    <article className="w-max h-max">{product.nombre}</article>
                  </div>
                  <div className="w-full h-2/3 flex flex-row gap-0.5 justify-between">
                    <div className="w-2/3 h-full overflow-y-auto scrollbar-none">
                      <article className="w-2/3">{product.descripcion}</article>
                    </div>
                    <article className="w-1/3 h-full rounded-2xl flex items-center justify-center bg-store-details">
                      <strong>{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(product.precio)}</strong>
                    </article>
                  </div>
                </section>
              </div>
            );
          })
        )}
      </div>

      {/* Paginación */}
      {isHome ? (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg transition-all ease-in-out hover:scale-105 cursor-pointer"
          >
            Ver más productos
          </button>
        </div>
      ) : (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            className="p-2 rounded-full transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-black/20"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            <svg width="20" height="20">
              <use xlinkHref="/sprite.svg#arrowl" />
            </svg>
          </button>
          <span className="">
            Página {currentPage} de {totalPages}
          </span>
          <button
            className="p-2 rounded-full transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-black/20"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            <svg width="20" height="20">
              <use xlinkHref="/sprite.svg#arrowr" />
            </svg>
          </button>
        </div>
      )}

      {productEditorOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-3 sm:p-6" onClick={(event) => { if (event.target === event.currentTarget) setProductEditorOpen(false); }}>
          <form onSubmit={saveProduct} className="max-h-[92dvh] w-full max-w-2xl space-y-4 overflow-y-auto bg-white p-5 shadow-2xl sm:p-7 rounded-3xl">
            <h2 className="text-xl font-bold">{editingProduct ? "Editar producto" : "Agregar producto"}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">Nombre
                <input required value={productForm.nombre} onChange={(event) => setProductForm({ ...productForm, nombre: event.target.value })} 
                  className="mt-1 w-full border border-gray-300 p-2" />
              </label>
              <label className="text-sm font-medium">Proveedor
                <input required value={productForm.proveedor} onChange={(event) => setProductForm({ ...productForm, proveedor: event.target.value })} 
                  className="mt-1 w-full border border-gray-300 p-2" />
              </label>
              <label className="text-sm font-medium">Proveedor registrado (opcional)
                <select value={productForm.supplierId} onChange={(event) => setProductForm({ ...productForm, supplierId: event.target.value,
                  proveedor: suppliers.find((supplierItem) => supplierItem.id === event.target.value)?.nombre || productForm.proveedor })}
                  className="mt-1 w-full border border-gray-300 bg-white p-2">
                  <option value="">Sin vincular</option>
                  {suppliers.map((supplierItem) => <option key={supplierItem.id} value={supplierItem.id}>{supplierItem.nombre} {supplierItem.apellidos}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium">Precio COP
                <input required min="0" type="number" value={productForm.precio} onChange={(event) => setProductForm({ ...productForm, precio: event.target.value })} 
                  className="mt-1 w-full border border-gray-300 p-2" />
              </label>
              <label className="text-sm font-medium">Unidades en inventario
                <input required min="0" type="number" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} 
                  className="mt-1 w-full border border-gray-300 p-2" />
              </label>
              <label className="text-sm font-medium">Categoría
                <select required value={productForm.categoriaId} onChange={(event) => setProductForm({ ...productForm, categoriaId: event.target.value })} 
                  className="mt-1 w-full border border-gray-300 p-2">{categories.map((category) => 
                  <option key={category.id} value={category.id}>{category.nombre}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium">Estado
                <select value={productForm.estado} onChange={(event) => setProductForm({ ...productForm, estado: event.target.value })} 
                  className="mt-1 w-full border border-gray-300 p-2">
                  <option value="disponible">Disponible</option>
                  <option value="casi agotado">Casi agotado</option>
                  <option value="agotado">Agotado</option>
                </select>
              </label>
              <label className="text-sm font-medium">Descuento (%)
                <input min="0" max="100" type="number" value={productForm.descuento} onChange={(event) => setProductForm({ ...productForm, descuento: event.target.value })} 
                  className="mt-1 w-full border border-gray-300 p-2" />
              </label>
              <label className="text-sm font-medium">URL de imagen
                <input type="url" value={productForm.imagen} onChange={(event) => setProductForm({ ...productForm, imagen: event.target.value })} 
                  className="mt-1 w-full border border-gray-300 p-2" />
              </label>
            </div>
            <label className="block text-sm font-medium">Descripción
              <textarea required rows="3" value={productForm.descripcion} onChange={(event) => setProductForm({ ...productForm, descripcion: event.target.value })} 
                className="mt-1 w-full border border-gray-300 p-2" />
            </label>
            <label className="block text-sm font-medium">Especificaciones, una por línea
              <textarea rows="3" value={productForm.especificaciones} onChange={(event) => setProductForm({ ...productForm, especificaciones: event.target.value })} 
                className="mt-1 w-full border border-gray-300 p-2" />
            </label>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setProductEditorOpen(false)} 
                className="border border-gray-400 px-4 py-2 rounded-xl hover:shadow-md transition-all duration-300 
                hover:scale-105 hover:bg-primary-dark/60 hover:text-white">Cancelar</button>
              <button type="submit" className="bg-primary rounded-xl shadow-md transition-all duration-300 hover:scale-105 
                hover:bg-primary/60 px-4 py-2 font-semibold text-white">Guardar producto</button>
            </div>
          </form>
        </div>,
        document.body,
      )}

      {selectedProduct && createPortal(
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 p-3 sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeProductModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            className="flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:flex-row"
          >
            <section className="flex h-[38vh] min-h-56 max-h-80 shrink-0 flex-col bg-gray-50 md:h-auto md:min-h-0 md:w-[42%] md:max-w-[28rem]">
              {selectedProduct.imagenes?.length > 0 ? (
                <>
                  <SkeletonImage
                    src={selectedProduct.imagenes[selectedImageIndex]?.url}
                    alt={selectedProduct.imagenes[selectedImageIndex]?.alt || selectedProduct.nombre}
                    className="min-h-0 flex-1 p-4"
                  />
                  {selectedProduct.imagenes.length > 1 && (
                    <div className="flex shrink-0 gap-2 overflow-x-auto border-t border-gray-200 px-4 py-3">
                      {selectedProduct.imagenes.map((image, index) => (
                        <button
                          key={`${image.url}-${index}`}
                          type="button"
                          aria-label={`Ver imagen ${index + 1}`}
                          aria-pressed={selectedImageIndex === index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`size-14 shrink-0 overflow-hidden rounded-lg border-2 bg-white ${selectedImageIndex === index ? "border-blue-600" : "border-transparent"
                            }`}
                        >
                          <SkeletonImage src={image.url} alt={image.alt} className="size-full" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-gray-500">
                  Sin imágenes
                </div>
              )}
            </section>

            <section className="flex min-h-0 flex-1 flex-col">
              <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {selectedProduct.categorias?.map((category) => (
                      <span key={category.id} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {category.nombre}
                      </span>
                    ))}
                  </div>
                  <h2 id="product-modal-title" className="text-lg font-bold leading-snug text-gray-950 sm:text-xl">
                    {selectedProduct.nombre}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeProductModal}
                  aria-label="Cerrar detalle del producto"
                  className="grid size-9 shrink-0 place-items-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-950"
                >
                  <svg className="size-4"><use xlinkHref="/sprite.svg#xmark" /></svg>
                </button>
              </header>

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4 sm:px-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Precio</p>
                    <p className="mt-1 text-2xl font-bold text-blue-700">
                      {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(selectedProduct.precio)}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedProduct.stock > 0 ? "bg-primary/20 text-secondary" : "bg-red-50 text-red-700"
                    }`}>
                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} unidades disponibles` : "Agotado"}
                  </span>
                </div>

                <p className="text-sm leading-6 text-gray-600">{selectedProduct.descripcion}</p>

                {selectedProduct.especificaciones?.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-gray-900">Características</h3>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {selectedProduct.especificaciones.map((specification, index) => (
                        <li key={`${specification.nombre}-${index}`} className="rounded-lg bg-gray-50 px-3 py-2 text-sm leading-5 text-gray-600">
                          {specification.nombre}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-sm">
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-500">Calificación</p>
                    <p className="mt-1 font-medium text-gray-800">
                      {selectedProduct.totalValoraciones > 0
                        ? `${selectedProduct.valoracionPromedio} de 5 · ${selectedProduct.totalValoraciones} opiniones`
                        : "Sin calificaciones"}
                    </p>
                  </div>
                </div>
              </div>

              <footer className="grid shrink-0 grid-cols-1 gap-2 border-t border-gray-100 bg-white p-4 min-[420px]:grid-cols-2 sm:px-6">
                <button
                  type="button" onClick={(event) => { event.stopPropagation(); openProductEditor(selectedProduct); }} aria-label={`Editar ${selectedProduct.nombre}`}
                  className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold hover:scale-105 transition-colors`}>
                  <svg className="size-5 shrink-0">
                    <use xlinkHref="/sprite.svg#edit" />
                  </svg>
                  <span>Editar</span>
                </button>
                <button
                  type="button" onClick={(event) => { event.stopPropagation(); deleteProduct(selectedProduct); }} aria-label={`Eliminar ${selectedProduct.nombre}`}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl hover:scale-105 bg-primary-dark px-4 py-3 text-sm 
                  font-semibold text-white transition-colors hover:bg-primary/50 disabled:cursor-not-allowed disabled:opacity-50" >
                  <svg className="size-5 shrink-0">
                    <use xlinkHref="/sprite.svg#delete" />
                  </svg>
                  <span>Eliminar</span>
                </button>
              </footer>
            </section>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}