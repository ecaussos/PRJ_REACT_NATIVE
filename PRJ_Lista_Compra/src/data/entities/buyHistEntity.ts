// src/data/entities/buyHistEntity.ts

// 1. Entidade base que reflete a tabela 'list_buy' no SQLite
export interface BuyHistEntity {
  id_hist_buy: number;       // ID gerado automaticamente (INTEGER)
  id_supplier: number;       // ID do fornecedor / mercado (opcional)
  id_product: number;        // ID do produto
  vl_product: number;        // Valor pago unitário/total (REAL)
  qt_product: number;        // Quantidade comprada (REAL)
  dt_list_buy: string;       // Data da lista de origem (TEXT)
  dt_hist_buy: string;       // Data em que a compra foi efetivada (TEXT)
}

// 2. DTO para criação de novo registros (Omite a chave primária autoincrement)
export type CreateBuyHistDTO = Omit<BuyHistEntity, 'id_hist_buy'>;

// 4. Interface expandida para exibição de itens da lista (nome produto e nome fornecedor - JOINs)
export interface BuyHistWithDetailsEntity extends BuyHistEntity {
  nm_product: string;
  nm_supplier?: string | null;
}