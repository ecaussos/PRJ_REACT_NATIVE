// src/data/entities/buyHistEntity.ts
import { SupplierEntity } from './supplier.entity';

// 1. Entidade base que reflete a tabela 'list_buy' no SQLite
export interface BuyHistEntity {
  id_hist_buy: string;          // ID gerado automaticamente (INTEGER)
  id_supplier?: string | null;  // ID do fornecedor / mercado (opcional)
  id_product: string;           // ID do produto
  vl_product: number;           // Valor pago unitário/total (REAL)
  qt_product: number;           // Quantidade comprada (REAL)
  dt_list_buy: string;          // Data da lista de origem (TEXT)
  dt_hist_buy: string;          // Data em que a compra foi efetivada (TEXT)
  at_updated?: string | null;   // Sincronização Data/Hora última atualização
  at_delete?: string | null;    // Sincronização Data/Hora da exclusão lógica (Soft Delete)
  st_sync?: number;             // Sincronização Status (0: synced, 1: pending, 2: pending delete)
}

// Tipo simplificado para popular componentes de seleção/picker de grupos na UI.
export type SupplierOption = Pick<SupplierEntity, 'id_supplier' | 'nm_supplier'>;

// 4. Interface expandida para exibição de itens da lista (nome produto e nome fornecedor - JOINs)
export interface BuyHistWithEntity extends BuyHistEntity {
  nm_product: string;
  nm_group?: string | null;
  nm_supplier?: string | null;
}