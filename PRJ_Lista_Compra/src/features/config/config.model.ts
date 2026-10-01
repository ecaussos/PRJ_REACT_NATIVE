// src/features/config/config.model.ts
import { ConfigEntity } from '../../data/entities/config.entity';
import { IConfigRepository } from '../../data/interfaces/config.repository.interface';
import { ConfigRepository } from '../../data/repositories/config.repository';
import { ConfigIntent, ConfigTypeOption } from './config.types';

// Contrato/Interface da Model de Configuração
export interface IConfigModel {
  fetchAll(): Promise<ConfigEntity[]>;                        // Busca a lista completa de configurações
  findByUrlExact(url: string): Promise<ConfigEntity | null>;  // Busca um registro por URL/Host exato
  fetchConfigTypeOptions(): Promise<ConfigTypeOption[]>;      // Busca as opções de tipos de configuração                                                                                          // Assinatura para listar tipos de configuração
  create(
      id_tp_config: number,       // ID do tipo de configuração
      url_config: string,         // URL ou host do serviço
      port_config: number | null, // Porta de conexão (opcional)
      user_config: string | null, // Usuário para autenticação (opcional)
      key_config: string | null,  // Chave ou senha de acesso (opcional)
      st_ssl: number,             // Indicador de uso de SSL (1 ativo, 0 inativo)
      st_config: number           // Status da configuração (1 ativo, 0 inativo)
    ): Promise<ConfigEntity>;     // Cria um novo registro e retorna a entidade criada
  update(id_config: number,       // ID da configuração a ser atualizada
        data: {
          id_tp_config: number;         // Novo tipo de configuração
          url_config: string;           // Nova URL ou host
          port_config?: number | null;  // Nova porta (opcional) 
          user_config?: string | null;  // Novo usuário (opcional)
          key_config?: string | null;   // Nova chave de acesso (opcional)
          st_ssl: number;               // Novo status do SSL
          st_config: number             // Novo status da configuração
        }
      ): Promise<void>;                 // Atualiza os dados do registro informado
  delete(id_config: number): Promise<void>;                   // Remove o registro pelo ID                                                                                                           // Assinatura para remoção
}

export class ConfigModel implements IConfigModel {
  // Recebe o repositório por contrato (interface), facilitando testes e inversão de controle
  constructor(private repository: IConfigRepository) {} // Define a dependência por interface no construtor

  // Função para buscar todos os registros sem filtro
  async fetchAll(): Promise<ConfigEntity[]> {
    return await this.repository.findAll(); // Executa a busca no repositório
  }

  // Função para buscar os registros filtrando pela URL/Host (Exato)
  async findByUrlExact(url: string): Promise<ConfigEntity | null> {
    const cleanUrl = url.trim();                            // Remove os espaços extras do início e fim da string
    if (!cleanUrl) return null;                             // Retorna nulo se a busca for vazia após a limpeza
    return await this.repository.findByUrlExact(cleanUrl);  // Executa a busca no repositório
  }

  // Função para buscar os tipos de configuração para a lista de seleção (Dropdown/Picker)
  async fetchConfigTypeOptions(): Promise<ConfigTypeOption[]> {
    return await this.repository.findConfigType();  // Executa a busca no repositório
  }

