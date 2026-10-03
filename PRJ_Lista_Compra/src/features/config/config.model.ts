// src/features/config/config.model.ts
import * as FileSystem from 'expo-file-system/legacy';
import { ConfigEntity, ConfigWithTypeEntity } from '../../data/entities/config.entity';
import { IConfigRepository } from '../../data/interfaces/config.repository.interface';
import { ConfigRepository } from '../../data/repositories/config.repository';
import { ConfigIntent, ConfigTypeOption } from './config.types';

// Caminho absoluto onde o arquivo JSON local de configuração será salvo no dispositivo
const CONFIG_FILE_PATH = `${FileSystem.documentDirectory}app_config.json`;

// Contrato/Interface da Model de Configuração
export interface IConfigModel {
  fetchAll(): Promise<ConfigEntity[]>;                        // Busca a lista completa de configurações
  findByUrlExact(url: string): Promise<ConfigEntity | null>;  // Busca um registro por URL/Host exato
  fetchConfigTypeOptions(): Promise<ConfigTypeOption[]>;      // Busca as opções de tipos de configuração                                                                                                                                              // Assinatura para listar tipos de configuração
  create(
      id_tp_config: number,          // ID do tipo de configuração
      url_config?: string | null,    // URL ou host do serviço (opcional)
      port_config?: number | null,   // Porta de conexão (opcional)
      user_config?: string | null,   // Usuário para autenticação (opcional)
      key_config?: string | null,    // Chave ou senha de acesso (opcional)
      vers_config?: string | null,   // Versão (opcional)
      st_ssl?: number,               // Indicador de uso de SSL (1 ativo, 0 inativo)
      st_config?: number             // Status da configuração (1 ativo, 0 inativo)
    ): Promise<ConfigEntity>;        // Cria um novo registro e retorna a entidade criada
  update(id_config: number,          // ID da configuração a ser atualizada
        data: {
          id_tp_config: number;        // Novo tipo de configuração
          url_config?: string | null;  // Nova URL ou host (opcional)
          port_config?: number | null; // Nova porta (opcional) 
          user_config?: string | null; // Novo usuário (opcional)
          key_config?: string | null;  // Nova chave de acesso (opcional)
          vers_config?: string | null; // Nova versão (opcional)
          st_ssl: number;              // Novo status do SSL
          st_config: number            // Novo status da configuração
        }
      ): Promise<void>;                // Atualiza os dados do registro informado
  delete(id_config: number): Promise<void>;                   // Remove o registro pelo ID                                                                                                                                                             // Assinatura para remoção

  // Assinaturas para manipulação do arquivo JSON local (FileSystem)
  checkConfigFileExists(): Promise<boolean>;                   // Verifica se o arquivo físico existe no dispositivo
  createConfigFile(initialData?: any): Promise<boolean>;        // Cria/Gera o arquivo de configuração física local
  deleteConfigFile(): Promise<boolean>;                        // Exclui o arquivo de configuração física local
  readConfigFile(): Promise<any | null>;                       // Lê o conteúdo do arquivo físico local
}

export class ConfigModel implements IConfigModel {
  // Recebe o repositório por contrato (interface), facilitando testes e inversão de controle
  constructor(private repository: IConfigRepository) {} // Define a dependência por interface no construtor

  // Função para buscar todos os registros sem filtro
  async fetchAll(): Promise<ConfigWithTypeEntity[]> {
    return await this.repository.findAll(); // Executa a busca no repositório
  }

