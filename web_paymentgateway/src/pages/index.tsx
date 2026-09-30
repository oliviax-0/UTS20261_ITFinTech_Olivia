import React, { useState, useMemo } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { getActiveProducts } from "@/lib/products";
import { useCart } from "@/context/CartContext";

export default function Home({ initialProducts, dbError }: { initialProducts: Product[]; dbError?: boolean }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<"Semua" | "Makanan" | "Minuman">("Semua");
  const { items, addItem, updateQty } = useCart();
  const cart = useMemo(
    () => Object.fromEntries(items.map((i) => [i.product._id, i.qty])) as Record<string, number>,
    [items]
  );

  const categoryOptions: Array<{ label: typeof cat; dbCategory: Product["category"] | null }> = [
    { label: "Semua", dbCategory: null },
    { label: "Makanan", dbCategory: "Makanan" },
    { label: "Minuman", dbCategory: "Minuman" },
  ];

  const filtered = useMemo(() => {
    const activeOption = categoryOptions.find((option) => option.label === cat);
    const targetDbCategory = activeOption ? activeOption.dbCategory : null;

    return initialProducts.filter((p) => {
      const matchCategory = targetDbCategory === null || p.category === targetDbCategory;
      const matchSearch =
        search === "" ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [initialProducts, search, cat]);

  function handleQuantityChange(product: Product, quantity: number): void {
    if (product.stock != null && quantity > product.stock) return;
    if (!cart[product._id]) addItem(product);
    else updateQty(product._id, quantity);
  }

  return (
    <>
      <Head>
        <title>Kedai Nongkrong Lokal — Menu</title>
      </Head>
      <div className="min-h-screen bg-[#FDF6EC] font-sans selection:bg-[#C4855A] selection:text-white">
        <Navbar />

        {/* Hero Section - Full width, bawah melengkung */}
        <div className="pb-8 sm:pb-12">
          <div className="relative overflow-hidden bg-[#F07316] rounded-b-[2rem] sm:rounded-b-[3rem] md:rounded-b-[4rem]">
            <div className="relative max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-12 pb-20 sm:pt-16 sm:pb-24 md:pt-24 md:pb-32 text-center flex flex-col items-center">
              <div>
                <h1 className="font-poppins text-4xl min-[400px]:text-5xl sm:text-6xl md:text-8xl font-extrabold text-white uppercase leading-[0.95] tracking-tight">
                  Ngemil.
                  <br />
                  Ngopi.
                  <br />
                  Nongkrong.
                </h1>
                <p className="font-poppins mt-4 sm:mt-6 text-[#FDE3C8] text-base sm:text-lg md:text-2xl font-medium">
                  Semua ada di Oliv&apos;s Kitchen
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar - Overlapping the Hero */}
          <div className="relative -mt-10 max-w-5xl mx-auto px-4 sm:px-8 z-10">
            <div className="bg-white rounded-2xl shadow-lg shadow-[#3B1F0E]/5 p-1.5 sm:p-2 flex items-center transition-shadow focus-within:shadow-xl focus-within:shadow-orange-500/20">
              <div className="pl-3 sm:pl-4">
                <Search size={22} className="text-orange-500 sm:w-[26px] sm:h-[26px]" />
              </div>
              <input
                type="text"
                placeholder="Cari dimsum, es kopi, batagor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none min-w-0 text-[#3B1F0E] text-base sm:text-lg px-3 sm:px-4 py-3 sm:py-4 focus:outline-none placeholder:text-gray-400"
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="pr-4 text-gray-400 hover:text-[#C4855A] font-bold text-lg"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        <main className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pb-20">
          {/* Category Tabs - Clean Pill Design */}
          <div className="max-w-5xl mx-auto grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-10">
            {categoryOptions.map((category) => {
              const isActive = cat === category.label;
              return (
                <button
                  key={category.label}
                  onClick={() => setCat(category.label)}
                  className={`w-full whitespace-nowrap px-2 sm:px-4 py-2.5 sm:py-3.5 rounded-full text-sm sm:text-base md:text-lg font-bold transition-all duration-300
                    ${isActive 
                      ? 'bg-orange-500 text-white shadow-md hover:bg-orange-600' 
                      : 'bg-white text-[#7C4A2D] shadow-sm hover:bg-orange-50 hover:text-orange-600'
                    }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* Results Header */}
          <div className="flex justify-between items-center gap-3 mb-5 sm:mb-8 px-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#3B1F0E]">
              {cat === "Semua" ? "Semua Menu" : `Menu ${cat}`}
            </h2>
            <p className="text-sm sm:text-base font-semibold text-[#A0714F] bg-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-sm whitespace-nowrap">
              {filtered.length} Item
            </p>
          </div>

          {/* Product Grid */}
          {dbError ? (
            <div className="flex flex-col items-center justify-center py-14 sm:py-20 px-4 bg-white rounded-3xl shadow-sm border border-red-100">
              <div className="text-6xl mb-6 opacity-80">⚠️</div>
              <h3 className="text-[#3B1F0E] font-black text-2xl mb-2">Menu gagal dimuat</h3>
              <p className="text-[#8C5333] text-base mb-6 text-center max-w-md">
                Tidak bisa terhubung ke database. Coba muat ulang halaman sebentar lagi.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 rounded-xl font-bold text-white bg-[#C4855A] hover:bg-[#A05C33] transition-colors shadow-md hover:shadow-lg"
              >
                Muat Ulang
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 sm:py-20 px-4 bg-white rounded-3xl shadow-sm border border-amber-100/50">
              <div className="text-6xl mb-6 opacity-80">🔍</div>
              <h3 className="text-[#3B1F0E] font-black text-2xl mb-2">Waduh, nggak ketemu!</h3>
              <p className="text-[#8C5333] text-base mb-6 text-center max-w-md">
                Menu yang kamu cari belum ada nih. Coba intip kategori lain atau pakai kata kunci yang berbeda.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setCat("Semua");
                }}
                className="px-8 py-3 rounded-xl font-bold text-white bg-[#C4855A] hover:bg-[#A05C33] transition-colors shadow-md hover:shadow-lg"
              >
                Lihat Semua Menu
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-8">
              {filtered.map((p) => (
               <ProductCard key={p._id}  product={p} 
               quantity={cart[p._id] || 0}
              onQuantityChange={handleQuantityChange}/>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const initialProducts = await getActiveProducts();
    return { props: { initialProducts } };
  } catch (error) {
    console.error("[index] gagal mengambil produk", error);
    return { props: { initialProducts: [], dbError: true } };
  }
};