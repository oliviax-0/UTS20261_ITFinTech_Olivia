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

// Nama channel yang tampil di aplikasi; kode Xendit-nya ada di lib/xendit.ts
export type PaymentChannel =
  | "OVO"
  | "DANA"
  | "ShopeePay"
  | "QRIS"
  | "BCA"
  | "BNI"
  | "BRI"
  | "Mandiri"
  | "Kartu Kredit";

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
