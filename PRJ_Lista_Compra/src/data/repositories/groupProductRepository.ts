// src/data/repositories/groupProductRepository.ts
import { getDBConnection } from '../../core/database/sqliteclient';
import { GroupProductEntity } from '../entities/groupProductEntity';

export class GroupProductRepository {

  // Listar todos os grupos de produtos
  async findAll(): Promise<GroupProductEntity[]> {
    const db = await getDBConnection();
    const query = `SELECT * FROM group_product ORDER BY id_group ASC;`;
    const result = await db.getAllAsync<GroupProductEntity>(query);
    return result;
  }

  // Buscar grupo por ID
  async findById(id_group: number): Promise<GroupProductEntity | null> {
    const db = await getDBConnection();
    const query = `SELECT * FROM group_product WHERE id_group = ?;`;
    const result = await db.getFirstAsync<GroupProductEntity>(query, [id_group]);
    return result || null;
  }

  // Criar um novo grupo de produtos
  async create(group: Omit<GroupProductEntity, 'id_group'>): Promise<void> {
    const db = await getDBConnection();
    const query = `INSERT INTO group_product (nm_group) VALUES (?);`;
    await db.runAsync(query, [group.nm_group]);
  }

  // Atualizar um grupo de produtos existente
  async update(id_group: number, group: { nm_group: string }): Promise<void> {
    const db = await getDBConnection();
    const query = `UPDATE group_product SET nm_group = ? WHERE id_group = ?;`;
    await db.runAsync(query, [group.nm_group, id_group]);
  }

  // Excluir um grupo de produtos pelo ID
  async delete(id_group: number): Promise<void> {
    const db = await getDBConnection();
    const query = `DELETE FROM group_product WHERE id_group = ?;`;
    await db.runAsync(query, [id_group]);
  }
}