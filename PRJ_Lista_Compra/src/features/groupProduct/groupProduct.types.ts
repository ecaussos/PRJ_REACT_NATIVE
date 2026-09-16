// src/features/groupProduct/groupProduct.types.ts
import { GroupProductEntity } from '../../data/entities/groupProduct.entity';

// Re-exportação para facilidade de uso na camada de UI
export type GroupProduct = GroupProductEntity;

// DTO para retorno de buscas parciais por nome na caixa de pesquisa
export interface GroupProductSearchResult {
  id_group: number; // ID único do fornecedo retornado
  nm_group: string; // Nome do fornecedo retornado
}

// -------- Interfaces de Componentes de UI (Props) - Utilizados pelo Form  -------- //

// Props para as ações superiores (Cadastrar, Buscar e Limpar)
export interface GroupProductActionsProps {
  onOpenCreateModal: () => void; // Função executada para abrir o modal de novo cadastro
  onOpenSearchModal: () => void; // Função executada para abrir o modal ou campo de busca
  onClearSearch: () => void;     // Função executada para limpar o filtro de busca aplicado
  hasActiveSearch: boolean;      // Indica se existe uma busca ativa no momento para alternar ícones ou botões
}

// Props do Modal de filtragem seleção de item na lista (FlatList)
export interface GroupProductFilterProps {
  visible: boolean;                           // Controla se o modal de filtram está visível ou oculto
  searchText: string;                         // Valor do campo de texto digitado para a filtragem
  onChangeSearchText: (text: string) => void; // Função para atualizar o texto da filtragem
  onClose: () => void;                        // Função executada o fechamento do model
  onCancel: () => void;                       // Função executada ao cancelar - limpar/fecha modal
}

// Props do Modal do Formulário (Cadastro e Edição)
export interface GroupProductFormProps {
  showModal: boolean;              // Controla se o modal está visível ou oculto 
  name: string;                    // Valor do campo de texto com o nome do registro
  setName: (text: string) => void; // Função para atualizar o nome digitado
  isEditing: boolean;              // Indica se o modal é de edição (true) ou novo cadastro (false)                 
  onSave: () => void;              // Função executada ao clicar no botão de salvar 
  onCancel: () => void;            // Função executada ao fechar ou cancelar o modal
}

// Props para os componente de item da lista
export interface GroupProductItemProps {
  GroupProduct: GroupProductEntity;                   // Dados para exibição
  onEdit: (GroupProduct: GroupProductEntity) => void; // Ação para editar campos e dados para edição
  onDelete: (id: number) => void;                     // Ação para deletar registro pelo ID
}

// -------- Estados da Aplicação e MVI (ViewModel / Hook) -------- //

// Define o formato do estado do reducer gerenciado pelo ViewModel
export interface GroupProductState {
  groups: GroupProductEntity[]; // Lista de registros cadastrados para exibição
  loading: boolean;                    // Indicador visual de carregamento (Spinner)
  error: string | null;                // Mensagem de erro caso ocorra alguma falha nas operações
}

// Define as intenções (Intents/Actions) que o componente pode despachar para o hook executar as regras
export type GroupProductIntent =
  | { type: 'LOAD' }                                                    // Intenção para carregar
  | { type: 'CREATE'; payload: { nm_group: string } }                   // Intenção para cadastrar
  | { type: 'UPDATE'; payload: { id_group: number; nm_group: string } } // Intenção para atualizar
  | { type: 'DELETE'; payload: number };                                // Intenção para excluir