// src/data/repositories/product.repository.ts

import * as Crypto from 'expo-crypto';
import { getActiveDatabase } from '../../core/database/database';
import {
  CreateProductDTO,
  GroupOption,
  ProductEntity,
  ProductWithGroupEntity,
  UpdateProductDTO,
} from '../entities/product.entity';
import { IProductRepository } from '../interfaces/product.repository.interface';

export class ProductRepository implements IProductRepository {

  // Retorna a lista completa de produtos ativos ordenados por nome com o nome do grupo via LEFT JOIN
  async findAll(): Promise<ProductWithGroupEntity[]> {
    try {
      const db = await getActiveDatabase();
      const query = `
        SELECT 
          p.id_product, 
          p.nm_product, 
          p.id_group, 
          p.cd_product_gtin,
          p.at_updated,
          p.at_delete,
          p.st_sync,
          g.nm_group 
        FROM product p
        LEFT JOIN group_product g ON p.id_group = g.id_group
        WHERE p.at_delete IS NULL
        ORDER BY p.nm_product ASC;
      `;
      return await db.getAllAsync<ProductWithGroupEntity>(query);
    } catch (error) {
      throw new Error(`Erro ao listar produtos: ${error instanceof Error ? error.message : error}`);
    }
  }

  async findByBarcode(cd_product_gtin: string): Promise<ProductEntity | null> {
    try {
      // Previne NullPointerException validando se o código foi informado
      if (!cd_product_gtin || !cd_product_gtin.trim()) {
        console.warn('[ProductRepository] ⚠️ Código de barras não informado ou nulo.');
        return null;
      }

      const db = await getActiveDatabase();
      const query = `
        SELECT 
          id_product, 
          nm_product, 
          cd_product_gtin,
          id_group,
          at_updated,
          at_delete,
          st_sync
        FROM product
        WHERE cd_product_gtin = ? AND at_delete IS NULL;
      `;
      const result = await db.getFirstAsync<ProductEntity>(query, [cd_product_gtin.trim()]);
      return result || null;
    } catch (error: any) {
      throw new Error(`Erro ao buscar por código: ${error.message}`);
    }
  }

  async findByName(nm_product: string): Promise<ProductEntity[]> {
    try {
      // Previne NullPointerException validando a string de busca
      if (!nm_product || !nm_product.trim()) {
        console.warn('[ProductRepository] ⚠️ Nome do produto não informado para busca.');
        return [];
      }

      const db = await getActiveDatabase();
      const query = `
        SELECT 
          p.id_product, 
          p.nm_product,
          p.cd_product_gtin,
          p.id_group,
          p.at_updated,
          p.at_delete,
          p.st_sync,
          g.nm_group
        FROM product p
        LEFT JOIN group_product g ON p.id_group = g.id_group
        WHERE p.nm_product LIKE ? AND p.at_delete IS NULL
        ORDER BY p.nm_product ASC;
      `;
      const searchName = `%${nm_product.trim()}%`;
      return await db.getAllAsync<ProductEntity>(query, [searchName]);
    } catch (error: any) {
      throw new Error(`Erro ao buscar por nome: ${error.message}`);
    }
  }

  // Busca um produto ativo no banco pelo nome exato (case-insensitive)
  async findByNameExact(name: string): Promise<ProductEntity | null> {
    try {
      if (!name || !name.trim()) {
        return null;
      }

      const db = await getActiveDatabase();

      const row = await db.getFirstAsync<ProductEntity>(
        `SELECT id_product, nm_product, id_group, cd_product_gtin, at_updated, at_delete, st_sync
        FROM product 
        WHERE LOWER(nm_product) = LOWER(?) AND at_delete IS NULL;`,
        [name.trim()]
      );

      return row || null;
    } catch (error) {
      console.error('[ProductRepository] ❌ Erro ao buscar produto por nome exato:', error);
      throw error;
    }
  }

  // Busca um produto ativo pelo seu identificador único (ID)
  async findById(id_product: string): Promise<ProductEntity | null> {
    try {
      if (!id_product) return null;

      const db = await getActiveDatabase();
      const query = `SELECT * FROM product WHERE id_product = ? AND at_delete IS NULL;`;
      const result = await db.getFirstAsync<ProductEntity>(query, [id_product]);
      return result || null;
    } catch (error) {
      throw new Error(`Erro ao buscar produto por ID: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Busca a lista de grupos para preenchimento de select/picker (grupos não deletados)
  async findGroupProduct(): Promise<GroupOption[]> {
    try {
      const db = await getActiveDatabase();
      const query = `
        SELECT id_group, nm_group 
        FROM group_product 
        WHERE at_delete IS NULL
        ORDER BY nm_group ASC;
      `;
      return await db.getAllAsync<GroupOption>(query);
    } catch (error) {
      throw new Error(`Erro ao buscar grupos de produtos: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Realiza o cadastro do produto usando o DTO de criação
  async create(product: CreateProductDTO): Promise<ProductEntity> {
    try {
      const db = await getActiveDatabase();
      const createId = Crypto.randomUUID();
      const generatedId = createId.substring(0, 8);
      const nowIso = new Date().toISOString();

      const query = `
        INSERT INTO product (
          id_product,
          nm_product,
          cd_product_gtin,
          id_group,
          at_updated, 
          at_delete, 
          st_sync
        ) VALUES (?, ?, ?, ?, ?, NULL, 1);
      `;

      await db.runAsync(query, [
        generatedId, 
        product.nm_product?.trim() || '',
        product.cd_product_gtin?.trim() || null,
        product.id_group,
        nowIso,
      ]);

      console.log(`[ProductRepository] ✅ Produto cadastrado com UUID: ${generatedId}`);

      return {
        id_product: generatedId,
        nm_product: product.nm_product,
        cd_product_gtin: product.cd_product_gtin,
        id_group: product.id_group,
        at_updated: nowIso,
        at_delete: null,
        st_sync: 1,
      };
    } catch (error) {
      throw new Error(`Erro ao cadastrar produto: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Editar o cadastro do produto atualizando at_updated e st_sync = 1
  async update(id_product: string, product: UpdateProductDTO): Promise<void> {
    try {
      const db = await getActiveDatabase();
      const nowIso = new Date().toISOString();

      const query = `
        UPDATE product 
        SET nm_product = ?, 
            cd_product_gtin = ?, 
            id_group = ?,
            at_updated = ?,
            st_sync = 1
        WHERE id_product = ?;
      `;
      await db.runAsync(query, [
        product.nm_product?.trim() || '', 
        product.cd_product_gtin?.trim() || null, 
        product.id_group, 
        nowIso,
        id_product,
      ]);
      console.log(`[ProductRepository] ✏️ Produto ${id_product} atualizado.`);
    } catch (error) {
      throw new Error(`Erro ao atualizar produto: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Excluir o cadastro do produto via Soft Delete
  async delete(id_product: string): Promise<void> {
    try {
      const db = await getActiveDatabase();
      const nowIso = new Date().toISOString();

      const query = `
        UPDATE product 
        SET at_delete = ?, 
            at_updated = ?, 
            st_sync = 2 
        WHERE id_product = ?;
      `;
      await db.runAsync(query, [nowIso, nowIso, id_product]);
      console.log(`[ProductRepository] 🗑️ Soft delete aplicado ao produto ${id_product}.`);
    } catch (error) {
      throw new Error(`Erro ao remover produto: ${error instanceof Error ? error.message : error}`);
    }
  }
}