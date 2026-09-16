// src/features/supplier/supplier.types.ts
import { SupplierEntity } from '../../data/entities/supplier.entity';

// Re-exportação para facilidade de uso na camada de UI
export type Supplier = SupplierEntity;

// DTO para retorno de buscas
export interface SupplierSearchResult {
  id_supplier: number; // ID único do fornecedo retornado
  nm_supplier: string; // Nome do fornecedo retornado
}

// -------- Interfaces de Componentes de UI (Props) - Utilizados pelo Form  -------- //

// Props para as ações superiores (Cadastrar, Filtrar e Limpar)
export interface SupplierActionsProps {
  onOpenCreateModal: () => void; // Função executada para abrir o modal de novo cadastro
  onOpenSearchModal: () => void; // Função executada para abrir o modal ou campo de busca
  onClearSearch: () => void;     // Função executada para limpar o filtro de busca aplicado
  hasActiveSearch: boolean;      // Indica se existe uma busca ativa no momento para alternar ícones ou botões
}

// Props do Modal de filtragem seleção de item na lista (FlatList)
export interface SupplierFilterProps {
  visible: boolean;                           // Controla se o modal de filtram está visível ou oculto
  searchText: string;                         // Valor do campo de texto digitado para a filtragem
  onChangeSearchText: (text: string) => void; // Função para atualizar o texto da filtragem
  onClose: () => void;                        // Função executada o fechamento do model
  onCancel: () => void;                       // Função executada ao cancelar - limpar/fecha modal
}

// Props para a exibição de cada item da Lista de registros cadastrados
export interface SupplierItemProps {
  supplier: SupplierEntity;                   // Dados para exibição
  onEdit: (supplier: SupplierEntity) => void; // Ação para editar campos e dados para edição
  onDelete: (id: number) => void;             // Ação para deletar registro pelo ID
}

// Props do Modal do Formulário (Cadastro e Edição)
export interface SupplierFormProps {
  showModal: boolean;              // Controla se o modal está visível ou oculto 
  name: string;                    // Valor do campo de texto com o nome do registro
  setName: (text: string) => void; // Função para atualizar o nome digitado
  isEditing: boolean;              // Indica se o modal é de edição (true) ou novo cadastro (false)                 
  onClose: () => void;                        // Função executada o fechamento do busca
  onCancel: () => void;                       // Função executada ao cancelar e limpar a busca
}

// -------- Estados da Aplicação e MVI (ViewModel / Hook) -------- //

// Define o formato do estado do reducer gerenciado pelo ViewModel
export interface SupplierState {
  suppliers: SupplierEntity[]; // Lista de registros cadastrados para exibição
  loading: boolean;            // Indicador visual de carregamento (Spinner)
  error: string | null;        // Mensagem de erro caso ocorra alguma falha nas operações
}

// Define as intenções (Intents/Actions) que o componente pode despachar para o hook executar as regras
export type SupplierIntent =
  | { type: 'LOAD' }                                                          // Intenção para carregar
  | { type: 'CREATE'; payload: { nm_supplier: string } }                      // Intenção para cadastrar
  | { type: 'UPDATE'; payload: { id_supplier: number; nm_supplier: string } } // Intenção para atualizar
  | { type: 'DELETE'; payload: number };                                      // Intenção para excluir



