import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { CheckoutSchema } from "@/models/checkout";
import { PaymentSchema } from "@/models/payment";

export async function collections() {
  const db = await connectToDatabase();
  return {
    checkouts: db.collection<CheckoutSchema>("checkouts"),
    payments: db.collection<PaymentSchema>("payments"),
  };
}

// Checkout beserta payment terakhirnya, sudah dalam bentuk JSON (untuk props / response API)
export async function getCheckoutDetail(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const { checkouts, payments } = await collections();
  const checkout = await checkouts.findOne({ _id: new ObjectId(id) });
  if (!checkout) return null;
  const payment = await payments.findOne({ checkoutId: checkout._id }, { sort: { createdAt: -1 } });
  return JSON.parse(JSON.stringify({ checkout, payment }));
}
