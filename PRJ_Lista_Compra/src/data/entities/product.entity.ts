// src/data/entities/product.entity.ts
import { GroupProductEntity } from './groupProduct.entity';

// 1. Entidade base que reflete a tabela 'product' no SQLite
export interface ProductEntity {
  id_product: string;             // ID gerado automaticamente (INTEGER)
  nm_product: string;             // Nome do produto
  id_group: string;               // Chave estrangeira para o grupo de produtos
  cd_product_gtin: string | null; // Código de barras (GTIN) - aceita null caso não informado
  at_updated?: string | null;     // Sincronização Data/Hora última atualização
  at_delete?: string | null;      // Sincronização Data/Hora da exclusão lógica (Soft Delete)
  st_sync?: number;               // Sincronização Status (0: synced, 1: pending, 2: pending delete)
}

// 2. DTO para criação de novos registros (Omite a chave primária autoincrement)
export type CreateProductDTO = Omit<ProductEntity, 'id_product'>;

// 3. DTO para atualização de registros existentes
export type UpdateProductDTO = CreateProductDTO;

// Tipo simplificado para popular componentes de seleção/picker de grupos na UI.
export type GroupOption = Pick<GroupProductEntity, 'id_group' | 'nm_group'>;

// 4. Entidade expandida para exibições que trazem o nome do grupo (JOINs)
export interface ProductWithGroupEntity extends ProductEntity {
  nm_group?: string;
}

