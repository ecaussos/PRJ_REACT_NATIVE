// src/data/repositories/config.repository.ts

import * as Crypto from 'expo-crypto';
import { getActiveDatabase } from '../../core/database/database';
import {
  ConfigEntity,
  ConfigTypeOption,
  ConfigWithTypeEntity,
  CreateConfigDTO,
  UpdateConfigDTO,
} from '../entities/config.entity';
import { IConfigRepository } from '../interfaces/config.repository.interface';

export class ConfigRepository implements IConfigRepository {
  
  // Busca e retorna todas as configurações ativas cadastradas no banco de dados
  async findAll(): Promise<ConfigWithTypeEntity[]> {
    try {
      const db = await getActiveDatabase();
      const query = `
        SELECT 
          c.id_config,
          c.id_tp_config,
          t.ds_tp_config,
          c.url_config,
          c.port_config,
          c.user_config,
          c.key_config,
          c.vers_config,
          c.st_ssl,
          c.st_config,
          c.dt_config,
          c.at_updated,
          c.at_delete,
          c.st_sync
        FROM config c
        INNER JOIN config_type t ON c.id_tp_config = t.id_tp_config
        WHERE c.at_delete IS NULL
        ORDER BY c.id_config ASC;
      `;

      const results = await db.getAllAsync<ConfigWithTypeEntity>(query);

      console.log('--------------------------------------------------');
      console.log('[ConfigRepository] 🗄️ CONFIGURAÇÕES ENCONTRADAS NO BANCO:');
      console.log(JSON.stringify(results, null, 2));
      console.log('--------------------------------------------------');

      return results;
    } catch (error) {
      console.error('[ConfigRepository] ❌ Erro ao listar configurações:', error);
      throw new Error(`Erro ao listar configurações: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Busca uma configuração ativa pelo seu identificador único (ID)
  async findById(id_config: string): Promise<ConfigEntity | null> {
    try {
      const db = await getActiveDatabase();
      const query = `SELECT * FROM config WHERE id_config = ? AND at_delete IS NULL;`;
      const result = await db.getFirstAsync<ConfigEntity>(query, [id_config]);
      return result || null;
    } catch (error) {
      throw new Error(`Erro ao buscar configuração por ID: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Busca a lista de tipos de configuração para preenchimento de select/picker
  async findConfigType(): Promise<ConfigTypeOption[]> {
    try {
      const db = await getActiveDatabase();
      const query = `
        SELECT id_tp_config, ds_tp_config 
        FROM config_type 
        WHERE at_delete IS NULL
        ORDER BY ds_tp_config ASC;
      `;
      return await db.getAllAsync<ConfigTypeOption>(query);
    } catch (error) {
      throw new Error(`Erro ao buscar tipos de configuração: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Busca as configurações ativas utilizando URL
  async findByUrlExact(url: string): Promise<ConfigEntity | null> {
    try {
      const db = await getActiveDatabase();
      const query = `SELECT * FROM config WHERE url_config = ? AND at_delete IS NULL;`;
      return await db.getFirstAsync<ConfigEntity>(query, [url]);
    } catch (error) {
      throw new Error(`Erro ao buscar configuração por URL: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Realiza o cadastro da configuração definindo at_updated e st_sync = 1
  async create(config: CreateConfigDTO): Promise<ConfigEntity> {
    try {
      const db = await getActiveDatabase();
      const createId = Crypto.randomUUID();
      const generatedId = createId.substring(0, 8);
      const nowIso = new Date().toISOString();

      const query = `
        INSERT INTO config (
          id_config,
          id_tp_config, 
          url_config, 
          port_config, 
          user_config, 
          key_config, 
          vers_config,
          st_ssl, 
          st_config, 
          dt_config,
          at_updated,
          at_delete,
          st_sync
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 1);
      `;

      await db.runAsync(query, [
        generatedId,
        config.id_tp_config,
        config.url_config || null,
        config.port_config || null,
        config.user_config || null,
        config.key_config || null,
        config.vers_config || null,
        config.st_ssl ?? 1,
        config.st_config ?? 1,
        nowIso,
        nowIso,
      ]);

      console.log(`[ConfigRepository] ✅ Configuração cadastrada com UUID: ${generatedId}`);

      return {
        id_config: generatedId,
        id_tp_config: config.id_tp_config,
        url_config: config.url_config,
        port_config: config.port_config,
        user_config: config.user_config,
        key_config: config.key_config,
        vers_config: config.vers_config,
        st_ssl: config.st_ssl ?? 1,
        st_config: config.st_config ?? 1,
        at_updated: nowIso,
        at_delete: null,
        st_sync: 1,
      };
    } catch (error) {
      throw new Error(`Erro ao cadastrar configuração: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Editar o cadastro da configuração atualizando at_updated e marcando st_sync = 1
  async update(id_config: string, config: UpdateConfigDTO): Promise<void> {
    try {
      const db = await getActiveDatabase();
      const nowIso = new Date().toISOString();

      const query = `
        UPDATE config 
        SET 
          id_tp_config = ?, 
          url_config = ?, 
          port_config = ?, 
          user_config = ?, 
          key_config = ?,
          vers_config = ?, 
          st_ssl = ?, 
          st_config = ?,
          at_updated = ?,
          st_sync = 1
        WHERE id_config = ?;
      `;
      await db.runAsync(query, [
        config.id_tp_config,
        config.url_config || null,
        config.port_config || null,
        config.user_config || null,
        config.key_config || null,
        config.vers_config || null,
        config.st_ssl,
        config.st_config,
        nowIso,
        id_config,
      ]);
      console.log(`[ConfigRepository] ✏️ Configuração ${id_config} atualizada.`);
    } catch (error) {
      throw new Error(`Erro ao atualizar configuração: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Excluir o cadastro da configuração via Soft Delete
  async delete(id_config: string): Promise<void> {
    try {
      const db = await getActiveDatabase();
      const nowIso = new Date().toISOString();

      const query = `
        UPDATE config 
        SET at_delete = ?, 
            at_updated = ?, 
            st_sync = 2 
        WHERE id_config = ?;
      `;
      await db.runAsync(query, [nowIso, nowIso, id_config]);
      console.log(`[ConfigRepository] 🗑️ Soft delete aplicado à configuração ${id_config}.`);
    } catch (error) {
      throw new Error(`Erro ao remover configuração: ${error instanceof Error ? error.message : error}`);
    }
  }
}