// src/data/repositories/product.repository.ts
import { getDBConnection } from '../../core/database/sqliteclient';
import {
  CreateProductDTO,
  GroupOption,
  ProductEntity,
  ProductWithGroupEntity,
  UpdateProductDTO,
} from '../entities/product.entity';
import { IProductRepository } from '../interfaces/product.repository.interface';

export class ProductRepository implements IProductRepository {
  // Retorna a lista completa de produtos ordenados por nome com o nome do grupo via LEFT JOIN
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
  
  // Realiza busca de produto pelo nome exacto/completo (insensível a maiúsculas/minúsculas)
  async findByNameExact(name: string): Promise<ProductEntity | null> {
    try {
      const db = await getDBConnection();
      const query = `SELECT * FROM product WHERE LOWER(nm_product) = LOWER(?);`;
      const result = await db.getFirstAsync<ProductEntity>(query, [name.trim()]);
      return result || null;
    } catch (error) {
      throw new Error(`Erro ao buscar produto por nome exato: ${error instanceof Error ? error.message : error}`);
    }
  }
  
  // Realiza busca parcial de produto pelo nome
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

  // Busca a lista de grupos para preenchimento de select/picker
  async findGroupProduct(): Promise<GroupOption[]> {
    try {
      const db = await getDBConnection();
      const query = `
        SELECT id_group, nm_group 
        FROM group_product 
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
      const db = await getDBConnection();

      const query = `
        INSERT INTO product (nm_product, cd_product_gtin, id_group)
        VALUES (?, ?, ?);
      `;

      const result = await db.runAsync(query, [
        product.nm_product,
        product.cd_product_gtin || null,
        product.id_group,

      ]);

      return {
        id_product: result.lastInsertRowId,
        nm_product: product.nm_product,
        cd_product_gtin: product.cd_product_gtin,
        id_group: product.id_group,
      };
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
        SET nm_product = ?, cd_product_gtin = ?, id_group = ?
        WHERE id_product = ?;
      `;
      await db.runAsync(query, [
        product.nm_product.trim(), 
        product.cd_product_gtin?.trim() || null, 
        product.id_group, 
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
    } catch (error) {
      throw new Error(`Erro ao remover produto: ${error instanceof Error ? error.message : error}`);
    }
  }
}