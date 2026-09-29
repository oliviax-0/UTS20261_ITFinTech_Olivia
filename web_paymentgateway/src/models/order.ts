export type OrderStatus = "Pending" | "Lunas" | "Dibatalkan";
export type OrderPaymentMethod = "Kartu Kredit/Debit" | "E-Wallet" | "Virtual Account" | "pending";

export interface OrderItemSchema {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image?: string; // Tambahkan ini (tanda ? berarti boleh kosong)
  stock?: number; // Tambahkan ini (tanda ? berarti boleh kosong)
}

export interface OrderSchema {
  items: OrderItemSchema[];
  customerName: string;
  tableNumber: string;
  notes?: string;
  paymentMethod: OrderPaymentMethod;
  paymentChannel?: string;
  subtotal: number;
  serviceFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentReference?: string;
  paidAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export const orderSchemaFields: Record<string, string> = {
  items: "array",
  customerName: "string",
  tableNumber: "string",
  notes: "string",
  paymentMethod: "enum",
  paymentChannel: "string",
  subtotal: "number",
  serviceFee: "number",
  tax: "number",
  total: "number",
  status: "enum",
  paymentReference: "string",
  paidAt: "date",
};