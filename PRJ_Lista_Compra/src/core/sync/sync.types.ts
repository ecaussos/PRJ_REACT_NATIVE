// src/core/database/sync/sync.types.ts
export interface BaseSyncEntity {
  at_updated?: string | null;
  at_delete?: string | null;
  st_sync?: number | null;
}

export interface SupplierSync extends BaseSyncEntity {
  id_supplier: string;
  nm_supplier: string;
}

export interface GroupProductSync extends BaseSyncEntity {
  id_group: string;
  nm_group: string;
}

export interface ProductSync extends BaseSyncEntity {
  id_product: string;
  nm_product: string;
  id_group?: string | null;
  cd_product_gtin?: string | null;
}

export interface FromToGroupSync extends BaseSyncEntity {
  id_external: string;
  description?: string | null;
  keywords?: string | null;
  tag?: string | null;
  id_group: string;
}

export interface ListBuySync extends BaseSyncEntity {
  id_list_buy: string;
  id_product: string;
  qt_product: number;
  fl_bought: number;
  dt_list_buy?: string | null;
}

export interface HistBuySync extends BaseSyncEntity {
  id_hist_buy: string;
  id_product: string;
  id_supplier?: string | null;
  qt_product: number;
  vl_product: number;
  dt_list_buy?: string | null;
  dt_hist_buy?: string | null;
}

export interface BuySync extends BaseSyncEntity {
  id_product: string;
  qt_product: number;
  vl_product: number;
  dt_list_buy?: string | null;
}

export interface ConfigTypeSync extends BaseSyncEntity {
  id_tp_config: string;
  ds_tp_config: string;
}

export interface ConfigSync extends BaseSyncEntity {
  id_config: string;
  id_tp_config: string;
  url_config?: string | null;
  port_config?: number | null;
  user_config?: string | null;
  key_config?: string | null;
  vers_config?: string | null;
  st_ssl: number;
  st_config: number;
  dt_config?: string | null;
}