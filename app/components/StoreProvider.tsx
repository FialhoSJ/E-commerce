'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { ProductReview, ProductType } from '@/lib/types/ProductType';
import { createClient } from '@/lib/supabase/client';

export type User = { name: string; email: string; isAdmin?: boolean };
export type CartItem = ProductType & { quantity: number };
export type Order = { id: string; items: CartItem[]; total: number; subtotal?: number; shipping?: number; date: string; status?: string; persistence?: 'local' | 'database' };

type StoreContextValue = {
  user: User | null;
  authReady: boolean;
  reviews: Record<number, ProductReview[]>;
  addReview: (review: Omit<ProductReview, 'id' | 'createdAt' | 'author'>) => string | null;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  lastOrder: Order | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (name: string, email: string, password: string, redirect?: string) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<string | null>;
  requestPasswordReset: (email: string) => Promise<string | null>;
  resetPassword: (password: string) => Promise<string | null>;
  addToCart: (product: ProductType) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  completeOrder: () => Order | null;
  saveOrder: (order: Order, clearCart?: boolean) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);
const CART_KEY = '3d-store-cart';
const ORDER_KEY = '3d-store-last-order';
const REVIEWS_KEY = '3d-store-reviews';

function mapAuthUser(user: SupabaseUser | null): User | null {
  if (!user?.email) return null;
  const metadataName = user.user_metadata?.full_name;
  const name = typeof metadataName === 'string' && metadataName.trim()
    ? metadataName.trim()
    : user.email.split('@')[0];
  return { name, email: user.email };
}

function errorMessage(error: unknown) {
  if (!(error instanceof Error)) return 'Não foi possível conectar ao serviço de autenticação. Tente novamente.';

  const message = error.message.toLowerCase();
  if (message.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (message.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar. Verifique também a caixa de spam.';
  if (message.includes('user already registered')) return 'Este e-mail já tem uma conta. Tente entrar.';
  if (message.includes('password should be at least')) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (message.includes('email rate limit exceeded') || message.includes('too many requests')) return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.';
  if (message.includes('failed to fetch') || message.includes('network')) return 'Não foi possível conectar. Confira sua internet e tente novamente.';
  if (message.includes('configure') || message.includes('supabase')) return 'O serviço de autenticação está indisponível no momento.';
  return error.message;
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const saved = localStorage.getItem(key);
  if (!saved) return fallback;
  try { return JSON.parse(saved) as T; } catch { return fallback; }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [reviews, setReviews] = useState<Record<number, ProductReview[]>>({});

  useEffect(() => {
    let active = true;
    let subscription: { unsubscribe: () => void } | undefined;
    const frame = window.requestAnimationFrame(() => {
      setCart(readStorage<CartItem[]>(CART_KEY, []));
      setLastOrder(readStorage<Order | null>(ORDER_KEY, null));
      setReviews(readStorage<Record<number, ProductReview[]>>(REVIEWS_KEY, {}));
      // Remove the old demo credentials/session, which were stored in plain text.
      localStorage.removeItem('3d-store-users');
      localStorage.removeItem('3d-store-session');
      localStorage.removeItem('3d-store-reset');
      setHydrated(true);
    });

    try {
      const supabase = createClient();
      const auth = supabase.auth.onAuthStateChange((_event, session) => {
        if (active) setUser(mapAuthUser(session?.user ?? null));
      });
      subscription = auth.data.subscription;
      void supabase.auth.getUser().then(({ data, error }) => {
        if (active && !error) setUser(mapAuthUser(data.user));
      }).catch(() => undefined).finally(() => {
        if (active) setAuthReady(true);
      });
    } catch {
      setAuthReady(true);
    }

    return () => {
      active = false;
      window.cancelAnimationFrame(frame);
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [hydrated, cart]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  }, [hydrated, reviews]);
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await createClient().auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      return error ? errorMessage(error) : null;
    } catch (error) {
      return errorMessage(error);
    }
  };

  const signUp = async (name: string, email: string, password: string, redirect = '/') => {
    try {
      const { data, error } = await createClient().auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
        },
      });
      return { error: error ? errorMessage(error) : null, needsEmailConfirmation: !error && !data.session };
    } catch (error) {
      return { error: errorMessage(error), needsEmailConfirmation: false };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await createClient().auth.signOut();
      return error ? errorMessage(error) : null;
    } catch (error) {
      return errorMessage(error);
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const { error } = await createClient().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      return error ? errorMessage(error) : null;
    } catch (error) {
      return errorMessage(error);
    }
  };

  const resetPassword = async (password: string) => {
    try {
      const { error } = await createClient().auth.updateUser({ password });
      return error ? errorMessage(error) : null;
    } catch (error) {
      return errorMessage(error);
    }
  };

  const addReview = useCallback((review: Omit<ProductReview, 'id' | 'createdAt' | 'author'>) => {
    if (!user) return 'Entre na sua conta para avaliar este produto.';
    const nextReview: ProductReview = { ...review, id: `review-${Date.now()}`, author: user.name, createdAt: new Date().toISOString() };
    setReviews((current) => ({ ...current, [review.productId]: [...(current[review.productId] || []), nextReview] }));
    return null;
  }, [user]);

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
  const clearCart = useCallback(() => setCart([]), []);

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

  const saveOrder = useCallback((order: Order, clear = true) => {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    setLastOrder(order);
    if (clear) setCart([]);
  }, []);

  const value = useMemo(() => ({
    user, authReady, reviews, addReview,
    cart, cartCount: cart.reduce((total, item) => total + item.quantity, 0),
    cartTotal: cart.reduce((total, item) => total + (item.price || 0) * item.quantity, 0),
    lastOrder,
    signIn, signUp, signOut, requestPasswordReset, resetPassword, addToCart, removeFromCart, updateQuantity, clearCart, completeOrder, saveOrder,
  }), [user, authReady, reviews, addReview, cart, lastOrder, removeFromCart, updateQuantity, clearCart, completeOrder, saveOrder]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore deve ser usado dentro de StoreProvider');
  return context;
}
