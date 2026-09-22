import { useState, useCallback, useEffect } from "react";
import { WishlistItem } from "../../lib/types/wishlist";
import ProductService from "../services/ProductService";

const productService = new ProductService();

const WISHLIST_STORAGE_PREFIX = "wishlistData_";

function getStorageKey(userId: string | null): string {
  return `${WISHLIST_STORAGE_PREFIX}${userId ?? "guest"}`;
}

function readWishlistFromStorage(userId: string | null): WishlistItem[] {
  if (typeof window === "undefined") return [];
  const key = getStorageKey(userId);
  try {
    const stored = localStorage.getItem(key);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function useWishlist(userId: string | null) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() =>
    readWishlistFromStorage(userId)
  );

  // Keep guest selections and merge them into the signed-in account once.
  useEffect(() => {
    let next = readWishlistFromStorage(userId);
    if (userId) {
      const guestItems = readWishlistFromStorage(null);
      if (guestItems.length > 0) {
        const byId = new Map(next.map((item) => [item._id, item]));
        guestItems.forEach((item) => byId.set(item._id, item));
        next = Array.from(byId.values());
        localStorage.setItem(getStorageKey(userId), JSON.stringify(next));
        localStorage.removeItem(getStorageKey(null));
      }
    }
    setWishlistItems(next);
  }, [userId]);

  const persist = useCallback(
    (items: WishlistItem[]) => {
      if (typeof window === "undefined") return;
      localStorage.setItem(getStorageKey(userId), JSON.stringify(items));
    },
    [userId]
  );

  const addToWishlist = useCallback(
    (item: WishlistItem) => {
      setWishlistItems((prev) => {
        if (prev.some((i) => i._id === item._id)) return prev;
        const next = [...prev, item];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const removeFromWishlist = useCallback(
    (id: string) => {
      setWishlistItems((prev) => {
        const next = prev.filter((i) => i._id !== id);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const toggleWishlist = useCallback(
    (item: WishlistItem) => {
      setWishlistItems((prev) => {
        const exists = prev.some((i) => i._id === item._id);
        const next = exists ? prev.filter((i) => i._id !== item._id) : [...prev, item];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const isInWishlist = useCallback(
    (id: string) => wishlistItems.some((i) => i._id === id),
    [wishlistItems]
  );

  /** Serverdan mahsulot narxi/rasmini yangilab, wishlist ni sync qiladi (seller o'zgartirsa customer ko'radi). */
  const refreshWishlist = useCallback(async () => {
    if (!userId || wishlistItems.length === 0) return;
    const results = await Promise.allSettled(
      wishlistItems.map((item) => productService.getProduct(item._id))
    );
    const updated: WishlistItem[] = wishlistItems.map((item, index) => {
      const result = results[index];
      if (result.status === "fulfilled" && result.value) {
        const p = result.value;
        return {
          _id: p._id,
          name: p.productName ?? item.name,
          price: p.productPrice ?? item.price,
          image: Array.isArray(p.productImages) && p.productImages[0] ? p.productImages[0] : item.image,
          collection: String(p.productCollection ?? item.collection),
        };
      }
      return item;
    });
    setWishlistItems(updated);
    persist(updated);
  }, [userId, wishlistItems, persist]);

  return {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    refreshWishlist,
    isSignedIn: !!userId,
  };
}
