// src/data/repositories/buyList.repository.ts
import { getDBConnection } from '../../core/database/sqliteclient';
import { ProductSearchResult } from '../../features/buy/buy.types';
import {
  BuyEntity,
  BuyWithProductEntity,
  CreateBuyDTO,
} from '../entities/buy.entity';
import { IBuyRepository } from '../interfaces/buy.repository.interfaces';

export { IBuyRepository };

export class BuyRepository implements IBuyRepository {

  // Implementação delegando para a busca completa com produtos/grupos
  async findAll(): Promise<BuyWithProductEntity[]> {
    return this.findAllWithProduct();
  }

  // Buscar todos os itens da compra (com dados do produto e grupo via LEFT JOIN)
  async findAllWithProduct(): Promise<BuyWithProductEntity[]> {
    try {
      const db = await getDBConnection();
      const query = `
        SELECT 
          b.id_product, 
          b.qt_product,
          b.vl_product, 
          b.dt_list_buy,
          p.nm_product,
          p.cd_product_gtin,
          p.id_group,
          g.nm_group
        FROM buy b
        INNER JOIN product p ON b.id_product = p.id_product
        LEFT JOIN group_product g ON p.id_group = g.id_group
        ORDER BY g.nm_group ASC, p.nm_product ASC;
      `;
      const result = await db.getAllAsync<BuyWithProductEntity>(query);
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
          p.id_product, 
          p.nm_product, 
          p.cd_product_gtin,
          g.nm_group
        FROM product p
        LEFT JOIN group_product g ON p.id_group = g.id_group
        WHERE p.cd_product_gtin = ?;
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
          p.id_product, 
          p.nm_product, 
          p.cd_product_gtin,
          g.nm_group
        FROM product p
        LEFT JOIN group_product g ON p.id_group = g.id_group
        WHERE p.nm_product LIKE ?
        ORDER BY p.nm_product ASC;
      `;
      const searchName = `%${nm_product.trim()}%`;
      return await db.getAllAsync<ProductSearchResult>(query, [searchName]);
    } catch (error: any) {
      throw new Error(`Erro ao buscar por nome: ${error.message}`);
    }
  }

  // Verificar se um produto já existe na lista de compras ativa
  async findByProductId(id_product: number): Promise<BuyEntity | null> {
    try {
      const db = await getDBConnection();
      const query = `SELECT * FROM buy WHERE id_product = ?;`;
      const result = await db.getFirstAsync<BuyEntity>(query, [id_product]);
      return result || null;
    } catch (error: any) {
      throw new Error(`Erro ao buscar produto na lista: ${error.message}`);
    }
  }

  // Adicionar um novo item à lista de compras usando o DTO
  async create(item: CreateBuyDTO): Promise<void> {
    try {
      const db = await getDBConnection();
      const query = `
        INSERT INTO buy (id_product, qt_product, vl_product, dt_list_buy)
        VALUES (?, ?, ?, ?);
      `;
      
      // Tratamento para evitar que valores 'undefined' passem para a Query
      const vlProduct = item.vl_product ?? 0;
      const dtListBuy = item.dt_list_buy ?? new Date().toISOString();

      await db.runAsync(query, [
        item.id_product,
        item.qt_product,
        vlProduct,
        dtListBuy,
      ]);
    } catch (error: any) {
      throw new Error(`Erro ao inserir item na compra: ${error.message}`);
    }
  }

  // Atualizar a quantidade e o valor de um item existente
  async update(id_product: number, qt_product: number, vl_product: number): Promise<void> {
    try {
      const db = await getDBConnection();
      const query = `UPDATE buy SET qt_product = ?, vl_product = ? WHERE id_product = ?;`;
      await db.runAsync(query, [qt_product, vl_product, id_product]);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar quantidade ou valor na compra: ${error.message}`);
    }
  }

  // Remover um item específico da compra
  async delete(id_product: number): Promise<void> {
    try {
      const db = await getDBConnection();
      const query = `DELETE FROM buy WHERE id_product = ?;`;
      await db.runAsync(query, [id_product]);
    } catch (error: any) {
      throw new Error(`Erro ao remover item da compra: ${error.message}`);
    }
  }

  // Remover um item específico da compra
  async deleteBuyList(id_product: number): Promise<void> {
    try {
      const db = await getDBConnection();
      const query = `DELETE FROM list_buy WHERE id_product = ?;`;
      await db.runAsync(query, [id_product]);
    } catch (error: any) {
      throw new Error(`Erro ao remover item da lista de compra: ${error.message}`);
    }
  }



  // Limpar toda a compra
  async clearBuy(): Promise<void> {
    try {
      const db = await getDBConnection();
      await db.runAsync(`DELETE FROM buy;`);
    } catch (error: any) {
      throw new Error(`Erro ao limpar a compra: ${error.message}`);
    }
  }
}