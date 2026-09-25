// src/features/buyList/buyList.types.ts
import { BuyEntity, BuyWithProductEntity } from '../../data/entities/buy.entity';
import { SupplierEntity } from '../../data/entities/supplier.entity';

// Re-exportação para facilidade de uso na camada de UI
export type Buy = BuyEntity;

// Representa o item da lista de compras (com JOIN do produto)
export type BuyItem = BuyWithProductEntity;

// Reexporta a entidade SupplierEntity para consumo na UI sem conflito de declaração local
export type { SupplierEntity };

// DTO para retorno de buscas
export interface ProductSearchResult {
  id_product: number;               // ID do produto
  nm_product: string;               // Nome do produto
  cd_product_gtin?: string | null;  // Código de barras GTIN/EAN (opcional)
  nm_group?: string | null;         // Nome da categoria/grupo do produto (opcional)
}

// -------- Interfaces de Componentes de UI (Props) - Utilizados pelo Form  -------- //

// Props para as ações principais (Cadastrar, Filtrar e Limpar)
export interface BuyActionsProps {
  onOpenCreateModal: () => void; // Função executada para abrir o modal de novo cadastro
  onOpenFilterModal: () => void; // Função executada para abrir o modal de filtragem na lista
  onClearSearch: () => void;     // Função executada para limpar o filtro de busca aplicado
  onClearBuy: () => void;        // Função executada para aciona a confirmação para exluir todos os registros da compra ()
  hasActiveSearch: boolean;      // Indica se existe uma busca ativa no momento para alternar ícones ou botões
}

// Props do Modal de filtragem seleção de item na lista (FlatList)
export interface BuyFilterProps {
  visible: boolean;                               // Controla se o modal de filtragem está visível ou oculto
  searchText: string;                             // Valor do campo de texto digitado para a filtragem
  // Filtro pr nome
  onChangeSearchText: (text: string) => void;     // Função executada ao digitar o texto da filtragem
  // Filtro sem valor
  onlyWithoutPrice: boolean;                      // Estado do filtro para itens sem valor/zero
  onToggleOnlyWithoutPrice: () => void;           // Função para alternar o estado do filtro de preço
  // Filtro por Grupo
  selectedGroup: string;                          // Nome do grupo atualmente selecionado para a filtragem
  onChangeSelectedGroup: (group: string) => void; // Função para atualizar a seleção do grupo
  availableGroups: string[];                      // Lista de nomes de grupos disponíveis para seleção
  // Ações
  onClose: () => void;                            // Função executada no fechamento do modal
  onCancel: () => void;                           // Função executada ao cancelar - limpa e fecha o modal
}

// Props para a exibição de cada item da Lista de registros cadastrados
export interface BuyItemProps {
  item: BuyWithProductEntity;                           // Dados detalhados do item (com JOIN do produto)
  onEdit: (item: BuyWithProductEntity) => void;         // Ação para abrir modal de edição de quantidade
  onDelete: (id_product: number, name: string) => void; // Ação para excluir o item específico
}

// Props do Modal para buscar Produto castrados por o código de barra (Adcionar a lista) - Câmera
export interface BuyBarcodeProps {
  visible: boolean;                         // Controla se a câmera está ativa
  onScanSuccess: (barcode: string) => void; // Retorna o código lido
  onClose: () => void;                      // Fecha a tela da câmera
}

// Props do Modal para buscar Produto cadastrados por nome (Adcionar a lista)
export interface BuySearchProductProps {
  visible: boolean;                                        // Controla se o modal de filtram está visível ou oculto
  onChangeSearchText: (text: string) => void;              // Função executada ao digitar o texto no de busca
  searchResults: ProductSearchResult[];                    // Lista os produtos encontrados na busca
  onSelectProduct: (product: ProductSearchResult) => void; // Função ap selecionar o produto na busca para adicionar à lista
  onClose: () => void;                                     // Função executada o fechamento do model
  onCancel: () => void;                                    // Função executada ao cancelar - limpar/fechar modal
}

// Props do Footer de totalizador do valor da compra
export interface BuyFooterTotalProps {
  totalValue: number;     // Valor total acumulado da compra
  onFinalize: () => void; // Função para finalizar o fluxo de compra
}

// Props do Modal para selecionar Fornecedor/Mercado para finaliza a compra
export interface FinishBuyProps {
  visible: boolean;                                     // Controla a exibição do modal na tela
  suppliers: SupplierEntity[];                          // Lista de fornecedores disponíveis
  onSelectSupplier: (supplier: SupplierEntity) => void; // Função para selecionar um fornecedor
  onClose: () => void;                                  // Função para fechar o modal
}

// -------- Estados da Aplicação e MVI (ViewModel / Hook) -------- //

// Estado centralizado retornado pelo Hook
export interface BuyState {
  items: BuyItem[];                      // Lista itens na compra
  searchResults: ProductSearchResult[];  // Busca produto por nome
  suppliers: SupplierEntity[];           // Lista de fornecedores/mercados
  loading: boolean;                      // Spinner/Carregamento ativado
  error: string | null;                  // Erros ocorridos durante o fluxo
}
// Intenções (MVI) aceitas pelo dispatch do ViewModel
export type BuyIntent =
  | { type: 'LOAD' }
  | { type: 'CREATE'; payload: {id_product: number, qt_product: number, vl_product: number } }  // Intenção para cadastrar
  | { type: 'UPDATE'; payload: { id_product: number; qt_product: number; vl_product: number } } // Intenção para editar produto da lista
  | { type: 'DELETE'; payload: { id_product: number } }                                         // Intenção para excluir um registro
  | { type: 'CLEAR' }                                                                           // Intenção para excluir todos