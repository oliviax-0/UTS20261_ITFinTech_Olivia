import type { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/checkouts";
import { createInvoice, XENDIT_CHANNEL_CODES } from "@/lib/xendit";

function baseUrl(req: NextApiRequest) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const proto = (req.headers["x-forwarded-proto"] as string)?.split(",")[0] ?? "http";
  return `${proto}://${req.headers["x-forwarded-host"] ?? req.headers.host}`;
}

// POST /api/payments/create — buat invoice Xendit untuk sebuah checkout dan simpan ke collection "payments"
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const { checkoutId, paymentMethod, paymentChannel } = req.body ?? {};
    if (typeof checkoutId !== "string" || !ObjectId.isValid(checkoutId)) {
      return res.status(400).json({ message: "Checkout ID tidak valid." });
    }

    const { checkouts, payments } = await collections();
    const checkout = await checkouts.findOne({ _id: new ObjectId(checkoutId) });
    if (!checkout) return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    if (checkout.status === "LUNAS") return res.status(409).json({ message: "Pesanan sudah dibayar." });

    // Invoice yang masih aktif dipakai ulang supaya tidak dobel
    const existing = await payments.findOne({ checkoutId: checkout._id, status: "PENDING" });
    if (existing && (!existing.expiresAt || existing.expiresAt > new Date())) {
      return res.status(200).json({ paymentId: existing._id.toString(), invoiceUrl: existing.invoiceUrl });
    }

    const url = baseUrl(req);
    const channelCode = XENDIT_CHANNEL_CODES[paymentChannel];
    const invoice = await createInvoice({
      externalId: checkoutId,
      amount: checkout.total,
      description: `Pesanan Oliv's Kitchen #${checkoutId.slice(-6).toUpperCase()} — Meja ${checkout.tableNumber}`,
      customerName: checkout.customerName,
      customerPhone: checkout.customerPhone?.replace(/^0/, "+62").replace(/^62/, "+62") || undefined,
      items: checkout.items.map((i) => ({ name: i.name, quantity: i.qty, price: i.price })),
      fees: [
        { type: "Pajak PB1 (10%)", value: checkout.tax },
        { type: "Biaya Layanan", value: checkout.serviceFee },
      ],
      paymentMethods: channelCode ? [channelCode] : undefined,
      successRedirectUrl: `${url}/payment-success?checkoutId=${checkoutId}`,
      failureRedirectUrl: `${url}/payment-success?checkoutId=${checkoutId}`,
    });

    const now = new Date();
    const result = await payments.insertOne({
      checkoutId: checkout._id,
      externalId: checkoutId,
      xenditInvoiceId: invoice.id,
      invoiceUrl: invoice.invoice_url,
      amount: checkout.total,
      status: "PENDING",
      paymentMethod: String(paymentMethod ?? ""),
      paymentChannel: String(paymentChannel ?? ""),
      expiresAt: invoice.expiry_date ? new Date(invoice.expiry_date) : undefined,
      createdAt: now,
      updatedAt: now,
    });
    await checkouts.updateOne({ _id: checkout._id }, { $set: { paymentId: result.insertedId, status: "PENDING" } });

    return res.status(201).json({ paymentId: result.insertedId.toString(), invoiceUrl: invoice.invoice_url });
  } catch (error) {
    console.error("[payments/create]", error);
    const message = error instanceof Error && error.message.includes("XENDIT_API_KEY")
      ? "Payment gateway belum dikonfigurasi (XENDIT_API_KEY)."
      : "Gagal membuat pembayaran. Coba lagi.";
    return res.status(500).json({ message });
  }
}
