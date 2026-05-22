import { useFavorites } from "../hooks/useFavorites";
import { useStores } from "../hooks/useStores";
import { Heart, Trash2 } from "lucide-react";

export function FavoritesView() {
  const { favorites, toggleFavorite } = useFavorites();
  const { stores } = useStores();

  // Find products that are favorited
  const favoriteProducts = stores.flatMap(store => 
    store.products
      .filter(p => favorites.includes(p.id))
      .map(p => ({ ...p, storeName: store.name }))
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 bg-background/95 backdrop-blur-md z-30 px-4 py-4 border-b border-[#2A2A2A]">
        <h1 className="text-white font-bold text-xl">Mes Favoris</h1>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-32 px-6 text-center">
          <div className="w-24 h-24 rounded-full bg-[#181818] flex items-center justify-center mb-6">
            <Heart className="w-10 h-10 text-[#333]" />
          </div>
          <h2 className="text-white font-bold text-lg mb-2">Pas encore de favoris</h2>
          <p className="text-muted-foreground text-sm">
            Appuyez sur le cœur sur les produits que vous aimez pour les retrouver ici.
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {favoriteProducts.map(product => (
            <div key={product.id} className="flex bg-[#181818] rounded-xl overflow-hidden p-3 border border-[#2A2A2A]">
              <div className="w-20 h-20 bg-[#2A2A2A] rounded-lg overflow-hidden flex-shrink-0">
                {product.photo ? (
                  <img src={product.photo} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#2A2A2A] to-[#1E1E1E]" />
                )}
              </div>
              <div className="ml-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-white font-bold text-sm">{product.name}</h3>
                  <p className="text-muted-foreground text-xs">{product.storeName}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-primary font-bold">{product.price.toFixed(2)} DH</span>
                  <button 
                    onClick={() => toggleFavorite(product.id)}
                    className="p-1.5 rounded-md bg-[#2A2A2A] text-white hover:bg-destructive hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
