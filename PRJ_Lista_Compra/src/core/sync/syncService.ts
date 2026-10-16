// src/core/sync/syncService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCloudConnection } from '../database/cloudClient';
import { readConfigFile } from '../database/database';
import { getLocalConnection } from '../database/localClient';
import { BaseSyncEntity } from './sync.types';

const LAST_SYNC_KEY = '@app_last_sync_timestamp';

export class SyncService {
  private static isSyncing = false;

  /**
   * Ponto de entrada padrão: lê automaticamente as configurações, valida permissões
   * e orquestra a sincronização sem duplicar execuções simultâneas.
   */
  static async runAutoSync(): Promise<void> {
    if (this.isSyncing) {
      console.log('[SyncService] ⏳ Sincronização já em andamento. Chamada ignorada.');
      return;
    }

    this.isSyncing = true;
    try {
      const { activeCloudConfig, isSyncEnabled } = await readConfigFile();

      if (!isSyncEnabled) {
        console.log('[SyncService] 🛑 Sincronização (BD Sync) está desativada nas configurações.');
        return;
      }

      if (!activeCloudConfig) {
        console.log('[SyncService] ⚠️ Nenhum banco Cloud ativo no app_config.json. Sincronização cancelada.');
        return;
      }

      const lastSync = (await AsyncStorage.getItem(LAST_SYNC_KEY)) || '1970-01-01T00:00:00.000Z';
      const syncStartTime = new Date().toISOString();

      await this.syncAll(lastSync, activeCloudConfig);

      // Atualiza a data/hora do último sync concluído com sucesso
      await AsyncStorage.setItem(LAST_SYNC_KEY, syncStartTime);
    } catch (error) {
      console.error('[SyncService] ❌ Erro na execução da sincronização:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Executa a sincronização de todas as tabelas na ordem correta das Chaves Estrangeiras (FKs)
   */
  static async syncAll(lastSyncIso: string, activeCloudConfig: any): Promise<void> {
    const localDb = await getLocalConnection();
    const cloudDb = await getCloudConnection(activeCloudConfig);

    console.log('[SyncService] 🔄 Iniciando sincronização Local <-> Nuvem...');

    // 1. Tabelas Independentes (Domínio/Símbolos)
    await this.syncTable(localDb, cloudDb, 'config_type', 'id_tp_config', ['id_tp_config', 'ds_tp_config', 'at_updated', 'at_delete'], lastSyncIso);
    await this.syncTable(localDb, cloudDb, 'supplier', 'id_supplier', ['id_supplier', 'nm_supplier', 'at_updated', 'at_delete'], lastSyncIso);
    await this.syncTable(localDb, cloudDb, 'group_product', 'id_group', ['id_group', 'nm_group', 'at_updated', 'at_delete'], lastSyncIso);

    // 2. Tabelas Nível 2 (Dependem das anteriores)
    await this.syncTable(localDb, cloudDb, 'config', 'id_config', ['id_config', 'id_tp_config', 'url_config', 'port_config', 'user_config', 'key_config', 'vers_config', 'st_ssl', 'st_config', 'dt_config', 'at_updated', 'at_delete'], lastSyncIso);
    await this.syncTable(localDb, cloudDb, 'from_to_group', 'id_external', ['id_external', 'description', 'keywords', 'tag', 'id_group', 'at_updated', 'at_delete'], lastSyncIso);
    await this.syncTable(localDb, cloudDb, 'product', 'id_product', ['id_product', 'nm_product', 'id_group', 'cd_product_gtin', 'at_updated', 'at_delete'], lastSyncIso);

    // 3. Tabelas Nível 3 (Listas e Históricos)
    await this.syncTable(localDb, cloudDb, 'list_buy', 'id_list_buy', ['id_list_buy', 'id_product', 'qt_product', 'fl_bought', 'dt_list_buy', 'at_updated', 'at_delete'], lastSyncIso);
    await this.syncTable(localDb, cloudDb, 'hist_buy', 'id_hist_buy', ['id_hist_buy', 'id_product', 'id_supplier', 'qt_product', 'vl_product', 'dt_list_buy', 'dt_hist_buy', 'at_updated', 'at_delete'], lastSyncIso);
    await this.syncTable(localDb, cloudDb, 'buy', 'id_product', ['id_product', 'qt_product', 'vl_product', 'dt_list_buy', 'at_updated', 'at_delete'], lastSyncIso);

    console.log('[SyncService] ✅ Sincronização concluída com sucesso!');
  }

  /**
   * Método genérico para PUSH e PULL de uma tabela
   */
  private static async syncTable<T extends BaseSyncEntity>(
    localDb: any,
    cloudDb: any,
    tableName: string,
    primaryKey: keyof T,
    columns: (keyof T)[],
    lastSyncIso: string
  ): Promise<void> {
    const nowIso = new Date().toISOString();

    // -------------------------------------------------------------------------
    // 1. PUSH: SQLite -> Cloud
    // -------------------------------------------------------------------------
    const pendingQuery = `SELECT * FROM ${tableName} WHERE st_sync IS NOT NULL AND st_sync != 0;`;
    const pendingItems = await localDb.getAllAsync(pendingQuery);

    for (const item of pendingItems) {
      const pkValue = item[primaryKey];

      if (item.st_sync === 1) {
        const itemToSync = { ...item, at_updated: item.at_updated || nowIso };
        
        const colNames = columns.map((c) => String(c)).join(', ');
        const valPlaceholders = columns
          .map((c) => {
            const val = itemToSync[c];
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number') return val;
            return `'${String(val).replace(/'/g, "''")}'`;
          })
          .join(', ');

        const updateSetClause = columns
          .filter((c) => c !== primaryKey)
          .map((c) => `${String(c)} = EXCLUDED.${String(c)}`)
          .join(', ');

        const upsertQuery = `
          INSERT INTO ${tableName} (${colNames})
          VALUES (${valPlaceholders})
          ON CONFLICT (${String(primaryKey)}) DO UPDATE SET
            ${updateSetClause};
        `;

        await cloudDb.execAsync(upsertQuery);

        // Marca como sincronizado no SQLite local
        await localDb.runAsync(
          `UPDATE ${tableName} SET st_sync = 0 WHERE ${String(primaryKey)} = ?;`,
          [pkValue]
        );
      } else if (item.st_sync === 2) {
        // Soft delete para a nuvem
        const softDeleteQuery = `
          UPDATE ${tableName} 
          SET at_delete = '${item.at_delete || nowIso}', at_updated = '${nowIso}'
          WHERE ${String(primaryKey)} = '${pkValue}';
        `;
        await cloudDb.execAsync(softDeleteQuery);

        // Remove do SQLite local
        await localDb.runAsync(
          `DELETE FROM ${tableName} WHERE ${String(primaryKey)} = ?;`,
          [pkValue]
        );
      }
    }

    // -------------------------------------------------------------------------
    // 2. PULL: Cloud -> SQLite
    // -------------------------------------------------------------------------
    const selectCols = columns.map((c) => String(c)).join(', ');
    const pullQuery = `
      SELECT ${selectCols} 
      FROM ${tableName} 
      WHERE at_updated > '${lastSyncIso}';
    `;
    const remoteItems = await cloudDb.getAllAsync(pullQuery);

    for (const remoteItem of remoteItems) {
      const pkValue = remoteItem[primaryKey];
      const localCheckQuery = `SELECT * FROM ${tableName} WHERE ${String(primaryKey)} = ?;`;
      const localItem = await localDb.getFirstAsync(localCheckQuery, [pkValue]);

      if (!localItem) {
        const colNames = [...columns, 'st_sync'].map((c) => String(c)).join(', ');
        const placeholders = columns.map(() => '?').concat('0').join(', ');
        const values = columns.map((c) => remoteItem[c] ?? null);

        await localDb.runAsync(
          `INSERT INTO ${tableName} (${colNames}) VALUES (${placeholders});`,
          values
        );
      } else if (
        localItem.st_sync === 0 &&
        remoteItem.at_updated &&
        localItem.at_updated &&
        new Date(remoteItem.at_updated) > new Date(localItem.at_updated)
      ) {
        const setClause = columns
          .filter((c) => c !== primaryKey)
          .map((c) => `${String(c)} = ?`)
          .concat('st_sync = 0')
          .join(', ');

        const values = columns
          .filter((c) => c !== primaryKey)
          .map((c) => remoteItem[c] ?? null)
          .concat(pkValue);

        await localDb.runAsync(
          `UPDATE ${tableName} SET ${setClause} WHERE ${String(primaryKey)} = ?;`,
          values
        );
      }
    }
  }
}