// src/features/config/config.types.ts
import { ConfigEntity, ConfigWithTypeEntity } from '../../data/entities/config.entity'; // Importa as entidades de dados

// Re-exportação para facilidade de uso na camada de UI
export type Config = ConfigEntity; // Alias para a entidade principal de configuração

// DTO para opções do dropdown/select de tipos de configuração
export interface ConfigTypeOption {
  id_tp_config: number; // ID do tipo de configuração retornado
  ds_tp_config: string; // Descrição do tipo de configuração retornado
}

// -------- Interfaces de Componentes de UI (Props) - Utilizados pelo Form -------- //

// Props para as ações superiores (Cadastrar, Buscar e Limpar)
export interface ConfigActionsProps {
  onOpenCreateModal: () => void;  // Função executada para abrir o modal de novo cadastro
  onOpenSearchModal: () => void;  // Função executada para abrir o modal ou campo de busca
  onClearSearch: () => void;      // Função executada para limpar o filtro de busca aplicado
  hasActiveSearch: boolean;       // Indica se existe uma busca ativa no momento para alternar ícones ou botões
}

// Props do Modal de filtragem seleção de item na lista (FlatList)
export interface ConfigFilterProps {
  visible: boolean;                           // Controla se o modal de filtragem está visível ou oculto
  searchText: string;                         // Valor do campo de texto digitado para a filtragem
  onChangeSearchText: (text: string) => void; // Função para atualizar o texto da filtragem
  onClose: () => void;                        // Função executada no fechamento do modal
  onCancel: () => void;                       // Função executada ao cancelar - limpar/fechar modal
}

// Props para a exibição de cada item da Lista de registros cadastrados
export interface ConfigItemProps {
  config: ConfigEntity;                   // Dados da configuração para exibição
  onEdit: (config: ConfigEntity) => void; // Ação para editar campos e dados para edição
  onDelete: (id: number) => void;         // Ação para deletar registro pelo ID
}

// -------- Estados da Aplicação e MVI (ViewModel / Hook) -------- //

// Define o formato do estado do reducer gerenciado pelo ViewModel
export interface ConfigState {
  configs: ConfigWithTypeEntity[];  // Lista de registros cadastrados para exibição
  configTypes: ConfigTypeOption[];  // Lista de tipos para preenchimento do Picker/Select
  loading: boolean;                 // Indicador visual de carregamento (Spinner)
  error: string | null;             // Mensagem de erro caso ocorra alguma falha nas operações
}

// Define as intenções (Intents/Actions) que o componente pode despachar para o hook executar as regras
export type ConfigIntent =
  | { type: 'LOAD' }                                                                                                                                                                                                          // Intenção para carregar registros
  | { type: 'CREATE'; payload: { id_tp_config: number; url_config: string | null; port_config: number | null; user_config: string | null; key_config: string | null; st_ssl: number; st_config: number } }                    // Intenção para cadastrar novo registro
  | { type: 'UPDATE'; payload: { id_config: number; id_tp_config: number; url_config: string | null; port_config: number | null; user_config: string | null; key_config: string | null; st_ssl: number; st_config: number } } // Intenção para atualizar registro
  | { type: 'DELETE'; payload: number };                                                                                                                                                                                      // Intenção para excluir registro pelo ID