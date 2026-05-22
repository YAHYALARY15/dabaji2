import { useState } from "react";
import { useStores } from "../hooks/useStores";
import { useCart } from "../hooks/useCart";
import { MapPin, Settings, Search } from "lucide-react";
import { CategoryBar } from "../components/CategoryBar";
import { StoreCard } from "../components/StoreCard";
import { StoreMenu } from "../components/StoreMenu";
import { ProductModal } from "../components/ProductModal";
import { Store, Product } from "../store/types";
import { AnimatePresence } from "framer-motion";

export function FeedView({ onAdminTrigger }: { onAdminTrigger: () => void }) {
  const { stores, incrementViews } = useStores();
  const { addToCart } = useCart();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [clicks, setClicks] = useState<number[]>([]);

  const handleSettingsClick = () => {
    const now = Date.now();
    const newClicks = [...clicks.filter(t => now - t < 3000), now];
    setClicks(newClicks);
    if (newClicks.length >= 5) {
      onAdminTrigger();
      setClicks([]);
    }
  };

  const filteredStores = stores.filter(store => {
    if (search && !store.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "all" && store.category !== category) return false;
    return true;
  });

  const handleStoreClick = (store: Store) => {
    incrementViews(store.id);
    setSelectedStore(store);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-md z-30 px-4 py-3 border-b border-[#2A2A2A]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-primary font-black text-2xl italic tracking-tight leading-none">Dabaji</h1>
            <span className="text-[10px] text-muted-foreground font-medium tracking-widest">دباجي</span>
          </div>

          <div className="flex items-center bg-[#1E1E1E] px-3 py-1.5 rounded-full border border-[#2A2A2A]">
            <MapPin className="w-3.5 h-3.5 text-primary mr-1.5" />
            <span className="text-white text-xs font-medium">Casablanca</span>
          </div>

          <button
            data-testid="button-settings"
            onClick={handleSettingsClick}
            className="p-2 rounded-full hover:bg-[#1E1E1E] transition-colors relative"
          >
            <Settings className="w-5 h-5 text-white" />
            {localStorage.getItem("dabajib_admin_unlocked") === "true" && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full shadow-[0_0_4px_rgba(255,215,0,0.8)]" />
            )}
          </button>
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            data-testid="input-search"
            type="text"
            placeholder="Rechercher un restaurant, plat..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <CategoryBar selectedCategory={category} onSelectCategory={setCategory} />

      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">
            {category === "all" ? "À Proximité" : `${filteredStores.length} résultat${filteredStores.length !== 1 ? "s" : ""}`}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {filteredStores.map(store => (
            <StoreCard key={store.id} store={store} onClick={handleStoreClick} />
          ))}
        </div>
        {filteredStores.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-[#181818] flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-[#333]" />
            </div>
            <p className="text-muted-foreground text-sm">Aucun résultat trouvé.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedStore && !selectedProduct && (
          <StoreMenu
            store={stores.find(s => s.id === selectedStore.id) || selectedStore}
            onClose={() => setSelectedStore(null)}
            onProductClick={setSelectedProduct}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProduct && selectedStore && (
          <ProductModal
            product={selectedProduct}
            store={selectedStore}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={(item) => { addToCart(item); setSelectedProduct(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
