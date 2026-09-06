// src/data/repositories/supplierRepository.ts
import { getDBConnection } from '../../core/database/sqliteclient';
import {
  CreateSupplierDTO,
  SupplierEntity,
  UpdateSupplierDTO
} from '../entities/supplierEntity';

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

  // Realizar o cadastro do fornecedor usando o DTO de criação
  async create(supplier: CreateSupplierDTO): Promise<void> {
    const db = await getDBConnection();
    const query = `
      INSERT INTO supplier (nm_supplier)
      VALUES (?);
    `;
    await db.runAsync(query, [supplier.nm_supplier]);
  }

  // Editar o cadastro do fornecedor usando o DTO de atualização
  async update(id_supplier: number, supplier: UpdateSupplierDTO): Promise<void> {
    const db = await getDBConnection();
    const query = `UPDATE supplier SET nm_supplier = ? WHERE id_supplier = ?;`;
    await db.runAsync(query, [supplier.nm_supplier, id_supplier]);
  }

  // Excluir o cadastro do fornecedor pelo ID
  async delete(id_supplier: number): Promise<void> {
    const db = await getDBConnection();
    const query = `DELETE FROM supplier WHERE id_supplier = ?;`;
    await db.runAsync(query, [id_supplier]);
  }
}