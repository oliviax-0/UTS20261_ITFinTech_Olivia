import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { History, ShoppingCart } from "lucide-react";

export default function Navbar() {
  const { totalQty } = useCart();
  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-3 sm:py-4 flex items-center justify-between gap-3">
        <Link href="/" className="group flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Logo: maskot chef */}
          <img
            src="/images/chef.png"
            alt="Oliv's Kitchen"
            className="h-11 sm:h-14 w-auto flex-shrink-0 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105"
          />
          <div className="leading-none">
            <p className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight whitespace-nowrap">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Oliv&apos;s</span>{" "}
              <span className="text-[#3B1F0E]">Kitchen</span>
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <Link
          href="/orders"
          aria-label="Riwayat pesanan"
          title="Riwayat pesanan"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center transition-all hover:bg-orange-500 hover:text-white active:scale-95"
        >
          <History size={22} />
        </Link>
        <Link
          href="/checkout"
          aria-label="Lihat keranjang"
          className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center transition-all hover:bg-orange-500 hover:text-white active:scale-95"
        >
          <ShoppingCart size={22} />
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
