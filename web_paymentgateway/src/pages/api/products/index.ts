import type { NextApiRequest, NextApiResponse } from "next";
import { getActiveProducts } from "@/lib/products";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const products = await getActiveProducts();
    return res.status(200).json(products);
  } catch (error) {
    console.error("[products]", error);
    return res.status(500).json({ message: "Gagal mengambil data produk" });
  }
}
