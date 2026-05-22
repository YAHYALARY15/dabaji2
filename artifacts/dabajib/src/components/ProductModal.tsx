import { useState, useMemo } from "react";
import { Product, Store, CartItem } from "../store/types";
import { ChevronDown, Heart, Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useFavorites } from "../hooks/useFavorites";

interface ProductModalProps {
  product: Product;
  store: Store;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export function ProductModal({ product, store, onClose, onAddToCart }: ProductModalProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>({});
  const [radioExtras, setRadioExtras] = useState<Record<string, string>>({}); // groupName -> extraId
  const [note, setNote] = useState("");

  const handleCheckboxToggle = (extraId: string) => {
    setSelectedExtras(prev => ({ ...prev, [extraId]: !prev[extraId] }));
  };

  const handleRadioSelect = (extraId: string) => {
    // Basic implementation: if all radio extras are in one group
    // Real implementation would group radios by some ID
    setRadioExtras({ "main": extraId });
  };

  const totalPrice = useMemo(() => {
    let extraPrice = 0;
    
    product.extras.forEach(extra => {
      if (extra.type === "checkbox" && selectedExtras[extra.id]) {
        extraPrice += extra.price;
      } else if (extra.type === "radio" && Object.values(radioExtras).includes(extra.id)) {
        extraPrice += extra.price;
      }
    });

    return (product.price + extraPrice) * quantity;
  }, [product, quantity, selectedExtras, radioExtras]);

  const handleAddToCart = () => {
    const extrasToAdd: { id: string; name: string; price: number }[] = [];
    
    product.extras.forEach(extra => {
      if (extra.type === "checkbox" && selectedExtras[extra.id]) {
        extrasToAdd.push({ id: extra.id, name: extra.name, price: extra.price });
      } else if (extra.type === "radio" && Object.values(radioExtras).includes(extra.id)) {
        extrasToAdd.push({ id: extra.id, name: extra.name, price: extra.price });
      }
    });

    onAddToCart({
      storeId: store.id,
      storeName: store.name,
      storePhone: store.phone,
      productId: product.id,
      productName: product.name,
      basePrice: product.price,
      selectedExtras: extrasToAdd,
      quantity,
      totalPrice,
      note
    });
    
    onClose();
  };

  const renderExtras = () => {
    if (!product.extras || product.extras.length === 0) return null;
    
    const checkboxes = product.extras.filter(e => e.type === "checkbox");
    const radios = product.extras.filter(e => e.type === "radio");

    return (
      <div className="mt-6 border-t border-[#2A2A2A] pt-6">
        <h3 className="text-white font-bold text-lg mb-4">Suppléments / الإضافات</h3>
        
        {radios.length > 0 && (
          <div className="space-y-3 mb-6">
            {radios.map(extra => (
              <div key={extra.id} className="flex items-center justify-between" onClick={() => handleRadioSelect(extra.id)}>
                <div className="flex items-center space-x-3 cursor-pointer">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${Object.values(radioExtras).includes(extra.id) ? "border-primary" : "border-muted"}`}>
                    {Object.values(radioExtras).includes(extra.id) && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className="text-white text-sm">{extra.name}</span>
                </div>
                <span className="text-muted-foreground text-sm">+{extra.price.toFixed(2)} DH</span>
              </div>
            ))}
          </div>
        )}

        {checkboxes.length > 0 && (
          <div className="space-y-3">
            {checkboxes.map(extra => (
              <div key={extra.id} className="flex items-center justify-between" onClick={() => handleCheckboxToggle(extra.id)}>
                <div className="flex items-center space-x-3 cursor-pointer">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedExtras[extra.id] ? "border-primary bg-primary" : "border-muted"}`}>
                    {selectedExtras[extra.id] && <div className="w-3 h-3 bg-primary-foreground rounded-sm" />}
                  </div>
                  <span className="text-white text-sm">{extra.name}</span>
                </div>
                <span className="text-muted-foreground text-sm">+{extra.price.toFixed(2)} DH</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[60] bg-[#121212] overflow-y-auto"
    >
      <div className="relative h-64 bg-[#1E1E1E]">
        {product.photo ? (
          <img src={product.photo} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[#2A2A2A] to-[#121212] flex items-center justify-center px-6 text-center">
            <span className="text-white/30 text-2xl font-bold uppercase tracking-widest">{product.name}</span>
          </div>
        )}
        
        <div className="absolute top-4 left-4">
          <button onClick={onClose} className="p-2 rounded-full bg-black/50 backdrop-blur text-white">
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
        
        <div className="absolute top-4 right-4">
          <button 
            onClick={() => toggleFavorite(product.id)} 
            className="p-2 rounded-full bg-black/50 backdrop-blur text-white"
          >
            <Heart className={`w-6 h-6 ${favorite ? "text-destructive fill-destructive" : ""}`} />
          </button>
        </div>
      </div>

      <div className="p-5 pb-32">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-white text-2xl font-bold">{product.name}</h1>
            <span className="inline-block mt-2 bg-[#2A2A2A] text-white text-[10px] px-2 py-1 rounded uppercase font-bold tracking-wider">
              {product.category}
            </span>
          </div>
          <span className="text-primary text-xl font-bold whitespace-nowrap ml-4">{product.price.toFixed(2)} DH</span>
        </div>
        
        <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
          {product.description}
        </p>

        {renderExtras()}

        <div className="mt-8">
          <h3 className="text-white font-bold text-sm mb-3">Notes spéciales / ملاحظات خاصة</h3>
          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex: Pas d'oignons, bien cuit..."
            className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl p-3 text-white text-sm focus:outline-none focus:border-primary resize-none h-24"
          />
        </div>
        
        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center bg-[#1E1E1E] rounded-full p-1 border border-[#2A2A2A]">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-[#2A2A2A]"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="w-12 text-center text-white font-bold text-lg">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center text-white hover:bg-[#333]"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-[#2A2A2A] p-4 pb-safe z-10">
        <button 
          onClick={handleAddToCart}
          className="w-full bg-primary text-primary-foreground font-bold text-lg py-4 rounded-xl flex items-center justify-between px-6 active:scale-[0.98] transition-transform"
        >
          <span>Ajouter au Panier</span>
          <span>{totalPrice.toFixed(2)} DH</span>
        </button>
      </div>
    </motion.div>
  );
}
