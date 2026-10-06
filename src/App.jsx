import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./Layout";
import { AuthModalProvider } from "./auth/AuthModalProvider";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { RequireEmployeeAuth } from "./auth/RequireEmployeeAuth";
import { PageSkeleton } from "./Skeletons";

const Content = lazy(() => import("./Content").then((module) => ({ default: module.Content })));
const Products = lazy(() => import("./Products").then((module) => ({ default: module.Products })));
const Categories = lazy(() => import("./Categories").then((module) => ({ default: module.Categories })));
const Sales = lazy(() => import("./Sales").then((module) => ({ default: module.Sales })));
const PointOfSale = lazy(() => import("./PointOfSale").then((module) => ({ default: module.PointOfSale })));
const Inventory = lazy(() => import("./Inventory").then((module) => ({ default: module.Inventory })));
const Users = lazy(() => import("./Users").then((module) => ({ default: module.Users })));
const Orders = lazy(() => import("./Orders").then((module) => ({ default: module.Orders })));
const User = lazy(() => import("./User").then((module) => ({ default: module.User })));

const withLoading = (Component, variant) => (
  <Suspense fallback={<PageSkeleton variant={variant} />}>
    <Component />
  </Suspense>
);

export function App() {
  return (
    <Router>
      <AuthModalProvider>
        <RequireEmployeeAuth>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={withLoading(Content, "home")} />
              <Route path="products" element={withLoading(Products, "products")} />
              <Route path="productos" element={withLoading(Products, "products")} />
              <Route path="categories" element={withLoading(Categories, "categories")} />
              <Route path="categorias" element={withLoading(Categories, "categories")} />
              <Route path="sales" element={withLoading(Sales, "sales")} />
              <Route path="ventas" element={withLoading(Sales, "sales")} />
              <Route path="pos" element={withLoading(PointOfSale, "pos")} />
              <Route path="inventory" element={withLoading(Inventory, "inventory")} />
              <Route path="users" element={withLoading(Users, "users")} />
              <Route path="usuarios" element={withLoading(Users, "users")} />
              <Route path="orders" element={<ProtectedRoute>{withLoading(Orders, "orders")}</ProtectedRoute>} />
              <Route path="pedidos" element={<ProtectedRoute>{withLoading(Orders, "orders")}</ProtectedRoute>} />
              <Route path="perfil" element={<ProtectedRoute>{withLoading(User, "profile")}</ProtectedRoute>} />
            </Route>
          </Routes>
        </RequireEmployeeAuth>
      </AuthModalProvider>
    </Router>
  );
}
