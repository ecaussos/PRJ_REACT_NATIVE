// src/core/database/database.ts

import * as FileSystem from 'expo-file-system/legacy';
import { runMigrations } from '../database/migrations/migrations';
import { getCloudConnection, resetCloudInstances } from './cloudClient';
import { getLocalConnection } from './localClient';

export interface ConfigItem {
  id_config: string;
  id_tp_config: string; // 1 = BD Local, 2 = BD Cloud
  ds_tp_config: string;
  url_config?: string | null;
  key_config?: string | null;
  st_config: number; // 1 = Ativo, 0 = Inativo
}

export type AppConfig = ConfigItem | ConfigItem[];

export interface DbClient {
  getAllAsync<T>(query: string, params?: any[]): Promise<T[]>;
  getFirstAsync<T>(query: string, params?: any[]): Promise<T | null>;
  runAsync(query: string, params?: any[]): Promise<{ lastInsertRowId: number; changes: number }>;
  execAsync(query: string): Promise<void>;
}

export const CONFIG_FILE_PATH = `${FileSystem.documentDirectory}app_config.json`;

let dbInstance: DbClient | null = null;
let isInitialized = false;
let initializationPromise: Promise<DbClient> | null = null;

function getDefaultAppConfig(): ConfigItem[] {
  return [
    {
      id_config: '1',
      id_tp_config: '1',
      ds_tp_config: 'BD Local',
      st_config: 1,
    },
  ];
}

export async function saveConfigFile(config: AppConfig): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2));
    console.log('[Database] 💾 Arquivo app_config.json atualizado.');
  } catch (error) {
    console.error('[Database] ❌ Erro ao gravar app_config.json:', error);
    throw error;
  }
}

export async function readConfigFile(): Promise<{ 
  configs: ConfigItem[];
  activeCloudConfig: ConfigItem | null;
  isSyncEnabled: boolean;
}> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(CONFIG_FILE_PATH);
    let configs: ConfigItem[];

    if (!fileInfo.exists) {
      configs = getDefaultAppConfig();
      await saveConfigFile(configs);
    } else {
      const content = await FileSystem.readAsStringAsync(CONFIG_FILE_PATH);
      const parsedData: AppConfig = JSON.parse(content);
      configs = Array.isArray(parsedData) ? parsedData : [parsedData];
    }

    // Busca estrita: garante que converte tanto para String quanto para Number ao comparar
    const activeCloudConfig = configs.find((item) => {
      const isCloudType = String(item.id_tp_config) === '2';
      const isActive = Number(item.st_config) === 1;
      return isCloudType && isActive;
    }) || null;

    // Busca se a sincronização está ativada (id_tp_config = '3' e st_config = 1)
    const syncConfig = configs.find((item) => String(item.id_tp_config) === '3');
    const isSyncEnabled = syncConfig ? Number(syncConfig.st_config) === 1 : false;
    console.log('[Database] 🔍 Configuração Cloud Ativa encontrada:', activeCloudConfig ? activeCloudConfig.ds_tp_config : 'NENHUMA (Usará Local)');
    console.log('[Database] 🔄 BD Sync Ativado:', isSyncEnabled);

    return { configs, activeCloudConfig, isSyncEnabled };
  } catch (error) {
    console.warn('[Database] ⚠️ Erro ao ler app_config.json. Usando local...', error);
    return { configs: getDefaultAppConfig(), activeCloudConfig: null, isSyncEnabled: false };
  }
}

export async function getActiveDatabase(): Promise<DbClient> {
  if (dbInstance && isInitialized) {
    console.log('[Database] ⚡ Retornando instância em cache (Singleton).');
    return dbInstance;
  }

  if (initializationPromise) {
    console.log('[Database] ⏳ Aguardando inicialização em andamento...');
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log('[Database] 🔍 [NOVA CONEXÃO] Inicializando validação do banco de dados...');
      const { activeCloudConfig } = await readConfigFile();
      let connectedClient: DbClient | null = null;

      if (activeCloudConfig) {
        console.log(`[Database] 🌐 BD Cloud Ativo detectado (${activeCloudConfig.ds_tp_config}). Testando conexão...`);
        try {
          const cloudClient = await getCloudConnection(activeCloudConfig);
          await cloudClient.getAllAsync('SELECT 1');
          console.log('[Database] ✅ Conexão Cloud estabelecida com sucesso!');
          connectedClient = cloudClient;
        } catch (error) {
          console.warn('[Database] ⚠️ Falha ao acessar BD Cloud. Alternando para o Banco Local (SQLite)...', error);
          connectedClient = null;
        }
      } else {
        console.log('[Database] 📱 Nenhuma configuração de BD Cloud ativa. Direcionando para o Banco Local...');
      }

      if (!connectedClient) {
        console.log('[Database] 📱 Conectando ao Banco Local (SQLite)...');
        connectedClient = await getLocalConnection();
      }

      dbInstance = connectedClient;

      if (!isInitialized) {
        console.log('[Database] ⚙️ Executando migrações no banco de dados ativo...');
        await runMigrations(dbInstance);
        isInitialized = true;
        console.log('[Database] 🚀 Banco de dados inicializado com sucesso.');
      }

      return dbInstance;
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
}

export function resetDatabaseConnection(): void {
  dbInstance = null;
  isInitialized = false;
  initializationPromise = null;
  resetCloudInstances();
  console.log('[Database] 🔄 Conexões e instâncias de cache resetadas.');
}