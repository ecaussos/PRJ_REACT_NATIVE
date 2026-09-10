// src/data/repositories/groupProduct.repository.ts
import { getDBConnection } from '../../core/database/sqliteclient';
import {
  CreateGroupProductDTO,
  GroupProductEntity,
  UpdateGroupProductDTO,
} from '../entities/groupProduct.entity';
import { IGroupProductRepository } from '../interfaces/groupProduct.repository.interface';

export class GroupProductRepository implements IGroupProductRepository {
  
  // Listar todos os grupos de produtos
  async findAll(): Promise<GroupProductEntity[]> {
    try {
      const db = await getDBConnection();
      const query = `SELECT * FROM group_product ORDER BY id_group ASC;`;
      const result = await db.getAllAsync<GroupProductEntity>(query);
      return result;
    } catch (error) {
      throw new Error(`Erro ao buscar grupos de produtos: ${(error as Error).message}`);
    }
  }

  // Busca um fornecedor pelo seu identificador único (ID)
  async findById(id_group: number): Promise<GroupProductEntity | null> {
    try {
      const db = await getDBConnection();
      const query = `SELECT * FROM group_product WHERE id_group = ?;`;
      const result = await db.getFirstAsync<GroupProductEntity>(query, [id_group]);
      return result || null;
    } catch (error) {
      throw new Error(`Erro ao buscar grupo de produto por ID: ${(error as Error).message}`);
    }
  }

  // Realiza busca de grupo pelo nome Exato/completo
  async findByNameExact(name: string): Promise<GroupProductEntity | null>{
  try {
    const db = await getDBConnection();
    const query = `SELECT * FROM group_product WHERE LOWER(nm_group) = LOWER(?)`;
    const result = await db.getFirstAsync<GroupProductEntity>(query, [name.trim()]);
    // Retorna o primeiro registro se encontrar, ou null
    return result || null;
  } catch (error) {
    throw new Error(`Erro ao buscar fornecedor por nome exato: ${error instanceof Error ? error.message : error}`);
  }
}

  // Realiza busca de grupo ao digitar nome - Utilizado na pesquisa
  async findByName(nameQuery: string): Promise<Pick<GroupProductEntity, 'id_group' | 'nm_group'>[]> {
    try {
      const db = await getDBConnection();
      const query = `
        SELECT 
          id_group,
          nm_group
        FROM group_product
        WHERE nm_group like ?
        ORDER BY nm_group ASC;
      `;
      return await db.getAllAsync<Pick<GroupProductEntity, 'id_group'| 'nm_group'>>(query, [`%${nameQuery.trim()}%`]);
    } catch (error) {
      throw new Error(`Erro ao buscar produtos por nome: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Realizar o cadastro do grupo usando o DTO de criação
  async create(group: CreateGroupProductDTO): Promise<GroupProductEntity> {
    try {
      const db = await getDBConnection();
      const query = `INSERT INTO group_product (nm_group) VALUES (?);`;
      const result = await db.runAsync(query, [group.nm_group]);
      return {
        id_group: result.lastInsertRowId,
        nm_group: group.nm_group,
      };
    } catch (error) {
      throw new Error(`Erro ao cadastrar grupo de produto: ${(error as Error).message}`);
    }
  }

  // Editar o cadastro do grupo usando o DTO de atualização
  async update(id_group: number, group: UpdateGroupProductDTO): Promise<void> {
    try {
      const db = await getDBConnection();
      const query = `UPDATE group_product SET nm_group = ? WHERE id_group = ?;`;
      await db.runAsync(query, [group.nm_group, id_group]);
    } catch (error) {
      throw new Error(`Erro ao atualizar grupo de produto: ${(error as Error).message}`);
    }
  }

  // Excluir um grupo de produtos pelo ID
  async delete(id_group: number): Promise<void> {
    try {
      const db = await getDBConnection();
      const query = `DELETE FROM group_product WHERE id_group = ?;`;
      await db.runAsync(query, [id_group]);
    } catch (error) {
      throw new Error(`Erro ao deletar grupo de produto: ${(error as Error).message}`);
    }
  }
}