// src/features/buy/buy.model.ts

export const BuyModel = {
  // Insere o item comprado na tabela de histórico 'hist_buy'
  async insertHistBuy(data: {
    id_product: number;
    id_supplier: number;
    qt_product: number;
    vl_product: number;
    dt_hist_buy: string;
  }) {
    // Implementação da query SQL de inserção no SQLite
    console.log("Inserindo no histórico:", data);
  }
};