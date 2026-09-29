import type { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { productsCollection } from "@/lib/products";
import { OrderItem } from "@/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { id } = req.query;
    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Order ID tidak valid." });
    }

    const db = await connectToDatabase();
    const orders = db.collection("orders");
    const { paymentMethod, paymentChannel } = req.body ?? {};

    // Hanya pesanan "Pending" yang bisa dibayar, supaya stok tidak terpotong dua kali
    const order = await orders.findOneAndUpdate(
      { _id: new ObjectId(id), status: "Pending" },
      {
        $set: {
          status: "Lunas",
          paymentMethod: paymentMethod ?? "E-Wallet",
          paymentChannel: paymentChannel ?? "QRIS",
          paidAt: new Date(),
          paymentReference: `SIM-${Date.now()}`,
        },
      },
      { returnDocument: "after" }
    );

    if (!order) {
      const exists = await orders.findOne({ _id: new ObjectId(id) });
      return exists
        ? res.status(409).json({ message: "Pesanan sudah dibayar." })
        : res.status(404).json({ message: "Pesanan tidak ditemukan." });
    }

    // Kurangi stok; kalau ada yang kurang, kembalikan semuanya
    const products = await productsCollection();
    const items = order.items as OrderItem[];
    const done: OrderItem[] = [];
    for (const item of items) {
      const r = await products.updateOne(
        { _id: new ObjectId(item.productId), stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } }
      );
      if (r.modifiedCount === 0) {
        for (const d of done) {
          await products.updateOne({ _id: new ObjectId(d.productId) }, { $inc: { stock: d.qty } });
        }
        await orders.updateOne(
          { _id: order._id },
          { $set: { status: "Pending" }, $unset: { paidAt: "", paymentReference: "" } }
        );
        return res.status(409).json({ message: `Stok ${item.name} tidak mencukupi.` });
      }
      done.push(item);
    }

    return res.status(200).json({ message: "Pembayaran berhasil disimulasikan.", order });
  } catch (error) {
    console.error("[orders/pay]", error);
    return res.status(500).json({ message: "Gagal memproses pembayaran." });
  }
}
