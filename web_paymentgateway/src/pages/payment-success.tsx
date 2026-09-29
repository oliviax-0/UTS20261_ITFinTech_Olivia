import React from "react";
import Head from "next/head";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { ArrowLeft, CheckCircle2, Hash, Phone, Receipt, ShoppingBag, User, Wallet } from "lucide-react";
import Navbar from "@/components/Navbar";
import { getCheckoutDetail } from "@/lib/checkouts";
import { OrderItem } from "@/types";

const fmt = (n: number) =>
  `Rp ${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

interface OrderDetail {
  _id: string;
  customerName: string;
  tableNumber: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  serviceFee: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentChannel: string;
  status: string;
  paidAt?: string | null;
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-[#A0714F]">{label}</p>
        <p className="font-bold text-[#3B1F0E] text-base truncate">{value}</p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage({ orderId, order }: { orderId: string | null; order: OrderDetail | null }) {
  const paidAt = order?.paidAt
    ? new Date(order.paidAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <>
      <Head><title>Pesanan Berhasil — Kedai Nongkrong</title></Head>
      <div className="min-h-screen flex flex-col bg-[#FDF6EC] font-sans selection:bg-[#C4855A] selection:text-white">
        <Navbar />
        <main className="w-full max-w-3xl mx-auto px-4 sm:px-8 pt-10 pb-20 flex-1">
          <Link href="/orders" className="inline-flex items-center gap-2 text-[#A0714F] hover:text-[#3B1F0E] mb-6 font-semibold transition text-base">
            <ArrowLeft size={18} /> Kembali ke Riwayat Pesanan
          </Link>
          {/* Header sukses */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-5 w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <CheckCircle2 size={52} className="text-white" strokeWidth={2} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[#3B1F0E] mb-3">Pesanan Berhasil! 🎉</h1>
            <p className="text-[#8C5333] text-base md:text-lg">
              Terima kasih! Pesananmu sedang disiapkan, tunggu sebentar ya ☕
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8">
            {/* Nomor pesanan */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-dashed border-orange-200">
              <div>
                <p className="text-sm text-[#A0714F]">Nomor Pesanan</p>
                <p className="text-2xl font-black text-orange-500 tracking-wider">
                  #{(order?._id ?? orderId ?? "").slice(-6).toUpperCase() || "—"}
                </p>
              </div>
              {order && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 text-green-600 px-4 py-1.5 text-sm font-bold">
                  <CheckCircle2 size={16} /> {order.status}
                </span>
              )}
            </div>

            {order ? (
              <>
                {/* Info pelanggan & pembayaran */}
                <div className="grid sm:grid-cols-2 gap-5 py-6 border-b border-dashed border-orange-200">
                  <InfoRow icon={User} label="Nama" value={order.customerName} />
                  <InfoRow icon={Hash} label="Nomor Meja" value={order.tableNumber} />
                  {order.customerPhone && <InfoRow icon={Phone} label="Nomor Telepon" value={order.customerPhone} />}
                  <InfoRow icon={Wallet} label="Pembayaran" value={`${order.paymentMethod} · ${order.paymentChannel}`} />
                </div>

                {/* Daftar item */}
                <div className="py-6 border-b border-dashed border-orange-200">
                  <h2 className="font-bold text-[#3B1F0E] text-xl mb-4 flex items-center gap-2">
                    <Receipt size={20} className="text-orange-500" /> Detail Pesanan
                  </h2>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex items-center gap-3">
                        <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-orange-50 flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag size={20} className="text-orange-200" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-base truncate">{item.name}</p>
                          <p className="text-sm text-orange-500 font-bold">
                            {item.qty} × {fmt(item.price)}
                          </p>
                          {item.note && <p className="text-sm text-[#A0714F] italic truncate">“{item.note}”</p>}
                        </div>
                        <p className="font-bold text-[#3B1F0E] text-base">{fmt(item.price * item.qty)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="pt-6 space-y-3 text-base">
                  <div className="flex justify-between text-[#7C4A2D]"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
                  <div className="flex justify-between text-[#7C4A2D]"><span>Biaya Layanan</span><span>{fmt(order.serviceFee)}</span></div>
                  <div className="flex justify-between text-[#7C4A2D]"><span>Pajak PB1 (10%)</span><span>{fmt(order.tax)}</span></div>
                  <div className="flex justify-between font-black text-2xl pt-4 mt-2 border-t border-amber-100">
                    <span className="text-[#3B1F0E]">Total Dibayar</span>
                    <span className="text-orange-500">{fmt(order.total)}</span>
                  </div>
                  {paidAt && <p className="text-sm text-[#A0714F] text-right">Dibayar {paidAt}</p>}
                </div>
              </>
            ) : (
              <p className="pt-6 text-[#8C5333] text-base text-center">
                Detail pesanan belum bisa ditampilkan, tapi pembayaranmu sudah kami terima.
              </p>
            )}
          </div>

          <Link
            href="/"
            className="mt-8 w-full flex items-center justify-center py-4 rounded-2xl text-white font-bold text-lg shadow-md hover:shadow-lg transition active:scale-95 bg-orange-500 hover:bg-orange-600"
          >
            Pesan Lagi
          </Link>
        </main>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const raw = query.checkoutId ?? query.orderId; // orderId: link lama
  const orderId = typeof raw === "string" ? raw : null;
  if (!orderId) return { props: { orderId, order: null } };

  try {
    // Data pesanan dari "checkouts", metode bayar dari "payments"
    const detail = await getCheckoutDetail(orderId);
    if (!detail) return { props: { orderId, order: null } };
    const { checkout, payment } = detail;
    const order: OrderDetail = {
      ...checkout,
      paymentMethod: payment?.paymentMethod ?? "-",
      paymentChannel: payment?.paidChannel ?? payment?.paymentChannel ?? "-",
      paidAt: checkout.paidAt ?? payment?.paidAt ?? null,
    };
    return { props: { orderId, order } };
  } catch (error) {
    console.error("[payment-success] gagal mengambil pesanan", error);
    return { props: { orderId, order: null } };
  }
};
