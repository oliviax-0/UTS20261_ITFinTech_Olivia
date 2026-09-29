// Riwayat pesanan disimpan per perangkat (belum ada login), berisi daftar orderId terbaru dulu
const KEY = "kedai-nongkrong-orders";
const MAX = 50;

export function getOrderHistory(): string[] {
  try {
    const ids = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function addOrderToHistory(orderId: string) {
  try {
    const ids = [orderId, ...getOrderHistory().filter((id) => id !== orderId)].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // localStorage tidak tersedia (mis. private mode) — riwayat dilewati saja
  }
}
