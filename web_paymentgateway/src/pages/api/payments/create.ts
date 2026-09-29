import type { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/checkouts";
import { productsCollection } from "@/lib/products";

// POST /api/payments/create — catat pembayaran sebuah checkout ke collection "payments".
// Sementara masih SIMULASI (langsung LUNAS); nanti diganti invoice Xendit + webhook.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const { checkoutId, paymentMethod, paymentChannel } = req.body ?? {};
    if (typeof checkoutId !== "string" || !ObjectId.isValid(checkoutId)) {
      return res.status(400).json({ message: "Checkout ID tidak valid." });
    }

    const { checkouts, payments } = await collections();
    const now = new Date();

    // Hanya checkout PENDING yang bisa dibayar, supaya stok tidak terpotong dua kali
    const checkout = await checkouts.findOneAndUpdate(
      { _id: new ObjectId(checkoutId), status: "PENDING" },
      { $set: { status: "LUNAS", paidAt: now } },
      { returnDocument: "after" }
    );
    if (!checkout) {
      const exists = await checkouts.findOne({ _id: new ObjectId(checkoutId) });
      return exists
        ? res.status(409).json({ message: "Pesanan sudah dibayar." })
        : res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }

    const payment = await payments.insertOne({
      checkoutId: checkout._id,
      externalId: checkoutId,
      amount: checkout.total,
      status: "LUNAS",
      paymentMethod: String(paymentMethod ?? ""),
      paymentChannel: String(paymentChannel ?? ""),
      paidAmount: checkout.total,
      paidAt: now,
      createdAt: now,
      updatedAt: now,
    });
    await checkouts.updateOne({ _id: checkout._id }, { $set: { paymentId: payment.insertedId } });

    // Kurangi stok produk (tidak boleh minus)
    const products = await productsCollection();
    for (const item of checkout.items) {
      if (!ObjectId.isValid(item.productId)) continue;
      await products.updateOne({ _id: new ObjectId(item.productId) }, [
        { $set: { stock: { $max: [0, { $subtract: ["$stock", item.qty] }] } } },
      ]);
    }

    return res.status(201).json({ paymentId: payment.insertedId.toString(), status: "LUNAS" });
  } catch (error) {
    console.error("[payments/create]", error);
    return res.status(500).json({ message: "Gagal memproses pembayaran." });
  }
}
