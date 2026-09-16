// src/features/buy/buy.types.ts
import { ProductEntity } from '../../data/entities/product.entity';
import { SupplierEntity } from '../../data/entities/supplier.entity';
import { SupplierModelInstance } from '../supplier/supplier.model';

// Resultado resumido da busca contendo apenas ID e nome
export type SearchProductResult = Pick<ProductEntity, 'id_product' | 'nm_product'>;

// Interface do Item do Carrinho de Compras em memória
export interface BuyCartItem {
id_list_buy?: number;               // ID único da lista de compras (opcional)
  id_product: number;               // ID do produto
  nm_product: string;               // Nome do produto
  cd_product_gtin?: string | null;  // Código de barras GTIN/EAN (opcional)
  id_group?: number;                // ID da categoria/grupo do produto (opcional)
  nm_group?: string;                // Nome da categoria/grupo do produto (opcional)
  qt_product: number;               // Quantidade do produto
  vl_product?: number | null;       // Valor/preço do produto (opcional)
  dt_list_buy?: string;             // Data de inclusão na lista (opcional)
}

// Contrato das Props consumidas pelo componente de formulário (BuyListForm.tsx)
export interface BuyFormProps {
  // Modal Câmera
  showCameraModal: boolean;                                                 // Exibe o modal da câmera
  onScanSuccess: (barcode: string) => void;                                 // Ação ao ler o código de barras
  onCloseCameraModal: () => void;                                           // Fecha o modal da câmera
  // Modal Busca por Nome
  showNameSearchModal: boolean;                                               // Exibe o modal de busca por nome
  onSearchProductsByName: (query: string) => Promise<SearchProductResult[]>;  // Executa a busca de produtos
  onSelectProductToAdd: (product: any) => void;                               // Ação ao selecionar um produto
  onCloseNameSearchModal: () => void;                                         // Fecha o modal de busca por nome
  // Modal Item / Edição
  editingItem: { item: BuyCartItem; index: number } | null;                   // Item sendo editado atualmente
  qtyText: string;                                                            // Texto da quantidade do item
  valueText: string;                                                          // Texto do preço do item
  onChangeQtyText: (text: string) => void;                                    // Atualiza o texto da quantidade
  onChangeValueText: (text: string) => void;                                  // Atualiza o texto do preço
  onSaveItemData: () => void;                                                 // Salva as edições do item
  onCloseItemModal: () => void;                                               // Fecha o modal de edição
  // Modal Finalizar
  showSupplierModal: boolean;                                                 // Exibe o modal de seleção de fornecedor
  suppliers: Awaited<ReturnType<typeof SupplierModelInstance.fetchAll>>;      // Lista de fornecedores disponíveis
  onConfirmFinalize: (supplier: any) => void;                                 // Confirma a finalização com o fornecedor
  onCloseSupplierModal: () => void;                                           // Fecha o modal de fornecedor
}

// Interface que encapsula o gerenciamento de dados do formulário e filtro no Hook (ViewModel)
export interface BuyFormState {
  // Estado e Despachante do Reducer
  state: BuyState;                        // Estado global da tela de compras
  dispatch: React.Dispatch<BuyIntent>;    // Função para disparar ações de negócio
  // Filtro e Controle de Inputs
  searchText: string;                       // Texto do campo de pesquisa de produtos
  setSearchText: (text: string) => void;    // Atualiza o texto da pesquisa
  qtyText: string;                          // Valor em texto da quantidade do item
  setQtyText: (text: string) => void;       // Atualiza a quantidade do item
  valueText: string;                        // Valor em texto do preço do item
  setValueText: (text: string) => void;     // Atualiza o preço do item
  // Propriedades Calculadas / Listas Filtradas
  filteredItems: BuyCartItem[];   // Lista de produtos filtrados pela pesquisa
  totalPurchaseValue: number;     // Valor total somado dos itens do carrinho
  // Handlers(Monipuladores) e Métodos de Negócio
  searchProductsByName: (query: string) => Promise<SearchProductResult[]>;          // Busca produtos no banco pelo nome
  handleScanSuccess: (barcode: string) => void;                                     // Processa o código de barras lido
  handleAddProductSelect: (product: ProductEntity | SearchProductResult) => void;   // Adiciona o produto selecionado à compra
  handleStartEditItem: (item: BuyCartItem, index: number) => void;                  // Abre a edição de um item da lista
  handleSaveItemData: () => void;                                                   // Salva as alterações de quantidade e valor
  handleOpenFinishModal: () => void;                                                // Valida a compra e abre modal de finalização
  handleConfirmFinalize: (supplier: SupplierEntity) => void;                        // Finaliza a compra salvando o histórico
  // Controle dos Modais
  setCameraModal: (show: boolean) => void;        // Controla exibição do modal da câmera
  setNameSearchModal: (show: boolean) => void;    // Controla exibição do modal de busca por nome
  setSupplierModal: (show: boolean) => void;      // Controla exibição do modal de fornecedores
  toggleAddOptions: () => void;                   // Alterna a exibição das opções de adição sem lista
}

// Define o formato completo do estado gerenciado pelo ViewModel (Hook) da tela Lista de Compra
export interface BuyState {
  items: BuyCartItem[];                                       // Lista itens no carrinho de compra
  suppliers: SupplierEntity[];                                // Lista de fornecedores/mercados
  loading: boolean;                                           // Indica carregamento na tela
  error: string | null;                                       // Mensagem de erro atual
  showAddOptions: boolean;                                    // Exibe botões de adição sem lista
  showCameraModal: boolean;                                   // Exibe modal da câmera/código de barras
  showNameSearchModal: boolean;                               // Exibe modal de busca por nome
  showSupplierModal: boolean;                                 // Exibe modal de seleção de fornecedor
  editingItem: { item: BuyCartItem; index: number } | null;   // Item sendo editado atualmente
}

// Define as intenções (Intents/Actions) que a interface pode despachar para o ViewModel
export type BuyIntent =
  | { type: 'LOAD_BUY_LIST' }                                                                     // Intenção para carregar lista de compra   
  | { type: 'ADD_BY_BARCODE'; payload: { barcode: string } }                                      // Intenção para adicionar produto código de barra
  | { type: 'ADD_BY_PRODUCT'; payload: { product: ProductEntity | SearchProductResult } }         // Intenção para adicionar produto por nome 
  | { type: 'UPDATE_ITEM'; payload: { index: number; quantityText: string; valueText: string } }  // Intenção para editar produto da lista
  | { type: 'REMOVE_ITEM'; payload: { index: number } }                                           // Intenção para remover produto da lista 
  | { type: 'FINALIZE'; payload: { id_supplier: number } };                                       // Intenção para finalizar a compra