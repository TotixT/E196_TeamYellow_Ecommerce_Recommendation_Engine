import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description: string;
  status: "Activo" | "Inactivo";
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: "Procesado" | "Enviado" | "Entregado";
  items: CartItem[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "Usuario" | "Administrador";
  status: "Activo" | "Inactivo";
  phone?: string;
  address?: string;
}

interface AppContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  role: "user" | "admin" | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const AppContext = createContext<AppContextType | null>(null);

const MOCK_USERS: User[] = [
  { id: 1, name: "Carlos Rodríguez", email: "user@eie.com", role: "Usuario", status: "Activo", phone: "300 123 4567", address: "Calle 123 #45-67, Bogotá" },
  { id: 2, name: "Administrador", email: "admin@eie.com", role: "Administrador", status: "Activo", phone: "310 987 6543", address: "Carrera 10 #20-30, Medellín" },
  { id: 3, name: "Laura Gómez", email: "laura@email.com", role: "Usuario", status: "Activo", phone: "315 555 1234", address: "Av. 68 #90-12, Cali" },
  { id: 4, name: "Andrés Torres", email: "andres@email.com", role: "Usuario", status: "Inactivo", phone: "320 333 4455", address: "Diagonal 22 #11-44, Barranquilla" },
  { id: 5, name: "Valentina Cruz", email: "valen@email.com", role: "Usuario", status: "Activo", phone: "305 777 8899", address: "Transversal 5 #30-10, Bucaramanga" },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: "Audífonos Inalámbricos Pro", category: "Audio", price: 189900, stock: 45, image: "https://images.unsplash.com/photo-1578517581165-61ec5ab27a19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", description: "Audífonos de alta fidelidad con cancelación activa de ruido, conectividad Bluetooth 5.0 y hasta 30 horas de batería. Diseño ergonómico con almohadillas de memoria para mayor comodidad.", status: "Activo" },
  { id: 2, name: "Laptop UltraBook 15\"", category: "Computadores", price: 3499900, stock: 12, image: "https://images.unsplash.com/photo-1631543561989-98c3bfd1bb73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", description: "Portátil de alto rendimiento con procesador Intel Core i7 de 12ª generación, 16 GB RAM, 512 GB SSD y pantalla Full HD IPS. Ideal para trabajo y entretenimiento.", status: "Activo" },
  { id: 3, name: "Smartphone Galaxy X12", category: "Celulares", price: 2199900, stock: 30, image: "https://images.unsplash.com/photo-1673718424091-5fb734062c05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", description: "Teléfono inteligente con pantalla AMOLED 6.7\", cámara triple 108 MP, batería 5000 mAh y carga rápida 65W. Android 14 con actualizaciones garantizadas por 4 años.", status: "Activo" },
  { id: 4, name: "Smartwatch FitPro Series 5", category: "Accesorios", price: 649900, stock: 58, image: "https://images.unsplash.com/photo-1687078426457-89ce2b562eaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", description: "Reloj inteligente con monitor cardíaco, GPS integrado, resistencia al agua IP68 y más de 100 modos deportivos. Pantalla AMOLED siempre encendida.", status: "Activo" },
  { id: 5, name: "Cámara Mirrorless Alpha 7", category: "Fotografía", price: 4899900, stock: 8, image: "https://images.unsplash.com/photo-1632222623518-bbbd5f1f2489?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", description: "Cámara sin espejo de full frame con sensor de 33 MP, sistema de enfoque automático avanzado, video 4K 60fps y estabilización en 5 ejes. Para fotógrafos profesionales.", status: "Activo" },
  { id: 6, name: "Tablet Pro 11\"", category: "Tablets", price: 1899900, stock: 25, image: "https://images.unsplash.com/photo-1672298597883-aba600a9b5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", description: "Tableta con pantalla Liquid Retina 11\", chip M2, compatible con Apple Pencil y teclado Magic Keyboard. Perfecta para creativos y profesionales en movimiento.", status: "Activo" },
  { id: 7, name: "Teclado Gaming Mecánico RGB", category: "Gaming", price: 299900, stock: 40, image: "https://images.unsplash.com/photo-1570944887446-890d62d87293?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", description: "Teclado mecánico con switches Cherry MX Red, iluminación RGB por tecla, construcción en aluminio y software de personalización. Anti-ghosting total.", status: "Activo" },
  { id: 8, name: "Altavoz Bluetooth 360°", category: "Audio", price: 249900, stock: 35, image: "https://images.unsplash.com/photo-1598034989845-48532781987e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400", description: "Altavoz portátil con sonido envolvente 360°, resistencia al agua IPX7, batería de 24 horas y carga inalámbrica. Conecta hasta 2 dispositivos simultáneamente.", status: "Activo" },
];

const INITIAL_ORDERS: Order[] = [
  { id: "ORD-202400001", date: "2024-11-15", total: 2449800, status: "Entregado", items: [{ ...INITIAL_PRODUCTS[0], quantity: 2 }, { ...INITIAL_PRODUCTS[3], quantity: 1 }] },
  { id: "ORD-202400002", date: "2025-01-20", total: 3499900, status: "Enviado", items: [{ ...INITIAL_PRODUCTS[1], quantity: 1 }] },
  { id: "ORD-202500003", date: "2025-02-10", total: 299900, status: "Procesado", items: [{ ...INITIAL_PRODUCTS[6], quantity: 1 }] },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  const role = currentUser?.role === "Administrador" ? "admin" : currentUser ? "user" : null;

  const login = (email: string, password: string): boolean => {
    const user = MOCK_USERS.find(u => u.email === email);
    if (user && password === "123456") {
      setIsAuthenticated(true);
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCart([]);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated, currentUser, role, login, logout,
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      orders, addOrder,
      products, setProducts,
      users, setUsers,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
