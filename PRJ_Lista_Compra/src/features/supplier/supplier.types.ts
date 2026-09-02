// src/features/supplier/supplier.types.ts
import { SupplierEntity } from '../../data/entities/supplierEntity';

// Define o formato completo do estado gerenciado pelo ViewModel (Hook)
export interface SupplierState {
  suppliers: SupplierEntity[]; // Lista registros cadastrados
  loading: boolean;            // Indicador visual de carregamento (Spinner)
  error: string | null;        // Mensagem de erro caso ocorra alguma falha nas operações
}

// Define as intenções (Intents/Actions) que o componente pode despachar para o hook executar as regras
export type SupplierIntent =
  | { type: 'LOAD'}                                                          // Intenção para carregar
  | { type: 'CREATE'; payload: { nm_supplier: string }}                      // Intenção para cadastrar
  | { type: 'UPDATE'; payload: { id_supplier: number; nm_supplier: string }} // Intenção para atualizar
  | { type: 'DELETE'; payload: number };                                     // Intenção para excluir