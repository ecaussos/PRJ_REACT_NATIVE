// src/data/repositories/buyRepository.ts

import * as Crypto from 'expo-crypto';
import { getActiveDatabase } from '../../core/database/database';
import { ProductSearchResult } from '../../features/buy/buy.types';
import {
  BuyEntity,
  BuyWithProductEntity,
  CreateBuyDTO,
  CreateBuyHistDTO,
} from '../entities/buy.entity';
import { IBuyRepository } from '../interfaces/buy.repository.interfaces';

export { IBuyRepository };

export class BuyRepository implements IBuyRepository {

  // Implementação delegando para a busca completa com produtos/grupos
  async findAll(): Promise<BuyWithProductEntity[]> {
    return this.findAllWithProduct();
  }

  // Buscar todos os itens ativos da compra (com dados do produto e grupo via LEFT JOIN)
  async findAllWithProduct(): Promise<BuyWithProductEntity[]> {
    try {
      const db = await getActiveDatabase();
      const query = `
        SELECT 
          b.id_product, 
          b.qt_product,
          b.vl_product, 
          b.dt_list_buy,
          b.at_updated,
          b.at_delete,
          b.st_sync,
          p.nm_product,
          p.cd_product_gtin,
          p.id_group,
          g.nm_group
        FROM buy b
        INNER JOIN product p ON b.id_product = p.id_product
        LEFT JOIN group_product g ON p.id_group = g.id_group
        WHERE b.at_delete IS NULL AND p.at_delete IS NULL
        ORDER BY g.nm_group ASC, p.nm_product ASC;
      `;
      const result = await db.getAllAsync<BuyWithProductEntity>(query);
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
          p.id_product, 
          p.nm_product, 
          p.cd_product_gtin,
          g.nm_group
        FROM product p
        LEFT JOIN group_product g ON p.id_group = g.id_group
        WHERE p.cd_product_gtin = ? AND p.at_delete IS NULL;
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
  async findByProductId(id_product: string): Promise<BuyEntity | null> {
    try {
      const db = await getActiveDatabase();
      const query = `SELECT * FROM buy WHERE id_product = ? AND at_delete IS NULL;`;
      const result = await db.getFirstAsync<BuyEntity>(query, [id_product]);
      return result || null;
    } catch (error: any) {
      throw new Error(`Erro ao buscar produto na lista: ${error.message}`);
    }
  }

  // Adicionar um novo item à compra definindo at_updated e st_sync = 1
  async create(item: CreateBuyDTO): Promise<void> {
    try {
      const db = await getActiveDatabase();
      const nowIso = new Date().toISOString();

      const query = `
        INSERT INTO buy (
          id_product, 
          qt_product, 
          vl_product, 
          dt_list_buy,
          at_updated,
          at_delete,
          st_sync
        ) VALUES (?, ?, ?, ?, ?, NULL, 1);
      `;
      
      const vlProduct = item.vl_product ?? 0;
      const dtListBuy = item.dt_list_buy ?? nowIso;

      await db.runAsync(query, [
        item.id_product,
        item.qt_product,
        vlProduct,
        dtListBuy,
        nowIso,
      ]);
      console.log(`[BuyRepository] ✅ Item cadastrado na compra: ${item.id_product}`);
    } catch (error: any) {
      throw new Error(`Erro ao inserir item na compra: ${error.message}`);
    }
  }

  // Atualizar a quantidade e o valor de um item existente marcando at_updated e st_sync = 1
  async update(id_product: string, qt_product: number, vl_product: number): Promise<void> {
    try {
      const db = await getActiveDatabase();
      const nowIso = new Date().toISOString();

      const query = `
        UPDATE buy 
        SET qt_product = ?, 
            vl_product = ?, 
            at_updated = ?, 
            st_sync = 1 
        WHERE id_product = ?;
      `;
      await db.runAsync(query, [qt_product, vl_product, nowIso, id_product]);
      console.log(`[BuyRepository] ✏️ Item ${id_product} atualizado na compra.`);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar quantidade ou valor na compra: ${error.message}`);
    }
  }

  // Soft delete de um item específico da compra
  async delete(id_product: string): Promise<void> {
    try {
      const db = await getActiveDatabase();
      const nowIso = new Date().toISOString();

      const query = `
        UPDATE buy 
        SET at_delete = ?, 
            at_updated = ?, 
            st_sync = 2 
        WHERE id_product = ?;
      `;
      await db.runAsync(query, [nowIso, nowIso, id_product]);
      console.log(`[BuyRepository] 🗑️ Soft delete aplicado ao produto ${id_product} na compra.`);
    } catch (error: any) {
      throw new Error(`Erro ao remover item da compra: ${error.message}`);
    }
  }

  // Soft delete de um item específico da lista de compra em aberto (list_buy)
  async deleteBuyList(id_product: string): Promise<void> {
    try {
      const db = await getActiveDatabase();
      const nowIso = new Date().toISOString();

      const query = `
        UPDATE list_buy 
        SET at_delete = ?, 
            at_updated = ?, 
            st_sync = 2 
        WHERE id_product = ?;
      `;
      await db.runAsync(query, [nowIso, nowIso, id_product]);
      console.log(`[BuyRepository] 🗑️ Soft delete aplicado ao produto ${id_product} na list_buy.`);
    } catch (error: any) {
      throw new Error(`Erro ao remover item da lista de compra: ${error.message}`);
    }
  }

  // Limpeza via Soft Delete de toda a tabela de compras
  async clearBuy(): Promise<void> {
    try {
      const db = await getActiveDatabase();
      const nowIso = new Date().toISOString();

      const query = `
        UPDATE buy 
        SET at_delete = ?, 
            at_updated = ?, 
            st_sync = 2 
        WHERE at_delete IS NULL;
      `;
      await db.runAsync(query, [nowIso, nowIso]);
      console.log(`[BuyRepository] 🧹 Soft delete aplicado em todas as compras ativas.`);
    } catch (error: any) {
      throw new Error(`Erro ao limpar a compra: ${error.message}`);
    }
  }

  // Inserção no histórico de compra (hist_buy) com colunas de sincronização
  async createBuyHist(item: CreateBuyHistDTO): Promise<void> {
    try {
      const db = await getActiveDatabase();
      const createId = Crypto.randomUUID();
      const generatedId = createId.substring(0, 8);
      const nowIso = new Date().toISOString();

      const query = `
        INSERT INTO hist_buy (
          id_hist_buy,
          id_product,
          id_supplier,
          qt_product,
          vl_product,
          dt_list_buy,
          dt_hist_buy,
          at_updated,
          at_delete,
          st_sync
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, 1);
      `;

      await db.runAsync(query, [
        generatedId,
        item.id_product,
        item.id_supplier,
        item.qt_product,
        item.vl_product,
        item.dt_list_buy,
        item.dt_hist_buy,
        nowIso,
      ]);
      console.log(`[BuyRepository] ✅ Registro de histórico ${generatedId} criado.`);
    } catch (error: any) {
      throw new Error(`Erro ao inserir histórico da compra: ${error.message}`);
    }
  }
}