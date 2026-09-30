import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { ArrowLeft, CheckCircle2, Clock, ExternalLink, Hash, XCircle, Phone, Receipt, ShoppingBag, User, Wallet } from "lucide-react";
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

// Tampilan header per status pembayaran
const STATUS_VIEW = {
  LUNAS: {
    icon: CheckCircle2,
    circle: "from-orange-400 to-orange-600 shadow-orange-500/30",
    badge: "bg-green-50 text-green-600",
    title: "Pesanan Berhasil! 🎉",
    text: "Terima kasih! Pembayaranmu sudah LUNAS dan pesananmu sedang disiapkan ☕",
  },
  PENDING: {
    icon: Clock,
    circle: "from-amber-300 to-amber-500 shadow-amber-500/30",
    badge: "bg-amber-50 text-amber-600",
    title: "Menunggu Pembayaran",
    text: "Selesaikan pembayaran di Xendit. Status akan berubah otomatis setelah pembayaran dikonfirmasi.",
  },
  EXPIRED: {
    icon: XCircle,
    circle: "from-gray-300 to-gray-500 shadow-gray-500/30",
    badge: "bg-gray-100 text-gray-500",
    title: "Pembayaran Kedaluwarsa",
    text: "Invoice sudah tidak berlaku. Silakan pesan ulang dari menu.",
  },
} as const;

export default function PaymentSuccessPage({
  orderId,
  order,
  invoiceUrl,
}: {
  orderId: string | null;
  order: OrderDetail | null;
  invoiceUrl: string | null;
}) {
  const router = useRouter();
  const status = (order?.status ?? "LUNAS") as keyof typeof STATUS_VIEW;
  const view = STATUS_VIEW[status] ?? STATUS_VIEW.LUNAS;
  const StatusIcon = view.icon;

  // Selama PENDING, muat ulang data tiap 4 detik supaya status dari webhook langsung terlihat
  useEffect(() => {
    if (status !== "PENDING") return;
    const started = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - started > 5 * 60 * 1000) return clearInterval(timer);
      router.replace(router.asPath, undefined, { scroll: false });
    }, 4000);
    return () => clearInterval(timer);
  }, [status, router]);

  const paidAt = order?.paidAt
    ? new Date(order.paidAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <>
      <Head><title>{`${view.title} — Kedai Nongkrong`}</title></Head>
      <div className="min-h-screen flex flex-col bg-[#FDF6EC] font-sans selection:bg-[#C4855A] selection:text-white">
        <Navbar />
        <main className="w-full max-w-3xl mx-auto px-4 sm:px-8 pt-6 sm:pt-10 pb-16 sm:pb-20 flex-1">
          <Link href="/orders" className="inline-flex items-center gap-2 text-[#A0714F] hover:text-[#3B1F0E] mb-6 font-semibold transition text-base">
            <ArrowLeft size={18} /> Kembali ke Riwayat Pesanan
          </Link>
          {/* Header sukses */}
          <div className="text-center mb-8">
            <div className={`mx-auto mb-5 w-24 h-24 rounded-full bg-gradient-to-br ${view.circle} flex items-center justify-center shadow-lg`}>
              <StatusIcon size={52} className="text-white" strokeWidth={2} />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#3B1F0E] mb-3">{view.title}</h1>
            <p className="text-[#8C5333] text-base md:text-lg max-w-xl mx-auto">{view.text}</p>
            {status === "PENDING" && invoiceUrl && (
              <a
                href={invoiceUrl}
                className="mt-6 inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition shadow-md"
              >
                <ExternalLink size={18} /> Lanjutkan Pembayaran
              </a>
            )}
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-5 sm:p-6 md:p-8">
            {/* Nomor pesanan */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-dashed border-orange-200">
              <div>
                <p className="text-sm text-[#A0714F]">Nomor Pesanan</p>
                <p className="text-2xl font-black text-orange-500 tracking-wider">
                  #{(order?._id ?? orderId ?? "").slice(-6).toUpperCase() || "—"}
                </p>
              </div>
              {order && (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold ${view.badge}`}>
                  <StatusIcon size={16} /> {order.status}
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
                    <span className="text-[#3B1F0E]">{status === "LUNAS" ? "Total Dibayar" : "Total"}</span>
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
  if (!orderId) return { props: { orderId, order: null, invoiceUrl: null } };

  try {
    // Data pesanan dari "checkouts", metode bayar dari "payments"
    const detail = await getCheckoutDetail(orderId);
    if (!detail) return { props: { orderId, order: null, invoiceUrl: null } };
    const { checkout, payment } = detail;
    const order: OrderDetail = {
      ...checkout,
      paymentMethod: payment?.paymentMethod ?? "-",
      paymentChannel: payment?.paidChannel ?? payment?.paymentChannel ?? "-",
      paidAt: checkout.paidAt ?? payment?.paidAt ?? null,
    };
    return { props: { orderId, order, invoiceUrl: payment?.invoiceUrl ?? null } };
  } catch (error) {
    console.error("[payment-success] gagal mengambil pesanan", error);
    return { props: { orderId, order: null, invoiceUrl: null } };
  }
};
