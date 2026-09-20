'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ProductType } from '@/lib/types/ProductType';

export type User = { name: string; email: string };
export type CartItem = ProductType & { quantity: number };
export type Order = { id: string; items: CartItem[]; total: number; date: string };

type StoreContextValue = {
  user: User | null;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  lastOrder: Order | null;
  signIn: (email: string, password: string) => string | null;
  signUp: (name: string, email: string, password: string) => string | null;
  signOut: () => void;
  requestPasswordReset: (email: string) => void;
  verifyPasswordReset: (email: string, code: string) => string | null;
  resetPassword: (email: string, password: string) => boolean;
  addToCart: (product: ProductType) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  completeOrder: () => Order | null;
};

const StoreContext = createContext<StoreContextValue | null>(null);
const USERS_KEY = '3d-store-users';
const SESSION_KEY = '3d-store-session';
const CART_KEY = '3d-store-cart';
const RESET_KEY = '3d-store-reset';
const ORDER_KEY = '3d-store-last-order';

type StoredUser = User & { password: string };

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const savedUser = localStorage.getItem(SESSION_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const savedCart = localStorage.getItem(CART_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [lastOrder, setLastOrder] = useState<Order | null>(() => {
    if (typeof window === 'undefined') return null;
    const savedOrder = localStorage.getItem(ORDER_KEY);
    return savedOrder ? JSON.parse(savedOrder) : null;
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const signIn = (email: string, password: string) => {
    const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const found = users.find((item) => item.email === email.trim().toLowerCase() && item.password === password);
    if (!found) return 'E-mail ou senha inválidos.';
    const session = { name: found.name, email: found.email };
    setUser(session);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return null;
  };

  const signUp = (name: string, email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.some((item) => item.email === normalizedEmail)) return 'Este e-mail já está cadastrado.';
    const newUser = { name: name.trim(), email: normalizedEmail, password };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    const session = { name: newUser.name, email: newUser.email };
    setUser(session);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return null;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const requestPasswordReset = (email: string) => {
    const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const normalizedEmail = email.trim().toLowerCase();
    const exists = users.some((item) => item.email === normalizedEmail);
    if (exists) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      localStorage.setItem(RESET_KEY, JSON.stringify({ email: normalizedEmail, code, expiresAt: Date.now() + 10 * 60 * 1000, attempts: 0, verified: false }));
      // Substituir por Resend/SMTP no backend. Nunca exponha o código na resposta da API.
      console.info(`[3D Store] OTP de desenvolvimento para ${normalizedEmail}: ${code}`);
    }
  };

  const verifyPasswordReset = (email: string, code: string) => {
    const reset = JSON.parse(localStorage.getItem(RESET_KEY) || 'null');
    const normalizedEmail = email.trim().toLowerCase();
    if (!reset || reset.email !== normalizedEmail || Date.now() > reset.expiresAt) return 'Código inválido ou expirado.';
    if (reset.attempts >= 5) return 'Limite de tentativas atingido. Solicite um novo código.';
    if (reset.code !== code.trim()) {
      reset.attempts += 1;
      localStorage.setItem(RESET_KEY, JSON.stringify(reset));
      return 'Código inválido ou expirado.';
    }
    reset.verified = true;
    localStorage.setItem(RESET_KEY, JSON.stringify(reset));
    return null;
  };

  const resetPassword = (email: string, password: string) => {
    const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const normalizedEmail = email.trim().toLowerCase();
    if (!users.some((item) => item.email === normalizedEmail)) return false;
    localStorage.setItem(USERS_KEY, JSON.stringify(users.map((item) => item.email === normalizedEmail ? { ...item, password } : item)));
    const reset = JSON.parse(localStorage.getItem(RESET_KEY) || 'null');
    if (!reset || reset.email !== normalizedEmail || !reset.verified || Date.now() > reset.expiresAt) return false;
    localStorage.setItem(USERS_KEY, JSON.stringify(users.map((item) => item.email === normalizedEmail ? { ...item, password } : item)));
    localStorage.removeItem(RESET_KEY);
    return true;
  };

  const addToCart = (product: ProductType) => setCart((items) => {
    const existing = items.find((item) => item.id === product.id);
    return existing
      ? items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...items, { ...product, quantity: 1 }];
  });

  const removeFromCart = useCallback((productId: number) => setCart((items) => items.filter((item) => item.id !== productId)), []);
  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity < 1) return removeFromCart(productId);
    setCart((items) => items.map((item) => item.id === productId ? { ...item, quantity } : item));
  }, [removeFromCart]);

  const completeOrder = useCallback((): Order | null => {
    if (cart.length === 0) return null;
    const order: Order = {
      id: `3DS-${Date.now().toString(36).toUpperCase()}`,
      items: cart,
      total: cart.reduce((total, item) => total + (item.price || 0) * item.quantity, 0),
      date: new Date().toISOString(),
    };
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    setLastOrder(order);
    setCart([]);
    return order;
  }, [cart]);

  const value = useMemo(() => ({
    user, cart, cartCount: cart.reduce((total, item) => total + item.quantity, 0),
    cartTotal: cart.reduce((total, item) => total + (item.price || 0) * item.quantity, 0),
    lastOrder,
    signIn, signUp, signOut, requestPasswordReset, verifyPasswordReset, resetPassword, addToCart, removeFromCart, updateQuantity, completeOrder,
  }), [user, cart, lastOrder, removeFromCart, updateQuantity, completeOrder]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore deve ser usado dentro de StoreProvider');
  return context;
}
