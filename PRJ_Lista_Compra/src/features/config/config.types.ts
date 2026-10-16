// src/features/config/config.types.ts
import { ConfigEntity, ConfigWithTypeEntity } from '../../data/entities/config.entity'; // Importa as entidades de dados base

// Re-exportação de tipo para facilitar o uso na interface de usuário (UI)
export type Config = ConfigEntity; // Alias para a entidade principal de configuração

// DTO para as opções da lista de tipos de configuração (Dropdown/Select)
export interface ConfigTypeOption {
  id_tp_config: string; // Identificador único do tipo de configuração
  ds_tp_config: string; // Descrição/Nome do tipo de configuração
}

// -------- Interfaces de Componentes de UI (Props) - Utilizados pelo Form -------- //

// Props para as ações do topo da tela (Cadastrar, Buscar e Limpar)
export interface ConfigActionsProps {
  onOpenCreateModal: () => void;  // Função para abrir o modal de cadastro
  onOpenSearchModal: () => void;  // Função para abrir a busca
  onClearSearch: () => void;      // Função para limpar a busca atual
  hasActiveSearch: boolean;       // Indica se há uma busca ativa na tela
}

// Props para o modal de filtragem da lista
export interface ConfigFilterProps {
  visible: boolean;                           // Define se o modal está visível
  searchText: string;                         // Texto atual da busca
  onChangeSearchText: (text: string) => void; // Função que atualiza o texto digitado
  onClose: () => void;                        // Função para fechar o modal
  onCancel: () => void;                       // Função para cancelar a filtragem
}

// Props para a exibição de cada item na lista de registros
export interface ConfigItemProps {
  config: ConfigWithTypeEntity;           // Dados da configuração com a descrição do tipo
  onEdit: (config: ConfigEntity) => void; // Ação acionada ao clicar em editar
  onDelete: (id: number) => void;         // Ação acionada ao clicar em excluir
}

// -------- DTOs para os Payloads das Intenções -------- //

// Dados necessários para criar uma nova configuração
export interface CreatePayload {
  id_tp_config: string;         // ID do tipo de configuração selecionado
  url_config: string | null;    // URL/Host configurado
  port_config: number | null;   // Porta de conexão
  user_config: string | null;   // Usuário de autenticação
  key_config: string | null;    // Chave/Token de acesso
  vers_config: string | null;   // Versão
  st_ssl: number;               // Indicador de uso de SSL (1 para sim, 0 para não)
  st_config: number;            // Status da configuração (1 para ativo, 0 para inativo)
}

// Dados necessários para atualizar uma configuração existente
export interface UpdatePayload extends CreatePayload {
  id_config: string; // ID do registro que será atualizado
}

// -------- Estados da Aplicação e MVI (ViewModel / Hook) -------- //

// Estrutura do estado global/local gerenciado pelo ViewModel
export interface ConfigState {
  configs: ConfigWithTypeEntity[];  // Lista de configurações cadastradas
  configTypes: ConfigTypeOption[];  // Lista de tipos disponíveis para seleção
  loading: boolean;                 // Estado de carregamento (Spinner)
  error: string | null;             // Mensagem de erro, se houver
  hasConfigFile: boolean;           // Flag para controle da geração do arquivo config
}

// Intenções/Ações disparadas pela interface (MVI Architecture)
export type ConfigIntent =
  | { type: 'LOAD' }                                   // Ação para carregar os dados
  | { type: 'CREATE'; payload: CreatePayload }         // Ação para criar novo registro
  | { type: 'UPDATE'; payload: UpdatePayload }         // Ação para atualizar registro existente
  | { type: 'DELETE'; payload: string };               // Ação para deletar registro pelo ID