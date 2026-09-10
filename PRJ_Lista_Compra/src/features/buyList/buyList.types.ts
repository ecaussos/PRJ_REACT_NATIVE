// src/features/buyList/buyList.types.ts
import { BuyListEntity, BuyListItemWithProductEntity } from '../../data/entities/buyList.entity';
import { EditingQuantityItem, ProductSearchResult } from './buyList.model';

// Re-exportação para facilidade de uso na camada de UI
export type BuyList = BuyListEntity;

// Contrato das Props consumidas pelo componente de formulário (BuyListForm.tsx)
export interface BuyListFormProps {
  // Props do Modal da Câmera
  showCameraModal: boolean;                                           // Visibilidade do modal de scanner/câmera
  onScanSuccess: (barcode: string) => void;                             // Acionado após a leitura do código de barras
  onCloseCameraModal: () => void;                                       // Fechar o modal da câmera
  
  // Props do Modal de Busca por Nome
  showNameSearchModal: boolean;                                       // Visibilidade do modal de busca por nome
  productQuery: string;                                                 // Texto atual da busca por nome de produto
  foundProducts: ProductSearchResult[];                                 // Lista de produtos retornados da pesquisa
  isSearching: boolean;                                                 // Indicador visual do estado de carregamento da busca
  onSearchProductQueryChange: (query: string) => void | Promise<void>;  // Handler para alteração da query de pesquisa
  onSelectProductToBuy: (product: ProductSearchResult) => void;         // Selecionar o produto desejado na lista
  onCloseNameSearchModal: () => void;                                   // Fechar o modal de busca por nome

  // Props do Modal de Edição de Quantidade
  editingQuantityItem: EditingQuantityItem | null;                      // Objeto com o item que está recebendo a alteração de quantidade
  newQuantityText: string;                                              // Texto digitado no input de alteração da quantidade
  onChangeQuantityText: (text: string) => void;                         // Handler para atualização do input de quantidade
  onSaveQuantity: () => void;                                           // Salva a editção do formulário de quantidade
  onCloseQuantityModal: () => void;                                     // Fechar o modal de edição de quantidade
}

// Interface que encapsula o gerenciamento de dados do formulário e filtro no Hook (ViewModel)
export interface BuyListFormState {
  // Câmera
  showCameraModal: boolean;                                           // Visibilidade do modal de scanner/câmera
  setShowCameraModal: (show: boolean) => void;                        // Altera visibilidade do modal de scanner
 
  // Busca por Nome
  showNameSearchModal: boolean;                                       // Visibilidade do modal de busca por nome
  setShowNameSearchModal: (show: boolean) => void;                    // Altera a visibilidade da busca por nome
  searchText: string;                                                 // Filtro de busca textual na lista
  setSearchText: (text: string) => void;                              // Altera o filtro de busca da lista
  productQuery: string;                                               // Termo pesquisado no modal por nome
  setProductQuery: (query: string) => void;                           // Altera o termo de busca por nome
  foundProducts: ProductSearchResult[];                               // Lista de produtos encontrados no banco
  setFoundProducts: (products: ProductSearchResult[]) => void;        // Altera a lista de encontrados
  isSearching: boolean;                                               // Status de carregamento da consulta de nomes
  setIsSearching: (isSearching: boolean) => void;                     // Altera status do indicador de carregamento

  // Edição de Quantidade
  editingQuantityItem: EditingQuantityItem | null;                    // Item em edição de quantidade
  setEditingQuantityItem: (item: EditingQuantityItem | null) => void; // Define o item em edição
  newQuantityText: string;                                            // Valor do input do modal de quantidade
  setNewQuantityText: (text: string) => void;                         // Altera o texto do input de quantidade
}

// Define o formato completo do estado gerenciado pelo ViewModel (Hook) da tela Lista de Compra
export interface BuyListState {
  items: BuyListItemWithProductEntity[];    // Lista de produtos vinculados
  loading: boolean;                         // Indicador de carregamento em tela
  error: string | null;                     // Mensagem de erro global do módulo
}

// Define as intenções (Intents/Actions) que a interface pode despachar para o ViewModel
export type BuyListIntent =
  | { type: 'LOAD' }                                                                     // Intenção para carregar
  | { type: 'CREATE'; payload: { id_product: number; qt_product: number } }              // Intenção para cadastrar
  | { type: 'CREATE_BY_BARCODE'; payload: { barcode: string } }                          // Intenção para cadastrar por código de barras
  | { type: 'UPDATE_QUANTITY'; payload: { id_list_buy: number; qt_product: number } }    // Intenção para atualizar quantidade
  | { type: 'DELETE'; payload: { id_list_buy: number } }                                 // Intenção para excluir
  | { type: 'CLEAR' };                                                                   // Intenção para limpar toda a lista