// src/data/entities/productEntity.ts
export interface ProductEntity {
  id_product: number;         // ID gerado automaticamente (INTEGER)
  nm_product: string;         // Nome do produto
  id_group: number;           // Chave estrangeira para a tabela group
  cd_product_gtin: string;    // Código de barras (GTIN)
}
