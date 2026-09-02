// src/data/repositories/buyHistRepository.ts
import { getDBConnection } from '../../core/database/sqliteclient';
import { BuyHistEntity, BuyHistWithDetailsEntity } from '../entities/buyHistEntity';

export class BuyHistRepository {

  // Inserir um registro no histórico de compras (ao finalizar uma compra com ou sem lista)
  async create(hist: BuyHistEntity): Promise<void> {
    const db = await getDBConnection();
    const query = `
      INSERT INTO hist_buy (id_hist_buy, id_supplier, id_product, vl_product, qt_product, dt_list_buy, dt_hist_buy)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    await db.runAsync(query, [
      hist.id_hist_buy,
      hist.id_supplier,
      hist.id_product,
      hist.vl_product,
      hist.qt_product,
      hist.dt_list_buy,
      hist.dt_hist_buy
    ]);
  }

  // Buscar todo o histórico de compras ordenado do mais recente para o mais antigo, com JOIN em produtos e fornecedores
  async findAllWithDetails(): Promise<BuyHistWithDetailsEntity[]> {
    const db = await getDBConnection();
    const query = `
      SELECT 
        h.id_hist_buy,
        h.id_supplier,
        h.id_product,
        h.vl_product,
        h.qt_product,
        h.dt_list_buy,
        h.dt_hist_buy,
        p.nm_product,
        s.nm_supplier
      FROM hist_buy h
      INNER JOIN product p ON h.id_product = p.id_product
      LEFT JOIN supplier s ON h.id_supplier = s.id_supplier
      ORDER BY h.dt_hist_buy DESC;
    `;
    const result = await db.getAllAsync<BuyHistWithDetailsEntity>(query);
    return result;
  }

  // Buscar um registro específico de histórico pelo ID
  async findById(id_hist_buy: string): Promise<BuyHistEntity | null> {
    const db = await getDBConnection();
    const query = `SELECT * FROM hist_buy WHERE id_hist_buy = ?;`;
    const result = await db.getFirstAsync<BuyHistEntity>(query, [id_hist_buy]);
    return result || null;
  }
}