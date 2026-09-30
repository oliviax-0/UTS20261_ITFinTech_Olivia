import React, { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, User, Hash, Loader2, Phone, CreditCard, Landmark, Smartphone, Wallet, Receipt, ShoppingBag, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { addCheckoutToHistory } from "@/lib/checkoutHistory";
import { PaymentChannel, PaymentMethod } from "@/types";

const fmt = (n: number) =>
  `Rp ${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

const CONTAINER = "w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12";

const METHODS: Array<{ value: PaymentMethod; label: string; hint: string; icon: typeof CreditCard; channels: PaymentChannel[] }> = [
  { value: "E-Wallet", label: "E-Wallet", hint: "QRIS · OVO · DANA · ShopeePay", icon: Smartphone, channels: ["QRIS", "OVO", "DANA", "ShopeePay"] },
  { value: "Virtual Account", label: "Virtual Account", hint: "BCA · BNI · BRI · Mandiri", icon: Landmark, channels: ["BCA", "BNI", "BRI", "Mandiri"] },
  { value: "Kartu Kredit/Debit", label: "Kartu Kredit/Debit", hint: "Visa · Mastercard · JCB", icon: CreditCard, channels: ["Kartu Kredit"] },
];

// Nomor HP Indonesia: diawali 08, 628, atau +628, total 10–15 digit
const PHONE_REGEX = /^(\+62|62|0)8\d{7,12}$/;

const inputClass =
  "w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-orange-100 bg-white text-base text-[#3B1F0E] font-medium placeholder:text-gray-400 focus:outline-none focus:border-orange-500 transition";
const labelClass = "block text-sm font-bold text-[#7C4A2D] mb-2";

export default function PaymentPage() {
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState({ customerName: "", tableNumber: "", customerPhone: "" });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("E-Wallet");
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannel>("QRIS");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const tax = subtotal * 0.1;
  const serviceFee = 2000;
  const total = subtotal + tax + serviceFee;

  const paymentChannels = useMemo(
    () => METHODS.find((m) => m.value === paymentMethod)?.channels ?? [],
    [paymentMethod]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim()) { setError("Nama pelanggan wajib diisi."); return; }
    if (!form.tableNumber.trim()) { setError("Nomor meja wajib diisi."); return; }
    const phone = form.customerPhone.replace(/[\s-]/g, "");
    if (phone && !PHONE_REGEX.test(phone)) { setError("Nomor telepon tidak valid. Contoh: 081234567890"); return; }
    if (!items.length) { setError("Keranjang kosong."); return; }
    setLoading(true);
    try {
      // 1) Simpan pesanan ke collection "checkouts"
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.product._id, name: i.product.name, price: i.product.price, qty: i.qty, note: i.note?.trim() ?? "" })),
          customerName: form.customerName.trim(), tableNumber: form.tableNumber.trim(), customerPhone: form.customerPhone.replace(/[\s-]/g, ""),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      // 2) Buat invoice Xendit + simpan ke collection "payments"
      const payRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutId: data.checkoutId, paymentMethod, paymentChannel }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.message);
      // 3) Arahkan ke halaman pembayaran Xendit; status LUNAS nanti di-update lewat webhook
      addCheckoutToHistory(data.checkoutId);
      clearCart();
      window.location.href = payData.invoiceUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setLoading(false); // saat sukses tetap loading sampai halaman Xendit terbuka
    }
  };

  return (
    <>
      <Head><title>Pembayaran — Kedai Nongkrong</title></Head>
      <div className="min-h-screen flex flex-col bg-[#FDF6EC] font-sans selection:bg-[#C4855A] selection:text-white">
        <Navbar />
        <main className={`${CONTAINER} pt-6 sm:pt-10 pb-16 sm:pb-20 flex-1`}>
          <Link href="/checkout" className="inline-flex items-center gap-2 text-[#A0714F] hover:text-[#3B1F0E] mb-4 font-semibold transition text-base">
            <ArrowLeft size={18} /> Kembali ke Keranjang
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#3B1F0E] mb-6 sm:mb-8">Pembayaran</h1>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">
              {/* Data Pelanggan */}
              <section className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-5 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#3B1F0E] mb-4 sm:mb-6 flex items-center gap-2">
                  <User size={24} className="text-orange-500" /> Data Pelanggan
                </h2>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Nama <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" />
                      <input type="text" name="customerName" value={form.customerName} onChange={handleChange} placeholder="John Doe" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Nomor Meja <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" />
                      <input type="text" name="tableNumber" value={form.tableNumber} onChange={handleChange} placeholder="5" className={inputClass} />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Nomor Telepon <span className="font-medium text-gray-400">(opsional)</span></label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" />
                      <input type="tel" inputMode="tel" name="customerPhone" value={form.customerPhone} onChange={handleChange}
                        placeholder="Contoh: 081234567890" maxLength={20} autoComplete="tel" className={inputClass} />
                    </div>
                  </div>
                </div>
              </section>

              {/* Metode Pembayaran */}
              <section className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-5 sm:p-6 md:p-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#3B1F0E] mb-4 sm:mb-6 flex items-center gap-2">
                  <Wallet size={24} className="text-orange-500" /> Metode Pembayaran
                </h2>
                <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
                  {METHODS.map((option) => {
                    const Icon = option.icon;
                    const active = paymentMethod === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(option.value);
                          setPaymentChannel(option.channels[0]);
                        }}
                        className={`relative text-left rounded-2xl border-2 p-4 sm:p-5 flex items-center gap-3 sm:block transition active:scale-[0.98] ${
                          active ? "border-orange-500 bg-orange-50 shadow-md" : "border-orange-100 bg-white hover:border-orange-300"
                        }`}
                      >
                        {active && <CheckCircle2 size={20} className="absolute top-4 right-4 text-orange-500" />}
                        <div className={`w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0 rounded-xl flex items-center justify-center sm:mb-3 ${active ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-500"}`}>
                          <Icon size={24} />
                        </div>
                        <div className="min-w-0 pr-6 sm:pr-0">
                          <p className="font-bold text-[#3B1F0E] text-base md:text-lg">{option.label}</p>
                          <p className="text-sm text-[#A0714F] mt-0.5">{option.hint}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className={`${labelClass} mt-6 sm:mt-8`}>Pilih Channel</p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {paymentChannels.map((channel) => {
                    const active = paymentChannel === channel;
                    return (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => setPaymentChannel(channel)}
                        className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-bold transition ${
                          active ? "bg-orange-500 text-white shadow-md hover:bg-orange-600" : "bg-white text-[#7C4A2D] border-2 border-orange-100 hover:bg-orange-50 hover:text-orange-600"
                        }`}
                      >
                        {channel}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Ringkasan */}
            <aside className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-5 sm:p-7 md:p-8 lg:sticky lg:top-28">
              <h2 className="font-bold text-[#3B1F0E] mb-6 text-2xl flex items-center gap-2">
                <Receipt size={20} className="text-orange-500" /> Ringkasan Order
              </h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product._id} className="flex items-center gap-3">
                    <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-orange-50 flex items-center justify-center">
                      {item.product.image ? (
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag size={20} className="text-orange-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-base truncate">{item.product.name}</p>
                      <p className="text-sm text-orange-500 font-bold">×{item.qty}</p>
                      {item.note?.trim() && (
                        <p className="text-sm text-[#A0714F] italic truncate">“{item.note.trim()}”</p>
                      )}
                    </div>
                    <p className="font-bold text-[#3B1F0E] text-base">{fmt(item.product.price * item.qty)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3 text-base border-t border-amber-100 pt-4">
                <div className="flex justify-between text-[#7C4A2D]"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                <div className="flex justify-between text-[#7C4A2D]"><span>Biaya Layanan</span><span>{fmt(serviceFee)}</span></div>
                <div className="flex justify-between text-[#7C4A2D]"><span>Pajak PB1 (10%)</span><span>{fmt(tax)}</span></div>
                <div className="flex justify-between font-black text-2xl pt-4 mt-2 border-t border-amber-100">
                  <span className="text-[#3B1F0E]">Total</span>
                  <span className="text-orange-500">{fmt(total)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-6 bg-red-50 border-2 border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 font-medium">⚠️ {error}</div>
              )}

              <button
                type="submit"
                disabled={loading || !items.length}
                className="mt-8 w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-lg shadow-md hover:shadow-lg transition active:scale-95 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <><Loader2 size={20} className="animate-spin" /> Mengarahkan ke Xendit...</> : <><CheckCircle2 size={20} /> Bayar Sekarang</>}
              </button>
            </aside>
          </form>
        </main>
      </div>
    </>
  );
}
