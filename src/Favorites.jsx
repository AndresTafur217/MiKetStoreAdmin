import { useState, useMemo, useEffect } from "react";
import { categories, getLocalFavorites, toggleLocalFavorite } from "./data/catalog";
import { Link } from "react-router-dom";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { SkeletonImage } from "./Skeletons";

function hasActiveFilters(filters) {
  return filters.selectedCategories.length > 0 ||
    filters.selectedSpecs.length > 0 ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "" ||
    filters.inStock ||
    filters.estado !== "" ||
    filters.dateRange.start !== "" ||
    filters.dateRange.end !== "" ||
    filters.searchTerm !== "";
}

export function Favorites() {
  const user = useCurrentUser();
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const favoritesPerPage = 30;

  // Estados para filtros
  const [filters, setFilters] = useState({
    selectedCategories: [],
    selectedSpecs: [],
    minPrice: "",
    maxPrice: "",
    inStock: false,
    estado: "",
    dateRange: {
      start: "",
      end: ""
    },
    sortBy: "newest", // newest, oldest, price-asc, price-desc, name-asc, name-desc
    searchTerm: ""
  });

  const [favorites, setFavorites] = useState([]);
  const [favMessage, setFavMessage] = useState("");
  const [favError, setFavError] = useState("");
  const loading = false;
  const isProductInFavorites = (productId) => Boolean(user && favorites.some((favorite) => favorite.id === productId));
  const clearMessages = () => {
    setFavMessage("");
    setFavError("");
  };

  useEffect(() => {
    setFavorites(user ? getLocalFavorites(user.id) : []);
  }, [user]);

  // Obtener especificaciones únicas de los favoritos
  const uniqueSpecs = useMemo(() => {
    const specs = new Set();
    favorites.forEach(favorite => {
      if (favorite.producto && favorite.producto.especificaciones) {
        favorite.producto.especificaciones.forEach(spec => {
          specs.add(spec.nombre);
        });
      }
    });
    return Array.from(specs).sort();
  }, [favorites]);

  // Aplicar filtros y ordenamiento a los favoritos
  const filteredAndSortedFavorites = useMemo(() => {
    let filtered = favorites.filter(favorite => {
      const product = favorite.producto;
      
      // Si el producto no existe, mantenerlo solo si no hay filtros aplicados
      if (!product) {
        return !hasActiveFilters(filters);
      }

      // Filtro por término de búsqueda
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          product.nombre?.toLowerCase().includes(searchLower) ||
          product.descripcion?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
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

      // Filtro por rango de fechas (cuando se guardó el favorito)
      if (filters.dateRange.start || filters.dateRange.end) {
        const favDate = new Date(favorite.createdAt);
        
        if (filters.dateRange.start) {
          const startDate = new Date(filters.dateRange.start);
          if (favDate < startDate) return false;
        }
        
        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          endDate.setHours(23, 59, 59, 999); // Final del día
          if (favDate > endDate) return false;
        }
      }

      return true;
    });

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      const productA = a.producto;
      const productB = b.producto;

      // Si algún producto no existe, ponerlo al final
      if (!productA && !productB) return 0;
      if (!productA) return 1;
      if (!productB) return -1;

      switch (filters.sortBy) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        
        case "price-asc":
          return productA.precio - productB.precio;
        
        case "price-desc":
          return productB.precio - productA.precio;
        
        case "name-asc":
          return productA.nombre.localeCompare(productB.nombre);
        
        case "name-desc":
          return productB.nombre.localeCompare(productA.nombre);
        
        case "newest":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  }, [favorites, filters]);

  const handleFavoriteClick = (productId) => {
    try {
      if (!user) return;
      const wasFavorite = isProductInFavorites(productId);
      setFavorites(toggleLocalFavorite(productId, user.id));
      setFavError("");
      setFavMessage(wasFavorite ? "Producto quitado de guardados" : "Producto guardado");
    } catch {
      setFavError("No se pudo actualizar el producto guardado");
    }
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType.includes('.')) {
      // Para objetos anidados como dateRange
      const [parent, child] = filterType.split('.');
      setFilters(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [filterType]: value
      }));
    }
    setCurrentPage(1);
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

  const clearFilters = () => {
    setFilters({
      selectedCategories: [],
      selectedSpecs: [],
      minPrice: "",
      maxPrice: "",
      inStock: false,
      estado: "",
      dateRange: {
        start: "",
        end: ""
      },
      sortBy: "newest",
      searchTerm: ""
    });
    setCurrentPage(1);
  };

  if (loading) return <p>Cargando guardados...</p>;
  if (!user) {
    return (
      <section className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Tus favoritos</h1>
        <p className="text-gray-600">Inicia sesión para consultar tus productos guardados.</p>
        <Link to="/perfil" className="border border-gray-400 px-4 py-2 hover:bg-store-items2">Ir a mi cuenta</Link>
      </section>
    );
  }
  if (favError && favorites.length === 0) return <p style={{ color: "red" }}>Error: {favError}</p>;

  // Paginación con favoritos filtrados
  const indexOfLast = currentPage * favoritesPerPage;
  const indexOfFirst = indexOfLast - favoritesPerPage;
  const currentFavorites = filteredAndSortedFavorites.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredAndSortedFavorites.length / favoritesPerPage);

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de filtros y búsqueda */}
      {filteredAndSortedFavorites.length >= 0 && (
        <div className="w-full space-y-3">
          {/* Barra de búsqueda */}
          <div className="w-full flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar en favoritos..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400">
                <use xlinkHref="/sprite.svg#search" />
              </svg>
            </div>
            
            {/* Selector de ordenamiento */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="name-asc">Nombre: A-Z</option>
              <option value="name-desc">Nombre: Z-A</option>
            </select>
          </div>

          {/* Controles de filtros */}
          <div className="w-full flex flex-wrap gap-2.5 items-center p-2.5">
            <div 
              className={`border border-gray-400 w-max h-max py-1 px-2.5 rounded-xl cursor-pointer 
                transition-all ease-in-out hover:scale-105 hover:border-gray-950 hover:shadow-2xl
                ${showFilters ? 'bg-store-details border-gray-950' : 'hover:bg-store-details'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtros avanzados {hasActiveFilters(filters) &&
                <span className="ml-1 bg-red-500 text-white rounded-full px-1 text-xs">•</span>
              }
            </div>

            <div className="border border-gray-400 w-max h-max py-1 px-2.5 rounded-xl cursor-pointer 
              transition-all ease-in-out hover:scale-105 hover:bg-store-items2 hover:border-gray-950 
              hover:shadow-2xl"
              onClick={() => handleFilterChange('inStock', !filters.inStock)}
            >
              Solo disponibles {filters.inStock && <span className="ml-1 text-green-600">✓</span>}
            </div>

            <div className="border border-gray-400 w-max h-max py-1 px-2.5 rounded-xl cursor-pointer 
              transition-all ease-in-out hover:scale-105 hover:bg-store-items2 hover:border-gray-950 
              hover:shadow-2xl"
              onClick={clearFilters}
            >
              Limpiar filtros
            </div>

            <div className="ml-auto text-sm text-gray-600">
              {filteredAndSortedFavorites.length} de {favorites.length} guardados
            </div>
          </div>
        </div>
      )}

      {/* Panel de filtros expandido */}
      {showFilters && filteredAndSortedFavorites.length >= 0 && (
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

            {/* Filtro por rango de fechas */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Guardado entre</h4>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleFilterChange('dateRange.start', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleFilterChange('dateRange.end', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Grid de favoritos */}
      <div className={`h-max w-full flex flex-row flex-wrap gap-2.5 
        ${currentFavorites.length === 0 ? ('justify-center items-center') : ('justify-start items-start')}`}>
        {currentFavorites.length === 0 ? (
          <div className="col-span-5 flex flex-col items-center justify-center p-8 text-gray-500">
            <svg className="w-16 h-16 mb-4 text-gray-300">
              <use xlinkHref="/sprite.svg#addbm" />
            </svg>
            {hasActiveFilters(filters) ? (
              <>
                <p className="text-lg font-medium">No se encontraron favoritos</p>
                <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">No hay productos guardados</p>
                <p className="text-sm">Los productos que marques como favoritos aparecerán aquí</p>
              </>
            )}
          </div>
        ) : (
          currentFavorites.map((favorite) => {
            const product = favorite.producto;
            
            // Si el producto fue eliminado, mostrar placeholder
            if (!product) {
              return (
                <div
                  key={favorite.id}
                  className="h-product w-product rounded-4xl p-2.5 flex flex-col gap-1.5 bg-gray-200/50 shadow-lg"
                >
                  <section className="h-2/3 w-full rounded-t-3xl bg-gray-300/70 overflow-hidden">
                    <div className="w-full h-full flex justify-center items-center text-gray-500">
                      Producto eliminado
                    </div>
                  </section>
                  <section className="h-1/3 w-full p-1 rounded-b-3xl bg-gray-300/70 flex flex-col gap-1 overflow-hidden">
                    <div className="w-full h-max overflow-x-auto scrollbar">
                      <article className="w-max h-max text-gray-500">Producto no disponible</article>
                    </div>
                    <div className="w-full h-2/3 flex flex-row gap-0.5 justify-between">
                      <div className="w-2/3 h-full overflow-y-auto scrollbar-none">
                        <article className="w-2/3 text-gray-400">Este producto ya no está disponible</article>
                      </div>
                      <article className="w-1/3 h-full rounded-2xl flex items-center justify-center bg-gray-200">
                        <strong className="text-gray-400">-</strong>
                      </article>
                    </div>
                  </section>
                </div>
              );
            }

            const isInFavorites = isProductInFavorites(product.id);
            
            let mensajeStock = "";
            if (product.stock === 0) {
              mensajeStock = "agotado";
            } else if (product.stock <= 5) {
              mensajeStock = "Últimas unidades";
            }

            return (
              <div
                key={favorite.id}
                className="h-product w-product rounded-4xl p-2.5 flex flex-col gap-1.5 bg-store-bg2/50 shadow-lg"
              >
                <section className="h-2/3 w-full rounded-t-3xl bg-store-bg2/70 overflow-hidden relative">
                  {/* Imagen principal */}
                  {product.imagenes?.length > 0 ? (
                    <SkeletonImage
                      src={product.imagenes[0].url}
                      alt={product.imagenes[0].alt || product.nombre}
                      className="absolute inset-0"
                    />
                  ) : product.imagen ? ( // si solo tiene una propiedad "imagen"
                    <SkeletonImage
                      src={product.imagen}
                      alt={product.nombre}
                      className="absolute inset-0"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                      Sin imagen
                    </div>
                  )}

                  {/* Overlay stock */}
                  {mensajeStock && (
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                      {mensajeStock}
                    </div>
                  )}

                  {/* Fecha de guardado */}
                  <div className="absolute top-2 right-2 bg-blue-500/80 text-white text-xs px-2 py-1 rounded-md">
                    {new Date(favorite.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit'
                    })}
                  </div>

                  {/* Botón favoritos */}
                  <div 
                    className={`absolute right-0 bottom-0 border p-1 m-3 rounded-full cursor-pointer transition-colors ${
                      isInFavorites 
                        ? 'border-red-600 text-red-600 hover:text-red-800 hover:border-red-800' 
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <div 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFavoriteClick(product.id);
                      }}
                      className={loading ? 'opacity-50 pointer-events-none' : ''}
                    >
                      <svg width="25" height="25">
                        <use xlinkHref={isInFavorites ? "/sprite.svg#removebm" : "/sprite.svg#addbm"} />
                      </svg>
                    </div>
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
                      <strong>{product.precio}</strong>
                    </article>
                  </div>
                </section>
              </div>
            );
          })
        )}
      </div>

      {/* Mensajes de favoritos */}
      {(favMessage || favError) && (
        <div className="fixed top-4 right-4 flex flex-col gap-2 w-60 sm:w-72 text-[10px] sm:text-xs z-50">
          <div className={`flex items-center justify-between w-full h-12 sm:h-14 rounded-lg px-[10px] ${
            favError ? 'bg-red-100 border border-red-300' : 'bg-store-items/90'
          }`}>
            <div className="flex gap-2 justify-between items-center">
              <div className={`p-1 rounded-lg ${
                favError 
                  ? 'text-red-600 bg-red-200' 
                  : 'text-emerald-600 bg-store-bg2/60 backdrop-blur-xl'
              }`}>
                <svg className="size-6">
                  <use xlinkHref={favError ? "/sprite.svg#error" : "/sprite.svg#check"} />
                </svg>
              </div>
              <p className="text-black">{favMessage || favError}</p>
            </div>
            <button 
              onClick={clearMessages}
              className="text-gray-800 hover:bg-white/5 p-1 rounded-md"
            >
              <svg className="size-5">
                <use xlinkHref="/sprite.svg#close" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
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
          <span>
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
    </div>
  );
}