// src/features/groupProduct/groupProduct.types.ts
import { GroupProductEntity } from '../../data/entities/groupProductEntity';

// Define o formato completo do estado gerenciado pelo ViewModel (Hook)
export interface GroupProductState {
  groups: GroupProductEntity[]; // Lista registros cadastrados
  loading: boolean;             // Indicador visual de carregamento (Spinner)
  error: string | null;         // Mensagem de erro caso ocorra alguma falha nas operações
}

// Define as intenções (Intents/Actions) que o componente pode despachar para o hook executar as regras
export type GroupProductIntent =
  | { type: 'LOAD'}                                                     // Intenção para carregar
  | { type: 'CREATE'; payload: { nm_group: string }}                    // Intenção para cadastrar
  | { type: 'UPDATE'; payload: { id_group: number; nm_group: string }}  // Intenção para atualizar
  | { type: 'DELETE'; payload: number };                                // Intenção para excluir