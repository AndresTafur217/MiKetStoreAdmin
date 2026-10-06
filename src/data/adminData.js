const dataChangeEvent = "miketstore:admin-data-change";

const readCollection = (key, fallback) => {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
};

const saveCollection = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(dataChangeEvent));
};

const seedRoles = [
  { id: "cliente", nombre: "Cliente", salario: 0, funciones: ["Realizar compras", "Gestionar su cuenta"] },
  { id: "administrador", nombre: "Administrador", salario: 4200000, funciones: ["Administrar catálogo", "Gestionar usuarios y ventas"] },
  { id: "supervisor", nombre: "Supervisor", salario: 3200000, funciones: ["Supervisar operaciones", "Consultar reportes"] },
  { id: "operador", nombre: "Operador", salario: 2200000, funciones: ["Procesar ventas", "Preparar pedidos"] },
  { id: "colaborador", nombre: "Colaborador", salario: 1800000, funciones: ["Atender clientes", "Apoyar inventario"] },
];

const seedUsers = [
  {
    id: "USR-001",
    nombre: "Andrea",
    apellidos: "Tafur",
    tipo_de_documento: "CC",
    numero_documento: "1000000001",
    fecha_de_nacimiento: "1998-05-12",
    id_rol: "cliente",
    correo: "andres.tafur@miketstore.com",
    telefono: "3000000001",
    contraseña: "MiKet2026!",
    contraseña_hash: "demo-hash-no-autenticable",
    fecha_de_ingreso: "2026-08-01",
    estado: "Activo",
  },
  {
    id: "USR-002",
    nombre: "Andres",
    apellidos: "Tafur",
    tipo_de_documento: "CC",
    numero_documento: "1000000002",
    fecha_de_nacimiento: "1995-03-20",
    id_rol: "administrador",
    correo: "admin@miketstore.com",
    telefono: "3000000002",
    contraseña: "MiKet2026!",
    contraseña_hash: "demo-hash-no-autenticable",
    fecha_de_ingreso: "2026-01-10",
    estado: "Activo",
  },
];

const seedAddresses = [
  {
    id: "DIR-001",
    id_usuario: "USR-001",
    ciudad: "Bogotá",
    localidad: "Chapinero",
    barrio: "La Soledad",
    tipo_de_via: "Carrera",
    numero_de_via: "24",
    numero_de_vivienda: "45-18",
    complemento: "Apto 302",
    predeterminada: true,
  },
];

const seedSales = [
  {
    id: "VTA-2026-0041",
    id_usuario: "USR-001",
    id_comprador: "USR-001",
    id_vendedor: "USR-002",
    cliente: "Andrea Tafur",
    items: [{ productId: 17, nombre: "Teclado Roland V-Stage 88", quantity: 1, precio: 17390000, subtotal: 17390000 }],
    total: 17390000,
    estado: "Pagada",
    tipo_venta: "Virtual",
    metodos_pago: ["Tarjeta débito o crédito"],
    fecha_venta: "2026-10-02T15:20:00.000Z",
    fecha_pago: "2026-10-02T15:21:00.000Z",
    requiere_domicilio: true,
    servicio_domicilio: true,
    requiere_factura_electronica: true,
    factura: {
      id: "FE-2026-0041",
      id_venta: "VTA-2026-0041",
      numero_factura: "000041",
      prefijo: "MK",
      fecha_emision: "2026-10-02T15:22:00.000Z",
      estado: "Validada",
      cufe: "CUFE-DEMO-2026-0041",
      fecha_validacion: "2026-10-02T15:23:00.000Z",
    },
    domicilio: {
      id: "PED-2026-0041",
      id_venta: "VTA-2026-0041",
      id_direccion: "DIR-001",
      precio: 35000,
      estado: "En preparación",
      fecha_salida: "",
      fecha_entrega: "",
    },
  },
  {
    id: "VTA-2026-0040",
    id_usuario: "",
    id_comprador: "",
    id_vendedor: "USR-002",
    cliente: "Cliente",
    items: [
      { productId: 19, nombre: "Cello Cervini HC-100 1/4", quantity: 1, precio: 1590000, subtotal: 1590000 },
      { productId: 9, nombre: "Guitarra Electrica Ibanez IC420-ABM/ESTUCHE", quantity: 1, precio: 3000000, subtotal: 3000000 },
    ],
    total: 4590000,
    estado: "En espera",
    tipo_venta: "Física",
    metodos_pago: ["Efectivo", "Transferencia bancaria"],
    fecha_venta: "2026-10-01T18:10:00.000Z",
    fecha_pago: "",
    requiere_domicilio: false,
    servicio_domicilio: false,
    requiere_factura_electronica: false,
    factura: null,
    domicilio: null,
  },
];

