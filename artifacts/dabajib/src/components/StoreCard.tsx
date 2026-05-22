import { Store } from "../store/types";
import { Star, Clock, Navigation } from "lucide-react";
import { haversineKm } from "../utils/haversine";
import { useGeolocation } from "../hooks/useGeolocation";

const CATEGORY_COVER_IMAGES: Record<string, string> = {
  restaurant: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80",
  tacos:      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80",
  shawarma:   "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400&q=80",
  pizza:      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
  pharmacy:   "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80",
  supermarket:"https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
  bakery:     "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
  cafe:       "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80",
};

interface StoreCardProps {
  store: Store;
  onClick: (store: Store) => void;
}

export function StoreCard({ store, onClick }: StoreCardProps) {
  const { coords } = useGeolocation();

  const deliveryTime = (parseInt(store.id.replace(/\D/g, ""), 10) % 20) + 20 || 30;

  let distanceStr = "~? km";
  if (coords) {
    const dist = haversineKm(coords.lat, coords.lng, store.lat, store.lng);
    distanceStr = `${dist.toFixed(1)} km`;
  }

  const coverImage = store.logo || CATEGORY_COVER_IMAGES[store.category] || CATEGORY_COVER_IMAGES["restaurant"];

  return (
    <div
      className="bg-[#181818] rounded-xl overflow-hidden cursor-pointer active:scale-95 transition-transform border border-[#242424] hover:border-primary/20"
      onClick={() => onClick(store)}
      data-testid={`store-card-${store.id}`}
    >
      {/* Cover image */}
      <div className="h-32 relative overflow-hidden">
        <img
          src={coverImage}
          alt={store.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Rating badge */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md flex items-center space-x-1">
          <Star className="w-3 h-3 text-primary fill-primary" />
          <span className="text-white text-xs font-bold">{store.rating.toFixed(1)}</span>
        </div>

        {/* Store initials (if no logo) visible on hover or always when no logo */}
        {!store.logo && (
          <div className="absolute bottom-2 left-2">
            <div className="w-9 h-9 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center text-sm font-black border-2 border-white/20">
              {store.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-white font-bold text-sm truncate">{store.name}</h3>
        <div className="flex items-center space-x-1.5 mt-1 flex-wrap gap-y-1">
          <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
            {store.category}
          </span>
          <span className="text-[#444]">•</span>
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground text-[10px]">{deliveryTime} min</span>
          <span className="text-[#444]">•</span>
          <Navigation className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground text-[10px]">{distanceStr}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-primary text-[9px] bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded font-semibold">
            Livraison Rapide
          </span>
          <span className="text-[#444] text-[9px]">{store.views} vues</span>
        </div>
      </div>
    </div>
  );
}
