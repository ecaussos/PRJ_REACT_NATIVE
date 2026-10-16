// src/data/repositories/buyList.repository.ts

import * as Crypto from 'expo-crypto';
import { getActiveDatabase } from '../../core/database/database';
import { ProductSearchResult } from '../../features/buyList/buyList.types';
import {
  BuyListEntity,
  BuyListItemWithProductEntity,
  CreateBuyListDTO,
} from '../entities/buyList.entity';
import { IBuyListRepository } from '../interfaces/buyList.repository.interfaces';

export { IBuyListRepository };

export class BuyListRepository implements IBuyListRepository {

  // Alias para manter compatibilidade com a interface IBuyListRepository
  async findAll(): Promise<BuyListItemWithProductEntity[]> {
    return this.findAllWithProduct();
  }

  // Buscar todos os itens ativos da lista de compras (com dados do produto e grupo via LEFT JOIN)
  async findAllWithProduct(): Promise<BuyListItemWithProductEntity[]> {
    try {
      const db = await getActiveDatabase();
      const query = `
        SELECT 
          l.id_list_buy, 
          l.id_product, 
          l.qt_product, 
          l.dt_list_buy,
          l.at_updated,
          l.at_delete,
          l.st_sync,
          p.nm_product,
          p.cd_product_gtin,
          p.id_group,
          g.nm_group
        FROM list_buy l
        INNER JOIN product p ON l.id_product = p.id_product
        LEFT JOIN group_product g ON p.id_group = g.id_group
        WHERE l.at_delete IS NULL AND p.at_delete IS NULL
        ORDER BY g.nm_group ASC, p.nm_product ASC;
      `;
      const result = await db.getAllAsync<BuyListItemWithProductEntity>(query);
      return result || [];
    } catch (error: any) {
      throw new Error(`Erro ao buscar itens da lista de compras: ${error.message}`);
    }
  }

  // Buscar produto ativo por Código de Barras exato
  async findByBarcode(cd_product_gtin: string): Promise<ProductSearchResult | null> {
    try {
      const db = await getActiveDatabase();
      const query = `
        SELECT 
          id_product, 
          nm_product, 
          cd_product_gtin
        FROM product
        WHERE cd_product_gtin = ? AND at_delete IS NULL;
      `;
      return await db.getFirstAsync<ProductSearchResult>(query, [cd_product_gtin]);
    } catch (error: any) {
      throw new Error(`Erro ao buscar por código: ${error.message}`);
    }
  }

  // Buscar produtos ativos por Nome (parcial com LIKE)
  async findByName(nm_product: string): Promise<ProductSearchResult[]> {
    try {
      const db = await getActiveDatabase();
      const query = `
        SELECT 
          p.id_product, 
          p.nm_product,
          p.cd_product_gtin,
          g.nm_group
        FROM product p
        LEFT JOIN group_product g ON p.id_group = g.id_group
        WHERE p.nm_product LIKE ? AND p.at_delete IS NULL
        ORDER BY p.nm_product ASC;
      `;
      const searchName = `%${nm_product.trim()}%`;
      return await db.getAllAsync<ProductSearchResult>(query, [searchName]);
    } catch (error: any) {
      throw new Error(`Erro ao buscar por nome: ${error.message}`);
    }
  }

  // Verificar se um produto já existe na lista de compras ativa
  async findByProductId(id_product: string): Promise<BuyListEntity | null> {
    try {
      const db = await getActiveDatabase();
      const query = `SELECT * FROM list_buy WHERE id_product = ? AND at_delete IS NULL;`;
      const result = await db.getFirstAsync<BuyListEntity>(query, [id_product]);
      return result || null;
    } catch (error: any) {
      throw new Error(`Erro ao buscar produto na lista: ${error.message}`);
    }
  }

  async findByActiveBuy(): Promise<boolean> {
    try {
      const db = await getActiveDatabase();
      const result = await db.getFirstAsync<{ total: number }>(
        'SELECT COUNT(*) as total FROM buy WHERE at_delete IS NULL;'
      );

      return (result?.total ?? 0) > 0;
    } catch (error: any) {
      throw new Error(`Erro ao verificar compra ativa: ${error.message}`);
    }
  }

  // Adicionar um novo item à lista de compras definindo at_updated e st_sync = 1
  async create(item: CreateBuyListDTO): Promise<void> {
    try {
      const db = await getActiveDatabase();
      const createId = Crypto.randomUUID();
      const generatedId = createId.substring(0, 8);
      const nowIso = new Date().toISOString();

      const query = `
        INSERT INTO list_buy (
          id_list_buy, 
          id_product, 
          qt_product, 
          dt_list_buy,
          at_updated,
          at_delete,
          st_sync
        ) VALUES (?, ?, ?, ?, ?, NULL, 1);
      `;
      await db.runAsync(query, [
        generatedId,
        item.id_product,
        item.qt_product,
        item.dt_list_buy,
        nowIso,
      ]);
      console.log(`[BuyListRepository] ✅ Item ${generatedId} inserido na lista.`);
    } catch (error: any) {
      throw new Error(`Erro ao inserir item na lista de compras: ${error.message}`);
    }
  }

  // Atualizar a quantidade de um item existente marcando at_updated e st_sync = 1
  async update(id_list_buy: string, qt_product: number): Promise<void> {
    try {
      const db = await getActiveDatabase();
      const nowIso = new Date().toISOString();

      const query = `
        UPDATE list_buy 
        SET qt_product = ?, 
            at_updated = ?, 
            st_sync = 1 
        WHERE id_list_buy = ?;
      `;
      await db.runAsync(query, [qt_product, nowIso, id_list_buy]);
      console.log(`[BuyListRepository] ✏️ Item ${id_list_buy} atualizado.`);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar quantidade na lista: ${error.message}`);
    }
  }

  // Soft delete de um item específico da lista
  async delete(id_list_buy: string): Promise<void> {
    try {
      const db = await getActiveDatabase();
      const nowIso = new Date().toISOString();

      const query = `
        UPDATE list_buy 
        SET at_delete = ?, 
            at_updated = ?, 
            st_sync = 2 
        WHERE id_list_buy = ?;
      `;
      await db.runAsync(query, [nowIso, nowIso, id_list_buy]);
      console.log(`[BuyListRepository] 🗑️ Soft delete no item ${id_list_buy}.`);
    } catch (error: any) {
      throw new Error(`Erro ao remover item da lista: ${error.message}`);
    }
  }

  // Limpeza via Soft Delete de toda a lista de compras
  async clearList(): Promise<void> {
    try {
      const db = await getActiveDatabase();
      const nowIso = new Date().toISOString();

      const query = `
        UPDATE list_buy 
        SET at_delete = ?, 
            at_updated = ?, 
            st_sync = 2 
        WHERE at_delete IS NULL;
      `;
      await db.runAsync(query, [nowIso, nowIso]);
      console.log(`[BuyListRepository] 🧹 Soft delete aplicado em toda a lista.`);
    } catch (error: any) {
      throw new Error(`Erro ao limpar a lista de compras: ${error.message}`);
    }
  }
}