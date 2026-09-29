import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ChefHat, History, ShoppingCart } from "lucide-react";

export default function Navbar() {
  const { totalQty } = useCart();
  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-4 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-3">
          {/* Logo */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/30 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
            <ChefHat size={26} className="text-white" strokeWidth={2.25} />
          </div>
          <div className="leading-none">
            <p className="text-2xl md:text-3xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Oliv&apos;s</span>{" "}
              <span className="text-[#3B1F0E]">Kitchen</span>
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
        <Link
          href="/orders"
          aria-label="Riwayat pesanan"
          title="Riwayat pesanan"
          className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center transition-all hover:bg-orange-500 hover:text-white active:scale-95"
        >
          <History size={24} />
        </Link>
        <Link
          href="/checkout"
          aria-label="Lihat keranjang"
          className="relative w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center transition-all hover:bg-orange-500 hover:text-white active:scale-95"
        >
          <ShoppingCart size={24} />
          {totalQty > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[11px] font-black rounded-full min-w-5 h-5 px-1 flex items-center justify-center ring-2 ring-white shadow">
              {totalQty > 9 ? "9+" : totalQty}
            </span>
          )}
        </Link>
        </div>
      </div>
    </header>
  );
}