const salesRelationsStorageKey = "miketstore-admin-sales-relations";

const buildSalesRelations = (sales) => ({
  ventas: sales.map((sale) => ({
    id: sale.id,
    fecha: sale.fecha_venta,
    total: sale.total,
    id_comprador: sale.id_comprador ?? sale.id_usuario ?? "",
    id_vendedor: sale.id_vendedor || "USR-002",
    tipo_de_venta: sale.tipo_venta,
    servicio_domicilio: sale.servicio_domicilio ?? Boolean(sale.requiere_domicilio),
    estado: sale.estado,
  })),
  detalleVenta: sales.flatMap((sale) => (sale.items || []).map((item, index) => ({
    id: `DET-${sale.id}-${index + 1}`,
    id_venta: sale.id,
    id_producto: item.productId,
    producto_nombre: item.nombre,
    cantidad: item.quantity,
    precio_unitario: item.precio,
    subtotal: item.subtotal ?? item.precio * item.quantity,
  }))),
  pagoVenta: sales.map((sale) => ({
    id: `PAG-${sale.id}`,
    id_venta: sale.id,
    monto_total: sale.total,
    metodo_de_pago: (sale.metodos_pago || []).join(" + "),
    fecha: sale.fecha_pago || sale.fecha_venta,
    estado: sale.estado,
  })),
  facturasElectronicas: sales.filter((sale) => sale.factura).map((sale) => ({ ...sale.factura })),
  pedidosUsuario: sales.filter((sale) => sale.domicilio).map((sale) => ({ ...sale.domicilio })),
});

export const getAdminDataChangeEvent = () => dataChangeEvent;

export const EMPLOYEE_ROLE_IDS = ["administrador", "supervisor", "operador", "colaborador"];

export const isEmployeeRole = (roleId) => EMPLOYEE_ROLE_IDS.includes(roleId);

export const getAdminUsers = () => readCollection("miketstore-admin-users", seedUsers);
export const saveAdminUsers = (users) => saveCollection("miketstore-admin-users", users);

export const getAdminRoles = () => readCollection("miketstore-admin-roles", seedRoles);
export const saveAdminRoles = (roles) => saveCollection("miketstore-admin-roles", roles);

export const getAdminAddresses = () => readCollection("miketstore-admin-addresses", seedAddresses);
export const saveAdminAddresses = (addresses) => saveCollection("miketstore-admin-addresses", addresses);

export const getAdminSales = () => readCollection("miketstore-admin-sales", seedSales).map((sale) => ({
  ...sale,
  id_comprador: sale.id_comprador ?? sale.id_usuario ?? "",
  id_vendedor: sale.id_vendedor || "USR-002",
  servicio_domicilio: sale.servicio_domicilio ?? Boolean(sale.requiere_domicilio),
}));
export const getAdminSalesRelations = () => readCollection(salesRelationsStorageKey, buildSalesRelations(getAdminSales()));
export const saveAdminSales = (sales) => {
  window.localStorage.setItem("miketstore-admin-sales", JSON.stringify(sales));
  window.localStorage.setItem(salesRelationsStorageKey, JSON.stringify(buildSalesRelations(sales)));
  window.dispatchEvent(new Event(dataChangeEvent));
};

export const recordAdminSale = (order, user, options = {}) => {
  const sales = getAdminSales();
  if (sales.some((sale) => sale.id === order.id)) return sales.find((sale) => sale.id === order.id);

  const sale = {
    id: order.id,
    id_usuario: user?.id || "",
    id_comprador: user?.id || "",
    id_vendedor: options.id_vendedor || "USR-002",
    cliente: user ? `${user.nombre} ${user.apellidos || ""}`.trim() : "Cliente",
    items: order.items.map((item) => ({
      productId: item.productId,
      nombre: item.nombre,
      quantity: item.quantity,
      precio: item.precio,
      subtotal: item.precio * item.quantity,
    })),
    total: order.total,
    estado: order.status === "Pagado" ? "Pagada" : "En espera",
    tipo_venta: options.tipo_venta || "Virtual",
    metodos_pago: options.metodos_pago || [order.paymentMethod].filter(Boolean),
    fecha_venta: order.createdAt,
    fecha_pago: order.status === "Pagado" ? order.createdAt : "",
    requiere_domicilio: Boolean(options.requiere_domicilio),
    servicio_domicilio: Boolean(options.requiere_domicilio),
    requiere_factura_electronica: Boolean(options.requiere_factura_electronica),
    factura: null,
    domicilio: options.requiere_domicilio ? {
      id: `PED-${order.id}`,
      id_venta: order.id,
      id_direccion: options.id_direccion || "",
      precio: Number(options.precio_domicilio) || 0,
      estado: "Pendiente",
      fecha_salida: "",
      fecha_entrega: "",
    } : null,
  };

  saveAdminSales([sale, ...sales]);
  return sale;
};

