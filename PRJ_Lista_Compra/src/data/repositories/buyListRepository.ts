// src/data/repositories/buyListRepository.ts
import { getDBConnection } from '../../core/database/sqliteclient';
import { BuyListEntity, BuyListItemWithProductEntity } from '../entities/buyListEntity';

export class BuyListRepository {

  // Buscar todos os itens da lista de compras (com informações do produto e grupo)
  async findAllWithProducts(): Promise<BuyListItemWithProductEntity[]> {
    const db = await getDBConnection();
    const query = `
      SELECT 
        l.id_list_buy, 
        l.id_product, 
        l.qt_product, 
        l.dt_list_buy,
        p.nm_product,
        p.cd_product_gtin,
        p.id_group,
        g.nm_group
      FROM list_buy l
      INNER JOIN product p ON l.id_product = p.id_product
      INNER JOIN group_product g ON p.id_group = g.id_group
      ORDER BY g.id_group ASC, p.nm_product ASC;
    `;
    const result = await db.getAllAsync<BuyListItemWithProductEntity>(query);
    return result;
  }

  // Verificar se um produto já existe na lista de compras ativa
  async findByProductId(id_product: number): Promise<BuyListEntity | null> {
    const db = await getDBConnection();
    const query = `SELECT * FROM list_buy WHERE id_product = ?;`;
    const result = await db.getFirstAsync<BuyListEntity>(query, [id_product]);
    return result || null;
  }

  // Adicionar um novo item à lista de compras
  async create(item: Omit<BuyListEntity, 'id_list_buy'>): Promise<void> {
    const db = await getDBConnection();
    const query = `
      INSERT INTO list_buy (id_product, qt_product, dt_list_buy)
      VALUES (?, ?, ?);
    `;
    await db.runAsync(query, [
      item.id_product,
      item.qt_product,
      item.dt_list_buy
    ]);
  }

  // Atualizar a quantidade de um item existente
  async updateQuantity(id_list_buy: number, qt_product: number): Promise<void> {
    const db = await getDBConnection();
    const query = `UPDATE list_buy SET qt_product = ? WHERE id_list_buy = ?;`;
    await db.runAsync(query, [qt_product, id_list_buy]);
  }

  // Remover um item específico da lista
  async delete(id_list_buy: number): Promise<void> {
    const db = await getDBConnection();
    const query = `DELETE FROM list_buy WHERE id_list_buy = ?;`;
    await db.runAsync(query, [id_list_buy]);
  }

  // Limpar toda a lista de compras
  async clearList(): Promise<void> {
    const db = await getDBConnection();
    await db.runAsync(`DELETE FROM list_buy;`);
  }
}