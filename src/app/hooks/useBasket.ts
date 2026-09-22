import { useState, useCallback, useEffect } from "react";
import { CartItem } from "../../lib/types/cart";
import { useGlobals } from "../hooks/useGlobals";

const CART_STORAGE_PREFIX = "cartData";

function getCartStorageKey(userId: string | null): string {
  return userId ? `${CART_STORAGE_PREFIX}_${userId}` : `${CART_STORAGE_PREFIX}_guest`;
}

function readCart(key: string): CartItem[] {
  try {
    const value = localStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mergeCarts(current: CartItem[], incoming: CartItem[]): CartItem[] {
  const merged = new Map(current.map((item) => [item._id, { ...item }]));
  incoming.forEach((item) => {
    const existing = merged.get(item._id);
    merged.set(item._id, existing
      ? { ...existing, quantity: existing.quantity + (item.quantity ?? 1) }
      : { ...item, quantity: item.quantity ?? 1 });
  });
  return Array.from(merged.values());
}

export default function useBasket() {
  const { authUser } = useGlobals();
  const userId = authUser?._id ?? null;
  const storageKey = getCartStorageKey(userId);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart for current user when storage key changes (login/logout)
  useEffect(() => {
    if (typeof window === "undefined") return;
    let next = readCart(storageKey);

    if (userId) {
      const guestKey = getCartStorageKey(null);
      const guestCart = readCart(guestKey);
      if (guestCart.length > 0) {
        next = mergeCarts(next, guestCart);
        localStorage.setItem(storageKey, JSON.stringify(next));
        localStorage.removeItem(guestKey);
      }
    }

    setCartItems(next);
  }, [storageKey, userId]);

  const persist = useCallback(
    (items: CartItem[]) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, JSON.stringify(items));
      }
    },
    [storageKey]
  );

  const onAdd = useCallback(
    (input: CartItem) => {
      setCartItems((prev) => {
        const exist = prev.find((item) => item._id === input._id);
        let next: CartItem[];
        if (exist) {
          next = prev.map((item) =>
            item._id === input._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          next = [...prev, { ...input, quantity: input.quantity ?? 1 }];
        }
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const onRemove = useCallback(
    (input: CartItem) => {
      setCartItems((prev) => {
        const item = prev.find((i) => i._id === input._id);
        if (!item) return prev;
        if (item.quantity <= 1) {
          const next = prev.filter((i) => i._id !== input._id);
          persist(next);
          return next;
        }
        const next = prev.map((i) =>
          i._id === input._id ? { ...i, quantity: i.quantity - 1 } : i
        );
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const onDelete = useCallback(
    (input: CartItem) => {
      setCartItems((prev) => {
        const next = prev.filter((item) => item._id !== input._id);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const onDeleteAll = useCallback(() => {
    setCartItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  return {
    cartItems,
    onAdd,
    onRemove,
    onDelete,
    onDeleteAll,
  };
}
