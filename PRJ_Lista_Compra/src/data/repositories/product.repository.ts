// src/data/repositories/product.repository.ts
import { getDBConnection } from '../../core/database/sqliteclient';
import {
  CreateProductDTO,
  ProductEntity,
  ProductWithGroupEntity,
  UpdateProductDTO,
} from '../entities/product.entity';
import { IProductRepository } from '../interfaces/product.repository.interface';

export class ProductRepository implements IProductRepository {
  
  // Listar todos os produtos cadastrados (ordenados por nome)// Retorna a lista completa de produtos ordenados por nome com o nome do grupo via LEFT JOIN
  async findAll(): Promise<ProductWithGroupEntity[]> {
    try {
      const db = await getDBConnection();
      const query = `
        SELECT 
          p.id_product, 
          p.nm_product, 
          p.id_group, 
          p.cd_product_gtin,
          g.nm_group 
        FROM product p
        LEFT JOIN group_product g ON p.id_group = g.id_group
        ORDER BY p.nm_product ASC;
      `;
      return await db.getAllAsync<ProductWithGroupEntity>(query);
    } catch (error) {
      throw new Error(`Erro ao listar produtos: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Busca um produto pelo seu identificador único (ID)
  async findById(id_product: number): Promise<ProductEntity | null> {
    try {
      const db = await getDBConnection();
      const query = `SELECT * FROM product WHERE id_product = ?;`;
      const result = await db.getFirstAsync<ProductEntity>(query, [id_product]);
      return result || null;
    } catch (error) {
      throw new Error(`Erro ao buscar produto por ID: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Busca um produto cadastrado com base em seu código de barras (GTIN)
  async findByBarcode(gtin: string): Promise<ProductEntity | null> {
    try {
      const db = await getDBConnection();
      const query = `SELECT * FROM product WHERE cd_product_gtin = ?;`;
      const result = await db.getFirstAsync<ProductEntity>(query, [gtin.trim()]);
      return result || null;
    } catch (error) {
      throw new Error(`Erro ao buscar produto por código de barras: ${error instanceof Error ? error.message : error}`);
    }
  }
  
  // Realiza busca de produto pelo nome - Utilizado na pesquisa
  async findByName(nameQuery: string): Promise<Pick<ProductEntity, 'id_product' | 'nm_product'>[]> {
    try {
      const db = await getDBConnection();
      const query = `
        SELECT 
          id_product, 
          nm_product 
        FROM product 
        WHERE nm_product LIKE ?
        ORDER BY nm_product ASC;
      `;
      return await db.getAllAsync<Pick<ProductEntity, 'id_product' | 'nm_product'>>(query, [`%${nameQuery.trim()}%`]);
    } catch (error) {
      throw new Error(`Erro ao buscar produtos por nome: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Realizar o cadastro do fornecedor usando o DTO de criação
  async create(product: CreateProductDTO): Promise<void> {
    try {
      const db = await getDBConnection();
      const query = `
        INSERT INTO product (nm_product, id_group, cd_product_gtin)
        VALUES (?, ?, ?);
      `;
      await db.runAsync(query, [
        product.nm_product.trim(),
        product.id_group,
        product.cd_product_gtin?.trim() || null,
      ]);
    } catch (error) {
      throw new Error(`Erro ao cadastrar produto: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Editar o cadastro do produto usando o DTO de atualização
  async update(id_product: number, product: UpdateProductDTO): Promise<void> {
    try {
      const db = await getDBConnection();
      const query = `
        UPDATE product 
        SET nm_product = ?, id_group = ?, cd_product_gtin = ? 
        WHERE id_product = ?;
      `;
      await db.runAsync(query, [
        product.nm_product.trim(), 
        product.id_group, 
        product.cd_product_gtin?.trim() || null, 
        id_product,
      ]);
    } catch (error) {
      throw new Error(`Erro ao atualizar produto: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Excluir o cadastro do produto pelo ID
  async delete(id_product: number): Promise<void> {
    try {
      const db = await getDBConnection();
      await db.runAsync('DELETE FROM product WHERE id_product = ?;', [id_product]);
    } catch (err) {
      throw new Error(`Erro ao remover produto: ${err instanceof Error ? err.message : err}`);
    }
  }
}