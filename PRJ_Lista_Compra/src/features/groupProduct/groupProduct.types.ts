// src/features/groupProduct/groupProduct.types.ts
import { GroupProductEntity } from '../../data/entities/groupProduct.entity';

// Re-exportação para facilidade de uso na camada de UI
export type GroupProduct = GroupProductEntity;

// Contracto das Props consumidas pelo componente de formulário (SupplierForm.tsx)
export interface GroupProductFormProps {
  name: string;                       // Nome do grupo
  setName: (text: string) => void;    // Atualiza o nome
  isEditing: boolean;                 // Indica se está em modo de edição
  onSave: () => void;                 // Função para salvar/cadastrar
  onCancel: () => void;               // Função para cancelar a edição
}

// Interface que encapsula o gerenciamento de dados do formulário e filtro no Hook (ViewModel)
export interface GroupProductFormState{
  name: string;                                             // Nome do grupo
  setName: (text: string) => void;                          // Atualiza o nome
  searchText: string;                                       // Texto de pesquisa
  setSearchText: (text: string) => void;                    // Atualiza o texto de pesquisa
  isEditing: boolean;                                       // Indica se está em modo de edição
  editingId: number | null;                                 // ID do grupo em edição ou null
  resetForm: () => void;                                    // Limpa o formulário
  startEditing: (id: number, currentName: string) => void;  // Inicia a edição do grupo
}

// Define o formato completo do estado gerenciado pelo ViewModel (Hook)
export interface GroupProductState {
  groups: GroupProductEntity[]; // Lista de registros cadastrados
  loading: boolean;             // Indicador visual de carregamento (Spinner)
  error: string | null;         // Mensagem de erro caso ocorra alguma falha nas operações
}

// Define as intenções (Intents/Actions) que o componente pode despachar para o hook executar as regras
export type GroupProductIntent =
  | { type: 'LOAD' }                                                    // Intenção para carregar
  | { type: 'CREATE'; payload: { nm_group: string } }                   // Intenção para cadastrar
  | { type: 'UPDATE'; payload: { id_group: number; nm_group: string } } // Intenção para atualizar
  | { type: 'DELETE'; payload: number };                                // Intenção para excluir