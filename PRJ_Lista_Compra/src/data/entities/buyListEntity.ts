// src/data/entities/buyListEntity.ts
export interface BuyListEntity {
  id_list_buy: number;      // ID gerado automaticamente (INTEGER)
  id_product: number;       // ID produto (INTEGER)
  qt_product: number;       // Quantidade (REAL no banco)
  dt_list_buy: string;      // Data em formato ISO (TEXT)
}

export interface BuyListItemWithProductEntity extends BuyListEntity {
  nm_product: string;
  cd_product_gtin: string | null;
  id_group: number;
  nm_group?: string;
}