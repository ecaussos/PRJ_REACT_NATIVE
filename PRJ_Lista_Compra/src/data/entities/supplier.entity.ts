// src/data/entities/supplierEntity.ts

// 1. Entidade base que reflete a tabela 'supplier' no SQLite
export interface SupplierEntity {
  id_supplier: number;   // ID gerado automaticamente (INTEGER AUTOINCREMENT)
  nm_supplier: string;   // Nome do fornecedor / mercado
}

// 2. DTO para criação de novos registros (omite o ID autoincrement)
export type CreateSupplierDTO = Omit<SupplierEntity, 'id_supplier'>;

// 3. DTO para atualização de registros existentes
export type UpdateSupplierDTO = CreateSupplierDTO;