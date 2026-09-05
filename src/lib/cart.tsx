import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  storeSlug: string;
  storeName: string;
  productSlug: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  currency: string;
  storeSlug: string | null;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "cinaauth.cart.v1";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const add = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((current) => {
        // One cart per store: switching stores replaces the cart.
        const base = current.length && current[0]!.storeSlug !== item.storeSlug ? [] : current;
        const existing = base.find((i) => i.productId === item.productId);
        const next = existing
          ? base.map((i) => (i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i))
          : [...base, { ...item, quantity }];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const remove = useCallback(
    (productId: string) => persist(items.filter((i) => i.productId !== productId)),
    [items, persist],
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number) =>
      persist(
        items
          .map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(99, quantity)) } : i))
          .filter((i) => i.quantity > 0),
      ),
    [items, persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  const value = useMemo<CartContextValue>(() => {
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return {
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      total,
      currency: items[0]?.currency ?? "USD",
      storeSlug: items[0]?.storeSlug ?? null,
      add,
      remove,
      setQuantity,
      clear,
    };
  }, [items, add, remove, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
