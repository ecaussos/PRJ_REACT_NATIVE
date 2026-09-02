// src/features/product/product.types.ts
import { ProductEntity } from '../../data/entities/productEntity';

// Define a estrutura para o elemento de seleção (Picker) na tela
export interface GroupOption {
  id_group: number;
  nm_group: string;
}

// Estende a entidade adicionando dados de outra entidade para exibição na lista
export interface ProductWithGroup extends ProductEntity {
  nm_group?: string;
}

// Define o formato completo do estado gerenciado pelo ViewModel (Hook) da tela de produtos
export interface ProductState {
  products: ProductWithGroup[];         // Lista registros cadastrados
  groups: GroupOption[];                // Lista registros cadastrados
  currentProduct: ProductEntity | null; // Produto atualmente selecionado para alguma operação específica
  loading: boolean;                     // Indicador visual de carregamento (Spinner)
  error: string | null;                 // Mensagem de erro caso ocorra alguma falha nas operações
}

// Define as intenções (Intents/Actions) que o componente pode despachar para o hook executar as regras
export type ProductIntent =
  | { type: 'LOAD'}                                                                                                   // Intenção para carregar
  | { type: 'CREATE'; payload: { nm_product: string; id_group: number; cd_product_gtin: string }}                     // Intenção para cadastrar
  | { type: 'UPDATE'; payload: { id_product: number; nm_product: string; id_group: number; cd_product_gtin: string }} // Intenção para atualizar
  | { type: 'DELETE'; payload: number };                                                                              // Intenção para excluir