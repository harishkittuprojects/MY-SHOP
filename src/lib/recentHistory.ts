// Utility for storing and retrieving recent searches and viewed products
const RECENT_SEARCHES_KEY = "my_shop_recent_searches";
const RECENT_VIEWED_KEY = "my_shop_recent_viewed_ids";

export function addRecentSearch(query: string) {
  if (typeof window === "undefined" || !query || !query.trim()) return;
  try {
    const clean = query.trim();
    const existing = getRecentSearches();
    const filtered = existing.filter((item) => item.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...filtered].slice(0, 10);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("recent_history_updated"));
  } catch (err) {
    console.warn("Could not save recent search:", err);
  }
}

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewedProduct(productId: string) {
  if (typeof window === "undefined" || !productId) return;
  try {
    const existing = getRecentlyViewedProductIds();
    const filtered = existing.filter((id) => id !== productId);
    const updated = [productId, ...filtered].slice(0, 12);
    localStorage.setItem(RECENT_VIEWED_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("recent_history_updated"));
  } catch (err) {
    console.warn("Could not save recently viewed product:", err);
  }
}

export function getRecentlyViewedProductIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_VIEWED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearRecentHistory() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    localStorage.removeItem(RECENT_VIEWED_KEY);
    window.dispatchEvent(new Event("recent_history_updated"));
  } catch (err) {
    console.warn("Could not clear recent history:", err);
  }
}
