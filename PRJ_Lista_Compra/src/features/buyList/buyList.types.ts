// src/features/buyList/buyList.types.ts
import { BuyListEntity, BuyListItemWithProductEntity } from '../../data/entities/buyList.entity';

// Re-exportação para facilidade de uso na camada de UI
export type BuyList = BuyListEntity;

// DTO para retorno de buscas
export interface ProductSearchResult {
  id_product: number;             // Id único do produto retornado
  nm_product: string;             // Nome do produto retornado
  cd_product_gtin: string | null; // Código do produto retornado
  nm_group?: string | null;       // Nome do grupo do produto retornado
}

// -------- Interfaces de Componentes de UI (Props) - Utilizados pelo Form  -------- //

// Props para as ações principais (Cadastrar, Filtrar e Limpar)
export interface BuylistActionsProps {
  onOpenCreateModal: () => void; // Função executada para abrir o modal de novo cadastro
  onOpenFilterModal: () => void; // Função executada para abrir o modal de filtragem na lista
  onClearSearch: () => void;     // Função executada para limpar o filtro de busca aplicado
  onClearList: () => void;       // Aciona a confirmação para exluir todos os registros da lista (limpar ista inteira)
  hasActiveSearch: boolean;      // Indica se existe uma busca ativa no momento para alternar ícones ou botões
}

// Props do Modal de filtragem seleção de item na lista (FlatList)
export interface BuyListFilterProps {
  visible: boolean;                           // Controla se o modal de filtram está visível ou oculto
  searchText: string;                         // Valor do campo de texto digitado para a filtragem
  onChangeSearchText: (text: string) => void; // Função executada ao digitar o texto da filtragem
  onClose: () => void;                        // Função executada o fechamento do model
  onCancel: () => void;                       // Função executada ao cancelar - limpar/fecha modal
}

// Props para a exibição de cada item da Lista de registros cadastrados
export interface BuyListItemProps {
  item: BuyListItemWithProductEntity;                    // Dados detalhados do item (com JOIN do produto)
  onEdit: (item: BuyListItemWithProductEntity) => void;  // Ação para abrir modal de edição de quantidade
  onDelete: (id_list_buy: number, name: string) => void; // Ação para excluir o item específico
}

// Props do Modal para buscar Produto castrados por o código de barra (Adcionar a lista) - Câmera
export interface BuyListBarcodeProps {
  visible: boolean;                         // Controla se a câmera está ativa
  onScanSuccess: (barcode: string) => void; // Retorna o código lido
  onClose: () => void;                      // Fecha a tela da câmera
}

// Props do Modal para buscar Produto cadastrados por nome (Adcionar a lista)
export interface BuyListSearchProps {
  visible: boolean;                                        // Controla se o modal de filtram está visível ou oculto
  onChangeSearchText: (text: string) => void;              // Função executada ao digitar o texto no de busca
  searchResults: ProductSearchResult[];                    // Lista os produtos encontrados na busca
  onSelectProduct: (product: ProductSearchResult) => void; // Função ap selecionar o produto na busca para adicionar à lista
  onClose: () => void;                                     // Função executada o fechamento do model
  onCancel: () => void;                                    // Função executada ao cancelar - limpar/fechar modal
}

// -------- Estados da Aplicação e MVI (ViewModel / Hook) -------- //

// Estado centralizado retornado pelo Hook
export interface BuyListState {
  items: BuyListItemWithProductEntity[]; // Lista de itens cadastrados com dados de produtos
  searchResults: ProductSearchResult[];  // <-- busca produto por nome
  loading: boolean;                      // Spinner/Carregamento ativado
  error: string | null;                  // Erros ocorridos durante o fluxo
}

// Intenções (MVI) aceitas pelo dispatch do ViewModel
export type BuyListIntent =
  | { type: 'LOAD' }                                                         // Intenção para carregar
  | { type: 'CREATE'; payload: { id_product: number; qt_product: number } }  // Intenção para cadastrar
  | { type: 'UPDATE'; payload: { id_list_buy: number; qt_product: number } } // Intenção para atualizar 
  | { type: 'DELETE'; payload: number }                                      // Intenção para excluir
  | { type: 'CLEAR_LIST' }                                                   // Intenção para excluir todos