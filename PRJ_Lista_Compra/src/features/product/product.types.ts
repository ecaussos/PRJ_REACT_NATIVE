// src/features/product/product.types.ts
import { ProductEntity, ProductWithGroupEntity } from '../../data/entities/product.entity'; // Importa as entidades de dados

// Re-exportação para facilidade de uso na camada de UI
export type Product = ProductEntity;  // Alias para a entidade principal de produto

// DTO para retorno de buscas parciais por nome na caixa de pesquisa
export interface ProductSearchResult {
  id_product: number; // Identificador único do produto retornado
  nm_product: string; // Nome do produto retornado
}

// DTO para opções do dropdown/select de grupos
export interface GroupOption {
  id_group: number; // ID do grupo de produto retornado
  nm_group: string; // Nome do grupo de produto retornado
}

// -------- Interfaces de Componentes de UI (Props) - Utilizados pelo Form  -------- //

// Props para as ações superiores (Cadastrar, Buscar e Limpar)
export interface ProductActionsProps {
  onOpenCreateModal: () => void; // Função executada para abrir o modal de novo cadastro
  onOpenSearchModal: () => void; // Função executada para abrir o modal ou campo de busca
  onClearSearch: () => void;     // Função executada para limpar o filtro de busca aplicado
  hasActiveSearch: boolean;      // Indica se existe uma busca ativa no momento para alternar ícones ou botões
}

// Props do Modal de filtragem seleção de item na lista (FlatList)
export interface ProductFilterProps {
  visible: boolean;                           // Controla se o modal de filtragem está visível ou oculto
  searchText: string;                         // Valor do campo de texto digitado para a filtragem
  onChangeSearchText: (text: string) => void; // Função para atualizar o texto da filtragem
  onClose: () => void;                         // Função executada no fechamento do modal
  onCancel: () => void;                       // Função executada ao cancelar - limpar/fechar modal
}

// Props para a exibição de cada item da Lista de registros cadastrados
export interface ProductItemProps {
  product: ProductEntity;                   // Dados do produto para exibição
  onEdit: (product: ProductEntity) => void; // Ação para editar campos e dados para edição
  onDelete: (id: number) => void;           // Ação para deletar registro pelo ID
}

// -------- Estados da Aplicação e MVI (ViewModel / Hook) -------- //

// Define o formato do estado do reducer gerenciado pelo ViewModel
export interface ProductState {
  products: ProductWithGroupEntity[]; // Lista de registros cadastrados para exibição
  groups: GroupOption[];              // Lista de grupos para preenchimento do Picker
  loading: boolean;                   // Indicador visual de carregamento (Spinner)
  error: string | null;               // Mensagem de erro caso ocorra alguma falha nas operações
}

// Define as intenções (Intents/Actions) que o componente pode despachar para o hook executar as regras
export type ProductIntent =
  | { type: 'LOAD' }                                                                                                   // Intenção para carregar registros
  | { type: 'CREATE'; payload: { nm_product: string; id_group: number; cd_product_gtin: string } }                     // Intenção para cadastrar novo registro
  | { type: 'UPDATE'; payload: { id_product: number; nm_product: string; id_group: number; cd_product_gtin: string } } // Intenção para atualizar registro
  | { type: 'DELETE'; payload: number };                                                                               // Intenção para excluir registro pelo ID