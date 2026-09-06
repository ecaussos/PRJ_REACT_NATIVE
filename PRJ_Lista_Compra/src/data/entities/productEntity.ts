// src/data/entities/productEntity.ts

// 1. Entidade base que reflete a tabela 'product' no SQLite
export interface ProductEntity {
  id_product: number;         // ID gerado automaticamente (INTEGER)
  nm_product: string;         // Nome do produto
  id_group: number;           // Chave estrangeira para o grupo de produtos
  cd_product_gtin: string | null; // Código de barras (GTIN) - aceita null caso não informado
}

// 2. DTO para criação de novo registros (Omite a chave primária autoincrement)
export type CreateProductDTO = Omit<ProductEntity, 'id_product'>;

// 3. DTO para atualização de registros existente
export type UpdateBuyListDTO = Partial<Omit<ProductEntity, 'id_product'>>;

// 4. Entidade expandida para exibições que trazem o nome do grupo (JOINs)
export interface ProductWithGroupEntity extends ProductEntity {
  nm_group?: string;
}