import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  createStoreOrder,
  getAdminDataChangeEvent,
  getAdminSales,
  getPurchasingData,
  initializeInventoryOpeningBalances,
  recordInventoryAudit,
  receiveStoreOrder,
  savePurchasingData,
} from "./data/adminData";
import {
  categories as catalogCategories,
  getCatalogChangeEvent,
  products as catalogProducts,
  saveCatalogProducts,
} from "./data/catalog";

const tabs = ["Inventario", "Conteos", "Movimientos", "Proveedores", "Compras", "Lotes"];
const paymentMethods = ["Transferencia bancaria", "Tarjeta débito o crédito", "PSE", "Consignación bancaria"];

const formatPrice = (value) => new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
}).format(value || 0);

const formatDate = (value) => value ? new Date(value).toLocaleDateString("es-CO") : "No aplica";

const createOrderLine = (products, suppliers) => ({
  productId: String(products[0]?.id || ""),
  supplierId: String(suppliers[0]?.id || ""),
  quantity: "1",
  unitCost: "",
});

export function Inventory() {
  const [activeTab, setActiveTab] = useState("Inventario");
  const [data, setData] = useState(() => getPurchasingData());
  const [sales, setSales] = useState(() => getAdminSales());
  const [products, setProducts] = useState(() => catalogProducts);
  const [categories, setCategories] = useState(() => catalogCategories);
  const [supplierEditorOpen, setSupplierEditorOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierForm, setSupplierForm] = useState({ nombre: "", apellidos: "", correo: "", telefono: "", estado: "Activo", categoryIds: [] });
  const [orderEditorOpen, setOrderEditorOpen] = useState(false);
  const [countEditorOpen, setCountEditorOpen] = useState(false);
  const [stockCounts, setStockCounts] = useState([]);
  const [orderLines, setOrderLines] = useState(() => [createOrderLine(catalogProducts, [])]);
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [paymentStatus, setPaymentStatus] = useState("Pendiente");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedInventoryId, setSelectedInventoryId] = useState("");

  useEffect(() => {
    const refreshData = () => {
      setData(getPurchasingData());
      setSales(getAdminSales());
    };
    const refreshCatalog = () => {
      setProducts(catalogProducts);
      setCategories(catalogCategories);
    };
    window.addEventListener(getAdminDataChangeEvent(), refreshData);
    window.addEventListener(getCatalogChangeEvent(), refreshCatalog);
    return () => {
      window.removeEventListener(getAdminDataChangeEvent(), refreshData);
      window.removeEventListener(getCatalogChangeEvent(), refreshCatalog);
    };
  }, []);

  useEffect(() => {
    setData(initializeInventoryOpeningBalances(products, sales));
  }, [products, sales]);

  const lowStockProducts = useMemo(() => products.filter((product) => product.stock > 0 && product.stock <= 5), [products]);
  const totalStockUnits = useMemo(() => products.reduce((total, product) => total + Number(product.stock || 0), 0), [products]);
  const activeSuppliers = useMemo(() => data.suppliers.filter((supplier) => supplier.estado === "Activo"), [data.suppliers]);
  const inventoryBalances = useMemo(() => products.map((product) => {
    const movements = data.inventoryMovements.filter((movement) => movement.id_producto === product.id);
    const purchased = movements.filter((movement) => movement.tipo === "Entrada por compra")
      .reduce((total, movement) => total + movement.unidades, 0);
    const adjustments = movements.reduce((total, movement) => {
      if (movement.tipo === "Ajuste positivo") return total + movement.unidades;
      if (movement.tipo === "Ajuste negativo") return total - movement.unidades;
      return total;
    }, 0);
    const sold = sales.filter((sale) => sale.estado !== "Cancelada")
      .flatMap((sale) => sale.items || [])
      .filter((item) => item.productId === product.id)
      .reduce((total, item) => total + item.quantity, 0);
    const opening = data.inventoryOpeningBalances.find((balance) => balance.id_producto === product.id)?.stock_inicial ?? product.stock;
    const expected = opening + purchased - sold + adjustments;
    return { product, opening, purchased, sold, adjustments, expected, difference: product.stock - expected };
  }), [data.inventoryMovements, data.inventoryOpeningBalances, products, sales]);
  const totalPurchasedUnits = inventoryBalances.reduce((total, row) => total + row.purchased, 0);
  const totalSoldUnits = inventoryBalances.reduce((total, row) => total + row.sold, 0);
  const totalExpectedUnits = inventoryBalances.reduce((total, row) => total + row.expected, 0);

  const openSupplierEditor = (supplier = null) => {
    setEditingSupplier(supplier);
    const categoryIds = data.supplierCategories
      .filter((relation) => relation.id_proveedor === supplier?.id)
      .map((relation) => relation.id_categoria);
    setSupplierForm(supplier ? { ...supplier, categoryIds } : {
      nombre: "", apellidos: "", correo: "", telefono: "", estado: "Activo", categoryIds: [],
    });
    setSupplierEditorOpen(true);
  };

  const saveSupplier = (event) => {
    event.preventDefault();
    const supplier = {
      ...supplierForm,
      id: editingSupplier?.id || `PROV-${Date.now()}`,
      nombre: supplierForm.nombre.trim(),
      apellidos: supplierForm.apellidos.trim(),
      correo: supplierForm.correo.trim(),
      telefono: supplierForm.telefono.trim(),
      fecha_de_ingreso: editingSupplier?.fecha_de_ingreso || new Date().toISOString().slice(0, 10),
    };
    const nextSuppliers = editingSupplier
      ? data.suppliers.map((item) => item.id === supplier.id ? supplier : item)
      : [supplier, ...data.suppliers];
    const nextSupplierCategories = [
      ...data.supplierCategories.filter((relation) => relation.id_proveedor !== supplier.id),
      ...supplierForm.categoryIds.map((categoryId) => ({ id_proveedor: supplier.id, id_categoria: Number(categoryId) })),
    ];
    const nextData = { ...data, suppliers: nextSuppliers, supplierCategories: nextSupplierCategories };
    savePurchasingData(nextData);
    setData(nextData);
    setSupplierEditorOpen(false);
  };

  const deleteSupplier = (supplier) => {
    const usedByProduct = products.some((product) => product.id_proveedor === supplier.id);
    const usedByOrder = data.storeOrderDetails.some((detail) => detail.id_proveedor === supplier.id);
    if (usedByProduct || usedByOrder) {
      window.alert("No se puede eliminar un proveedor asociado a productos o pedidos.");
      return;
    }
    if (!window.confirm(`¿Eliminar el proveedor ${supplier.nombre}?`)) return;
    const nextData = {
      ...data,
      suppliers: data.suppliers.filter((item) => item.id !== supplier.id),
      supplierCategories: data.supplierCategories.filter((relation) => relation.id_proveedor !== supplier.id),
    };
    savePurchasingData(nextData);
    setData(nextData);
  };

  const openOrderEditor = () => {
    setOrderLines([createOrderLine(products, activeSuppliers)]);
    setPaymentMethod(paymentMethods[0]);
    setPaymentStatus("Pendiente");
    setOrderEditorOpen(true);
  };

  const openCountEditor = () => {
    setStockCounts(products.map((product) => ({
      productId: product.id,
      systemStock: product.stock,
      stock: String(product.stock),
      lotId: data.lots.find((lot) => lot.id_producto === product.id)?.id || "",
    })));
    setCountEditorOpen(true);
  };

  const saveInventoryCount = (event) => {
    event.preventDefault();
    try {
      recordInventoryAudit({ userId: "USR-002", counts: stockCounts });
      const stockByProduct = new Map(stockCounts.map((count) => [count.productId, Number(count.stock)]));
      const nextProducts = products.map((product) => {
        const stock = stockByProduct.get(product.id);
        if (stock === undefined) return product;
        return { ...product, stock, estado: stock === 0 ? "agotado" : stock <= 5 ? "casi agotado" : "disponible" };
      });
      saveCatalogProducts(nextProducts);
      setProducts(nextProducts);
      setData(getPurchasingData());
      setCountEditorOpen(false);
    } catch (error) {
      window.alert(error.message);
    }
  };

  const updateOrderLine = (index, key, value) => {
    setOrderLines((currentLines) => currentLines.map((line, lineIndex) => lineIndex === index
      ? { ...line, [key]: value }
      : line));
  };

  const saveOrder = (event) => {
    event.preventDefault();
    try {
      createStoreOrder({
        userId: "USR-002",
        paymentMethod,
        paymentStatus,
        items: orderLines.map((line) => ({
          productId: Number(line.productId),
          supplierId: line.supplierId,
          quantity: Number(line.quantity),
          unitCost: Number(line.unitCost),
        })),
      });
      setData(getPurchasingData());
      setOrderEditorOpen(false);
    } catch (error) {
      window.alert(error.message);
    }
  };

  const receiveOrder = (order) => {
    if (!window.confirm(`¿Confirmar la recepción de ${order.id} y aumentar el inventario?`)) return;
    const receivedItems = receiveStoreOrder(order.id);
    if (!receivedItems) return;

    const nextProducts = products.map((product) => {
      const receivedQuantity = receivedItems
        .filter((item) => item.productId === product.id)
        .reduce((total, item) => total + item.detail.cantidad, 0);
      if (receivedQuantity === 0) return product;
      const supplierId = receivedItems.find((item) => item.productId === product.id)?.detail.id_proveedor;
      const supplier = data.suppliers.find((item) => item.id === supplierId);
      const stock = product.stock + receivedQuantity;
      return {
        ...product,
        stock,
        estado: stock <= 5 ? "casi agotado" : "disponible",
        fecha_de_ingreso: new Date().toISOString().slice(0, 10),
        id_proveedor: supplierId,
        proveedor: supplier?.nombre || product.proveedor,
      };
    });
    saveCatalogProducts(nextProducts);
    setProducts(nextProducts);
    setData(getPurchasingData());
  };

  const getOrderDetails = (orderId) => data.storeOrderDetails
    .filter((detail) => detail.id_pedido_tienda === orderId)
    .map((detail) => {
      const productRelation = data.orderProducts.find((item) => item.id_detalle_pedido === detail.id);
      return {
        ...detail,
        product: products.find((product) => product.id === productRelation?.id_producto),
        supplier: data.suppliers.find((supplier) => supplier.id === detail.id_proveedor),
      };
    });

  return (
    <section className="mx-auto w-full flex flex-col gap-5">
      <section className="w-full h-20 p-2.5 overflow-hidden border shadow-md bg-surface-alt border-border-gray rounded-3xl flex flex-row items-center">
        <article className="rounded-1xl size-[56px] flex justify-center items-center shadow-md bg-accent">
          <svg className="size-7">
            <use xlinkHref="/sprite.svg#categories" />
          </svg>
        </article>
        <span className="flex-1 px-2 font-bold transition-all duration-300">Inventario</span>
        {activeTab === "Conteos" &&
          <button type="button" onClick={openCountEditor} className="rounded-xl bg-primary px-4 py-2 font-semibold text-white 
            transition-all duration-300 hover:bg-primary/60 hover:scale-105">Registrar conteo
          </button>
        }
        {activeTab === "Proveedores" &&
          <button type="button" onClick={() => openSupplierEditor()} className="rounded-xl bg-primary px-4 py-2 font-semibold text-white 
            transition-all duration-300 hover:bg-primary/60 hover:scale-105">Agregar proveedor
          </button>
        }
        {activeTab === "Compras" &&
          <button type="button" onClick={openOrderEditor} disabled={data.suppliers.length === 0}
            className="rounded-xl bg-primary px-4 py-2 font-semibold text-white 
              transition-all duration-300 hover:bg-primary/60 hover:scale-105">Crear pedido de tienda
          </button>
        }
      </section>

      <nav className="mb-5 flex flex-wrap gap-5 border-b border-gray-300" aria-label="Inventario y abastecimiento">
        {tabs.map((tab) =>
          <button key={tab} type="button" onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-1 pb-3 text-sm font-semibold ${activeTab === tab ? "border-emerald-700 text-emerald-900" :
              "border-transparent text-gray-600 hover:text-gray-950"}`}>{tab}
          </button>
        )}
      </nav>

      {activeTab === "Inventario" && <>
        <div className="mb-5 grid grid-cols-2 gap-4 border-y border-gray-300 py-4 sm:grid-cols-3 xl:grid-cols-6">
          <div><p className="text-sm text-gray-500">Productos</p><strong className="text-xl">{products.length}</strong></div>
          <div><p className="text-sm text-gray-500">Stock actual</p><strong className="text-xl">{totalStockUnits}</strong></div>
          <div><p className="text-sm text-gray-500">Comprado</p><strong className="text-xl">{totalPurchasedUnits}</strong></div>
          <div><p className="text-sm text-gray-500">Vendido</p><strong className="text-xl">{totalSoldUnits}</strong></div>
          <div><p className="text-sm text-gray-500">Stock esperado</p><strong className="text-xl">{totalExpectedUnits}</strong></div>
          <div><p className="text-sm text-gray-500">Referencias con poco stock</p><strong className="text-xl">{lowStockProducts.length}</strong></div>
        </div>
        <div className="overflow-x-auto border-y border-gray-300">
          <table className="w-full min-w-[1150px] text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-3 py-3">Producto</th>
                <th className="px-3 py-3">Categoría</th>
                <th className="px-3 py-3">Proveedor</th>
                <th className="px-3 py-3">Stock inicial</th>
                <th className="px-3 py-3">Comprado</th>
                <th className="px-3 py-3">Vendido</th>
                <th className="px-3 py-3">Ajustes</th>
                <th className="px-3 py-3">Stock esperado</th>
                <th className="px-3 py-3">Stock actual</th>
                <th className="px-3 py-3">Diferencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventoryBalances.map(({ product, opening, purchased, sold, adjustments, expected, difference }) => {
                const supplier = data.suppliers.find((item) => item.id === product.id_proveedor);
                return <tr key={product.id}>
                  <td className="px-3 py-3 font-medium">{product.nombre}</td>
                  <td className="px-3 py-3">{product.categorias?.map((category) => category.nombre).join(", ") || "Sin categoría"}</td>
                  <td className="px-3 py-3">{supplier?.nombre || product.proveedor || "Por registrar"}</td>
                  <td className="px-3 py-3">{opening}</td>
                  <td className="px-3 py-3">{purchased}</td>
                  <td className="px-3 py-3">{sold}</td>
                  <td className="px-3 py-3">{adjustments > 0 ? `+${adjustments}` : adjustments}</td>
                  <td className="px-3 py-3 font-semibold">{expected}</td>
                  <td className="px-3 py-3">{product.stock}</td>
                  <td className={`px-3 py-3 font-semibold ${difference === 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {difference > 0 ? `+${difference}` : difference}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </>}

      {activeTab === "Conteos" && <div className="overflow-x-auto border-y border-gray-300">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-3 py-3">Inventario</th>
              <th className="px-3 py-3">Fecha</th>
              <th className="px-3 py-3">Usuario</th>
              <th className="px-3 py-3">Unidades contadas</th>
              <th className="px-3 py-3">Diferencias</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.inventorySessions.map((session) => {
              const details = data.inventoryDetails.filter((detail) => detail.id_inventario === session.id);
              const differenceCount = details.filter((detail) => detail.diferencia !== 0).length;
              return <tr key={session.id}>
                <td className="px-3 py-3 font-semibold">{session.numero_de_inventario}</td>
                <td className="px-3 py-3">{formatDate(session.fecha)}</td>
                <td className="px-3 py-3">{session.id_usuario}</td>
                <td className="px-3 py-3">{session.stock_total}</td>
                <td className="px-3 py-3">{differenceCount}</td>
                <td className="px-3 py-3">{session.estado}</td>
                <td className="px-3 py-3">
                  <button type="button" onClick={() => setSelectedInventoryId(selectedInventoryId === session.id ? "" : session.id)}
                    className="text-blue-800 underline size-7 rounded-full shadow-md transition-all duration-300 hover:scale-105 hover:bg-primary/60 
                    font-semibold">{selectedInventoryId === session.id ?
                      <svg className="size-7">
                        <use xlinkHref="/sprite.svg#seeminus" />
                      </svg> :
                      <svg className="size-7">
                        <use xlinkHref="/sprite.svg#seemore" />
                      </svg>}
                  </button>
                </td>
              </tr>;
            })}
            {data.inventorySessions.length === 0 &&
              <tr>
                <td colSpan="7" className="px-3 py-10 text-center text-gray-600">No hay conteos registrados.</td>
              </tr>
            }
          </tbody>
        </table>
        {selectedInventoryId && <div className="border-t border-gray-200 p-4">
          <h2 className="mb-3 font-semibold">Detalle del inventario {selectedInventoryId}</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="py-2">Producto</th>
                  <th className="py-2">Lote</th>
                  <th className="py-2">Stock del sistema</th>
                  <th className="py-2">Conteo</th>
                  <th className="py-2">Diferencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.inventoryDetails.filter((detail) => detail.id_inventario === selectedInventoryId).map((detail) =>
                  <tr key={detail.id}>
                    <td className="py-2">{products.find((product) => product.id === detail.id_producto)?.nombre || "Producto eliminado"}</td>
                    <td className="py-2">{data.lots.find((lot) => lot.id === detail.id_lote)?.numero_de_lote || "Sin lote asignado"}</td>
                    <td className="py-2">{detail.stock_sistema}</td>
                    <td className="py-2">{detail.stock_fisico}</td>
                    <td className={`py-2 ${detail.diferencia === 0 ? "text-emerald-700" : "text-amber-800"}`}>
                      {detail.diferencia > 0 ? `+${detail.diferencia}` : detail.diferencia}
                    </td>
                  </tr>)
                }
              </tbody>
            </table>
          </div>
        </div>}
      </div>}

      {activeTab === "Movimientos" && <div className="overflow-x-auto border-y border-gray-300">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-3 py-3">Movimiento</th>
              <th className="px-3 py-3">Fecha</th>
              <th className="px-3 py-3">Producto</th>
              <th className="px-3 py-3">Tipo</th>
              <th className="px-3 py-3">Referencia</th>
              <th className="px-3 py-3">Unidades</th>
              <th className="px-3 py-3">Usuario</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">{data.inventoryMovements.map((movement) => {
            const isOutgoing = movement.tipo === "Salida por venta" || movement.tipo === "Ajuste negativo";
            return <tr key={movement.id}>
              <td className="px-3 py-3 font-semibold">{movement.id}</td>
              <td className="px-3 py-3">{formatDate(movement.fecha)}</td>
              <td className="px-3 py-3">{products.find((product) => product.id === movement.id_producto)?.nombre || "Producto eliminado"}</td>
              <td className="px-3 py-3">{movement.tipo}</td>
              <td className="px-3 py-3">{movement.id_referencia}</td>
              <td className={`px-3 py-3 font-semibold ${isOutgoing ? "text-red-700" : "text-emerald-700"}`}>
                {isOutgoing ? "−" : "+"}{movement.unidades}
              </td>
              <td className="px-3 py-3">{movement.id_usuario || "Sin asignar"}</td>
            </tr>;
          })}
            {data.inventoryMovements.length === 0 &&
              <tr>
                <td colSpan="7" className="px-3 py-10 text-center text-gray-600">No hay movimientos de inventario registrados.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>}

      {activeTab === "Proveedores" && <div className="overflow-x-auto border-y border-gray-300">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-3 py-3">Proveedor</th>
              <th className="px-3 py-3">Contacto</th>
              <th className="px-3 py-3">Categorías</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.suppliers.map((supplier) => {
              const supplierCategoryIds = data.supplierCategories.filter((relation) => relation.id_proveedor === supplier.id).map((relation) => relation.id_categoria);
              const categoryNames = categories.filter((category) => supplierCategoryIds.includes(category.id)).map((category) => category.nombre);
              return <tr key={supplier.id}>
                <td className="px-3 py-3">
                  <strong className="block">{supplier.nombre} {supplier.apellidos}</strong>
                  <span className="text-xs text-gray-500">{supplier.id}</span>
                </td>
                <td className="px-3 py-3">
                  {supplier.correo}
                  <span className="block text-gray-500">
                    {supplier.telefono}
                  </span>
                </td>
                <td className="px-3 py-3">{categoryNames.join(", ") || "Sin categorías"}</td>
                <td className="px-3 py-3">{supplier.estado}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-3">
                    <button type="button" onClick={() => openSupplierEditor(supplier)} className="underline transition-all duration-300 
                      hover:scale-105 rounded-full hover:bg-black/50">
                      <svg className="size-7">
                        <use xlinkHref="/sprite.svg#edit" />
                      </svg>
                    </button>
                    <button type="button" onClick={() => deleteSupplier(supplier)} className="text-red-700 underline transition-all duration-300 
                      hover:scale-105 rounded-full hover:bg-red-700/50">
                      <svg className="size-7">
                        <use xlinkHref="/sprite.svg#delete" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>;
            })}
            {data.suppliers.length === 0 &&
              <tr>
                <td colSpan="5" className="px-3 py-10 text-center text-gray-600">Aún no hay proveedores registrados.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>}

      {activeTab === "Compras" && <div className="overflow-x-auto border-y border-gray-300">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-3 py-3">Pedido</th>
              <th className="px-3 py-3">Fecha</th>
              <th className="px-3 py-3">Referencias</th>
              <th className="px-3 py-3">Total</th>
              <th className="px-3 py-3">Pago</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.storeOrders.map((order) => {
              const details = getOrderDetails(order.id);
              const payment = data.purchasePayments.find((item) => item.id_pedido_tienda === order.id);
              return <tr key={order.id}>
                <td className="px-3 py-3 font-semibold">{order.id}</td>
                <td className="px-3 py-3">{formatDate(order.fecha)}</td>
                <td className="px-3 py-3">{details.length}</td>
                <td className="px-3 py-3">{formatPrice(order.total)}</td>
                <td className="px-3 py-3">
                  {payment?.estado || "Sin registrar"}
                  <span className="block text-gray-500">{payment?.metodo_de_pago}</span>
                </td>
                <td className="px-3 py-3">{order.estado}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setSelectedOrderId(selectedOrderId === order.id ? "" : order.id)}
                      className="text-blue-800 underline size-8 rounded-full shadow-md transition-all duration-300 hover:scale-105 hover:bg-primary/60 
                      px-4 py-2 font-semibold">
                      {selectedOrderId === order.id ?
                        <svg className="size-7">
                          <use xlinkHref="/sprite.svg#seeminus" />
                        </svg> :
                        <svg className="size-7">
                          <use xlinkHref="/sprite.svg#seemore" />
                        </svg>
                      }
                    </button>
                    {order.estado !== "Recibido" &&
                      <button type="button" onClick={() => receiveOrder(order)} className="text-emerald-800 underline">Recibir</button>
                    }
                  </div>
                </td>
              </tr>;
            })}
            {data.storeOrders.length === 0 &&
              <tr>
                <td colSpan="7" className="px-3 py-10 text-center text-gray-600">No hay pedidos de abastecimiento.</td>
              </tr>
            }
          </tbody>
        </table>
        {selectedOrderId && <div className="border-t border-gray-200 p-4">
          <h2 className="mb-3 font-semibold">Detalle del pedido {selectedOrderId}</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-left text-sm">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="py-2">Producto</th>
                  <th className="py-2">Proveedor</th>
                  <th className="py-2">Cantidad</th>
                  <th className="py-2">Subtotal</th>
                  <th className="py-2">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {getOrderDetails(selectedOrderId).map((detail) =>
                  <tr key={detail.id}>
                    <td className="py-2">{detail.product?.nombre || "Producto eliminado"}</td>
                    <td className="py-2">{detail.supplier?.nombre || "Proveedor eliminado"}</td>
                    <td className="py-2">{detail.cantidad}</td>
                    <td className="py-2">{formatPrice(detail.subtotal)}</td>
                    <td className="py-2">{detail.estado}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>}
      </div>}

      {activeTab === "Lotes" && <div className="overflow-x-auto border-y border-gray-300">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-3 py-3">Lote</th>
              <th className="px-3 py-3">Producto</th>
              <th className="px-3 py-3">Ingreso</th>
              <th className="px-3 py-3">Vencimiento</th>
              <th className="px-3 py-3">Unidades recibidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.lots.map((lot) =>
              <tr key={lot.id}>
                <td className="px-3 py-3 font-semibold">{lot.numero_de_lote}</td>
                <td className="px-3 py-3">{products.find((product) => product.id === lot.id_producto)?.nombre || "Producto eliminado"}</td>
                <td className="px-3 py-3">{formatDate(lot.fecha_de_ingreso)}</td>
                <td className="px-3 py-3">{formatDate(lot.fecha_de_vencimiento)}</td>
                <td className="px-3 py-3">{lot.unidades}</td>
              </tr>
            )}
            {data.lots.length === 0 &&
              <tr>
                <td colSpan="5" className="px-3 py-10 text-center text-gray-600">Todavía no hay lotes recibidos.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>}

      {countEditorOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-3 sm:p-6" onClick={(event) => { if (event.target === event.currentTarget) setCountEditorOpen(false); }}>
          <form onSubmit={saveInventoryCount} className="max-h-[92dvh] w-full max-w-4xl space-y-4 overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7 scrollbar">
            <div>
              <p className="text-sm text-gray-500">Conciliación de existencias</p>
              <h2 className="text-xl font-bold">Conteo</h2>
            </div>
            <div className="overflow-x-auto border-y border-gray-200">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-3 py-2">Producto</th>
                    <th className="px-3 py-2">Stock del sistema</th>
                    <th className="px-3 py-2">Conteo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stockCounts.map((count, index) =>
                    <tr key={count.productId}>
                      <td className="px-3 py-2">{products.find((product) => product.id === count.productId)?.nombre || "Producto eliminado"}</td>
                      <td className="px-3 py-2">{count.systemStock}</td>
                      <td className="px-3 py-2">
                        <input aria-label={`Conteo producto ${count.productId}`} required min="0" step="1" type="number" value={count.stock}
                          onChange={(event) => setStockCounts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, stock: event.target.value } : item))}
                          className="w-32 border border-gray-300 p-2" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600">Al confirmar, las existencias se ajustarán al conteo y quedará guardado el historial de diferencias.</p>
            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
              <button type="button" onClick={() => setCountEditorOpen(false)} className="border border-gray-400 px-4 py-2 rounded-xl hover:shadow-md transition-all duration-300 
                hover:scale-105 hover:bg-primary-dark/60 hover:text-white">Cancelar</button>
              <button type="submit" className="bg-primary rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:bg-primary/60 
                px-4 py-2 font-semibold text-white">Confirmar conteo</button>
            </div>
          </form>
        </div>, document.body
      )}

      {supplierEditorOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4" onClick={(event) => { if (event.target === event.currentTarget) setSupplierEditorOpen(false); }}>
          <form onSubmit={saveSupplier} className="max-h-[90dvh] w-full max-w-xl space-y-4 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold">{editingSupplier ? "Editar proveedor" : "Agregar proveedor"}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[["nombre", "Nombre"], ["apellidos", "Apellidos"], ["correo", "Correo"], ["telefono", "Teléfono"]].map(([key, label]) =>
                <label key={key} className="text-sm font-medium">
                  {label}
                  <input required={key === "nombre"} type={key === "correo" ? "email" : "text"} value={supplierForm[key] || ""}
                    onChange={(event) => setSupplierForm({ ...supplierForm, [key]: event.target.value })} className="mt-1 w-full border border-gray-300 p-2" />
                </label>
              )}
            </div>
            <label className="block text-sm font-medium">Estado
              <select value={supplierForm.estado} onChange={(event) => setSupplierForm({ ...supplierForm, estado: event.target.value })}
                className="mt-1 w-full border border-gray-300 bg-white p-2">
                <option>Activo</option>
                <option>Inactivo</option>
              </select>
            </label>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Categorías que provee</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {categories.map((category) =>
                  <label key={category.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={supplierForm.categoryIds.includes(category.id)}
                      onChange={() => setSupplierForm((current) => ({ ...current, categoryIds: current.categoryIds.includes(category.id) ? current.categoryIds.filter((id) => id !== category.id) : [...current.categoryIds, category.id] }))} />{category.nombre}
                  </label>
                )}
              </div>
            </fieldset>
            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
              <button type="button" onClick={() => setSupplierEditorOpen(false)} className="border border-gray-400 px-4 py-2 rounded-xl hover:shadow-md transition-all duration-300 
                hover:scale-105 hover:bg-primary-dark/60 hover:text-white">Cancelar</button>
              <button type="submit" className="bg-primary rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:bg-primary/60 
                px-4 py-2 font-semibold text-white">Guardar proveedor</button>
            </div>
          </form>
        </div>, document.body
      )}

      {orderEditorOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-3 sm:p-6" onClick={(event) => { if (event.target === event.currentTarget) setOrderEditorOpen(false); }}>
          <form onSubmit={saveOrder} className="max-h-[92dvh] w-full max-w-3xl space-y-4 overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
            <div>
              <p className="text-sm text-gray-500">Abastecimiento</p>
              <h2 className="text-xl font-bold">Crear pedido de tienda</h2>
            </div>
            {orderLines.map((line, index) =>
              <div key={`order-line-${index}`} className="grid gap-3 border-y border-gray-200 py-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_6rem_8rem_auto]">
                <label className="text-sm font-medium">Producto
                  <select required value={line.productId} onChange={(event) => updateOrderLine(index, "productId", event.target.value)}
                    className="mt-1 w-full border border-gray-300 bg-white p-2">
                    {products.map((product) =>
                      <option key={product.id} value={product.id}>{product.nombre}
                      </option>
                    )}
                  </select>
                </label>
                <label className="text-sm font-medium">Proveedor
                  <select required value={line.supplierId} onChange={(event) => updateOrderLine(index, "supplierId", event.target.value)}
                    className="mt-1 w-full border border-gray-300 bg-white p-2">
                    {activeSuppliers.map((supplier) =>
                      <option key={supplier.id} value={supplier.id}>{supplier.nombre} {supplier.apellidos}
                      </option>
                    )}
                  </select>
                </label>
                <label className="text-sm font-medium">Cantidad
                  <input required min="1" type="number" value={line.quantity} onChange={(event) => updateOrderLine(index, "quantity", event.target.value)}
                    className="mt-1 w-full border border-gray-300 p-2" />
                </label>
                <label className="text-sm font-medium">Costo unitario
                  <input required min="0" type="number" value={line.unitCost} onChange={(event) => updateOrderLine(index, "unitCost", event.target.value)}
                    className="mt-1 w-full border border-gray-300 p-2" />
                </label>
                {orderLines.length > 1 &&
                  <button type="button" onClick={() => setOrderLines((current) => current.filter((_, lineIndex) => lineIndex !== index))}
                    aria-label="Quitar producto" className="self-end px-2 py-2 text-red-700">Quitar
                  </button>
                }
              </div>
            )}
            <button type="button" onClick={() => setOrderLines((current) => [...current, createOrderLine(products, activeSuppliers)])}
              className="text-sm font-semibold text-blue-800 underline">Agregar producto al pedido</button>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">Método de pago
                <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}
                  className="mt-1 w-full border border-gray-300 bg-white p-2">
                  {paymentMethods.map((method) =>
                    <option key={method}>{method}</option>
                  )}
                </select>
              </label>
              <label className="text-sm font-medium">Estado del pago
                <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}
                  className="mt-1 w-full border border-gray-300 bg-white p-2">
                  <option>Pendiente</option>
                  <option>Pagado</option>
                </select>
              </label>
            </div>
            <p className="text-sm text-gray-600">El stock se actualiza únicamente al recibir el pedido. Los lotes se registran sin vencimiento salvo que aplique.</p>
            {activeSuppliers.length === 0 && <p className="text-sm text-amber-800">Registra al menos un proveedor activo para crear pedidos.</p>}
            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
              <button type="button" onClick={() => setOrderEditorOpen(false)} className="border border-gray-400 px-4 py-2 rounded-xl hover:shadow-md transition-all duration-300 
                hover:scale-105 hover:bg-primary-dark/60 hover:text-white">Cancelar</button>
              <button type="submit" disabled={!products.length || activeSuppliers.length === 0}
                className="bg-primary rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:bg-primary/60 
                px-4 py-2 font-semibold text-white">Guardar pedido</button>
            </div>
          </form>
        </div>, document.body
      )}
    </section>
  );
}