  // Função para buscar os registros filtrando pela URL/Host (Exato)
  async findByUrlExact(url: string): Promise<ConfigEntity | null> {
    const cleanUrl = url ? url.trim() : '';                 // Remove os espaços extras do início e fim da string
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
    vers_config: string | null = null,  // versão (opcional, padrão: null)
    st_ssl: number = 0,                 // Status do SSL (padrão: 0 - inativo)
    st_config: number = 1               // Status da configuração (padrão: 1 - ativo)
  ): Promise<ConfigEntity> {             // Método assíncrono que retorna a entidade criada
    // Limpeza de espaços em branco das strings
    const cleanUrl = url_config && url_config.trim().length > 0 ? url_config.trim() : null;
    const cleanUser = user_config && user_config.trim().length > 0 ? user_config.trim() : null;
    const cleanKey = key_config && key_config.trim().length > 0 ? key_config.trim() : null;
    const cleanVers = vers_config && vers_config.trim().length > 0 ? vers_config.trim() : null;
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
    // Executa a persistência do registro no repositório
    return await this.repository.create({
      id_tp_config: Number(id_tp_config),                   // ID do tipo de configuração
      url_config: cleanUrl,                                 // URL/host limpo e sanitizado
      port_config: port_config ?? null,                     // Porta de conexão
      user_config: cleanUser,                               // Usuário sem espaços extras (ou null)
      key_config: cleanKey,                                 // Chave sem espaços extras (ou null)
      vers_config: cleanVers,                               // Versão (ou null)
      st_ssl: st_ssl ?? 0,                                  // Status do SSL
      st_config: st_config ?? 1,                            // Status da configuração
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
      vers_config?: string | null;  // Nova versão (opcional/pode ser nulo)
      st_ssl: number;               // Novo status do SSL (1 para ativo, 0 para inativo)
      st_config: number;            // Novo status da configuração (1 para ativo, 0 para inativo)
    }
  ): Promise<void> {                // Método assíncrono de atualização (sem retorno)
    // Limpeza de espaços em branco das strings
    const cleanUrl = data.url_config && data.url_config.trim().length > 0 ? data.url_config.trim() : null;      // URL
    const cleanUser = data.user_config && data.user_config.trim().length > 0 ? data.user_config.trim() : null;  // Usuário
    const cleanKey = data.key_config && data.key_config.trim().length > 0 ? data.key_config.trim() : null;      // Chave ou senha
    const cleanVers = data.vers_config && data.vers_config.trim().length > 0 ? data.vers_config.trim() : null;  // Versão

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
      url_config: cleanUrl,                   // Repassa a URL sanitizada
      port_config: data.port_config ?? null,  // Define a porta (converte undefined para null)
      user_config: cleanUser,                 // Repassa o usuário sanitizado
      key_config: cleanKey,                   // Repassa a chave sanitizada
      vers_config: cleanVers,                 // Repassa a versão sanitizada
      st_ssl: data.st_ssl ?? 0,               // Repassa o status do SSL
      st_config: data.st_config ?? 1,         // Repassa o status da configuração
    });
  }

  // Função para deletar o registro utilizando o ID
  async delete(id_config: number): Promise<void> {
    // Executa a exclusão do registro no repositório
    await this.repository.delete(id_config);
  }

  // --- MANIPULAÇÃO DO ARQUIVO FÍSICO DE CONFIGURAÇÃO (FILE SYSTEM) ---

  // Verifica se o arquivo de configuração física local existe no dispositivo
  async checkConfigFileExists(): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(CONFIG_FILE_PATH);
      return fileInfo.exists;
    } catch (error) {
      console.error('Erro ao verificar existência do arquivo de configuração local:', error);
      return false;
    }
  }

  // Cria/Gera o arquivo local app_config.json com as configurações padrão e exibe no log
