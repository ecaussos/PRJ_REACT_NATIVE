// src/data/repositories/groupProduct.repository.ts

import * as Crypto from 'expo-crypto';
import { getActiveDatabase } from '../../core/database/database';
import {
  CreateGroupProductDTO,
  GroupProductEntity,
  UpdateGroupProductDTO,
} from '../entities/groupProduct.entity';
import { IGroupProductRepository } from '../interfaces/groupProduct.repository.interface';

export class GroupProductRepository implements IGroupProductRepository {
  
  // Listar todos os grupos de produtos ativos (não eliminados)
  async findAll(): Promise<GroupProductEntity[]> {
    try {
      const db = await getActiveDatabase();
      const query = `
        SELECT id_group, nm_group, at_updated, at_delete, st_sync 
        FROM group_product 
        WHERE at_delete IS NULL 
        ORDER BY id_group ASC;
      `;
      const result = await db.getAllAsync<GroupProductEntity>(query);
      return result || [];
    } catch (error) {
      throw new Error(`Erro ao buscar grupos de produtos: ${(error as Error).message}`);
    }
  }

  // Busca um grupo ativo pelo seu identificador único (ID)
  async findById(id_group: string): Promise<GroupProductEntity | null> {
    try {
      const db = await getActiveDatabase();
      const query = `SELECT * FROM group_product WHERE id_group = ? AND at_delete IS NULL;`;
      const result = await db.getFirstAsync<GroupProductEntity>(query, [id_group]);
      return result || null;
    } catch (error) {
      throw new Error(`Erro ao buscar grupo de produto por ID: ${(error as Error).message}`);
    }
  }

  // Realiza busca de grupo ativo pelo nome exato/completo
  async findByNameExact(name: string): Promise<GroupProductEntity | null> {
    try {
      const db = await getActiveDatabase();
      const query = `SELECT * FROM group_product WHERE LOWER(nm_group) = LOWER(?) AND at_delete IS NULL;`;
      const result = await db.getFirstAsync<GroupProductEntity>(query, [name.trim()]);
      return result || null;
    } catch (error) {
      throw new Error(`Erro ao buscar grupo por nome exato: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Realiza busca de grupos ativos ao digitar o nome
  async findByName(nameQuery: string): Promise<Pick<GroupProductEntity, 'id_group' | 'nm_group'>[]> {
    try {
      const db = await getActiveDatabase();
      const query = `
        SELECT 
          id_group,
          nm_group
        FROM group_product
        WHERE nm_group LIKE ? AND at_delete IS NULL
        ORDER BY nm_group ASC;
      `;
      return await db.getAllAsync<Pick<GroupProductEntity, 'id_group' | 'nm_group'>>(query, [`%${nameQuery.trim()}%`]);
    } catch (error) {
      throw new Error(`Erro ao buscar grupos por nome: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Realizar o cadastro do grupo definindo at_updated e st_sync = 1
  async create(group: CreateGroupProductDTO): Promise<GroupProductEntity> {
    try {
      const db = await getActiveDatabase();
      const createId = Crypto.randomUUID();
      const generatedId = createId.substring(0, 8);
      const nowIso = new Date().toISOString();

      const query = `
        INSERT INTO group_product (
          id_group, 
          nm_group, 
          at_updated, 
          at_delete, 
          st_sync
        ) VALUES (?, ?, ?, NULL, 1);
      `;
      await db.runAsync(query, [generatedId, group.nm_group, nowIso]);

      console.log(`[GroupProductRepository] ✅ Grupo cadastrado com UUID: ${generatedId}`);

      return {
        id_group: generatedId,
        nm_group: group.nm_group,
        at_updated: nowIso,
        at_delete: null,
        st_sync: 1,
      };
    } catch (error) {
      throw new Error(`Erro ao cadastrar grupo de produto: ${(error as Error).message}`);
    }
  }

  // Editar o cadastro do grupo atualizando at_updated e marcando st_sync = 1
  async update(id_group: string, group: UpdateGroupProductDTO): Promise<void> {
    try {
      const db = await getActiveDatabase();
      const nowIso = new Date().toISOString();

      const query = `
        UPDATE group_product 
        SET nm_group = ?, 
            at_updated = ?, 
            st_sync = 1 
        WHERE id_group = ?;
      `;
      await db.runAsync(query, [group.nm_group, nowIso, id_group]);
      console.log(`[GroupProductRepository] ✏️ Grupo ${id_group} atualizado.`);
    } catch (error) {
      throw new Error(`Erro ao atualizar grupo de produto: ${(error as Error).message}`);
    }
  }

  // Realiza Soft Delete do grupo marcando at_delete, at_updated e st_sync = 2
  async delete(id_group: string): Promise<void> {
    try {
      const db = await getActiveDatabase();
      const nowIso = new Date().toISOString();

      const query = `
        UPDATE group_product 
        SET at_delete = ?, 
            at_updated = ?, 
            st_sync = 2 
        WHERE id_group = ?;
      `;
      await db.runAsync(query, [nowIso, nowIso, id_group]);
      console.log(`[GroupProductRepository] 🗑️ Soft delete aplicado ao grupo ${id_group}.`);
    } catch (error) {
      throw new Error(`Erro ao deletar grupo de produto: ${(error as Error).message}`);
    }
  }
}