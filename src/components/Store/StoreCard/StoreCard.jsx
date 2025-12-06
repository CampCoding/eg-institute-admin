"use client";
import DeleteModal from "@/components/DeleteModal/DeleteModal";
import {
  ArrowRight,
  Heart,
  ShoppingCart,
  Star,
  Check,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

export default function StoreCard({
  p,
  PRIMARY,
  PRIMARY_DARK,
  PRIMARY_LIGHT,
  onDelete,
  onEdit,
}) {
  const [favorites, setFavorites] = useState(new Set());
  const [hoveredCard, setHoveredCard] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const router = useRouter();

  // Load cart from localStorage when component mounts
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("store-cart")) || [];
    const isInCart = storedCart.some((item) => item.id === p.id);
    setAddedToCart(isInCart);
  }, [p.id]);

  // Toggle favorite
  function toggleFavorite(id) {
    setFavorites((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  }

  function handleSubmit() {
    console.log("Hello");
  }

  return (
    <article
      key={p.id}
      className="group bg-white rounded-3xl border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col transform hover:scale-[1.03]"
      onMouseEnter={() => setHoveredCard(p.id)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={p.image}
          alt={p.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        {/* Tag */}
        {p.tag && (
          <div
            className="absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg"
            style={{
              backgroundImage: `linear-gradient(90deg, ${PRIMARY}, ${PRIMARY_LIGHT})`,
            }}
          >
            {p.tag}
          </div>
        )}
        {/* Favorite */}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 relative flex flex-col">
        {/* <div className="absolute cursor-none -z-10 bottom-0 bg-gradient-to-br from-teal-100 via-teal-200 left-0 blur-3xl to-teal-300 w-30 h-30"></div> */}
        {/* <div className="absolute cursor-none -z-10 bottom-40 bg-gradient-to-br from-[#8d7a4c] via-[#c9ae6c] right-0 blur-3xl to-[#d4be89] w-30 h-30"></div> */}
        <div className="flex items-start gap-3 mb-3">
          <div className="text-2xl">{p.badge}</div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mt-2 text-shadow-md">
              {p.title}
            </h3>
            {/* <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-slate-900">
                  {p.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-slate-500">
                ({p.reviews} reviews)
              </span>
            </div> */}
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-4">
          {p.desc}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-primary">
              ${p.price.toFixed(2)}
            </span>
            {p.originalPrice && p.originalPrice > p.price && (
              <span className="text-sm text-slate-500 line-through">
                ${p.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          {/* {p.originalPrice && p.originalPrice > p.price && (
            <div className="px-4 py-1.5 rounded-full bg-red-100 text-red-600 font-semibold text-xs">
              Save ${(p.originalPrice - p.price).toFixed(2)}
            </div>
          )} */}
        </div>

        {/* Category */}
        <div className="mt-4 flex justify-between items-center">
          <span
            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border"
            style={{
              backgroundColor: "#F0FBFA",
              color: PRIMARY_DARK,
              borderColor: "#CFF3EF",
            }}
          >
            {p.type === "books"
              ? "📚 Book"
              : p.type === "supplies"
              ? "📝 Supply"
              : "🎥 Video Course"}
          </span>
          <div className="text-xs text-slate-500 font-medium">
            Premium Quality
          </div>
        </div>

        {/* Action Buttons: Edit & Delete */}
        <div className="flex justify-between mt-4">
          <div
            onClick={() => router.push(`/store/edit-store/${p?.id}`)}
            className={`text-[${PRIMARY}] hover:text-[${PRIMARY_DARK}] flex items-center gap-2 text-sm font-semibold cursor-pointer`}
          >
            <Edit className="w-4 h-4" /> Edit
          </div>

          <button
            onClick={() => router.push(`/store/details/${p?.id}`)}
            className={`text-pink-500 hover:text-pink-700 flex items-center gap-2 text-sm font-semibold cursor-pointer`}
          >
            <Eye className="w-4 h-4" />
            Details
          </button>

          <button
            onClick={() => {
              setOpenDeleteModal(true);
            }}
            className="text-red-500 hover:text-red-600 flex items-center gap-2 text-sm font-semibold"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      <DeleteModal
        handleSubmit={handleSubmit}
        open={openDeleteModal}
        title={"Delete this item"}
        description={"Do You Want to delete this item?"}
        setOpen={setOpenDeleteModal}
      />
    </article>
  );
}
