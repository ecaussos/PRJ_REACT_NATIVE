// src/features/buy/buy.types.ts
import { BuyListItemWithProductEntity } from '../../data/entities/buyListEntity';
// Define o formato completo do estado gerenciado pelo ViewModel (Hook) da tela de produtos
export interface BuyState {
  items: BuyListItemWithProductEntity[]; // Lista registros cadastrados
  loading: boolean;                      // Indicador visual de carregamento (Spinner)
  error: string | null;                  // Mensagem de erro caso ocorra alguma falha nas operações
}
// Define as intenções (Intents/Actions) que o componente pode despachar para o hook executar as regras
export type BuyListIntent =
  | { type: 'LOAD' }                                                                              // Intenção para carregar
  | { type: 'CREATE'; payload: { id_product: number; qt_product: number } }                       // Intenção para cadastrar
  | { type: 'UPDATE_ITEM'; payload: { index: number; qt_product: number; vl_product: number } }   // Intenção para atualizar
  | { type: 'REMOVE_ITEM'; payload: { index: number } }                                           // Intenção para excluir
  | { type: 'FINALIZE'; payload: { id_supplier: number } }                                        // Intenção para finalizar
