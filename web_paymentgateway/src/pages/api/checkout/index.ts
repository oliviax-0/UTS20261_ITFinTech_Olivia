import type { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/checkouts";
import { getProductsByIds, SERVICE_FEE, TAX_RATE } from "@/lib/products";
import { CheckoutItemSchema } from "@/models/checkout";

const PHONE_REGEX = /^(\+62|62|0)8\d{7,12}$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") return createCheckout(req, res);
  if (req.method === "GET") return listCheckouts(req, res);
  return res.status(405).json({ message: "Method not allowed" });
}

// POST /api/checkout — simpan pesanan ke collection "checkouts" dengan status PENDING
async function createCheckout(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { items, customerName, tableNumber, customerPhone } = req.body ?? {};
    const phone = typeof customerPhone === "string" ? customerPhone.replace(/[\s-]/g, "") : "";
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: "Pesanan kosong." });
    if (!customerName || !tableNumber) return res.status(400).json({ message: "Nama dan nomor meja wajib diisi." });
    if (phone && !PHONE_REGEX.test(phone)) return res.status(400).json({ message: "Nomor telepon tidak valid." });

    // Harga, nama, dan stok diambil dari database, bukan dari client
    const products = await getProductsByIds(items.map((i: { productId: string }) => String(i.productId)));
    const checkoutItems: CheckoutItemSchema[] = [];
    for (const item of items) {
      const product = products.get(String(item.productId));
      const qty = Math.floor(Number(item.qty));
      if (!product) return res.status(400).json({ message: "Ada produk yang sudah tidak tersedia." });
      if (!(qty > 0)) return res.status(400).json({ message: `Jumlah ${product.name} tidak valid.` });
      if (product.stock != null && qty > product.stock) {
        return res.status(409).json({ message: `Stok ${product.name} tinggal ${product.stock}.` });
      }
      const note = typeof item.note === "string" ? item.note.trim().slice(0, 100) : "";
      checkoutItems.push({ productId: product._id, name: product.name, price: product.price, qty, note, image: product.image });
    }

    const subtotal = checkoutItems.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = Math.round(subtotal * TAX_RATE);
    const serviceFee = SERVICE_FEE;
    const total = subtotal + tax + serviceFee;

    const { checkouts } = await collections();
    const result = await checkouts.insertOne({
      items: checkoutItems,
      customerName: String(customerName).trim(),
      tableNumber: String(tableNumber).trim(),
      customerPhone: phone,
      subtotal,
      serviceFee,
      tax,
      total,
      status: "PENDING",
      createdAt: new Date(),
    });
    return res.status(201).json({ checkoutId: result.insertedId.toString(), total });
  } catch (error) {
    console.error("[checkout/create]", error);
    return res.status(500).json({ message: "Gagal membuat pesanan." });
  }
}

// GET /api/checkout?ids=a,b,c — untuk halaman riwayat pesanan
async function listCheckouts(req: NextApiRequest, res: NextApiResponse) {
  const ids = String(req.query.ids ?? "")
    .split(",")
    .filter((id) => ObjectId.isValid(id))
    .slice(0, 50)
    .map((id) => new ObjectId(id));
  if (!ids.length) return res.status(200).json([]);

  try {
    const { checkouts, payments } = await collections();
    const list = await checkouts.find({ _id: { $in: ids } }).sort({ createdAt: -1 }).toArray();
    const pays = await payments.find({ checkoutId: { $in: list.map((c) => c._id) } }).sort({ createdAt: 1 }).toArray();
    const payByCheckout = new Map(pays.map((p) => [p.checkoutId.toString(), p]));
    return res.status(200).json(
      list.map((c) => {
        const p = payByCheckout.get(c._id.toString());
        return { ...c, paymentChannel: p?.paidChannel ?? p?.paymentChannel ?? "", invoiceUrl: p?.invoiceUrl ?? null };
      })
    );
  } catch (error) {
    console.error("[checkout/list]", error);
    return res.status(500).json({ message: "Gagal mengambil riwayat pesanan." });
  }
}
