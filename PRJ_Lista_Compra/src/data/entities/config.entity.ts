// src/data/entities/config.entity.ts

// 1. Entidade que reflete a tabela 'config_type' no SQLite
export interface ConfigTypeEntity {
  id_tp_config: number;            // ID do tipo de configuração
  ds_tp_config: string;            // Descrição do tipo (ex: 'BD Local', 'API Gemini')
}

// 2. Entidade base que reflete a tabela 'config' no SQLite
export interface ConfigEntity {
  id_config: number;               // ID gerado automaticamente (INTEGER)
  id_tp_config: number;            // Chave estrangeira para o tipo de configuração (INTEGER)
  url_config: string | null;       // URL ou Host da configuração
  port_config: number | null;      // Porta de conexão
  user_config: string | null;      // Usuário de autenticação
  key_config: string | null;       // Chave de acesso ou senha
  vers_config: string | null;      // versão de acesso
  st_ssl: number;                  // Status do SSL (1 = ativo, 0 = inativo)
  st_config: number;               // Status da configuração (1 = ativo, 0 = inativo)
  dt_config?: string;              // Data de criação/registro no SQLite
}

// 3. DTO para criação de novos registros (Omite a chave primária e o carimbo de data autogerado)
export type CreateConfigDTO = Omit<ConfigEntity, 'id_config' | 'dt_config'>;

// 4. DTO para atualização de registros existentes
export type UpdateConfigDTO = CreateConfigDTO;

// 5. Tipo simplificado para popular componentes de seleção/picker de tipos de configuração na UI
export type ConfigTypeOption = Pick<ConfigTypeEntity, 'id_tp_config' | 'ds_tp_config'>;

// 6. Entidade expandida para exibições que trazem a descrição do tipo (JOINs)
export interface ConfigWithTypeEntity extends ConfigEntity {
  ds_tp_config?: string;
}