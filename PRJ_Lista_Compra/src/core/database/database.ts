// src/core/database/database.ts

import * as FileSystem from 'expo-file-system/legacy'; // Importa o módulo de sistema de arquivos do Expo Legacy
import { runMigrations } from '../database/migrations/migrations'; // Importa a função para executar as migrações no banco
import { getCloudConnection, resetCloudInstances } from './clients/cloudClient'; // Importa conexões e reset do banco na nuvem
import { getLocalConnection } from './clients/localClient'; // Importa a função para obter conexão com o SQLite local

export interface ConfigItem {
  id_config: string;          // Identificador único do registro de configuração
  id_tp_config: string;       // Tipo de configuração (ex: 1 = BD Local, 2 = BD Cloud)
  ds_tp_config: string;       // Descrição amigável do tipo de configuração
  url_config?: string | null; // URL/Endpoint de conexão do banco ou serviço (opcional)
  key_config?: string | null; // Chave/Token de autenticação para a conexão (opcional)
  st_config: number;          // Status de ativação da configuração (1 = Ativo, 0 = Inativo)
}

export type AppConfig = ConfigItem | ConfigItem[];  // Tipo para permitir item único ou array de configurações

export interface DbClient {
  getAllAsync<T>(query: string, params?: any[]): Promise<T[]>;                                    // Executa busca e retorna lista de registros
  getFirstAsync<T>(query: string, params?: any[]): Promise<T | null>;                             // Executa busca e retorna apenas o primeiro registro
  runAsync(query: string, params?: any[]): Promise<{ lastInsertRowId: number; changes: number }>; // Executa comandos de alteração (INSERT/UPDATE/DELETE)
  execAsync(query: string): Promise<void>;                                                        // Executa blocos de instruções SQL diretas
}

export const CONFIG_FILE_PATH = `${FileSystem.documentDirectory}app_config.json`; // Caminho absoluto do arquivo JSON local

let dbInstance: DbClient | null = null;                     // Instância singleton em cache do banco ativo
let isInitialized = false;                                  // Flag que indica se as migrações já foram executadas
let initializationPromise: Promise<DbClient> | null = null; // Promise para evitar concorrência no processo de conexão

function getDefaultAppConfig(): ConfigItem[] {
  return [
    {
      id_config: '1',           // ID padrão do banco de dados local
      id_tp_config: '1',        // Tipo correspondente a Banco Local
      ds_tp_config: 'BD Local', // Descrição padrão para exibição
      st_config: 1,             // Habilitado por padrão
    },
  ];
}

export async function saveConfigFile(config: AppConfig): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2)); // Escreve o JSON formatado no disco
    console.log('[Database] 💾 Arquivo app_config.json atualizado.');                      // Log de confirmação de gravação
  } catch (error) {
    console.error('[Database] ❌ Erro ao gravar app_config.json:', error);                 // Log de erro no salvamento do arquivo
    throw error;                                                                          // Propaga a exceção
  }
}

export async function readConfigFile(): Promise<{ 
  configs: ConfigItem[];
  activeCloudConfig: ConfigItem | null;
  isSyncEnabled: boolean;
}> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(CONFIG_FILE_PATH);        // Obtém informações do arquivo no sistema de arquivos
    let configs: ConfigItem[];

    if (!fileInfo.exists) {                                                  // Se o arquivo não existir localmente
      configs = getDefaultAppConfig();                                       // Carrega as configurações padrão
      await saveConfigFile(configs);                                         // Salva as configurações padrão em disco
    } else {
      const content = await FileSystem.readAsStringAsync(CONFIG_FILE_PATH);  // Lê o conteúdo em texto do arquivo JSON
      const parsedData: AppConfig = JSON.parse(content);                     // Converte a string lida para objeto JS
      configs = Array.isArray(parsedData) ? parsedData : [parsedData];       // Garante que o resultado seja sempre um array
    }

    // Busca estrita: garante que converte tanto para String quanto para Number ao comparar
    const activeCloudConfig = configs.find((item) => {
      const isCloudType = String(item.id_tp_config) === '2';                 // Filtra por tipo Cloud (ID 2)
      const isActive = Number(item.st_config) === 1;                         // Filtra se a configuração está ativa
      return isCloudType && isActive;
    }) || null;

    // Busca se a sincronização está ativada (id_tp_config = '3' e st_config = 1)
    const syncConfig = configs.find((item) => String(item.id_tp_config) === '3'); // Localiza o registro de controle de sync
    const isSyncEnabled = syncConfig ? Number(syncConfig.st_config) === 1 : false; // Determina se a sincronização está ativa
    console.log('[Database] 🔍 Configuração Cloud Ativa encontrada:', activeCloudConfig ? activeCloudConfig.ds_tp_config : 'NENHUMA (Usará Local)'); // Log do BD selecionado
    console.log('[Database] 🔄 BD Sync Ativado:', isSyncEnabled);            // Log do estado da sincronização

    return { configs, activeCloudConfig, isSyncEnabled };                   // Retorna o objeto completo com as configurações
  } catch (error) {
    console.warn('[Database] ⚠️ Erro ao ler app_config.json. Usando local...', error); // Log de aviso em caso de exceção na leitura
    return { configs: getDefaultAppConfig(), activeCloudConfig: null, isSyncEnabled: false }; // Retorna padrão local em caso de falha
  }
}

