import type { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/checkouts";
import { productsCollection } from "@/lib/products";

// Webhook "Invoice paid / expired" dari Xendit
// Dashboard Xendit: Settings → Webhooks → Invoices → https://<domain>/api/webhooks/xendit
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  // Pastikan request benar-benar dari Xendit
  const token = process.env.XENDIT_WEBHOOK_TOKEN;
  if (!token || req.headers["x-callback-token"] !== token) {
    return res.status(401).json({ message: "Invalid callback token" });
  }

  try {
    const { id, external_id, status, paid_amount, paid_at, payment_method, payment_channel } = req.body ?? {};
    console.log("[webhook/xendit]", { id, external_id, status });

    const { checkouts, payments } = await collections();
    const payment = await payments.findOne(id ? { xenditInvoiceId: String(id) } : { externalId: String(external_id) });
    if (!payment) {
      // Mis. tombol "Test" di dashboard Xendit — balas 200 supaya tidak di-retry
      return res.status(200).json({ message: "Payment tidak ditemukan, diabaikan." });
    }

    if (status === "PAID" || status === "SETTLED") {
      // Filter status PENDING -> webhook yang dikirim ulang tidak memotong stok dua kali
      const paidAt = paid_at ? new Date(paid_at) : new Date();
      const updated = await payments.findOneAndUpdate(
        { _id: payment._id, status: { $ne: "LUNAS" } },
        {
          $set: {
            status: "LUNAS",
            paidAmount: Number(paid_amount ?? payment.amount),
            paidMethod: payment_method,
            paidChannel: payment_channel,
            paidAt,
            updatedAt: new Date(),
          },
        }
      );
      if (updated) {
        const checkout = await checkouts.findOneAndUpdate(
          { _id: payment.checkoutId },
          { $set: { status: "LUNAS", paidAt, paymentId: payment._id } }
        );
        // Kurangi stok produk (tidak boleh minus)
        const products = await productsCollection();
        for (const item of checkout?.items ?? []) {
          if (!ObjectId.isValid(item.productId)) continue;
          await products.updateOne({ _id: new ObjectId(item.productId) }, [
            { $set: { stock: { $max: [0, { $subtract: ["$stock", item.qty] }] } } },
          ]);
        }
      }
    } else if (status === "EXPIRED") {
      await payments.updateOne({ _id: payment._id, status: "PENDING" }, { $set: { status: "EXPIRED", updatedAt: new Date() } });
      await checkouts.updateOne({ _id: payment.checkoutId, status: "PENDING" }, { $set: { status: "EXPIRED" } });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("[webhook/xendit]", error);
    return res.status(500).json({ message: "Gagal memproses webhook." });
  }
}
