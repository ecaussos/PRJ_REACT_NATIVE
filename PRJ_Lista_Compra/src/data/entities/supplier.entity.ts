// src/data/entities/supplierEntity.ts

// 1. Entidade base que reflete a tabela 'supplier' no SQLite
export interface SupplierEntity {
  id_supplier: string;        // ID gerado automaticamente (INTEGER AUTOINCREMENT)
  nm_supplier: string;        // Nome do fornecedor / mercado
  at_updated?: string | null; // Sincronização Data/Hora última atualização
  at_delete?: string | null;  // Sincronização Data/Hora da exclusão lógica (Soft Delete)
  st_sync?: number;           // Sincronização Status (0: synced, 1: pending, 2: pending delete)
}

// 2. DTO para criação de novos registros (omite o ID autoincrement)
export type CreateSupplierDTO = Omit<SupplierEntity, 'id_supplier'>;

// 3. DTO para atualização de registros existentes
export type UpdateSupplierDTO = CreateSupplierDTO;