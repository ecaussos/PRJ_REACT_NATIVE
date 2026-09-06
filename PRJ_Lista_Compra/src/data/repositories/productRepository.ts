// src/data/repositories/productRepository.ts
import { getDBConnection } from '../../core/database/sqliteclient';
import {
  CreateProductDTO,
  ProductEntity,
  ProductWithGroupEntity,
  UpdateProductDTO
} from '../entities/productEntity';

export class ProductRepository {

  // Buscar produto pelo ID
  async findById(id_product: number): Promise<ProductEntity | null> {
    const db = await getDBConnection();
    const query = `SELECT * FROM product WHERE id_product = ?;`;
    const result = await db.getFirstAsync<ProductEntity>(query, [id_product]);
    return result || null;
  }

  // Listar todos os produtos cadastrados com os nomes dos grupos (JOIN)
  async findAll(): Promise<ProductWithGroupEntity[]> {
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
    const result = await db.getAllAsync<ProductWithGroupEntity>(query);
    console.log('--- DADOS DA TABELA PRODUCT ---', JSON.stringify(result, null, 2));
    return result;
  }

  // Buscar produto pelo código de barras (GTIN)
  async findByBarcode(gtin: string): Promise<ProductEntity | null> {
    const db = await getDBConnection();
    const query = `SELECT * FROM product WHERE cd_product_gtin = ?;`;
    const result = await db.getFirstAsync<ProductEntity>(query, [gtin]);
    return result || null;
  }

  // Buscar produtos pelo nome (com LIKE para busca parcial)
  async findByName(nameQuery: string): Promise<Pick<ProductEntity, 'id_product' | 'nm_product'>[]> {
    const db = await getDBConnection();
    const query = `
      SELECT 
        id_product, 
        nm_product 
      FROM product 
      WHERE nm_product LIKE ?
      ORDER BY nm_product ASC;
    `;
    return await db.getAllAsync<Pick<ProductEntity, 'id_product' | 'nm_product'>>(query, [`%${nameQuery}%`]);
  }

  // Cadastrar um novo produto usando o DTO de criação
  async create(product: CreateProductDTO): Promise<void> {
    const db = await getDBConnection();
    const query = `
      INSERT INTO product (nm_product, id_group, cd_product_gtin)
      VALUES (?, ?, ?);
    `;
    await db.runAsync(query, [
      product.nm_product,
      product.id_group,
      product.cd_product_gtin ?? null // Evita undefined no SQLite
    ]);
  }

  // Editar o cadastro do produto usando o DTO de atualização
  async update(id_product: number, product: UpdateProductDTO): Promise<void> {
    const db = await getDBConnection();
    const query = `
      UPDATE product 
      SET nm_product = ?, id_group = ?, cd_product_gtin = ? 
      WHERE id_product = ?;
    `;
    await db.runAsync(query, [
      product.nm_product, 
      product.id_group, 
      product.cd_product_gtin ?? null, 
      id_product
    ]);
  }

  // Excluir o cadastro do produto pelo ID
  async delete(id_product: number): Promise<void> {
    const db = await getDBConnection();
    await db.runAsync('DELETE FROM product WHERE id_product = ?;', [id_product]);
  }
}