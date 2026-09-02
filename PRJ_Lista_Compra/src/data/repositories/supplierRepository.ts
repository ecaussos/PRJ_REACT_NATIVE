// src/data/repositories/supplierRepository.ts
import { getDBConnection } from '../../core/database/sqliteclient';
import { SupplierEntity } from '../entities/supplierEntity';

export class SupplierRepository {

  // Listar todos os fornecedores cadastrados (ordenados por nome)
  async findAll(): Promise<SupplierEntity[]> {
    const db = await getDBConnection();
    const query = `SELECT * FROM supplier ORDER BY nm_supplier ASC;`;
    const result = await db.getAllAsync<SupplierEntity>(query);
    return result;
  }

  // Buscar fornecedor por ID
  async findById(id_supplier: number): Promise<SupplierEntity | null> {
    const db = await getDBConnection();
    const query = `SELECT * FROM supplier WHERE id_supplier = ?;`;
    const result = await db.getFirstAsync<SupplierEntity>(query, [id_supplier]);
    return result || null;
  }

  // Realizar o cadastro do fornecedor
  async create(supplier: Omit<SupplierEntity, 'id_supplier'>): Promise<void> {
    const db = await getDBConnection();
    const query = `
      INSERT INTO supplier (nm_supplier)
      VALUES (?);
    `;
    await db.runAsync(query, [supplier.nm_supplier]);
  }

  // Editar o cadastro do fornecedor (Corrigido com WHERE)
  async update(id: number, data: { nm_supplier: string }) {
    const db = await getDBConnection();
    await db.runAsync(
      'UPDATE supplier SET nm_supplier = ? WHERE id_supplier = ?;',
      [data.nm_supplier, id]
    );
  }

  // Excluir o cadastro do fornecedor (Corrigido para id_supplier)
  async delete(id: number) {
    const db = await getDBConnection();
    await db.runAsync('DELETE FROM supplier WHERE id_supplier = ?;', [id]);
  }
}