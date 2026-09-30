
import React from "react";
import Link from "next/link";
import { ShoppingBag, ShoppingCart, Plus, Minus } from "lucide-react";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  quantity: number;
  onQuantityChange: (product: Product, quantity: number) => void;
}

export default function ProductCard({
  product,
  quantity,
  onQuantityChange,
}: ProductCardProps) {
  const soldOut = product.stock === 0;
  const atLimit = product.stock != null && quantity >= product.stock;

  const handleIncrease = () => {
    if (atLimit) return;
    onQuantityChange(product, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      onQuantityChange(product, quantity - 1);
    }
  };

  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow group flex flex-col">
      {/* Product Image */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-4 bg-orange-50 flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="text-orange-200 flex flex-col items-center">
            <ShoppingBag size={32} className="mb-2 opacity-50" />
            <span className="text-xs font-medium">Tanpa Gambar</span>
          </div>
        )}
        {soldOut ? (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-black text-lg">
            Habis
          </span>
        ) : product.stock != null && product.stock <= 5 ? (
          <span className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
            Sisa {product.stock}
          </span>
        ) : null}
      </div>

      {/* Product Info */}
      <h3 className="font-poppins font-bold text-gray-800 text-lg md:text-xl leading-tight mb-1 line-clamp-1">
        {product.name}
      </h3>

      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
        {product.description}
      </p>

      {/* Price + Quantity Controls */}
      <div className="mt-auto pt-3 flex items-center justify-between gap-2">
        <span
          className="font-bold text-orange-500 text-lg md:text-xl"
          suppressHydrationWarning
        >
          Rp{product.price?.toLocaleString("id-ID")}
        </span>

        {quantity === 0 ? (
          <button
            onClick={handleIncrease}
            disabled={soldOut}
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm hover:bg-orange-600 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={`Tambah ${product.name} ke keranjang`}
          >
            <Plus size={20} />
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-orange-50 rounded-xl p-1">
            <button
              onClick={handleDecrease}
              className="w-8 h-8 rounded-lg bg-white text-orange-500 flex items-center justify-center hover:bg-orange-100 active:scale-95 transition"
              aria-label={`Kurangi ${product.name}`}
            >
              <Minus size={16} />
            </button>

            <span className="min-w-[20px] text-center text-sm font-bold text-gray-800">
              {quantity}
            </span>

            <button
              onClick={handleIncrease}
              disabled={atLimit}
              className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label={`Tambah ${product.name}`}
            >
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>

      {quantity > 0 && (
        <Link
          href="/checkout"
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-base font-bold text-white shadow-sm hover:bg-orange-600 active:scale-95 transition"
        >
          <ShoppingCart size={16} /> Lihat Keranjang
        </Link>
      )}
    </div>
  );
}
