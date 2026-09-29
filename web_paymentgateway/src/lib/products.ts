import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/types";
import { ProductSchema } from "@/models/product";

export const TAX_RATE = 0.1;
export const SERVICE_FEE = 2000;

type ProductDoc = ProductSchema & { _id: ObjectId };

function toProduct(doc: ProductDoc): Product {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    description: doc.description ?? "",
    price: Number(doc.price ?? 0),
    stock: Number(doc.stock ?? 0),
    image: doc.image ?? "",
    category: doc.category,
  };
}

export async function productsCollection() {
  const db = await connectToDatabase();
  return db.collection<ProductDoc>("products");
}

// Produk yang tampil di menu: hanya yang aktif
export async function getActiveProducts(): Promise<Product[]> {
  const col = await productsCollection();
  const docs = await col
    .find({ isActive: { $ne: false } })
    .sort({ category: 1, name: 1 })
    .toArray();
  return docs.map(toProduct);
}

export async function getProductsByIds(ids: string[]): Promise<Map<string, Product>> {
  const objectIds = ids.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
  const col = await productsCollection();
  const docs = await col.find({ _id: { $in: objectIds }, isActive: { $ne: false } }).toArray();
  return new Map(docs.map((d) => [d._id.toString(), toProduct(d)]));
}
