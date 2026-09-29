import type { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";

// GET /api/orders?ids=a,b,c — ambil pesanan berdasarkan daftar id (untuk halaman riwayat)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  const ids = String(req.query.ids ?? "")
    .split(",")
    .filter((id) => ObjectId.isValid(id))
    .slice(0, 50)
    .map((id) => new ObjectId(id));
  if (!ids.length) return res.status(200).json([]);

  try {
    const db = await connectToDatabase();
    const orders = await db
      .collection("orders")
      .find({ _id: { $in: ids } })
      .project({ customerName: 1, tableNumber: 1, items: 1, total: 1, status: 1, paymentMethod: 1, paymentChannel: 1, createdAt: 1, paidAt: 1 })
      .sort({ createdAt: -1 })
      .toArray();
    return res.status(200).json(orders);
  } catch (error) {
    console.error("[orders]", error);
    return res.status(500).json({ message: "Gagal mengambil riwayat pesanan." });
  }
}
