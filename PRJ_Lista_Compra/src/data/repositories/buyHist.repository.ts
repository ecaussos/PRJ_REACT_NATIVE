// src/features/buyHist/buyHist.repository.ts
import { getDBConnection } from '../../core/database/sqliteclient';
import { BuyHistWithEntity } from '../entities/buyHist.entity';

export class BuyHistRepository {
  // Consulta todos os registros de histórico realizando JOINs para obter nomes de produto, grupo e fornecedor
  async findAll(): Promise<BuyHistWithEntity[]> {
    try {
    const db = await getDBConnection();
    const query = `
      SELECT 
        hb.id_hist_buy,
        hb.id_product,
        hb.qt_product,
        hb.vl_product,
        hb.id_supplier,
        hb.dt_hist_buy,
        p.nm_product,
        gp.nm_group,
        sup.nm_supplier
      FROM hist_buy hb
      INNER JOIN product p ON hb.id_product = p.id_product
      LEFT JOIN group_product gp ON p.id_group = gp.id_group
      LEFT JOIN supplier sup ON hb.id_supplier = sup.id_supplier
      ORDER BY hb.dt_hist_buy DESC, hb.id_hist_buy DESC;
    `;
      const result = await db.getAllAsync<BuyHistWithEntity>(query);
      return result;
    } catch (error: any) {
      throw new Error(`Erro ao buscar itens da lista de compras: ${error.message}`);
    }
  }

  // Atualizar a quantidade e o valor de um item existente
  async update(id_hist_buy: number, id_product: number, qt_product: number, vl_product: number, id_supplier: number): Promise<void> {
    try {
      const db = await getDBConnection();
      const query = `UPDATE hist_buy SET id_product = ?, qt_product = ?, vl_product = ?, id_supplier = ? WHERE id_hist_buy = ?;`;
      await db.runAsync(query, [id_product, qt_product, vl_product, id_supplier, id_hist_buy]);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar quantidade ou valor na compra: ${error.message}`);
    }
  }

  // Remover um item específico da compra
  async delete(id_hist_buy: number): Promise<void> {
    try {
      const db = await getDBConnection();
      const query = `DELETE FROM hist_buy WHERE id_hist_buy = ?;`;
      await db.runAsync(query, [id_hist_buy]);
    } catch (error: any) {
      throw new Error(`Erro ao remover item da compra: ${error.message}`);
    }
  }
}
