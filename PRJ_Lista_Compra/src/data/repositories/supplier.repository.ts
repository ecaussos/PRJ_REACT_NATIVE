// src/data/repositories/supplierRepository.ts
import { getDBConnection } from '../../core/database/sqliteclient';
import {
  CreateSupplierDTO,
  SupplierEntity,
  UpdateSupplierDTO,
} from '../entities/supplier.entity';
import { ISupplierRepository } from '../interfaces/supplier.repository.interface';

export class SupplierRepository implements ISupplierRepository {

  // Listar todos os fornecedores cadastrados (ordenados por nome)
  async findAll(): Promise<SupplierEntity[]> {
    try {
      const db = await getDBConnection();
      const query = `SELECT * FROM supplier ORDER BY nm_supplier ASC;`;
      const result = await db.getAllAsync<SupplierEntity>(query);
      return result;
    } catch (error) {
      throw new Error(`Erro ao buscar fornecedores: ${(error as Error).message}`);
    }
  }

  // Busca um fornecedor pelo seu identificador único (ID)
  async findById(id_supplier: number): Promise<SupplierEntity | null> {
    try {
      const db = await getDBConnection();
      const query = `SELECT * FROM supplier WHERE id_supplier = ?;`;
      const result = await db.getFirstAsync<SupplierEntity>(query, [id_supplier]);
      return result || null;
    } catch (error) {
      throw new Error(`Erro ao buscar fornecedor por ID: ${(error as Error).message}`);
    }
  }

  // Realiza busca de fornecedor pelo nome Exato/completo
  async findByNameExact(name: string): Promise<SupplierEntity | null>{
  try {
    const db = await getDBConnection();
    const query = `SELECT * FROM supplier WHERE LOWER(nm_supplier) = LOWER(?)`;
    const result = await db.getFirstAsync<SupplierEntity>(query, [name.trim()]);
       // Retorna o primeiro registro se encontrar, ou null
    return result || null;
  } catch (error) {
    throw new Error(`Erro ao buscar fornecedor por nome exato: ${error instanceof Error ? error.message : error}`);
  }
}

  // Realiza busca de fornecedor ao digitar nome - Utilizado na pesquisa
  async findByName(nameQuery: string): Promise<Pick<SupplierEntity, 'id_supplier' | 'nm_supplier'>[]> {
    try {
      const db = await getDBConnection();
      const query = `
        SELECT 
          id_supplier,
          nm_supplier
        FROM supplier
        WHERE nm_supplier like ?
        ORDER BY nm_supplier ASC;
      `;
      return await db.getAllAsync<Pick<SupplierEntity, 'id_supplier'| 'nm_supplier'>>(query, [`%${nameQuery.trim()}%`]);
    } catch (error) {
      throw new Error(`Erro ao buscar produtos por nome: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Realizar o cadastro do fornecedor usando o DTO de criação
  async create(supplier: CreateSupplierDTO): Promise<SupplierEntity> {
    try {
      const db = await getDBConnection();
      const query = `INSERT INTO supplier (nm_supplier) VALUES (?);`;
      const result = await db.runAsync(query, [supplier.nm_supplier]);
      return {
        id_supplier: result.lastInsertRowId,
        nm_supplier: supplier.nm_supplier,
      };
    } catch (error) {
      throw new Error(`Erro ao cadastrar fornecedor: ${(error as Error).message}`);
    }
  }

  // Editar o cadastro do fornecedor usando o DTO de atualização
  async update(id_supplier: number, supplier: UpdateSupplierDTO): Promise<void> {
    try {
      const db = await getDBConnection();
      const query = `UPDATE supplier SET nm_supplier = ? WHERE id_supplier = ?;`;
      await db.runAsync(query, [supplier.nm_supplier, id_supplier]);
    } catch (error) {
      throw new Error(`Erro ao atualizar fornecedor: ${(error as Error).message}`);
    }
  }

  // Excluir o cadastro do fornecedor pelo ID
  async delete(id_supplier: number): Promise<void> {
    try {
      const db = await getDBConnection();
      const query = `DELETE FROM supplier WHERE id_supplier = ?;`;
      await db.runAsync(query, [id_supplier]);
    } catch (error) {
      throw new Error(`Erro ao deletar fornecedor: ${(error as Error).message}`);
    }
  }
}