export async function getActiveDatabase(): Promise<DbClient> {
  if (dbInstance && isInitialized) {                                         // Se a conexão já existe e foi inicializada
    console.log('[Database] ⚡ Retornando instância em cache (Singleton).');  // Log de retorno da instância em cache
    return dbInstance;                                                       // Retorna a conexão reutilizável
  }

  if (initializationPromise) {                                               // Se já existe um processo de inicialização em andamento
    console.log('[Database] ⏳ Aguardando inicialização em andamento...');   // Log de espera para conexões simultâneas
    return initializationPromise;                                            // Retorna a Promise em execução
  }

  initializationPromise = (async () => {
    try {
      console.log('[Database] 🔍 [NOVA CONEXÃO] Inicializando validação do banco de dados...'); // Log de início do fluxo de conexão
      const { activeCloudConfig } = await readConfigFile();                  // Lê o arquivo para verificar se há BD Cloud ativo
      let connectedClient: DbClient | null = null;

      if (activeCloudConfig) {                                               // Se houver banco na nuvem configurado e ativo
        console.log(`[Database] 🌐 BD Cloud Ativo detectado (${activeCloudConfig.ds_tp_config}). Testando conexão...`); // Log de teste de conexão Cloud
        try {
          const cloudClient = await getCloudConnection(activeCloudConfig);  // Tenta obter o cliente de conexão na nuvem
          await cloudClient.getAllAsync('SELECT 1');                         // Executa query simples para testar a comunicação
          console.log('[Database] ✅ Conexão Cloud estabelecida com sucesso!'); // Log de sucesso na conexão remota
          connectedClient = cloudClient;                                     // Atribui o cliente Cloud como ativo
        } catch (error) {
          console.warn('[Database] ⚠️ Falha ao acessar BD Cloud. Alternando para o Banco Local (SQLite)...', error); // Log de fallback em erro no Cloud
          connectedClient = null;                                            // Reseta para forçar uso do banco local
        }
      } else {
        console.log('[Database] 📱 Nenhuma configuração de BD Cloud ativa. Direcionando para o Banco Local...'); // Log de direcionamento local
      }

      if (!connectedClient) {                                                // Caso a conexão Cloud não exista ou tenha falhado
        console.log('[Database] 📱 Conectando ao Banco Local (SQLite)...');  // Log de conexão ao banco local
        connectedClient = await getLocalConnection();                        // Conecta ao banco SQLite nativo do dispositivo
      }

      dbInstance = connectedClient;                                          // Salva o cliente conectado na instância global

      if (!isInitialized) {                                                  // Se as migrações ainda não foram rodadas para esta instância
        console.log('[Database] ⚙️ Executando migrações no banco de dados ativo...'); // Log de execução das migrações
        await runMigrations(dbInstance);                                     // Executa o orquestrador de migrações DDL
        isInitialized = true;                                                // Marca que a inicialização do esquema foi concluída
        console.log('[Database] 🚀 Banco de dados inicializado com sucesso.'); // Log de conclusão geral
      }

      return dbInstance;                                                     // Retorna a instância ativa do banco
    } finally {
      initializationPromise = null;                                          // Libera a Promise de inicialização
    }
  })();

  return initializationPromise;                                              // Retorna a Promise criada
}

export function resetDatabaseConnection(): void {
  dbInstance = null;                                                         // Reseta a referência da instância em cache
  isInitialized = false;                                                     // Reseta o status de inicialização
  initializationPromise = null;                                              // Reseta a Promise de conexão
  resetCloudInstances();                                                     // Limpa os caches internos das conexões Cloud
  console.log('[Database] 🔄 Conexões e instâncias de cache resetadas.');     // Log de confirmação do reset de conexões
}