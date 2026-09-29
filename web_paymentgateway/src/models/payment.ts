import { ObjectId } from "mongodb";
import { PaymentStatus } from "@/models/checkout";

// Collection "payments": satu dokumen per percobaan pembayaran sebuah checkout
export interface PaymentSchema {
  _id?: ObjectId;
  checkoutId: ObjectId;
  externalId: string; // = checkoutId (nanti dikirim ke Xendit sebagai external_id)
  // Diisi setelah integrasi Xendit; kosong untuk pembayaran simulasi
  xenditInvoiceId?: string;
  invoiceUrl?: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string; // pilihan pelanggan di aplikasi, mis. "E-Wallet"
  paymentChannel: string; // mis. "OVO"
  paidMethod?: string; // dari webhook Xendit, mis. "EWALLET"
  paidChannel?: string; // dari webhook Xendit, mis. "OVO"
  paidAmount?: number;
  paidAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