// Cria/Gera o arquivo local app_config.json sincronizado com o banco de dados e exibe no log
  async createConfigFile(): Promise<boolean> {
    try {
      // 1. Busca todas as configurações cadastradas no banco SQLite
      const dbConfigs = await this.fetchAll(); // Busca as configurações atualizadas do banco

      if (!dbConfigs || dbConfigs.length === 0) { // Se não encontrar dados no banco
        console.warn('[ConfigModel] ⚠️ Nenhum registro retornado do banco para gerar o JSON.'); // Registra aviso
        return false; // Interrompe e retorna falso
      }

      // 2. Mapeia a estrutura do banco para o formato do arquivo JSON
      const jsonContent = dbConfigs.map(item => ({ // Converte cada item da consulta no formato do JSON
        id_config: item.id_config,              // ID da configuração
        id_tp_config: item.id_tp_config,        // Tipo da configuração (1 = BD Local/Gemini, 3 = API Cosmos)
        ds_tp_config: item.ds_tp_config,
        url_config: item.url_config ?? null,    // Endpoint/URL da API
        port_config: item.port_config ?? null,  // Porta
        key_config: item.key_config ?? null,    // Chave de acesso/token
        vers_config: item.vers_config ?? null,  // Chave de acesso/token
        st_ssl: item.st_ssl, // Status de verificação SSL
        st_config: item.st_config, // Status de ativação da configuração
        dt_config: item.dt_config, // Data da última atualização
      }));

      // 3. Grava o arquivo JSON no armazenamento local do dispositivo
      const jsonString = JSON.stringify(jsonContent, null, 2); // Converte os dados em string JSON formatada
      await FileSystem.writeAsStringAsync(CONFIG_FILE_PATH, jsonString, { // Escreve o arquivo no disco
        encoding: FileSystem.EncodingType.UTF8, // Define a codificação UTF-8
      });
      console.log('[ConfigModel] ✅ Arquivo config.json criado/salvo com sucesso!');

      // 4. Lê o conteúdo do arquivo imediatamente após a gravação para confirmar no log
      const createdContent = await this.readConfigFile(); // Executa a leitura do arquivo recém-criado
      console.log( // Exibe no console a estrutura completa lida do arquivo
        '[ConfigModel] 🔍 Conteúdo lido imediatamente após a criação:\n',
        JSON.stringify(createdContent, null, 2)
      );

      return true; // Retorna verdadeiro indicando sucesso
    } catch (error) {
      console.error('Erro ao criar arquivo de configuração local:', error); // Exibe mensagem de erro no console
      return false; // Retorna falso indicando falha
    }
  }

  // Exclui o arquivo físico local app_config.json
  async deleteConfigFile(): Promise<boolean> {
    try {
      const exists = await this.checkConfigFileExists();
      if (exists) {
        await FileSystem.deleteAsync(CONFIG_FILE_PATH);
      }
      return true;
    } catch (error) {
      console.error('Erro ao excluir arquivo de configuração local:', error);
      return false;
    }
  }

  // Lê os dados salvos dentro do arquivo físico local app_config.json
  async readConfigFile(): Promise<any | null> {
    try {
      const exists = await this.checkConfigFileExists();
      if (!exists) return null;

      const fileContent = await FileSystem.readAsStringAsync(CONFIG_FILE_PATH, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      return JSON.parse(fileContent);
    } catch (error) {
      console.error('Erro ao ler arquivo de configuração local:', error);
      return null;
    }
  }

  // Valida se os campos obrigatórios foram preenchidos de acordo com o tipo selecionado.

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
    versConfig?: string | null;                     // Versão
  }): { isValid: boolean; errorMessage?: string } { // Retorna se é válido e a mensagem de erro (se houver)
    const tp = Number(data.tpConfig);               // Converte a propriedade tpConfig para número
    // 1. Verifica se o tipo é inválido ou menor/igual a zero
    if (!tp || tp <= 0) {
      // Verdadeiro: Gerar mensagem informativa
      return { isValid: false, errorMessage: 'Selecione um Tipo de Configuração.' };
    }
    // Limpeza de espaços em branco das strings
    const cleanUrl = data.urlConfig ? data.urlConfig.trim() : '';       // URL
    const cleanKey = data.keyConfig ? data.keyConfig.trim() : '';       // Chave Key
    const cleanVers = data.versConfig ? data.versConfig.trim() : null;  // Versão
    // Identificar dos tipos de configuração
    const isBdCloud = tp === 2;   // Banco de Dados Cloud (ID 2)
    const isApiCosmos = tp === 3; // API Cosmos (ID 3)
    const isApiGemini = tp === 4; // API Gemini (ID 4)
    const isApiOpenFood = tp === 5;  // API OpenFood (ID 5)
    // 1. URL/Host (BD Cloud, API Cosmos E API OpenFood)
    // Valida se o tipo selecionado é 2 ou 3 e se a URL está vazia.
    if ((isBdCloud || isApiCosmos || isApiOpenFood) && !cleanUrl) {
      // Verdadeiro: Gerar mensagem informativa     
      return { isValid: false, errorMessage: 'A URL / Host é obrigatória para o tipo selecionado.' };
    }
    // 2. Chave de Acesso / Senha (BD Cloud, API Cosmos e API Gemini)
    // Valida se o tipo selecionado é 2 ou 3 ou 4 e se a Chave está vazia.
    if ((isBdCloud || isApiCosmos || isApiGemini) && !cleanKey) {
      // Verdadeiro: Gerar mensagem informativa         
      return { isValid: false, errorMessage: 'A Chave de Acesso / Senha é obrigatória para o tipo selecionado.' };
    }
    // 3. Versão (API Gemini)
    // Valida se o tipo selecionado 4 e se a Chave está vazia.
    if ((isApiGemini) && !cleanVers) {
      // Verdadeiro: Gerar mensagem informativa         
      return { isValid: false, errorMessage: 'A versão é obrigatória para o tipo selecionado.' };
    }
    // Retorna sucesso se todas as validações passarem
    return { isValid: true }; 
  }

  // Regra de negócio: Valida se os campos obrigatórios foram preenchidos corretamente
  static isValid(
    tpConfig: string | number,    // Recebe o tipo da configuração (aceita string ou número)
    urlConfig?: string | null,    // URL/Host opcional para verificação
    keyConfig?: string | null,     // Chave de acesso/senha opcional para verificação
    versConfig?: string | null    // Versão opcional para verificação
  ): boolean {                    // Retorna um valor booleano (true para válido, false para inválido)
    const tp = Number(tpConfig);  // Converte o parâmetro tpConfig para tipo numérico
    // 1. Verifica se o tipo é inválido ou menor/igual a zero
    if (!tp || tp <= 0) {
      // Verdadeiro: retorna falso
      return false;
    }
    // Limpeza de espaços em branco das strings
    const cleanUrl = urlConfig ? urlConfig.trim() : '';    // URL
    const cleanKey = keyConfig ? keyConfig.trim() : '';    // Chave Key
    const cleanVers = versConfig ? versConfig.trim() : ''; // Versão
    // Identificar dos tipos de configuração
    const isBdCloud = tp === 2;   // Banco de Dados Cloud (ID 2)
    const isApiCosmos = tp === 3; // API Cosmos (ID 3)
    const isApiGemini = tp === 4; // API Gemini (ID 4)
    const isApiOpenFood = tp === 5; // API OpenFood (ID 5)
    // 1. URL/Host (BD Cloud e API Cosmos)
    // Valida se o tipo selecionado é 2 ou 3 e se a URL possui tamanho 0.
    if ((isBdCloud || isApiCosmos || isApiOpenFood) && cleanUrl.length === 0) {
      // Verdadeiro: retorna falso
      return false;
    }
    // 2. Chave de Acesso / Senha (BD Cloud, API Cosmos e API Gemini)
    // Valida se o tipo selecionado é 2 ou 3 ou 4 e se a Chave possui tamnaho 0.
    if ((isBdCloud || isApiCosmos || isApiGemini) && cleanKey.length === 0) {
      // Verdadeiro: retorna falso
      return false;
    }
    // 3. Versão (API Gemini)
    // Valida se o tipo selecionado é 4 e se a Chave possui tamnaho 0.
    if ((isApiGemini) && cleanVers.length === 0) {
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
    versConfig: string,          // Valor do campo Versão
    stSsl: number,              // Status do SSL (1/0)
    stConfig: number,           // Status da Configuração (1/0)
    isEditing: boolean,         // Indica se é edição (true) ou novo (false)
    editingId: number | null    // ID do item em edição
  ): ConfigIntent {
    const convertTpConfig = Number(tpConfig);                                             // Converte o tipo de configuração para valor numérico
    const cleanUrl = urlConfig && urlConfig.trim() !== '' ? urlConfig.trim() : null;      // URL remove espaços em branco das pontas
    const parsePort = portConfig && portConfig.trim() !== '' ? Number(portConfig) : null; // Porta remove espaços e valida se vazio ou null coverte numérico
    const cleanUser = userConfig && userConfig.trim() !== '' ? userConfig.trim() : null;  // Usuário remove espaços e valida se vazio ou null
    const cleanKey = keyConfig && keyConfig.trim() !== '' ? keyConfig.trim() : null;      // Chave remove espaços e valida se vazio ou null
    const cleanVers = versConfig && versConfig.trim() !== '' ? versConfig.trim() : null;  // Chave remove espaços e valida se vazio ou null

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
          vers_config: cleanVers,           // Versão
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
        vers_config: cleanVers,            // Versão
        st_ssl: stSsl,                    // Status do SSL
        st_config: stConfig,              // Status da configuração
      },
    };
  }
}

// Instância padrão injetando o repositório concreto fora da classe
export const ConfigModelInstance = new ConfigModel(new ConfigRepository());