import { useLocalStorage } from "./useLocalStorage";
import { Store, Product } from "../store/types";
import { DEFAULT_STORES } from "../store/seed";

function migrateStore(s: Store): Store {
  return {
    ...s,
    ratingSum: s.ratingSum ?? (s.rating * 10),
    ratingCount: s.ratingCount ?? 10,
    views: s.views ?? 0,
    products: (s.products ?? []).map((p: Product) => ({
      ...p,
      extras: p.extras ?? [],
      photo: p.photo ?? "",
      stars: p.stars ?? 5,
    })),
  };
}

export function useStores() {
  const [rawStores, setStores] = useLocalStorage<Store[]>("dabajib_stores", DEFAULT_STORES);

  const stores = rawStores.map(migrateStore);

  const addStore = (store: Store) => {
    setStores(prev => [...prev, store]);
  };

  const updateStore = (updatedStore: Store) => {
    setStores(prev => prev.map(s => s.id === updatedStore.id ? updatedStore : s));
  };

  const deleteStore = (id: string) => {
    setStores(prev => prev.filter(s => s.id !== id));
  };

  const incrementViews = (id: string) => {
    setStores(prev => prev.map(s => s.id === id ? { ...s, views: (s.views ?? 0) + 1 } : s));
  };

  const rateStore = (storeId: string, score: number) => {
    setStores(prev => prev.map(s => {
      if (s.id !== storeId) return s;
      const newSum = (s.ratingSum ?? s.rating * 10) + score;
      const newCount = (s.ratingCount ?? 10) + 1;
      return { ...s, ratingSum: newSum, ratingCount: newCount, rating: newSum / newCount };
    }));
  };

  const addProductToStore = (storeId: string, product: Product) => {
    setStores(prev => prev.map(s =>
      s.id === storeId ? { ...s, products: [...s.products, product] } : s
    ));
  };

  const deleteProductFromStore = (storeId: string, productId: string) => {
    setStores(prev => prev.map(s =>
      s.id === storeId ? { ...s, products: s.products.filter(p => p.id !== productId) } : s
    ));
  };

  const deleteExtraFromProduct = (storeId: string, productId: string, extraId: string) => {
    setStores(prev => prev.map(s => {
      if (s.id !== storeId) return s;
      return {
        ...s,
        products: s.products.map(p =>
          p.id === productId ? { ...p, extras: p.extras.filter(e => e.id !== extraId) } : p
        )
      };
    }));
  };

  const resetAllViews = () => {
    setStores(prev => prev.map(s => ({ ...s, views: 0, ratingSum: 0, ratingCount: 0, rating: 0 })));
  };

  return {
    stores,
    setStores,
    addStore,
    updateStore,
    deleteStore,
    incrementViews,
    rateStore,
    addProductToStore,
    deleteProductFromStore,
    deleteExtraFromProduct,
    resetAllViews
  };
}