const purchasingStorageKey = "miketstore-admin-purchasing";
const emptyPurchasingData = {
  suppliers: [],
  supplierCategories: [],
  storeOrders: [],
  storeOrderDetails: [],
  orderProducts: [],
  purchasePayments: [],
  lots: [],
  inventorySessions: [],
  inventoryDetails: [],
  inventoryMovements: [],
  inventoryOpeningBalances: [],
};

export const getPurchasingData = () => {
  const stored = readCollection(purchasingStorageKey, emptyPurchasingData);
  return Object.fromEntries(Object.keys(emptyPurchasingData).map((key) => [
    key,
    Array.isArray(stored?.[key]) ? stored[key] : [],
  ]));
};

export const savePurchasingData = (data) => saveCollection(purchasingStorageKey, data);

export const createStoreOrder = ({ userId, items, paymentMethod, paymentStatus }) => {
  const data = getPurchasingData();
  if (!items.length || items.some((item) => !Number.isInteger(Number(item.productId))
    || !data.suppliers.some((supplier) => supplier.id === item.supplierId && supplier.estado === "Activo")
    || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1
    || !Number.isFinite(Number(item.unitCost)) || Number(item.unitCost) < 0)) {
    throw new Error("El pedido requiere productos, proveedor y cantidades válidas.");
  }

  const now = new Date().toISOString();
  const id = `PDT-${Date.now()}`;
  const details = items.map((item, index) => ({
    id: `DET-${id}-${index + 1}`,
    id_pedido_tienda: id,
    id_proveedor: item.supplierId,
    cantidad: Number(item.quantity),
    subtotal: Number(item.quantity) * Number(item.unitCost),
    estado: "Pendiente de recepción",
  }));
  const orderProducts = items.map((item, index) => ({
    id_detalle_pedido: details[index].id,
    id_producto: Number(item.productId),
  }));
  const total = details.reduce((sum, detail) => sum + detail.subtotal, 0);
  const order = { id, id_usuario: userId, fecha: now, total, estado: "Solicitado" };
  const payment = {
    id: `PP-${id}`,
    id_pedido_tienda: id,
    monto_total: total,
    metodo_de_pago: paymentMethod,
    fecha: now,
    estado: paymentStatus,
  };

  savePurchasingData({
    ...data,
    storeOrders: [order, ...data.storeOrders],
    storeOrderDetails: [...details, ...data.storeOrderDetails],
    orderProducts: [...orderProducts, ...data.orderProducts],
    purchasePayments: [payment, ...data.purchasePayments],
  });
  return order;
};

export const receiveStoreOrder = (orderId) => {
  const data = getPurchasingData();
  const order = data.storeOrders.find((item) => item.id === orderId);
  if (!order || order.estado === "Recibido") return null;

  const now = new Date().toISOString();
  const details = data.storeOrderDetails.filter((item) => item.id_pedido_tienda === orderId);
  const receivedItems = details.map((detail) => {
    const relation = data.orderProducts.find((item) => item.id_detalle_pedido === detail.id);
    return { detail, productId: relation?.id_producto };
  }).filter((item) => item.productId);
  const lots = receivedItems.map(({ detail, productId }) => ({
    id: `LOT-${detail.id}`,
    numero_de_lote: `L-${detail.id}`,
    id_producto: productId,
    fecha_de_ingreso: now,
    fecha_de_vencimiento: "",
    unidades: detail.cantidad,
  }));
  const movements = receivedItems.map(({ detail, productId }) => ({
    id: `MOV-${detail.id}`,
    id_producto: productId,
    id_referencia: orderId,
    tipo: "Entrada por compra",
    unidades: detail.cantidad,
    fecha: now,
    id_usuario: order.id_usuario,
  }));

  savePurchasingData({
    ...data,
    storeOrders: data.storeOrders.map((item) => item.id === orderId ? { ...item, estado: "Recibido", fecha_recepcion: now } : item),
    storeOrderDetails: data.storeOrderDetails.map((item) => item.id_pedido_tienda === orderId
      ? { ...item, estado: "Recibido" }
      : item),
    lots: [...lots, ...data.lots],
    inventoryMovements: [...movements, ...data.inventoryMovements],
  });
  return receivedItems;
};

