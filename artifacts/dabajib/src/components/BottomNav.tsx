import { Home, Heart, ShoppingCart, User, MessageCircle } from "lucide-react";
import { useCart } from "../hooks/useCart";

interface BottomNavProps {
  currentView: string;
  onChangeView: (view: string) => void;
}

export function BottomNav({ currentView, onChangeView }: BottomNavProps) {
  const { cart } = useCart();
  const itemCount = cart.length;

  const tabs = [
    { id: "feed", icon: Home, label: "Accueil" },
    { id: "favorites", icon: Heart, label: "Favoris" },
    { id: "cart", icon: ShoppingCart, label: "Panier" },
    { id: "account", icon: User, label: "Compte" },
    { id: "support", icon: MessageCircle, label: "Support", color: "text-[#25D366]" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#0E0E0E] border-t border-[#2A2A2A] z-40 flex justify-around items-center px-2 pb-safe">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;
        
        return (
          <button
            key={tab.id}
            data-testid={`nav-${tab.id}`}
            onClick={() => onChangeView(tab.id)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${
              isActive 
                ? tab.color || "text-primary" 
                : "text-muted-foreground hover:text-white transition-colors"
            }`}
          >
            <div className="relative">
              <Icon className="w-6 h-6" />
              {tab.id === "cart" && itemCount > 0 && (
                <div className="absolute -top-1 -right-2 bg-primary text-primary-foreground text-[10px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                  {itemCount}
                </div>
              )}
            </div>
            <span className="text-[10px] font-medium leading-none">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
