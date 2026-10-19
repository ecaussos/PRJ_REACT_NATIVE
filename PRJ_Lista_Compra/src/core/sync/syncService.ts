// src/core/sync/syncService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCloudConnection } from '../database/clients/cloudClient';
import { getLocalConnection } from '../database/clients/localClient';
import { readConfigFile } from '../database/database';
import { BaseSyncEntity } from './sync.types';

const LAST_SYNC_KEY = '@app_last_sync_timestamp';                     // Chave do AsyncStorage para guardar o timestamp do último sync

export class SyncService {
  private static isSyncing = false;                                   // Flag estática para evitar execuções simultâneas de sync

  // INICIO DA EXECUÇÃO SINCRONIZAÇÃO - Configurações, Ordenação e controle
  static async runAutoSync(): Promise<void> {                                    // Função para rodar a sincronização automática
    if (this.isSyncing) {                                                        // Verifica se já existe uma sincronização em andamento
      console.log('[Sync] ⏳ Sincronização já em andamento. Chamada ignorada.'); // Registra log no console
      return;                                                                    // Interrompe a função
    }
    this.isSyncing = true;  // Indica o início do sync
    try {
      const { activeCloudConfig, isSyncEnabled } = await readConfigFile();  // Lê o arquivo local de configuração do app
      // Verifica se sincronização não está ativa
      if (!isSyncEnabled) {        
        console.log('[Sync] 🛑 Sincronização (BD Sync) está desativada nas configurações.');  // Registra log no console
        return;                                                                               // Interrompe a função
      }
      // Verifica se não existe configurações BD Cloud 
      if (!activeCloudConfig) {
        console.log('[Sync] ⚠️ Nenhum banco Cloud ativo no arquivo de configuração'); // Registra log no console
        return;                                                                       // Interrompe a função
      }

      const lastSync = (await AsyncStorage.getItem(LAST_SYNC_KEY)) || '2026-01-01T00:00:00.000Z'; // Busca último sync ou define data padrão
      const syncStartTime = new Date().toISOString();                                             // Captura data/hora início da sincronização
      // Chama função de sicronização das tabelas
      await this.syncAll(lastSync, activeCloudConfig);                                            // Chama Função ordenação sincronizada das tabelas
      // Atualiza a data/hora do último sync concluído com sucesso
      await AsyncStorage.setItem(LAST_SYNC_KEY, syncStartTime);                                   // Salva a data de início da sync
    } catch (error) {
      console.error('[SyncService] ❌ Erro na execução da sincronização:', error);               // Loga qualquer exceção capturada durante o processo
    } finally {
      this.isSyncing = false;                                                                    // Altera a flag do sync permitindo futuras execuções
    }
  }

