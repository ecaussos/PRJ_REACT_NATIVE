// src/data/entities/buyListEntity.ts

// 1. Entidade base que reflete a tabela 'list_buy' no SQLite
export interface BuyListEntity {
  id_list_buy: number;      // ID gerado automaticamente (INTEGER)
  id_product: number;       // ID produto (INTEGER)
  qt_product: number;       // Quantidade (REAL no banco)
  dt_list_buy: string;      // Data em formato ISO (TEXT)
}

// 2. DTO para criação de novos registros (Omite a chave primária autoincrement)
export type CreateBuyListDTO = Omit<BuyListEntity, 'id_list_buy'>;

// 3. DTO para atualização de registros existentes
export type UpdateBuyListDTO = Partial<Omit<BuyListEntity, 'id_list_buy'>>;

// 4. Interface expandida para exibição de itens da lista com JOINs (Produto e Grupo)
export interface BuyListItemWithProductEntity extends BuyListEntity {
  nm_product: string;
  nm_group?: string;
}

// 5. DTOs de Payload unificados para arquitetura MVI
export interface CreateBuyListItemPayload {
  id_product: number;
  qt_product: number;
}

export interface UpdateBuyListQuantityPayload {
  id_list_buy: number;
  qt_product: number;
}

export interface DeleteBuyListItemPayload {
  id_list_buy: number;
}