export const recordInventoryMovements = (movements) => {
  if (movements.length === 0) return;
  const data = getPurchasingData();
  const now = new Date().toISOString();
  const entries = movements.map((movement, index) => ({
    id: `MOV-${Date.now()}-${index}`,
    fecha: now,
    ...movement,
  }));
  savePurchasingData({ ...data, inventoryMovements: [...entries, ...data.inventoryMovements] });
};

export const recordInventoryAudit = ({ userId, counts }) => {
  const uniqueProductIds = new Set();
  const validCounts = counts.every((count) => {
    const productId = Number(count.productId);
    const stock = Number(count.stock);
    const isValid = Number.isInteger(productId) && Number.isInteger(stock) && stock >= 0 && !uniqueProductIds.has(productId);
    uniqueProductIds.add(productId);
    return isValid;
  });
  if (counts.length === 0 || !validCounts) throw new Error("Cada producto debe tener un conteo entero y no negativo.");

  const data = getPurchasingData();
  const now = new Date().toISOString();
  const id = `INV-${Date.now()}`;
  const session = {
    id,
    numero_de_inventario: id,
    id_usuario: userId,
    stock_total: counts.reduce((total, count) => total + Number(count.stock), 0),
    fecha: now,
    estado: "Finalizado",
  };
  const details = counts.map((count, index) => ({
    id: `DINV-${id}-${index + 1}`,
    id_inventario: id,
    id_producto: Number(count.productId),
    id_lote: count.lotId || "",
    stock_sistema: Number(count.systemStock),
    stock_fisico: Number(count.stock),
    diferencia: Number(count.stock) - Number(count.systemStock),
  }));
  const adjustments = details.filter((detail) => detail.diferencia !== 0).map((detail) => ({
    id: `MOV-${detail.id}`,
    id_producto: detail.id_producto,
    id_referencia: id,
    tipo: detail.diferencia > 0 ? "Ajuste positivo" : "Ajuste negativo",
    unidades: Math.abs(detail.diferencia),
    fecha: now,
    id_usuario: userId,
  }));

  savePurchasingData({
    ...data,
    inventorySessions: [session, ...data.inventorySessions],
    inventoryDetails: [...details, ...data.inventoryDetails],
    inventoryMovements: [...adjustments, ...data.inventoryMovements],
  });
  return { session, details };
};

export const initializeInventoryOpeningBalances = (products, sales) => {
  const data = getPurchasingData();
  const knownProductIds = new Set(data.inventoryOpeningBalances.map((balance) => balance.id_producto));
  const missingProducts = products.filter((product) => !knownProductIds.has(product.id));
  if (missingProducts.length === 0) return data;

  const balances = missingProducts.map((product) => {
    const productMovements = data.inventoryMovements.filter((movement) => movement.id_producto === product.id);
    const purchased = productMovements.filter((movement) => movement.tipo === "Entrada por compra")
      .reduce((total, movement) => total + movement.unidades, 0);
    const adjustments = productMovements.reduce((total, movement) => {
      if (movement.tipo === "Ajuste positivo") return total + movement.unidades;
      if (movement.tipo === "Ajuste negativo") return total - movement.unidades;
      return total;
    }, 0);
    const sold = sales.filter((sale) => sale.estado !== "Cancelada")
      .flatMap((sale) => sale.items || [])
      .filter((item) => item.productId === product.id)
      .reduce((total, item) => total + item.quantity, 0);

    return {
      id_producto: product.id,
      stock_inicial: Number(product.stock) - purchased + sold - adjustments,
      fecha_de_apertura: new Date().toISOString(),
    };
  });
  const nextData = { ...data, inventoryOpeningBalances: [...data.inventoryOpeningBalances, ...balances] };
  savePurchasingData(nextData);
  return nextData;
};