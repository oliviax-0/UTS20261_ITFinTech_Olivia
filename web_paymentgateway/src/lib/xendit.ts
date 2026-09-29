// Integrasi Xendit Invoice API: https://developers.xendit.co/api-reference/#create-invoice
const XENDIT_API = "https://api.xendit.co/v2/invoices";

export interface InvoiceRequest {
  externalId: string;
  amount: number;
  description: string;
  customerName: string;
  customerPhone?: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  fees?: Array<{ type: string; value: number }>;
  paymentMethods?: string[];
  successRedirectUrl: string;
  failureRedirectUrl: string;
}

export interface InvoiceResponse {
  id: string;
  external_id: string;
  status: string;
  amount: number;
  invoice_url: string;
  expiry_date: string;
}

function authHeader() {
  const key = process.env.XENDIT_API_KEY;
  if (!key || !key.startsWith("xnd_")) {
    throw new Error("XENDIT_API_KEY belum diatur di .env.local");
  }
  // Basic auth: secret key sebagai username, password kosong
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

async function postInvoice(body: Record<string, unknown>): Promise<InvoiceResponse> {
  const res = await fetch(XENDIT_API, {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Xendit ${res.status}: ${data.error_code ?? ""} ${data.message ?? ""}`.trim());
  }
  return data;
}

export async function createInvoice(req: InvoiceRequest): Promise<InvoiceResponse> {
  const body: Record<string, unknown> = {
    external_id: req.externalId,
    amount: req.amount,
    description: req.description,
    currency: "IDR",
    invoice_duration: 60 * 60 * 24, // 24 jam
    customer: {
      given_names: req.customerName,
      ...(req.customerPhone ? { mobile_number: req.customerPhone } : {}),
    },
    items: req.items,
    fees: req.fees,
    success_redirect_url: req.successRedirectUrl,
    failure_redirect_url: req.failureRedirectUrl,
  };

  if (req.paymentMethods?.length) {
    try {
      return await postInvoice({ ...body, payment_methods: req.paymentMethods });
    } catch (error) {
      // Channel yang dipilih belum aktif di akun Xendit -> tampilkan semua metode yang tersedia
      console.warn("[xendit] gagal dengan payment_methods, coba tanpa filter:", error);
    }
  }
  return postInvoice(body);
}

// Nama channel di aplikasi -> kode channel Xendit
export const XENDIT_CHANNEL_CODES: Record<string, string> = {
  OVO: "OVO",
  DANA: "DANA",
  ShopeePay: "SHOPEEPAY",
  QRIS: "QRIS",
  BCA: "BCA",
  BNI: "BNI",
  BRI: "BRI",
  Mandiri: "MANDIRI",
  "Kartu Kredit": "CREDIT_CARD",
};
