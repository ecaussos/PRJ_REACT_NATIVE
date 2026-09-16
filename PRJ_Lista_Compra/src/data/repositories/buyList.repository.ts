// src/data/repositories/buyList.repository.ts
import { getDBConnection } from '../../core/database/sqliteclient';
import { ProductSearchResult } from '../../features/buyList/buyList.types';
import {
  BuyListEntity,
  BuyListItemWithProductEntity,
  CreateBuyListDTO,
} from '../entities/buyList.entity';
import { IBuyListRepository } from '../interfaces/buyList.repository.interfaces';

export { IBuyListRepository };

export class BuyListRepository implements IBuyListRepository {

  findAll(): Promise<BuyListItemWithProductEntity[]> {
    throw new Error('Method not implemented.');
  }
  // Buscar todos os itens da lista de compras (com dados do produto e grupo via LEFT JOIN)
  async findAllWithProduct(): Promise<BuyListItemWithProductEntity[]> {
    try {
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
        LEFT JOIN group_product g ON p.id_group = g.id_group
        ORDER BY g.nm_group ASC, p.nm_product ASC;
      `;
      const result = await db.getAllAsync<BuyListItemWithProductEntity>(query);
      return result;
    } catch (error: any) {
      throw new Error(`Erro ao buscar itens da lista de compras: ${error.message}`);
    }
  }

// Buscar produto por Código de Barras exato
  async findByBarcode(cd_product_gtin: string): Promise<ProductSearchResult | null> {
    try {
      const db = await getDBConnection();
      const query = `
        SELECT 
          id_product, 
          nm_product, 
          cd_product_gtin
        FROM product
        WHERE cd_product_gtin = ?;
      `;
      return await db.getFirstAsync<ProductSearchResult>(query, [cd_product_gtin]);
    } catch (error: any) {
      throw new Error(`Erro ao buscar por código: ${error.message}`);
    }
  }

  // Buscar produtos por Nome (parcial com LIKE)
  async findByName(nm_product: string): Promise<ProductSearchResult[]> {
    try {
      const db = await getDBConnection();
      const query = `
        SELECT 
          id_product, 
          nm_product, 
          cd_product_gtin
        FROM product
        WHERE nm_product LIKE ?
        ORDER BY nm_product ASC;
      `;
      const searchName = `%${nm_product.trim()}%`;
      return await db.getAllAsync<ProductSearchResult>(query, [searchName]);
    } catch (error: any) {
      throw new Error(`Erro ao buscar por nome: ${error.message}`);
    }
  }

  // Verificar se um produto já existe na lista de compras ativa
  async findByProductId(id_product: number): Promise<BuyListEntity | null> {
    try {
      const db = await getDBConnection();
      const query = `SELECT * FROM list_buy WHERE id_product = ?;`;
      const result = await db.getFirstAsync<BuyListEntity>(query, [id_product]);
      return result || null;
    } catch (error: any) {
      throw new Error(`Erro ao buscar produto na lista: ${error.message}`);
    }
  }

  // Adicionar um novo item à lista de compras usando o DTO
  async create(item: CreateBuyListDTO): Promise<void> {
    try {
      const db = await getDBConnection();
      const query = `
        INSERT INTO list_buy (id_product, qt_product, dt_list_buy)
        VALUES (?, ?, ?);
      `;
      await db.runAsync(query, [
        item.id_product,
        item.qt_product,
        item.dt_list_buy,
      ]);
    } catch (error: any) {
      throw new Error(`Erro ao inserir item na lista de compras: ${error.message}`);
    }
  }

  // Atualizar a quantidade de um item existente
  async update(id_list_buy: number, qt_product: number): Promise<void> {
    try {
      const db = await getDBConnection();
      const query = `UPDATE list_buy SET qt_product = ? WHERE id_list_buy = ?;`;
      await db.runAsync(query, [qt_product,id_list_buy]);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar quantidade na lista: ${error.message}`);
    }
  }

  // Remover um item específico da lista
  async delete(id_list_buy: number): Promise<void> {
    try {
      const db = await getDBConnection();
      const query = `DELETE FROM list_buy WHERE id_list_buy = ?;`;
      await db.runAsync(query, [id_list_buy]);
    } catch (error: any) {
      throw new Error(`Erro ao remover item da lista: ${error.message}`);
    }
  }

  // Limpar toda a lista de compras
  async clearList(): Promise<void> {
    try {
      const db = await getDBConnection();
      await db.runAsync(`DELETE FROM list_buy;`);
    } catch (error: any) {
      throw new Error(`Erro ao limpar a lista de compras: ${error.message}`);
    }
  }
}