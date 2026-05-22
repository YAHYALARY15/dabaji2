import { useState } from "react";
import { useCart } from "../hooks/useCart";
import { useAppConfig } from "../hooks/useAppConfig";
import { useGeolocation } from "../hooks/useGeolocation";
import { useStores } from "../hooks/useStores";
import { useRoadDistance } from "../hooks/useRoadDistance";
import { buildWhatsAppUrl } from "../utils/whatsapp";
import { ShoppingCart, Trash2, ChevronRight, MessageCircle, X, Navigation, Loader2 } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { OrderRecord } from "../store/types";

export function CartView() {
  const { cart, removeFromCart, clearCart } = useCart();
  const { config } = useAppConfig();
  const { coords } = useGeolocation();
  const { stores } = useStores();
  const [orders, setOrders] = useLocalStorage<OrderRecord[]>("dabajib_orders", []);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");

  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);

  // Build store coords list from cart items
  const storeCoordsList = cart
    .map(item => {
      const store = stores.find(s => s.id === item.storeId);
      return store ? { storeId: store.id, lat: store.lat, lng: store.lng } : null;
    })
    .filter((s): s is { storeId: string; lat: number; lng: number } => s !== null)
    .filter((s, idx, self) => self.findIndex(x => x.storeId === s.storeId) === idx);

  const { deliveryFee, distanceKm, isRoad, loading: distLoading } = useRoadDistance(
    coords,
    storeCoordsList,
    config.distanceTiers
  );

  const grandTotal = subtotal + (cart.length > 0 ? deliveryFee : 0);
  const effectiveDeliveryFee = cart.length > 0 ? deliveryFee : 0;

  const buildMessage = () => {
    let message = `*طلب جديد / Nouvelle Commande*\n\n`;

    const storeGroups = cart.reduce((acc, item) => {
      if (!acc[item.storeName]) acc[item.storeName] = [];
      acc[item.storeName].push(item);
      return acc;
    }, {} as Record<string, typeof cart>);

    Object.entries(storeGroups).forEach(([storeName, items]) => {
      message += `*${storeName}*\n`;
      items.forEach(item => {
        message += `- ${item.quantity}x ${item.productName}`;
        if (item.selectedExtras.length > 0) {
          message += ` (${item.selectedExtras.map(e => e.name).join(", ")})`;
        }
        if (item.note) message += `\n  Note: ${item.note}`;
        message += ` - *${item.totalPrice.toFixed(2)} DH*\n`;
      });
      message += `\n`;
    });

    message += `*ثمن الطلبات / Sous-total:* ${subtotal.toFixed(2)} DH\n`;
    message += `*ثمن التوصيل / Livraison:* ${effectiveDeliveryFee.toFixed(2)} DH`;
    if (distanceKm > 0) {
      message += ` (${distanceKm.toFixed(1)} km${isRoad ? " - route réelle" : " - vol d'oiseau"})`;
    }
    message += `\n`;
    message += `*الثمن الإجمالي الكلي / Total Global:* ${grandTotal.toFixed(2)} DH\n\n`;

    if (coords) {
      message += `*موقع الزبون / Localisation Client:*\nhttps://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
    } else {
      message += `*موقع الزبون:* غير متوفر / Non disponible`;
    }
    return message;
  };

  const handleConfirmOrder = () => {
    if (cart.length === 0) return;
    const msg = buildMessage();
    setOrderMessage(msg);
    setShowWhatsAppModal(true);
  };

  const finishOrder = () => {
    const storeIds = new Set(cart.map(item => item.storeId));
    const newOrder: OrderRecord = {
      id: "ORD-" + Math.floor(Math.random() * 1000000),
      timestamp: new Date().toISOString(),
      storeName: storeIds.size === 1 ? cart[0].storeName : "Multi-Boutiques",
      items: cart,
      subtotal,
      deliveryFee: effectiveDeliveryFee,
      total: grandTotal
    };
    setOrders([...orders, newOrder]);
    clearCart();
    setShowWhatsAppModal(false);
  };

  const sendToPhone = (phone: string) => {
    const url = buildWhatsAppUrl(phone, orderMessage);
    window.open(url, "_blank");
  };

  if (cart.length === 0 && !showWhatsAppModal) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-10 px-6 text-center pb-20">
        <div className="w-28 h-28 rounded-full bg-[#181818] flex items-center justify-center mb-6 border border-[#2A2A2A]">
          <ShoppingCart className="w-12 h-12 text-[#2A2A2A]" />
        </div>
        <h2 className="text-white font-bold text-lg mb-2">Votre panier est vide</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Découvrez les meilleurs restaurants de Casablanca et commencez à commander.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-44">
      <div className="sticky top-0 bg-background/95 backdrop-blur-md z-30 px-4 py-4 border-b border-[#2A2A2A] flex justify-between items-center">
        <h1 className="text-white font-bold text-xl">Mon Panier</h1>
        <button data-testid="button-clear-cart" onClick={clearCart} className="text-muted-foreground text-xs uppercase font-bold hover:text-white">
          Vider
        </button>
      </div>

      <div className="p-4 space-y-3">
        {cart.map((item, index) => (
          <div key={index} className="bg-[#181818] rounded-xl p-3 border border-[#2A2A2A]" data-testid={`card-cart-item-${index}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-2">
                <span className="inline-block bg-[#2A2A2A] text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider mb-1">
                  {item.storeName}
                </span>
                <h3 className="text-white font-bold text-sm leading-tight">
                  {item.quantity}x {item.productName}
                </h3>
                {item.selectedExtras.length > 0 && (
                  <p className="text-muted-foreground text-[10px] mt-1">
                    + {item.selectedExtras.map(e => e.name).join(", ")}
                  </p>
                )}
                {item.note && (
                  <p className="text-primary/70 text-[10px] mt-1 italic">"{item.note}"</p>
                )}
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-white font-bold text-sm">{item.totalPrice.toFixed(2)} DH</span>
                <button
                  data-testid={`button-remove-item-${index}`}
                  onClick={() => removeFromCart(index)}
                  className="mt-2 p-1.5 bg-[#2A2A2A] rounded text-muted-foreground hover:bg-destructive hover:text-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order summary — fixed above bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto bg-[#0E0E0E] border-t border-[#2A2A2A] p-4 z-20 shadow-2xl">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sous-total</span>
            <span className="text-white">{subtotal.toFixed(2)} DH</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <div className="flex items-center space-x-1.5">
              <span className="text-muted-foreground">Livraison</span>
              {distLoading && <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />}
              {!distLoading && distanceKm > 0 && (
                <div className="flex items-center space-x-1">
                  <Navigation className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    {distanceKm.toFixed(1)} km{isRoad ? " (route)" : ""}
                  </span>
                </div>
              )}
            </div>
            <span className="text-white">{effectiveDeliveryFee.toFixed(2)} DH</span>
          </div>
          <div className="pt-2 mt-1 border-t border-[#2A2A2A] flex justify-between items-center">
            <span className="text-white font-bold">Total</span>
            <span className="text-primary font-black text-xl">{grandTotal.toFixed(2)} DH</span>
          </div>
        </div>

        <button
          data-testid="button-confirm-order"
          onClick={handleConfirmOrder}
          disabled={distLoading}
          className="w-full bg-destructive text-destructive-foreground font-bold text-base py-4 rounded-xl flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          {distLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Calcul de la livraison...</span>
            </>
          ) : (
            <>
              <span>Confirmer la Commande</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {/* WhatsApp dual-send modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-end justify-center p-4">
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl w-full max-w-md p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">Envoyer la commande</h3>
              <button onClick={() => setShowWhatsAppModal(false)} className="p-1.5 bg-[#2A2A2A] rounded-full">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="bg-[#121212] rounded-xl p-3 mb-4 border border-[#2A2A2A]">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Total commande</span>
                <span className="text-primary font-black">{grandTotal.toFixed(2)} DH</span>
              </div>
              {distanceKm > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Distance</span>
                  <span className="text-white flex items-center space-x-1">
                    <Navigation className="w-3 h-3 text-primary" />
                    <span>{distanceKm.toFixed(1)} km {isRoad ? "(route réelle)" : "(vol d'oiseau)"}</span>
                  </span>
                </div>
              )}
            </div>

            <p className="text-muted-foreground text-sm mb-4">
              Envoyez votre commande aux deux responsables de livraison via WhatsApp.
            </p>

            <div className="space-y-3">
              <button
                data-testid="button-send-phone1"
                onClick={() => sendToPhone(config.deliveryPhone1)}
                className="w-full bg-[#25D366] text-white font-bold py-3.5 rounded-xl flex items-center justify-center space-x-3 active:scale-[0.98] transition-transform"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Envoyer — Responsable 1</span>
              </button>
              <button
                data-testid="button-send-phone2"
                onClick={() => sendToPhone(config.deliveryPhone2)}
                className="w-full bg-[#128C7E] text-white font-bold py-3.5 rounded-xl flex items-center justify-center space-x-3 active:scale-[0.98] transition-transform"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Envoyer — Responsable 2</span>
              </button>
              <button
                data-testid="button-finish-order"
                onClick={finishOrder}
                className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-muted-foreground font-bold py-3 rounded-xl text-sm"
              >
                Confirmer et vider le panier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
