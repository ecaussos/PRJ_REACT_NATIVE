// src/data/repositories/config.repository.ts
import { getDBConnection } from '../../core/database/sqliteclient';
import {
  ConfigEntity,
  ConfigTypeOption,
  ConfigWithTypeEntity,
  CreateConfigDTO,
  UpdateConfigDTO,
} from '../entities/config.entity';
import { IConfigRepository } from '../interfaces/config.repository.interface';

export class ConfigRepository implements IConfigRepository {
  // Retorna a lista completa de configurações ordenadas por ID com a descrição do tipo via INNER JOIN
// Busca e retorna todas as configurações cadastradas no banco de dados
  async findAll(): Promise<ConfigWithTypeEntity[]> {
    try {
      const db = await getDBConnection(); // Obtém a conexão com o banco de dados SQLite
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
          c.dt_config
        FROM config c
        INNER JOIN config_type t ON c.id_tp_config = t.id_tp_config
        ORDER BY c.id_config ASC;
      `; // Define a instrução SQL para buscar as configurações com a descrição do tipo

      const results = await db.getAllAsync<ConfigWithTypeEntity>(query); // Executa a consulta no banco de dados

      console.log('--------------------------------------------------');
      console.log('[ConfigRepository] 🗄️ CONFIGURAÇÕES ENCONTRADAS NO BANCO:');
      console.log(JSON.stringify(results, null, 2)); // Imprime os resultados formatados no console
      console.log('--------------------------------------------------');

      return results; // Retorna a lista de configurações encontrada
    } catch (error) {
      console.error('[ConfigRepository] ❌ Erro ao listar configurações:', error); // Registra a falha no console
      throw new Error(`Erro ao listar configurações: ${error instanceof Error ? error.message : error}`); // Lança exceção tratada
    }
  }

  // Busca uma configuração pelo seu identificador único (ID)
  async findById(id_config: number): Promise<ConfigEntity | null> {
    try {
      const db = await getDBConnection();
      const query = `SELECT * FROM config WHERE id_config = ?;`;
      const result = await db.getFirstAsync<ConfigEntity>(query, [id_config]);
      return result || null;
    } catch (error) {
      throw new Error(`Erro ao buscar configuração por ID: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Busca a lista de tipos de configuração para preenchimento de select/picker
  async findConfigType(): Promise<ConfigTypeOption[]> {
    try {
      const db = await getDBConnection();
      const query = `
        SELECT id_tp_config, ds_tp_config 
        FROM config_type 
        ORDER BY ds_tp_config ASC;
      `;
      return await db.getAllAsync<ConfigTypeOption>(query);
    } catch (error) {
      throw new Error(`Erro ao buscar tipos de configuração: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Busca as configurações utilizando URL
  async findByUrlExact(url: string): Promise<ConfigEntity | null> {
    // Ajuste a consulta conforme a sua biblioteca de banco de dados (ex: SQLite, TypeORM, Prisma, etc.)
    const db = await getDBConnection();
    const query =  'SELECT * FROM config WHERE url_config = ? LIMIT 1;';
    return await db.getFirstAsync<ConfigEntity>(query,[url]);
  }

  // Realiza o cadastro da configuração usando o DTO de criação
  async create(config: CreateConfigDTO): Promise<ConfigEntity> {
    try {
      const db = await getDBConnection();

      const query = `
        INSERT INTO config (
          id_tp_config, 
          url_config, 
          port_config, 
          user_config, 
          key_config, 
          vers_config,
          st_ssl, 
          st_config, 
          dt_config
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'));
      `;

      const result = await db.runAsync(query, [
        config.id_tp_config,
        config.url_config || null,
        config.port_config || null,
        config.user_config || null,
        config.key_config || null,
        config.vers_config || null,
        config.st_ssl ?? 1,
        config.st_config ?? 1,
      ]);

      return {
        id_config: result.lastInsertRowId,
        id_tp_config: config.id_tp_config,
        url_config: config.url_config,
        port_config: config.port_config,
        user_config: config.user_config,
        key_config: config.key_config,
        vers_config: config.vers_config,
        st_ssl: config.st_ssl ?? 1,
        st_config: config.st_config ?? 1,
      };
    } catch (error) {
      throw new Error(`Erro ao cadastrar configuração: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Editar o cadastro da configuração usando o DTO de atualização
  async update(id_config: number, config: UpdateConfigDTO): Promise<void> {
    try {
      const db = await getDBConnection();
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
          st_config = ?
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
        id_config,
      ]);
    } catch (error) {
      throw new Error(`Erro ao atualizar configuração: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Excluir o cadastro da configuração pelo ID
  async delete(id_config: number): Promise<void> {
    try {
      const db = await getDBConnection();
      await db.runAsync('DELETE FROM config WHERE id_config = ?;', [id_config]);
    } catch (error) {
      throw new Error(`Erro ao remover configuração: ${error instanceof Error ? error.message : error}`);
    }
  }
}