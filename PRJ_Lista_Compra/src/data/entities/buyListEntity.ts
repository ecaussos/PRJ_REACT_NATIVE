// src/data/entities/buyListEntity.ts

// 1. Entidade base que reflete a tabela 'list_buy' no SQLite
export interface BuyListEntity {
  id_list_buy: number;      // ID gerado automaticamente (INTEGER)
  id_product: number;       // ID produto (INTEGER)
  qt_product: number;       // Quantidade (REAL no banco)
  dt_list_buy: string;      // Data em formato ISO (TEXT)
}

// 2. DTO para criação de novo registros (Omite a chave primária autoincrement)
export type CreateBuyListDTO = Omit<BuyListEntity, 'id_list_buy'>;

// 3. DTO para atualização de registros existente
export type UpdateBuyListDTO = Partial<Omit<BuyListEntity, 'id_list_buy'>>;

// 4. Interface expandida para exibição de itens da lista (nome grupo - JOINs)
export interface BuyListItemWithProductEntity extends BuyListEntity {
  nm_product: string;
  cd_product_gtin: string | null;
  id_group: number;
  nm_group?: string;
}