  // Função para criar registro e validar antes de salvar no repositório
  async create(
    id_tp_config: number,               // ID do tipo de configuração a ser criada
    url_config: string | null = null,   // URL ou host do serviço (opcional, padrão: null)
    port_config: number | null = null,  // Porta de conexão (opcional, padrão: null)
    user_config: string | null = null,  // Usuário de autenticação (opcional, padrão: null)
    key_config: string | null = null,   // Chave ou senha de acesso (opcional, padrão: null)
    st_ssl: number = 0,                 // Status do SSL (padrão: 0 - inativo)
    st_config: number = 1               // Status da configuração (padrão: 1 - ativo)
  ): Promise<ConfigEntity> {             // Método assíncrono que retorna a entidade criada
    // Limpeza de espaços em branco das strings
    const cleanUrl = url_config ? url_config.trim() : null;
    // Validação se a URL foi preenchidade (apenas para tipos que exigem URL)
    if (cleanUrl) {
      // Verdadeiro: Busca a URL no banco de dados
      const existingUrl = await this.findByUrlExact(cleanUrl);
      // Valida se a busca retornou alguma url
      if (existingUrl) {
        // Verdadeiro: Gerar a mensagem informativa
        throw new Error(`Já existe uma configuração cadastrada com esta URL/Host: "${cleanUrl}"`);
      }
    }
    // Executa a persistência do registro no repositório'
    return await this.repository.create({
      id_tp_config,                                         // ID do tipo de configuração
      url_config: cleanUrl,                                 // URL/host limpo e sanitizado
      port_config,                                          // Porta de conexão
      user_config: user_config ? user_config.trim() : null, // Usuário sem espaços extras (ou null)
      key_config: key_config ? key_config.trim() : null,    // Chave sem espaços extras (ou null)
      st_ssl,                                               // Status do SSL
      st_config,                                            // Status da configuração
    });
  }

// Função para atualizar e validar antes de salvar no repositório
  async update(
    id_config: number,              // ID da configuração que será atualizada
    data: {
      id_tp_config: number;         // Novo tipo de configuração
      url_config?: string | null;   // Nova URL/host (opcional/pode ser nulo)
      port_config?: number | null;  // Nova porta de conexão (opcional/pode ser nulo)
      user_config?: string | null;  // Novo usuário de autenticação (opcional/pode ser nulo)
      key_config?: string | null;   // Nova chave ou senha (opcional/pode ser nulo)
      st_ssl: number;               // Novo status do SSL (1 para ativo, 0 para inativo)
      st_config: number;            // Novo status da configuração (1 para ativo, 0 para inativo)
    }
  ): Promise<void> {                // Método assíncrono de atualização (sem retorno)
    // Limpeza de espaços em branco das strings
    const cleanUrl = data.url_config ? data.url_config.trim() : null;     // URL
    const cleanUser = data.user_config ? data.user_config.trim() : null;  // Usuário
    const cleanKey = data.key_config ? data.key_config.trim() : null;     // Chave ou senha

    // Validação Tipo de Configuração está vazio
    if (!data.id_tp_config) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('Selecione um Tipo de Configuração.');
    }
    // Verifica se a URL foi preenchida
    if (cleanUrl) {
      // Verdadeiro: Busca a URL no banco de dados
      const existingUrl = await this.findByUrlExact(cleanUrl);
      // Valida se a URL existe e se o ID configuração é diferente
      if (existingUrl && existingUrl.id_config !== id_config) {
        // Verdadeiro: Gerar a mensagem informativa
        throw new Error(`Já existe outra configuração cadastrada com esta URL/Host: "${cleanUrl}"`);
      }
    }
    // Executa a alteração do registro no repositório com os dados sanitizados
    return await this.repository.update(id_config, {
      id_tp_config: data.id_tp_config,        // Repassa o ID do tipo de configuração
      url_config: cleanUrl,                    // Repassa a URL sanitizada
      port_config: data.port_config ?? null,   // Define a porta (converte undefined para null)
      user_config: cleanUser,                  // Repassa o usuário sanitizado
      key_config: cleanKey,                    // Repassa a chave sanitizada
      st_ssl: data.st_ssl,                     // Repassa o status do SSL
      st_config: data.st_config,               // Repassa o status da configuração
    });
  }

  // Função para deletar o registro utilizando o ID
  async delete(id_config: number): Promise<void> {
    // Executa a exclusão do registro no repositório
    await this.repository.delete(id_config);
  }

  //Valida se os campos obrigatórios foram preenchidos de acordo com o tipo selecionado.

  /* Tipos:
   * 1 = BD Local (Apenas Tipo e Status)
   * 2 = BD Cloud (Todos os campos)
   * 3 = API Cosmos (URL/Host e Chave de Acesso)
   * 4 = API Gemini (Chave de Acesso) 
  */

  static validate(data: {
    tpConfig: string | number;                      // Aceita o tipo como string ou número
    urlConfig?: string | null;                      // URL/Host opcional para validação
    keyConfig?: string | null;                      // Chave de acesso/senha opcional para validação
  }): { isValid: boolean; errorMessage?: string } { // Retorna se é válido e a mensagem de erro (se houver)
    const tp = Number(data.tpConfig);               // Converte a propriedade tpConfig para número
    // 1. Verifica se o tipo é inválido ou menor/igual a zero
    if (!tp || tp <= 0) {
      // Verdadeiro: Gerar mensagem informativa
      return { isValid: false, errorMessage: 'Selecione um Tipo de Configuração.' };
    }
    // Limpeza de espaços em branco das strings
    const cleanUrl = data.urlConfig ? data.urlConfig.trim() : ''; // URL
    const cleanKey = data.keyConfig ? data.keyConfig.trim() : ''; // Chave Key
    // Identificar dos tipos de configuração
    const isBdCloud = tp === 2;   // Banco de Dados Cloud (ID 2)
    const isApiCosmos = tp === 3; // API Cosmos (ID 3)
    const isApiGemini = tp === 4; // API Gemini (ID 4)
    // 1. URL/Host (BD Cloud e API Cosmos)
    // Valida se o tipo selecionado é 2 ou 3 e se a URL está vazia.
    if ((isBdCloud || isApiCosmos) && !cleanUrl) {
      // Verdadeiro: Gerar mensagem informativa     
      return { isValid: false, errorMessage: 'A URL / Host é obrigatória para o tipo selecionado.' };
    }
    // 2. Chave de Acesso / Senha (BD Cloud, API Cosmos e API Gemini)
    // Valida se o tipo selecionado é 2 ou 3 ou 4 e se a Chave está vazia.
    if ((isBdCloud || isApiCosmos || isApiGemini) && !cleanKey) {
      // Verdadeiro: Gerar mensagem informativa         
      return { isValid: false, errorMessage: 'A Chave de Acesso / Senha é obrigatória para o tipo selecionado.' };
    }
    // Retorna sucesso se todas as validações passarem
    return { isValid: true }; 
  }

  // Regra de negócio: Valida se os campos obrigatórios foram preenchidos corretamente
  static isValid(
    tpConfig: string | number,    // Recebe o tipo da configuração (aceita string ou número)
    urlConfig?: string | null,    // URL/Host opcional para verificação
    keyConfig?: string | null     // Chave de acesso/senha opcional para verificação
  ): boolean {                    // Retorna um valor booleano (true para válido, false para inválido)
    const tp = Number(tpConfig);  // Converte o parâmetro tpConfig para tipo numérico
    // 1. Verifica se o tipo é inválido ou menor/igual a zero
    if (!tp || tp <= 0) {
      // Verdadeiro: retorna falso
      return false
    }
    // Limpeza de espaços em branco das strings
    const cleanUrl = urlConfig ? urlConfig.trim() : ''; // URL
    const cleanKey = keyConfig ? keyConfig.trim() : ''; // Chave Key
    // Identificar dos tipos de configuração
    const isBdCloud = tp === 2;   // Banco de Dados Cloud (ID 2)
    const isApiCosmos = tp === 3; // API Cosmos (ID 3)
    const isApiGemini = tp === 4; // API Gemini (ID 4)
    // 1. URL/Host (BD Cloud e API Cosmos)
    // Valida se o tipo selecionado é 2 ou 3 e se a URL possui tamanho 0.
    if ((isBdCloud || isApiCosmos) && cleanUrl.length === 0) {
      // Verdadeiro: retorna falso
      return false;
    }
    // 2. Chave de Acesso / Senha (BD Cloud, API Cosmos e API Gemini)
    // Valida se o tipo selecionado é 2 ou 3 ou 4 e se a Chave possui tamnaho 0.
    if ((isBdCloud || isApiCosmos || isApiGemini) && cleanKey.length === 0) {
      // Verdadeiro: retorna falso
      return false;
    }
    // Se passar por todas as validações retorna verdadeiro indicando que a configuração é válida
    return true;
  }

  // Regra de negócio: Constrói a intenção (Intent) para Salvar/Editar - Fábrica de ações (Action Factory)
  static buildSaveAction(
    tpConfig: string | number,  // Valor do campo de tipo de configuração
    urlConfig: string,          // Valor do campo URL/Host
    portConfig: string,         // Valor do campo Porta
    userConfig: string,         // Valor do campo Usuário
    keyConfig: string,          // Valor do campo Chave/Senha
    stSsl: number,              // Status do SSL (1/0)
    stConfig: number,           // Status da Configuração (1/0)
    isEditing: boolean,         // Indica se é edição (true) ou novo (false)
    editingId: number | null    // ID do item em edição
  ): ConfigIntent {
    const convertTpConfig = Number(tpConfig);                               // Converte o tipo de configuração para valor numérico
    const cleanUrl = urlConfig.trim();                                      // URL remove espaços em branco das pontas
    const parsePort = portConfig.trim() !== '' ? Number(portConfig) : null; // Porta remove espaços e valida se vazio ou null coverte numérico
    const cleanUser = userConfig.trim() !== '' ? userConfig.trim() : null;  // Usuário remove espaços e valida se vazio ou null
    const cleanKey = keyConfig.trim() !== '' ? keyConfig.trim() : null;     // Chave remove espaços e valida se vazio ou null

    // Verificar se é Edição
    if (isEditing && editingId !== null) {  // Se estiver no modo de edição e possuir um ID válido
      return {
        type: 'UPDATE' as const,            // Define a ação como atualização (tipo literal)
        payload: {
          id_config: editingId,             // ID do registro sendo alterado
          id_tp_config: convertTpConfig,    // Tipo de configuração 
          url_config: cleanUrl,             // URL
          port_config: parsePort,           // Porta
          user_config: cleanUser,           // Usuário
          key_config: cleanKey,             // Chave
          st_ssl: stSsl,                    // Status do SSL
          st_config: stConfig,              // Status da configuração
        },
      };
    }

    // Falso: Identifica que é uma Criação
    return {
      type: 'CREATE' as const,          // Define a ação como criação (tipo literal)
      payload: {
        id_tp_config: convertTpConfig,    // Tipo de configuração 
        url_config: cleanUrl,             // URL
        port_config: parsePort,           // Porta
        user_config: cleanUser,           // Usuário
        key_config: cleanKey,             // Chave
        st_ssl: stSsl,                    // Status do SSL
        st_config: stConfig,              // Status da configuração
      },
    };
  }
}

// Instância padrão injetando o repositório concreto fora da classe
export const ConfigModelInstance = new ConfigModel(new ConfigRepository());