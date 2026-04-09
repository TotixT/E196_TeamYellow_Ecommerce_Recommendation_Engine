import { createBrowserRouter, Navigate } from "react-router";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Home } from "./pages/Home";
import { Catalog } from "./pages/Catalog";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { OrderHistory } from "./pages/OrderHistory";
import { Profile } from "./pages/Profile";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminProducts } from "./pages/admin/Products";
import { AdminProductForm } from "./pages/admin/ProductForm";
import { AdminUsers } from "./pages/admin/Users";
import { AdminRecommendations } from "./pages/admin/Recommendations";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { AdminStats } from "./pages/admin/AdminStats";

function NotFound() {
  return <Navigate to="/" replace />;
}

export const router = createBrowserRouter([
  { path: "/", Component: Home },
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },
  { path: "/catalog", Component: Catalog },
  { path: "/product/:id", Component: ProductDetail },
  { path: "/cart", Component: Cart },
  { path: "/checkout", Component: Checkout },
  { path: "/orders", Component: OrderHistory },
  { path: "/profile", Component: Profile },
  { path: "/admin", Component: AdminDashboard },
  { path: "/admin/products", Component: AdminProducts },
  { path: "/admin/products/new", Component: AdminProductForm },
  { path: "/admin/products/:id/edit", Component: AdminProductForm },
  { path: "/admin/users", Component: AdminUsers },
  { path: "/admin/recommendations", Component: AdminRecommendations },
  { path: "/admin/orders", Component: AdminOrders },
  { path: "/admin/stats", Component: AdminStats },
  { path: "*", Component: NotFound },
]);