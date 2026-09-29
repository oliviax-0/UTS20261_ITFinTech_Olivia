import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/mongodb";
import { getProductsByIds, SERVICE_FEE, TAX_RATE } from "@/lib/products";
import { OrderItem } from "@/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
  try {
    const { items, customerName, tableNumber, customerPhone, paymentMethod, paymentChannel } = req.body ?? {};
    const phone = typeof customerPhone === "string" ? customerPhone.replace(/[\s-]/g, "") : "";
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: "Pesanan kosong." });
    if (!customerName || !tableNumber) return res.status(400).json({ message: "Nama dan nomor meja wajib diisi." });
    if (phone && !/^(\+62|62|0)8\d{7,12}$/.test(phone)) return res.status(400).json({ message: "Nomor telepon tidak valid." });

    // Harga, nama, dan stok diambil dari database, bukan dari client
    const products = await getProductsByIds(items.map((i: { productId: string }) => String(i.productId)));
    const orderItems: OrderItem[] = [];
    for (const item of items) {
      const product = products.get(String(item.productId));
      const qty = Math.floor(Number(item.qty));
      if (!product) return res.status(400).json({ message: "Ada produk yang sudah tidak tersedia." });
      if (!(qty > 0)) return res.status(400).json({ message: `Jumlah ${product.name} tidak valid.` });
      if (product.stock != null && qty > product.stock) {
        return res.status(409).json({ message: `Stok ${product.name} tinggal ${product.stock}.` });
      }
      const note = typeof item.note === "string" ? item.note.trim().slice(0, 100) : "";
      orderItems.push({ productId: product._id, name: product.name, price: product.price, qty, note, image: product.image });
    }

    const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = subtotal * TAX_RATE;
    const serviceFee = SERVICE_FEE;
    const total = subtotal + tax + serviceFee;

    const db = await connectToDatabase();
    const result = await db.collection("orders").insertOne({
      items: orderItems,
      customerName,
      tableNumber,
      customerPhone: phone,
      subtotal,
      serviceFee,
      tax,
      total,
      paymentMethod: paymentMethod ?? "pending",
      paymentChannel: paymentChannel ?? "",
      status: "Pending",
      createdAt: new Date(),
    });
    return res.status(201).json({ message: "Pesanan berhasil dibuat", orderId: result.insertedId.toString(), total });
  } catch (error) {
    console.error("[orders/create]", error);
    return res.status(500).json({ message: "Gagal membuat pesanan." });
  }
}
