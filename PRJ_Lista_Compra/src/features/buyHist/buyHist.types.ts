// src/features/buyHist/buyHist.types.ts
import { BuyHistEntity, BuyHistWithEntity } from '../../data/entities/buyHist.entity';
import { SupplierEntity } from '../../data/entities/supplier.entity';

// Re-exportação para facilidade de uso na camada de UI
export type BuyHist = BuyHistEntity;

// Representa o item da lista de compras (com JOIN do produto)
export type BuyHistItem = BuyHistWithEntity;

// Reexporta a entidade SupplierEntity para consumo na UI sem conflito de declaração local
export type { SupplierEntity };

export interface BuyHistSearchResult {
  id_buy_hist: number;
  id_product?: number;
  nm_product?: string;
  id_group?: number;
  nm_group?: string;
  quantity: number;
  price?: number | null;
  id_supplier?: number;
  nm_supplier?: string;
  dt_buy?: string;
}

// -------- Interfaces de Componentes de UI (Props) - Utilizados pelo Form  -------- //

// Props para as ações principais (Cadastrar, Filtrar e Limpar)
export interface BuyHistActionsProps {
  onOpenDeleteModal?: () => void; // Ação para abrir modal de exclusão/limpeza
  onOpenFilterModal: () => void;  // Ação para abrir o modal de filtro
  onClearSearch: () => void;      // Ação para limpar a busca atual
  hasActiveSearch: boolean;       // Flag indicando se existe uma busca aplicada
  onClearList?: () => void;       // Ação para limpar toda a lista
}

// Props do Modal de filtragem seleção de item na lista (FlatList)
export interface BuyHistFilterProps {
  visible: boolean;                           // Controla a visibilidade do modal de busca
  searchText: string;                         // Texto atual digitado no campo de busca
  onChangeSearchText: (text: string) => void; // Evento disparado ao alterar o texto de busca
  onClose: () => void;                        // Ação de confirmar/aplicar a busca e fechar
  onCancel: () => void;                       // Ação de cancelar e restaurar a lista
}

// Props para a exibição de cada item da Lista de registros cadastrados
export interface BuyHistItemProps {
  item: BuyHistWithEntity;                    // Dados detalhados do item (com JOIN do produto)
  onEdit: (item: BuyHistWithEntity) => void;  // Ação para abrir modal de edição de quantidade
  onDelete: (id_hist_buy: number, name: string) => void; // Ação para excluir o item específico
}

// -------- Estados da Aplicação e MVI (ViewModel / Hook) -------- //

// Estado centralizado retornado pelo Hook
export interface BuyHistState {
  items: BuyHistWithEntity[];         // Lista principal de itens do histórico
  searchResults: BuyHistWithEntity[]; // Resultados filtrados na pesquisa
  totalRecords: number;                  // Total de registro cadastrados
  loading: boolean;                   // Indicador de carregamento da tela/operações
  error: string | null;               // Mensagem de erro, se houver
}

// Intenções (MVI) aceitas pelo dispatch do ViewModel
export type BuyHistIntent =
  | { type: 'LOAD' }                                                                                                  // Intenção para carregar
  | { type: 'UPDATE'; payload: { // Intenção para atualizar 
      id_hist_buy: number;
      id_product: number;
      qt_product: number;
      vl_product: number;
      id_supplier: number;
    } }
  | { type: 'DELETE'; payload: number }                                                                               // Intenção para excluir
