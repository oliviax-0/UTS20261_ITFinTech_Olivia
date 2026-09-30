import React from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, StickyNote, Trash2, ShoppingCart, ShoppingBag, Plus, Minus, Receipt } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

const fmt = (n: number) =>
  `Rp ${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

export default function CheckoutPage() {
  const { items, updateQty, updateNote, removeItem, subtotal, totalQty } = useCart();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <>
      <Head><title>Keranjang — Kedai Nongkrong</title></Head>
      <div className="min-h-screen flex flex-col bg-[#FDF6EC] font-sans selection:bg-[#C4855A] selection:text-white">
        <Navbar />

        {items.length === 0 ? (
          <>
            <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 sm:pt-10 pb-16 sm:pb-20 flex-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#3B1F0E] mb-6 sm:mb-8">Keranjang Saya</h1>
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-amber-100/50">
                <ShoppingCart size={64} className="mb-6 text-orange-500 opacity-80" />
                <h3 className="text-[#3B1F0E] font-black text-2xl mb-2">Keranjang Masih Kosong</h3>
                <p className="text-[#8C5333] text-base mb-6 text-center max-w-md">
                  Yuk tambahkan menu favoritmu dulu!
                </p>
                <Link
                  href="/"
                  className="px-8 py-3 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg"
                >
                  Lihat Menu
                </Link>
              </div>
            </main>
          </>
        ) : (
          <>
            <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 sm:pt-10 pb-16 sm:pb-20 flex-1">
              <Link href="/" className="inline-flex items-center gap-2 text-[#A0714F] hover:text-[#3B1F0E] mb-4 font-semibold transition text-base">
                <ArrowLeft size={18} /> Kembali ke Menu
              </Link>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#3B1F0E] mb-6 sm:mb-8">Keranjang Saya</h1>

              <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                <div className="lg:col-span-2">
                  {/* Items */}
                  <section>
                    <div className="flex flex-wrap justify-between items-center gap-3 mb-4 px-1">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#3B1F0E]">Daftar Pesanan</h2>
                      <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-3 sm:px-4 py-1.5 text-sm md:text-base font-bold text-orange-500 hover:bg-orange-100 hover:text-orange-600 transition"
                      >
                        <Plus size={16} /> Tambah Pesanan
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.product._id} className="bg-white rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5 md:p-6">
                          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 rounded-2xl overflow-hidden bg-orange-50 flex items-center justify-center">
                              {item.product.image ? (
                                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                              ) : (
                                <ShoppingBag size={28} className="text-orange-200" />
                              )}
                            </div>
                            {/* HP: nama di atas, qty + total di bawah; sm ke atas: satu baris */}
                            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-800 text-base sm:text-lg md:text-xl leading-tight truncate mb-1">{item.product.name}</p>
                                <p className="text-sm sm:text-base md:text-lg font-bold text-orange-500">{fmt(item.product.price)}</p>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                                <div className="flex items-center gap-1 sm:gap-2 bg-orange-50 rounded-xl p-1">
                                  <button
                                    onClick={() => updateQty(item.product._id, item.qty - 1)}
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white text-orange-500 flex items-center justify-center hover:bg-orange-100 active:scale-95 transition"
                                    aria-label={`Kurangi ${item.product.name}`}
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <span className="min-w-[24px] sm:min-w-[28px] text-center text-sm sm:text-base font-bold text-gray-800">{item.qty}</span>
                                  <button
                                    onClick={() => updateQty(item.product._id, item.qty + 1)}
                                    disabled={item.product.stock != null && item.qty >= item.product.stock}
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                    aria-label={`Tambah ${item.product.name}`}
                                  >
                                    <Plus size={16} />
                                  </button>
                                </div>
                                <p className="sm:w-32 text-right font-black text-[#3B1F0E] text-base sm:text-lg whitespace-nowrap">
                                  {fmt(item.product.price * item.qty)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeItem(item.product._id)}
                              className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 rounded-lg flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 transition active:scale-95"
                              aria-label={`Hapus ${item.product.name}`}
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                          <div className="relative mt-3 sm:mt-4">
                            <StickyNote size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" />
                            <input
                              type="text"
                              value={item.note ?? ""}
                              onChange={(e) => updateNote(item.product._id, e.target.value)}
                              maxLength={100}
                              placeholder="Tambah catatan, mis. tidak pedas, es sedikit..."
                              aria-label={`Catatan untuk ${item.product.name}`}
                              className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl bg-orange-50/60 border-2 border-transparent text-sm sm:text-base text-[#3B1F0E] placeholder:text-gray-400 focus:outline-none focus:border-orange-300 focus:bg-white transition"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                </div>

                {/* Summary */}
                <aside className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-5 sm:p-7 md:p-8 lg:sticky lg:top-28">
                  <h2 className="font-bold text-[#3B1F0E] mb-6 text-2xl flex items-center gap-2">
                    <Receipt size={20} className="text-orange-500" /> Ringkasan Biaya
                  </h2>
                  <div className="space-y-3 text-base">
                    <div className="flex justify-between text-[#7C4A2D]">
                      <span>Subtotal ({totalQty} item)</span>
                      <span>{fmt(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[#7C4A2D]">
                      <span>Pajak PB1 (10%)</span>
                      <span>{fmt(tax)}</span>
                    </div>
                    <div className="flex justify-between font-black text-2xl pt-4 mt-2 border-t border-amber-100">
                      <span className="text-[#3B1F0E]">Total</span>
                      <span className="text-orange-500">{fmt(total)}</span>
                    </div>
                  </div>
                  <Link
                    href="/payment"
                    className="mt-8 w-full flex items-center justify-center py-4 rounded-2xl text-white font-bold text-lg shadow-md hover:shadow-lg transition active:scale-95 bg-orange-500 hover:bg-orange-600"
                  >
                    Lanjut ke Pembayaran
                  </Link>
                </aside>
              </div>
            </main>
          </>
        )}
      </div>
    </>
  );
}
