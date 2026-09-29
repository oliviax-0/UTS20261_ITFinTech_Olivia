// Riwayat pesanan disimpan per perangkat (belum ada login), berisi daftar checkoutId terbaru dulu
const KEY = "kedai-nongkrong-orders";
const MAX = 50;

export function getCheckoutHistory(): string[] {
  try {
    const ids = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function addCheckoutToHistory(checkoutId: string) {
  try {
    const ids = [checkoutId, ...getCheckoutHistory().filter((id) => id !== checkoutId)].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // localStorage tidak tersedia (mis. private mode) — riwayat dilewati saja
  }
}
