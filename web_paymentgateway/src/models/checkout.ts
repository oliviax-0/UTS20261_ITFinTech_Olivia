import { ObjectId } from "mongodb";

// Status dipakai bersama oleh collection "checkouts" dan "payments"
export type PaymentStatus = "PENDING" | "LUNAS" | "EXPIRED";

export interface CheckoutItemSchema {
  productId: string;
  name: string;
  price: number;
  qty: number;
  note?: string;
  image?: string;
}

// Collection "checkouts": pesanan pelanggan (isi keranjang + data pelanggan)
export interface CheckoutSchema {
  _id?: ObjectId;
  items: CheckoutItemSchema[];
  customerName: string;
  tableNumber: string;
  customerPhone?: string;
  subtotal: number;
  serviceFee: number;
  tax: number;
  total: number;
  status: PaymentStatus;
  paymentId?: ObjectId;
  createdAt: Date;
  paidAt?: Date;
}