  // EXECUTA A SINCRONIZA DE TODAS A TABELAS - ORDEM FK
  static async syncAll(lastSyncIso: string, activeCloudConfig: any): Promise<void> { // Executa o sync em lote de todas as tabelas
    const localDb = await getLocalConnection();                                      // Obtém a instância de conexão BD local
    const cloudDb = await getCloudConnection(activeCloudConfig);                     // Obtém a instância de conexão BD Cloud
    console.log('[SyncService] 🔄 Iniciando sincronização Local <-> Nuvem...');     // Registra log no console

    // 1. Tabelas Independentes (Domínio/Símbolos)
    await this.syncTable(localDb, cloudDb, 'config_type', 'id_tp_config', ['id_tp_config', 'ds_tp_config', 'at_updated', 'at_delete'], lastSyncIso);  // Sync tipos de config
    await this.syncTable(localDb, cloudDb, 'supplier', 'id_supplier', ['id_supplier', 'nm_supplier', 'at_updated', 'at_delete'], lastSyncIso);        // Sync fornecedores
    await this.syncTable(localDb, cloudDb, 'group_product', 'id_group', ['id_group', 'nm_group', 'at_updated', 'at_delete'], lastSyncIso);            // Sync grupos de produtos

    // 2. Tabelas Nível 2 (Dependem das anteriores)
    await this.syncTable(localDb, cloudDb, 'config', 'id_config', ['id_config', 'id_tp_config', 'url_config', 'port_config', 'user_config', 'key_config', 'vers_config', 'st_ssl', 'st_config', 'dt_config', 'at_updated', 'at_delete'], lastSyncIso); // Sync configurações
    await this.syncTable(localDb, cloudDb, 'from_to_group', 'id_external', ['id_external', 'description', 'keywords', 'tag', 'id_group', 'at_updated', 'at_delete'], lastSyncIso);                                                                     // Sync mapeamentos de-para
    await this.syncTable(localDb, cloudDb, 'product', 'id_product', ['id_product', 'nm_product', 'id_group', 'cd_product_gtin', 'at_updated', 'at_delete'], lastSyncIso);                                                                              // Sync produtos

    // 3. Tabelas Nível 3 (Listas e Históricos)
    await this.syncTable(localDb, cloudDb, 'list_buy', 'id_list_buy', ['id_list_buy', 'id_product', 'qt_product', 'fl_bought', 'dt_list_buy', 'at_updated', 'at_delete'], lastSyncIso);                                // Sync listas de compras
    await this.syncTable(localDb, cloudDb, 'hist_buy', 'id_hist_buy', ['id_hist_buy', 'id_product', 'id_supplier', 'qt_product', 'vl_product', 'dt_list_buy', 'dt_hist_buy', 'at_updated', 'at_delete'], lastSyncIso); // Sync histórico de compras
    await this.syncTable(localDb, cloudDb, 'buy', 'id_product', ['id_product', 'qt_product', 'vl_product', 'dt_list_buy', 'at_updated', 'at_delete'], lastSyncIso);                                                    // Sync transações de compras

    console.log('[SyncService] ✅ Sincronização concluída com sucesso!'); // Registra log no console
  }

  
  // Método para gerar o PUSH E PULL das tabelas
  private static async syncTable<T extends BaseSyncEntity>( // Método genérico para fazer PUSH e PULL de uma tabela específica
    localDb: any,                                           // Instância da conexão BD Local
    cloudDb: any,                                           // Instância da conexão BD Cloud
    tableName: string,                                      // Nome da tabela
    primaryKey: keyof T,                                    // Coluna PK
    columns: (keyof T)[],                                   // Array contendo todas as colunas
    lastSyncIso: string                                     // Timestamp ISO do último sync realizado
  ): Promise<void> {
    const nowIso = new Date().toISOString();                // Timestamp atual utilizado nos inserts e updates
    // 1. PUSH: Local -> Cloud
    const pendingQuery = `SELECT * FROM ${tableName} WHERE st_sync IS NOT NULL AND st_sync != 0;`; // Query para buscar itens pendentes no local
    const pendingItems = await localDb.getAllAsync(pendingQuery);                                  // Busca todos os registros modificados/removidos localmente
    for (const item of pendingItems) {                                                             // Itera sobre cada registro pendente de envio para a nuvem
      const pkValue = item[primaryKey];                                                            // Obtém o valor da chave primária do registro local
      // Valida status INSERT/UPDADE
      if (item.st_sync === 1) {                                                // Status 1: Registro pendente de inserção ou atualização (upsert)
        const itemToSync = { ...item, at_updated: item.at_updated || nowIso }; // Garante um timestamp de atualização no objeto
        const colNames = columns.map((c) => String(c)).join(', ');             // Formata o nome das colunas separadas por vírgula
        const valPlaceholders = columns                                        // Mapeia e formata os valores para SQL estático
          .map((c) => {
            const val = itemToSync[c];
            if (val === null || val === undefined) return 'NULL'; // Trata valores nulos ou indefindos
            if (typeof val === 'number') return val;              // Trata valores numéricos sem aspas
            return `'${String(val).replace(/'/g, "''")}'`;        // Escapa aspas simples em strings para evitar SQL Injection
          })
          .join(', ');
        const updateSetClause = columns                       // Constrói cláusula de atualização para os campos afetados
          .filter((c) => c !== primaryKey)                    // Ignora a chave primária na atualização
          .map((c) => `${String(c)} = EXCLUDED.${String(c)}`) // Prepara instrução EXCLUDED do PostgreSQL/SQLite para UPSERT
          .join(', ');
        // Constroi query INSERT (UPSERT)
        const upsertQuery = `                       
          INSERT INTO ${tableName} (${colNames})          
          VALUES (${valPlaceholders})
          ON CONFLICT (${String(primaryKey)}) DO UPDATE SET
            ${updateSetClause};
        `;
        // Executa a instrução no BD Cloud
        await cloudDb.execAsync(upsertQuery);

        // Atualiza o Status sincronização BD Local - 0 = Sincronizado
        await localDb.runAsync(
          `UPDATE ${tableName} SET st_sync = 0 WHERE ${String(primaryKey)} = ?;`, // Query para atualizar status 0 (sincronizado)
          [pkValue]                                                               // Parâmetro do ID do registro local
        );
      // Valida status DELETE
      } else if (item.st_sync === 2) {  // Status 2: Registro pendente de exclusão (soft delete)
        // Constroi query update para o DELETE SOFT - mantém registro no BD para sincronização
        const softDeleteQuery = `
          UPDATE ${tableName} 
          SET at_delete = '${item.at_delete || nowIso}', at_updated = '${nowIso}'
          WHERE ${String(primaryKey)} = '${pkValue}';
        `;
        // Executa a instrução no BD Cloud
        await cloudDb.execAsync(softDeleteQuery);

        // Executa a query DELETE - DB Local
        await localDb.runAsync(
          `DELETE FROM ${tableName} WHERE ${String(primaryKey)} = ?;`, // Query para exclui o registro
          [pkValue]                                                    // Parâmetro da PK para exclusão
        );
      }
    }
    // 2. PULL: Cloud -> Local
    const selectCols = columns.map((c) => String(c)).join(', ');     // Formata a lista de colunas para a busca na nuvem
    // Query de busca por registros alterados após o último sync
    const pullQuery = `
      SELECT ${selectCols} 
      FROM ${tableName} 
      WHERE at_updated > '${lastSyncIso}';
    `;
    // Executa a instrução no BD Cloud
    const remoteItems = await cloudDb.getAllAsync(pullQuery);
    for (const remoteItem of remoteItems) {                                                  // Itera sobre cada registro recebido da nuvem
      const pkValue = remoteItem[primaryKey];                                                // Obtém a chave primária do registro remoto
      const localCheckQuery = `SELECT * FROM ${tableName} WHERE ${String(primaryKey)} = ?;`; // Query para checar existência no local
      const localItem = await localDb.getFirstAsync(localCheckQuery, [pkValue]);             // Busca se o registro já existe no banco local
      if (!localItem) {                                                                      // Caso o registro não exista localmente
        const colNames = [...columns, 'st_sync'].map((c) => String(c)).join(', ');           // Adiciona a coluna st_sync nas colunas locais
        const placeholders = columns.map(() => '?').concat('0').join(', ');                  // Define placeholders '?' e o valor '0' para st_sync
        const values = columns.map((c) => remoteItem[c] ?? null);                            // Extrai os valores do registro remoto
        // Conecta ao BD e Executa
        await localDb.runAsync(
          `INSERT INTO ${tableName} (${colNames}) VALUES (${placeholders});`, // Insere o novo registro no banco local
          values                                                              // Valores parametrizados para inserção
        );
      // Atualiza local se estiver sincronizado e o remoto for mais recente
      } else if (
        localItem.st_sync === 0 &&                                        // Item local sem pendências
        remoteItem.at_updated &&                                          // Tem data na nuvem
        localItem.at_updated &&                                           // Tem data no local
        new Date(remoteItem.at_updated) > new Date(localItem.at_updated)  // Nuvem é mais recente
      ) {
        const setClause = columns           // Prepara a instrução de UPDATE local
          .filter((c) => c !== primaryKey)  // Remove chave primária dos campos alteráveis
          .map((c) => `${String(c)} = ?`)   // Cria instrução parametrizada por coluna
          .concat('st_sync = 0')            // Assegura que o st_sync se mantenha zerado
          .join(', ');
        const values = columns                // Mapeia os valores atualizados
          .filter((c) => c !== primaryKey)    // Filtra valores que não são a chave primária
          .map((c) => remoteItem[c] ?? null)  // Extrai valores do item remoto
          .concat(pkValue);                   // Adiciona o valor da chave primária para a cláusula WHERE
        // Conecta ao BD e Executa
        await localDb.runAsync(
          `UPDATE ${tableName} SET ${setClause} WHERE ${String(primaryKey)} = ?;`, // Aplica as atualizações do servidor no local
          values                                                                   // Passa array de valores parametrizados
        );
      }
    }
  }
}