// src/features/supplier/supplier.model.ts
import { SupplierEntity } from '../../data/entities/supplier.entity';
import { ISupplierRepository } from '../../data/interfaces/supplier.repository.interface';
import { SupplierRepository } from '../../data/repositories/supplier.repository';
import { SupplierIntent } from './supplier.types';

export class SupplierModel {
  // Instância do repositório injetada no construtor permitindo inversão de dependência e testes unitários
  constructor(
    private repository: ISupplierRepository = new SupplierRepository()
  ) {}

  // Busca todos os fornecedore
  async fetchAll(): Promise<SupplierEntity[]> {
    return await this.repository.findAll();
  }

  // Verifica se já existe um registro associado o nome
  async findByNameExact(name: string): Promise<SupplierEntity | null> {
    if (!name.trim()) return null;
    return await this.repository.findByNameExact(name.trim());
  }

  // Busca parcial por nome para auto-complete
  async findByName(query: string) {
    return await this.repository.findByName(query);
  }

  // Valida e cadastra um novo fornecedo no sistema
  async create(nm_supplier: string): Promise<SupplierEntity> {
    const cleanName = nm_supplier.trim();
    // Valida se o campo está preenchido
    if (!cleanName) {
      //Verdadeira: Gera alerta informativo
      throw new Error('O nome do fornecedor não pode estar vazio.');
    }
    // Regra de negócio: impede duplicidade de nome
    const existing = await this.findByNameExact(cleanName);
    if (existing) {
      throw new Error (`Já existe um fornecedor cadastrado com este nome: "${cleanName}"`);
    }
    // Persiste no banco de dados
    return await this.repository.create({
      nm_supplier: cleanName,
    });
  }

  // Atualiza o registro no banco de dados - Utilizando o ID
  async update(id_supplier: number, data: {nm_supplier: string}): Promise<void> {
    const cleanName = data.nm_supplier.trim();

    if (!cleanName) {
      throw new Error('O nome do fornecedor não pode estar vazio.');
    }
    // Regra de negócio: impede duplicação de nome com outro fornecedos cadastrado
    const existing = await this.findByNameExact(cleanName);
    // Valida para ver se o ID é diferente
    if (existing && existing.id_supplier !== id_supplier) {
      throw new Error('Já existe outro fornecedor cadastrado com este Nome.');
    }
    // Persiste no banco de dados
    await this.repository.update(id_supplier, {
      nm_supplier: cleanName,
    });
  }

  // Deleta o registro no banco de dados - Utilizando o ID
  async delete(id_supplier: number): Promise<void> {
    // Persiste no banco de dados
    await this.repository.delete(id_supplier);
  }

  // Regra de negócio: Valida se os dados foram preenchidos nos campos
  static isValid(name: string): boolean {
    const hasValidName = name.trim().length > 0;
    return hasValidName;
  }

  // Regra de negócio: Monta a Action (Intent) indicando a ação do payload
  static buildSaveAction(
    name: string, 
    isEditing: boolean, 
    editingId: number | null
  ): SupplierIntent {
    const cleanName = name.trim();
    // Se houver um ID em edição, despacha a ação de atualização
    if (isEditing && editingId !== null) {
      return {
        type: 'UPDATE' as const,
        payload: {
          id_supplier: editingId,
          nm_supplier: cleanName
        },
      };
    }
    // Caso contrário, despacha a ação de criação de um novo registro
    return {
      type: 'CREATE' as const,
      payload: {
        nm_supplier: cleanName
      },
    };
  }

}
// Instância pronta para uso na aplicação (singleton)
export const SupplierModelInstance = new SupplierModel();