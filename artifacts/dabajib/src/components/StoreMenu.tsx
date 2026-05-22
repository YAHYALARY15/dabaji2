import { useState } from "react";
import { Store, Product } from "../store/types";
import { ChevronDown, Star, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useStores } from "../hooks/useStores";
import { useLocalStorage } from "../hooks/useLocalStorage";

const FOOD_PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=80",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80",
  "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&q=80",
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&q=80",
];

function getProductPlaceholder(productId: string): string {
  const idx = productId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % FOOD_PLACEHOLDER_IMAGES.length;
  return FOOD_PLACEHOLDER_IMAGES[idx];
}

interface StoreMenuProps {
  store: Store;
  onClose: () => void;
  onProductClick: (product: Product) => void;
}

export function StoreMenu({ store, onClose, onProductClick }: StoreMenuProps) {
  const categories = ["Tous", ...Array.from(new Set(store.products.map(p => p.category)))];
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [userRatings, setUserRatings] = useLocalStorage<Record<string, number>>("dabajib_user_ratings", {});
  const { rateStore, stores } = useStores();

  const liveStore = stores.find(s => s.id === store.id) ?? store;

  const filteredProducts = activeCategory === "Tous"
    ? liveStore.products
    : liveStore.products.filter(p => p.category === activeCategory);

  const hasRated = userRatings[store.id] !== undefined;
  const myRating = userRatings[store.id] ?? 0;

  const handleRate = (score: number) => {
    if (hasRated) return;
    rateStore(store.id, score);
    setUserRatings({ ...userRatings, [store.id]: score });
    setRatingSubmitted(true);
  };

  const ratingCount = liveStore.ratingCount ?? 0;
  const ratingSum = liveStore.ratingSum ?? 0;
  const displayRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : liveStore.rating.toFixed(1);

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 bg-[#121212] overflow-y-auto"
    >
      {/* Hero header */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={liveStore.logo || `https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80`}
          alt={liveStore.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-black/40 to-transparent" />
        <button
          data-testid="button-close-store-menu"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/60 backdrop-blur-sm text-white"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
        <div className="absolute bottom-3 left-4 right-4">
          <h2 className="text-white font-bold text-lg leading-tight">{liveStore.name}</h2>
          <div className="flex items-center space-x-3 mt-1">
            <div className="flex items-center space-x-1">
              <Star className="w-3.5 h-3.5 text-primary fill-primary" />
              <span className="text-white font-semibold text-sm">{displayRating}</span>
              <span className="text-white/50 text-xs">({ratingCount} avis)</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5 text-white/50" />
              <span className="text-white/50 text-xs">{liveStore.views} vues</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky controls */}
      <div className="sticky top-0 bg-[#121212]/95 backdrop-blur-md z-10 border-b border-[#2A2A2A]">
        {/* User star rating */}
        <div className="px-4 py-2.5 border-b border-[#1A1A1A]">
          {hasRated || ratingSubmitted ? (
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-muted-foreground">Votre note:</span>
              <div className="flex space-x-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < (myRating || hoverRating) ? "text-primary fill-primary" : "text-[#333]"}`} />
                ))}
              </div>
              <span className="text-[10px] text-primary font-semibold">Merci pour votre avis!</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-muted-foreground">Évaluer ce magasin:</span>
              <div className="flex space-x-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    data-testid={`button-rate-star-${i + 1}`}
                    onMouseEnter={() => setHoverRating(i + 1)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRate(i + 1)}
                    className="p-0.5 focus:outline-none"
                  >
                    <Star className={`w-4 h-4 transition-colors ${i < hoverRating ? "text-primary fill-primary" : "text-[#333]"}`} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex overflow-x-auto px-4 py-2.5 space-x-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              data-testid={`button-category-tab-${cat}`}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-[#1E1E1E] text-white hover:bg-[#2A2A2A]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product list */}
      <div className="p-4 space-y-3 pb-24">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            data-testid={`card-product-${product.id}`}
            className="flex bg-[#181818] rounded-xl overflow-hidden border border-[#242424] active:border-primary/40 transition-colors cursor-pointer"
            onClick={() => onProductClick(product)}
          >
            {/* Product image */}
            <div className="w-24 h-24 flex-shrink-0 overflow-hidden relative">
              <img
                src={product.photo || getProductPlaceholder(product.id)}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {!product.photo && (
                <div className="absolute inset-0 bg-black/30" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 p-3 flex flex-col justify-between">
              <div>
                <h3 className="text-white font-bold text-sm leading-tight">{product.name}</h3>
                <p className="text-muted-foreground text-[10px] mt-0.5 line-clamp-2 leading-relaxed">{product.description}</p>
                <div className="flex items-center mt-1.5 space-x-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-2.5 h-2.5 ${i < product.stars ? "text-primary fill-primary" : "text-[#333]"}`} />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-primary font-bold text-sm">{product.price.toFixed(2)} DH</span>
                {product.extras.length > 0 && (
                  <span className="text-[9px] text-muted-foreground bg-[#2A2A2A] px-1.5 py-0.5 rounded-full">
                    +{product.extras.length} options
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Aucun produit dans cette catégorie.
          </div>
        )}
      </div>
    </motion.div>
  );
}
