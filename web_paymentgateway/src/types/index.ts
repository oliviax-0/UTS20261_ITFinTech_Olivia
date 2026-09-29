export interface Product {
  _id: string;
  name: string;
  category: string; // Ubah menjadi string agar fleksibel
  description: string;
  price: number;
  stock?: number;
  image?: string; // Tambahkan ini (tanda ? berarti boleh kosong)
}

export type PaymentMethod = "Kartu Kredit/Debit" | "E-Wallet" | "Virtual Account";

export type PaymentChannel =
  | "QRIS"
  | "OVO"
  | "Dana"
  | "GoPay"
  | "BCA"
  | "BNI"
  | "Mandiri";

export interface CartItem {
  product: Product;
  qty: number;
  note?: string; // catatan khusus per item, mis. "tidak pedas"
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  note?: string;
  image?: string; // Tambahkan ini (tanda ? berarti boleh kosong)
}

export interface OrderSummary {
  subtotal: number;
  serviceFee: number;
  tax: number;
  total: number;
  image?: string; // Tambahkan ini (tanda ? berarti boleh kosong)
}
