// src/data/entities/buy.entity.ts

// 1. Entidade base que reflete a tabela 'list_buy' no SQLite
export interface BuyEntity {
  id_product: number;         // ID produto (INTEGER)
  qt_product: number;         // Quantidade de produto
  vl_product?: number | null; // Valor do produto
  dt_list_buy: string;        // Data em formato ISO (TEXT)
}

export interface BuyHistEntity extends BuyEntity {
  id_hist_buy?: number;       // ID primário autoincrementado (INTEGER)
  id_supplier: number;        // ID do fornecedor
  vl_product: number;         // Sobrescreve para tornar obrigatório no histórico
  dt_hist_buy: string;        // Data de inserção no histórico
}

// 2. DTO para criação de novos registros (Omite a data da lista de compra)
export type CreateBuyDTO = Omit<BuyEntity, 'dt_list_buy'> & {
  id_list_buy?: number | null;
  dt_list_buy?: string;
};

export interface CreateBuyHistDTO {
  id_product: number;
  id_supplier: number;
  qt_product: number;
  vl_product: number;
  dt_list_buy: string;
  dt_hist_buy: string;
}

// 3. DTO para atualização de registros existentes
export type UpdateBuyDTO = Partial<Omit<BuyEntity, 'id_product'>>;

// 4. Interface expandida para exibição de itens da lista com JOINs (Produto e Grupo)
export interface BuyWithProductEntity extends BuyEntity {
  nm_product: string;
  nm_group?: string;
}

// 5. DTOs de Payload unificados para arquitetura MVI
export interface CreateBuyItemPayload {
  id_product: number;
  qt_product: number;
  vl_product: number;
}

export interface UpdateBuyPayload {
  id_product: number;
  qt_product: number;
  vl_product: number;
}

export interface DeleteBuyItemPayload {
  id_product: number;
}