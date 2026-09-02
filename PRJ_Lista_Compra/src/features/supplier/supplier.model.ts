// src/features/supplier/supplier.model.ts
import { SupplierEntity } from '../../data/entities/supplierEntity';
import { SupplierRepository } from '../../data/repositories/supplierRepository';

// Instância do repositório para interagir diretamente com as operações do banco de dados
const repository = new SupplierRepository();

export const SupplierModel = {
  // Retorna todos os registros cadastrados no banco
  async fetchAll(): Promise<SupplierEntity[]> {
    return await repository.findAll();
  },

  // Cria o registro no banco de dados
  async create(nm_supplier: string): Promise<void> {
    // Valida se o campo está preenchido
    if (!nm_supplier.trim()) {
      throw new Error('O nome do fornecedor não pode estar vazio.');
    }
    // Persiste no banco de dados
    await repository.create({
      nm_supplier: nm_supplier.trim(),
    });
  },

  //Atualiza o registro no banco de dados - Utilizando o ID
  async update(id_supplier: number, nm_supplier: string): Promise<void> {
    // Persiste no banco de dados
    if (!nm_supplier.trim()){
      throw new Error('O nome do fornecedor não pode estar vazio.');
    }
    // Persiste no banco de dados
    await repository.update(id_supplier, {
      nm_supplier: nm_supplier.trim(),
    });
  },

  //Deleta o registro no banco de dados - Utilizando o ID
  async delete(id_supplier: number): Promise<void> {
    // Persiste no banco de dados
    await repository.delete(id_supplier);
  }
};