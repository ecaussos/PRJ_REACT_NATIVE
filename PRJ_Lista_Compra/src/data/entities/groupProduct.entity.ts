// src/data/entities/groupProductEntity.ts

// 1. Entidade base que reflete a tabela 'group_product' no SQLite
export interface GroupProductEntity {
  id_group: string;           // ID gerado automaticamente (INTEGER AUTOINCREMENT)
  nm_group: string;           // Nome do grupo (ex: Mercearia, Hortifrúti, Limpeza, etc.)
  at_updated?: string | null; // Sincronização Data/Hora última atualização
  at_delete?: string | null;  // Sincronização Data/Hora da exclusão lógica (Soft Delete)
  st_sync?: number;           // Sincronização Status (0: synced, 1: pending, 2: pending delete)
}

// 2. DTO para criação de novos registros (omite o ID autoincrement)
export type CreateGroupProductDTO = Omit<GroupProductEntity, 'id_group'>;

// 3. DTO para atualização de registros existentes
export type UpdateGroupProductDTO = CreateGroupProductDTO;