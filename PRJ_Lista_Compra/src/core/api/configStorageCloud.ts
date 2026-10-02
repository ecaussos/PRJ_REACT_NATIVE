// src/core/api/configStorageCloud.ts
import { ConfigEntity } from '../../data/entities/config.entity';
import { ConfigModelInstance } from '../../features/config/config.model';

// Configuração padrão com todos os campos exigidos pela interface ConfigEntity
const DEFAULT_CONFIG: ConfigEntity = {
  id_config: 0,       // Configuração padrão  
  id_tp_config: 1,    // BD Local
  url_config: null,   // Url
  port_config: null,  // Porta
  user_config: null,  // Usuário
  key_config: null,   // Senha
  st_ssl: 0,          // Inativo por padrão
  st_config: 1,       // Ativo por padrão
  dt_config: new Date().toISOString(),
};

export const configStorageApi = {
  /**
   * Busca a configuração atual a partir do arquivo JSON local (config.json)
   */
  async fetchConfig(): Promise<ConfigEntity> {
    try {
      const fileExists = await ConfigModelInstance.checkConfigFileExists();
      if (!fileExists) {
        console.log('[Config Storage] ⚠️ Arquivo config.json não encontrado. Utilizando configuração padrão.');
        return DEFAULT_CONFIG;
      }

      const configFile = await ConfigModelInstance.readConfigFile();
      if (configFile) {
        console.log('[Config Storage] ⚙️ Configuração lida com sucesso do arquivo config.json.');
        // Mescla a configuração padrão com os dados lidos do JSON para garantir integridade dos campos
        return { ...DEFAULT_CONFIG, ...configFile };
      }
    } catch (error) {
      console.error('[Config Storage] ❌ Erro ao ler o arquivo config.json:', error);
    }

    return DEFAULT_CONFIG;
  },

  /**
   * Salva/Atualiza a configuração no arquivo JSON local (config.json)
   */
  async persistConfig(config: ConfigEntity): Promise<boolean> {
    try {
      const success = await ConfigModelInstance.createConfigFile(config);
      if (success) {
        console.log('[Config Storage] ✅ Configuração salva com sucesso em config.json.');
        return true;
      }
    } catch (error) {
      console.error('[Config Storage] ❌ Erro ao salvar configuração em config.json:', error);
    }

    return false;
  },
};