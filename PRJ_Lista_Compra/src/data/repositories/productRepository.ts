// src/data/repositories/productRepository.ts
import { getDBConnection } from '../../core/database/sqliteclient';
import { ProductEntity } from '../entities/productEntity';

export class ProductRepository {

  // Buscar produto pelo ID
  async findById(id_product: number): Promise<ProductEntity | null> {
    const db = await getDBConnection();
    const query = `SELECT * FROM product WHERE id_product = ?;`;
    const result = await db.getFirstAsync<ProductEntity>(query, [id_product]);
    return result || null;
  }

  // Listar todos os produtos cadastrados
  async findAll(): Promise<any[]> {
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
    const result = await db.getAllAsync(query);
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
  async findByName(nameQuery: string): Promise<any[]> {
    const db = await getDBConnection();
    const query = `
      SELECT 
        id_product, 
        nm_product 
      FROM product 
      WHERE nm_product LIKE ?
      ORDER BY nm_product ASC;
    `;
    const result = await db.getAllAsync(query, [`%${nameQuery}%`]);
    return result;
  }


  // Cadastrar um novo produto
  async create(product: Omit<ProductEntity, 'id_product'>): Promise<void> {
    const db = await getDBConnection();
    const query = `
      INSERT INTO product (nm_product, id_group, cd_product_gtin)
      VALUES (?, ?, ?);
    `;
    await db.runAsync(query, [
      product.nm_product,
      product.id_group,
      product.cd_product_gtin
    ]);
  }

  // Editar o cadastro do produto
  async update(id: number, data: { nm_product: string; id_group: number; cd_product_gtin: string }) {
    const db = await getDBConnection();
    await db.runAsync(
      'UPDATE product SET nm_product = ?, id_group = ?, cd_product_gtin = ? WHERE id_product = ?;',
      [data.nm_product, data.id_group, data.cd_product_gtin, id]
    );
  }

  // Excluir o cadastro do produto
  async delete(id: number) {
    const db = await getDBConnection();
    await db.runAsync('DELETE FROM product WHERE id_product = ?;', [id]);
  }
}