// src/data/entities/buyHistEntity.ts
export interface BuyHistEntity {
  id_hist_buy: number;       // UUID em formato TEXT
  id_supplier: number | null;// UUID do fornecedor / mercado (opcional)
  id_product: string;        // UUID do produto
  vl_product: number;        // Valor pago unitário/total (REAL)
  qt_product: number;        // Quantidade comprada (REAL)
  dt_list_buy: string;       // Data da lista de origem (TEXT)
  dt_hist_buy: string;       // Data em que a compra foi efetivada (TEXT)
}

// Interface expandida para exibir os dados unidos ao nome do produto e do fornecedor na tela de histórico
export interface BuyHistWithDetailsEntity extends BuyHistEntity {
  nm_product: string;
  nm_supplier?: string | null;
}