// src/data/repositories/supplierRepository.ts

import * as Crypto from 'expo-crypto';
import { getActiveDatabase } from '../../core/database/database';
import {
  CreateSupplierDTO,
  SupplierEntity,
  UpdateSupplierDTO,
} from '../entities/supplier.entity';
import { ISupplierRepository } from '../interfaces/supplier.repository.interface';

export class SupplierRepository implements ISupplierRepository {

  // Listar todos os fornecedores ativos (não deletados), ordenados por nome
  async findAll(): Promise<SupplierEntity[]> {
    try {
      const db = await getActiveDatabase();
      const query = `
        SELECT id_supplier, nm_supplier, at_updated, at_delete, st_sync 
        FROM supplier 
        WHERE at_delete IS NULL 
        ORDER BY nm_supplier ASC;
      `;
      
      console.log('[SupplierRepository] 🔍 Executando busca de fornecedores ativos...');
      const result = await db.getAllAsync<SupplierEntity>(query);
      
      console.log(`[SupplierRepository] 📊 Encontrados: ${result ? result.length : 0} registro(s).`);
      return result || [];
    } catch (error) {
      console.error('[SupplierRepository] ❌ Erro detalhado ao buscar fornecedores:', error);
      throw new Error(`Erro ao buscar fornecedores: ${(error as Error).message}`);
    }
  }

  // Busca um fornecedor ativo pelo seu identificador único (ID)
  async findById(id_supplier: string): Promise<SupplierEntity | null> {
    try {
      const db = await getActiveDatabase();
      const query = `SELECT * FROM supplier WHERE id_supplier = ? AND at_delete IS NULL;`;
      const result = await db.getFirstAsync<SupplierEntity>(query, [id_supplier]);
      return result || null;
    } catch (error) {
      throw new Error(`Erro ao buscar fornecedor por ID: ${(error as Error).message}`);
    }
  }

  // Realiza busca de fornecedor ativo pelo nome exato/completo
  async findByNameExact(name: string): Promise<SupplierEntity | null> {
    try {
      const db = await getActiveDatabase();
      const query = `SELECT * FROM supplier WHERE LOWER(nm_supplier) = LOWER(?) AND at_delete IS NULL;`;
      const result = await db.getFirstAsync<SupplierEntity>(query, [name.trim()]);
      return result || null;
    } catch (error) {
      throw new Error(`Erro ao buscar fornecedor por nome exato: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Realiza busca de fornecedores ativos ao digitar o nome
  async findByName(nameQuery: string): Promise<Pick<SupplierEntity, 'id_supplier' | 'nm_supplier'>[]> {
    try {
      const db = await getActiveDatabase();
      const query = `
        SELECT 
          id_supplier,
          nm_supplier
        FROM supplier
        WHERE nm_supplier LIKE ? AND at_delete IS NULL
        ORDER BY nm_supplier ASC;
      `;
      return await db.getAllAsync<Pick<SupplierEntity, 'id_supplier' | 'nm_supplier'>>(query, [`%${nameQuery.trim()}%`]);
    } catch (error) {
      throw new Error(`Erro ao buscar fornecedores por nome: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Cadastra o fornecedor definindo at_updated e pendência de sync (st_sync = 1)
  async create(supplier: CreateSupplierDTO): Promise<SupplierEntity> {
    try {
      const db = await getActiveDatabase();
      const createId = Crypto.randomUUID();
      const generatedId = createId.substring(0, 8);
      const nowIso = new Date().toISOString();

      const query = `
        INSERT INTO supplier (
          id_supplier, 
          nm_supplier, 
          at_updated, 
          at_delete, 
          st_sync
        ) VALUES (?, ?, ?, NULL, 1);
      `;

      await db.runAsync(query, [generatedId, supplier.nm_supplier, nowIso]);

      console.log(`[SupplierRepository] ✅ Fornecedor cadastrado com UUID: ${generatedId}`);

      return {
        id_supplier: generatedId,
        nm_supplier: supplier.nm_supplier,
        at_updated: nowIso,
        at_delete: null,
        st_sync: 1,
      };
    } catch (error) {
      throw new Error(`Erro ao cadastrar fornecedor: ${(error as Error).message}`);
    }
  }

  // Atualiza o fornecedor ajustando at_updated e marcando st_sync = 1
  async update(id_supplier: string, supplier: UpdateSupplierDTO): Promise<void> {
    try {
      const db = await getActiveDatabase();
      const nowIso = new Date().toISOString();

      const query = `
        UPDATE supplier 
        SET nm_supplier = ?, 
            at_updated = ?, 
            st_sync = 1 
        WHERE id_supplier = ?;
      `;

      await db.runAsync(query, [supplier.nm_supplier, nowIso, id_supplier]);
      console.log(`[SupplierRepository] ✏️ Fornecedor ${id_supplier} atualizado.`);
    } catch (error) {
      throw new Error(`Erro ao atualizar fornecedor: ${(error as Error).message}`);
    }
  }

  // Realiza Soft Delete marcando at_delete, at_updated e st_sync = 2
  async delete(id_supplier: string): Promise<void> {
    try {
      const db = await getActiveDatabase();
      const nowIso = new Date().toISOString();

      const query = `
        UPDATE supplier 
        SET at_delete = ?, 
            at_updated = ?, 
            st_sync = 2 
        WHERE id_supplier = ?;
      `;

      await db.runAsync(query, [nowIso, nowIso, id_supplier]);
      console.log(`[SupplierRepository] 🗑️ Soft delete aplicado ao fornecedor ${id_supplier}.`);
    } catch (error) {
      throw new Error(`Erro ao deletar fornecedor: ${(error as Error).message}`);
    }
  }
}