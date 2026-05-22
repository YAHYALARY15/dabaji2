import { useLocalStorage } from "./useLocalStorage";
import { CartItem } from "../store/types";

export function useCart() {
  const [cart, setCart] = useLocalStorage<CartItem[]>("dabajib_cart", []);

  const addToCart = (item: CartItem) => {
    setCart([...cart, item]);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const clearCart = () => setCart([]);

  return { cart, addToCart, removeFromCart, clearCart };
}
