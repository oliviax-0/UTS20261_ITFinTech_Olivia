import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, ChevronRight, History, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { getCheckoutHistory } from "@/lib/checkoutHistory";
import { OrderItem } from "@/types";

const fmt = (n: number) =>
  `Rp ${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

interface OrderRow {
  _id: string;
  customerName: string;
  tableNumber: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentMethod: string;
  paymentChannel: string;
  createdAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  LUNAS: "bg-green-50 text-green-600",
  PENDING: "bg-amber-50 text-amber-600",
  EXPIRED: "bg-gray-100 text-gray-500",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const ids = getCheckoutHistory();
    const load: Promise<OrderRow[]> = ids.length
      ? fetch(`/api/checkout?ids=${ids.join(",")}`).then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message);
          return data;
        })
      : Promise.resolve([]);
    load
      .then(setOrders)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Gagal mengambil riwayat pesanan.");
        setOrders([]);
      });
  }, []);

  return (
    <>
      <Head><title>Riwayat Pesanan — Kedai Nongkrong</title></Head>
      <div className="min-h-screen flex flex-col bg-[#FDF6EC] font-sans selection:bg-[#C4855A] selection:text-white">
        <Navbar />
        <main className="w-full max-w-4xl mx-auto px-4 sm:px-8 pt-10 pb-20 flex-1">
          <Link href="/" className="inline-flex items-center gap-2 text-[#A0714F] hover:text-[#3B1F0E] mb-4 font-semibold transition text-base">
            <ArrowLeft size={18} /> Kembali ke Menu
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-[#3B1F0E] mb-8">Riwayat Pesanan</h1>

          {orders === null ? (
            <div className="flex items-center justify-center gap-2 py-20 text-[#A0714F]">
              <Loader2 size={20} className="animate-spin" /> Memuat riwayat...
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 text-red-600 rounded-3xl px-6 py-5 font-medium">⚠️ {error}</div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm">
              <History size={64} className="mb-6 text-orange-500 opacity-80" />
              <h3 className="text-[#3B1F0E] font-black text-2xl mb-2">Belum Ada Pesanan</h3>
              <p className="text-[#8C5333] text-base mb-6 text-center max-w-md">
                Pesanan yang sudah kamu bayar di perangkat ini akan muncul di sini.
              </p>
              <Link
                href="/"
                className="px-8 py-3 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg"
              >
                Lihat Menu
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const qty = order.items.reduce((s, i) => s + i.qty, 0);
                const date = new Date(order.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
                return (
                  <Link
                    key={order._id}
                    href={`/payment-success?checkoutId=${order._id}`}
                    className="group block bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow p-5 md:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="text-xl font-black text-orange-500 tracking-wider">#{order._id.slice(-6).toUpperCase()}</p>
                          <span className={`rounded-full px-3 py-0.5 text-sm font-bold ${STATUS_STYLE[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-[#A0714F]">
                          {date} · Meja {order.tableNumber} · {order.paymentChannel}
                        </p>
                      </div>
                      <ChevronRight size={22} className="flex-shrink-0 mt-1 text-orange-300 group-hover:text-orange-500 transition" />
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-4">
                      <p className="text-base text-gray-700 line-clamp-2">
                        {order.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                      </p>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-[#A0714F]">{qty} item</p>
                        <p className="text-lg font-black text-[#3B1F0E]">{fmt(order.total)}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
