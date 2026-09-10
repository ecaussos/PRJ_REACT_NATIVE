// src/features/product/product.types.ts
import { GroupProductEntity } from '../../data/entities/groupProduct.entity';
import { ProductWithGroupEntity } from '../../data/entities/product.entity';

// Define a estrutura para o elemento de seleção (Picker) na tela
export type GroupOption = Pick<GroupProductEntity, 'id_group' | 'nm_group'>;

// Reutiliza a entidade expandida da camada de dados para exibição na listagem
export type ProductWithGroup = ProductWithGroupEntity;

// Contrato das Props consumidas pelo componente de formulário (ProductForm.tsx)
export interface ProductFormProps {
  name: string;                        // Nome do produto
  setName: (text: string) => void;     // Atualiza o nome
  barcode: string;                     // Código de barras (GTIN)
  setBarcode: (text: string) => void;  // Atualiza o código de barras
  groupId: string;                     // ID do grupo selecionado
  setGroupId: (text: string) => void;  // Atualiza o grupo selecionado
  editingId: number | null;            // ID do produto em edição ou null
  groups: GroupOption[];               // Lista de grupos para o Picker
  onSave: () => void;                  // Função para salvar/cadastrar
  onCancel: () => void;                // Função para cancelar a edição
}

// Interface que encapsula o gerenciamento de dados do formulário e filtro no Hook (ViewModel)
export interface ProductFormState {
  name: string;                                                                                            // Nome do produto
  setName: (text: string) => void;                                                                         // Atualiza o nome
  barcode: string;                                                                                         // Código de barras (GTIN)
  setBarcode: (text: string) => void;                                                                      // Atualiza o código de barras
  groupId: string;                                                                                         // ID do grupo selecionado
  setGroupId: (text: string) => void;                                                                      // Atualiza o grupo selecionado
  searchText: string;                                                                                      // Texto de pesquisa
  setSearchText: (text: string) => void;                                                                   // Atualiza o texto de pesquisa
  isEditing: boolean;                                                                                      // Indica se está em modo de edição
  editingId: number | null;                                                                                // ID do produto em edição ou null
  resetForm: () => void;                                                                                   // Limpa o formulário
  startEditing: (id: number, currentName: string, currentBarcode: string, currentGroupId: string) => void; // Inicia a edição do produto
}

// Define o formato completo do estado gerenciado pelo ViewModel (Hook) da tela de produtos
export interface ProductState {
  products: ProductWithGroup[];         // Lista de registros cadastrados para exibição
  groups: GroupOption[];                // Lista de grupos para preenchimento do Picker
  loading: boolean;                     // Indicador visual de carregamento (Spinner)
  error: string | null;                 // Mensagem de erro caso ocorra alguma falha nas operações
}

// Define as intenções (Intents/Actions) que a interface pode despachar para o ViewModel
export type ProductIntent =
  | { type: 'LOAD' }                                                                                                   // Intenção para carregar
  | { type: 'CREATE'; payload: { nm_product: string; id_group: number; cd_product_gtin: string } }                     // Intenção para cadastrar
  | { type: 'UPDATE'; payload: { id_product: number; nm_product: string; id_group: number; cd_product_gtin: string } } // Intenção para atualizar 
  | { type: 'DELETE'; payload: number };                                                                               // Intenção para excluir