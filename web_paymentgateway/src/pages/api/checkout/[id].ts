import type { NextApiRequest, NextApiResponse } from "next";
import { getCheckoutDetail } from "@/lib/checkouts";

// GET /api/checkout/:id — status checkout + payment (dipakai untuk cek status setelah bayar)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });
  try {
    const detail = await getCheckoutDetail(String(req.query.id));
    if (!detail) return res.status(404).json({ message: "Pesanan tidak ditemukan." });
    return res.status(200).json(detail);
  } catch (error) {
    console.error("[checkout/detail]", error);
    return res.status(500).json({ message: "Gagal mengambil pesanan." });
  }
}
