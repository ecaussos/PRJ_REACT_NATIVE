// src/features/buyHist/buyHist.repository.ts

import { getActiveDatabase } from '../../core/database/database';
import { BuyHistWithEntity, SupplierOption } from '../entities/buyHist.entity';

export class BuyHistRepository {
  // Consulta todos os registros ativos do histórico realizando JOINs para obter nomes de produto, grupo e fornecedor
  async findAll(): Promise<BuyHistWithEntity[]> {
    try {
      const db = await getActiveDatabase();
      const query = `
        SELECT 
          hb.id_hist_buy,
          hb.id_product,
          hb.qt_product,
          hb.vl_product,
          hb.id_supplier,
          hb.dt_hist_buy,
          hb.at_updated,
          hb.at_delete,
          hb.st_sync,
          p.nm_product,
          gp.nm_group,
          sup.nm_supplier
        FROM hist_buy hb
        INNER JOIN product p ON hb.id_product = p.id_product
        LEFT JOIN group_product gp ON p.id_group = gp.id_group
        LEFT JOIN supplier sup ON hb.id_supplier = sup.id_supplier
        WHERE hb.at_delete IS NULL AND p.at_delete IS NULL
        ORDER BY hb.dt_hist_buy DESC, hb.id_hist_buy DESC;
      `;
      const result = await db.getAllAsync<BuyHistWithEntity>(query);
      return result || [];
    } catch (error: any) {
      throw new Error(`Erro ao buscar histórico de compras: ${error.message}`);
    }
  }

  // Busca lista de fornecedores ativos para seleção no formulário de histórico
  async findSupplier(): Promise<SupplierOption[]> {
    try {
      const db = await getActiveDatabase();
      const query = `
        SELECT 
          id_supplier,
          nm_supplier
        FROM supplier
        WHERE at_delete IS NULL
        ORDER BY nm_supplier ASC;
      `;
      const result = await db.getAllAsync<SupplierOption>(query);
      console.log("=== [SQL LOG] FORNECEDORES NO BANCO ===", JSON.stringify(result, null, 2));
      return result || [];
    } catch (error: any) {
      throw new Error(`Erro ao buscar fornecedores da compra: ${error.message}`);
    }
  }

  // Atualizar a quantidade, valor, produto e fornecedor de um registro do histórico marcando at_updated e st_sync = 1
  async update(
    id_hist_buy: string,
    id_product: string | number,
    qt_product: number,
    vl_product: number,
    id_supplier: string | number
  ): Promise<void> {
    try {
      const db = await getActiveDatabase();
      const nowIso = new Date().toISOString();

      const query = `
        UPDATE hist_buy 
        SET id_product = ?, 
            qt_product = ?, 
            vl_product = ?, 
            id_supplier = ?,
            at_updated = ?,
            st_sync = 1
        WHERE id_hist_buy = ?;
      `;
      await db.runAsync(query, [id_product, qt_product, vl_product, id_supplier, nowIso, id_hist_buy]);
      console.log(`[BuyHistRepository] ✏️ Item ${id_hist_buy} do histórico atualizado.`);
    } catch (error: any) {
      throw new Error(`Erro ao atualizar item do histórico de compra: ${error.message}`);
    }
  }

  // Realiza Soft Delete de um item do histórico pelo ID
  async delete(id_hist_buy: string): Promise<void> {
    try {
      const db = await getActiveDatabase();
      const nowIso = new Date().toISOString();

      const query = `
        UPDATE hist_buy 
        SET at_delete = ?, 
            at_updated = ?, 
            st_sync = 2 
        WHERE id_hist_buy = ?;
      `;
      await db.runAsync(query, [nowIso, nowIso, id_hist_buy]);
      console.log(`[BuyHistRepository] 🗑️ Soft delete no item ${id_hist_buy} do histórico.`);
    } catch (error: any) {
      throw new Error(`Erro ao remover item do histórico de compra: ${error.message}`);
    }
  }
}