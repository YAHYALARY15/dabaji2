import { useLocalStorage } from "./useLocalStorage";
import { AppConfig } from "../store/types";
import { DEFAULT_CONFIG } from "../store/seed";

function migrateConfig(raw: AppConfig & { masterPhone?: string }): AppConfig {
  return {
    ...DEFAULT_CONFIG,
    ...raw,
    deliveryPhone1: raw.deliveryPhone1 ?? raw.masterPhone ?? DEFAULT_CONFIG.deliveryPhone1,
    deliveryPhone2: raw.deliveryPhone2 ?? DEFAULT_CONFIG.deliveryPhone2,
    globalExtras: raw.globalExtras ?? DEFAULT_CONFIG.globalExtras,
    productCategories: raw.productCategories ?? DEFAULT_CONFIG.productCategories,
    distanceTiers: raw.distanceTiers ?? DEFAULT_CONFIG.distanceTiers,
    layoutOrder: raw.layoutOrder ?? DEFAULT_CONFIG.layoutOrder,
    adminPassword: raw.adminPassword ?? DEFAULT_CONFIG.adminPassword,
  };
}

export function useAppConfig() {
  const [rawConfig, setRawConfig] = useLocalStorage<AppConfig & { masterPhone?: string }>(
    "dabajib_config",
    DEFAULT_CONFIG
  );

  const config = migrateConfig(rawConfig);

  const setConfig = (newConfig: AppConfig) => {
    setRawConfig(newConfig);
  };

  return { config, setConfig };
}
