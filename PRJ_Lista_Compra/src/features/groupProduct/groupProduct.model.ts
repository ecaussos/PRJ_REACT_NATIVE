// src/features/groupProduct/groupProduct.model.ts
import { GroupProductEntity } from '../../data/entities/groupProduct.entity';
import { IGroupProductRepository } from '../../data/interfaces/groupProduct.repository.interface';
import { GroupProductRepository } from '../../data/repositories/groupProduct.repository';
import { GroupProductIntent } from './groupProduct.types';

export class GroupProductModel {
  // Instância do repositório injetada no construtor permitindo inversão de dependência e testes unitários
  constructor(
    private repository: IGroupProductRepository = new GroupProductRepository()
  ) {}

  // Retorna todos os registros cadastrados no banco
  async fetchAll(): Promise<GroupProductEntity[]> {
    return await this.repository.findAll();
  }

  // Verifica se já existe um registro associado o nome
  async findByNameExact(name: string): Promise<GroupProductEntity | null> {
    if (!name.trim()) return null;
    return await this.repository.findByNameExact(name.trim());
  }

  // Busca parcial por nome para auto-complete
  async findByName(query: string) {
    return await this.repository.findByName(query);
  }

  // Valida e cadastra um novo fornecedo no sistema
  async create(nm_group: string): Promise<GroupProductEntity> {
    const cleanName = nm_group.trim();
    // Valida se o campo está preenchido
    if (!cleanName) {
      throw new Error('O nome do grupo não pode estar vazio.');
    }
    // Regra de negócio: impede duplicidade de nome
    const existing = await this.findByNameExact(cleanName);
    if (existing) {
      throw new Error (`Já existe outro grupo cadastrado com este nome: "${cleanName}"`);
    }
    // Persiste no banco de dados
    return await this.repository.create({
      nm_group: cleanName,
    });
  }

  // Atualiza o registro no banco de dados - Utilizando o ID
  async update(id_group: number, data: {nm_group: string}): Promise<void> {
    const cleanName = data.nm_group.trim();
    // Valida que o id não está entre 1 e 7 (Bloqueado)
    if (id_group <= 7) {
      throw new Error ('Não é permitido alterar os grupos padrão do sistema.');
    }
    // Valida se o campo está preenchido
    if (!cleanName) {
      throw new Error ('O nome do grupo não pode estar vazio.');
    }
    // Regra de negócio: impede duplicação de nome com outro produto cadastrado
    const existing = await this.findByNameExact(cleanName);
    // Valida para ver se o ID é diferente
    if (existing && existing.id_group !== id_group) {
      throw new Error (`Já existe outro grupo cadastrado com este nome: "${cleanName}"`);
    }    
    // Persiste no banco de dados
    await this.repository.update(id_group, {
      nm_group: cleanName,
    });
  }

  // Deleta o registro no banco de dados - Utilizando o ID
  async delete(id_group: number): Promise<void> {
    // Valida que o id não está entre 1 e 7 (Bloqueado)
    if (id_group <= 7) {
      throw new Error('Não é permitido excluir os grupos padrão do sistema.');
    }
    // Persiste no banco de dados
    await this.repository.delete(id_group);
  }

  // Regra de Negócio: Valida se os dados foram preenchidos nos campos
  static isValid(name: string): boolean {
    const hasValidName = name.trim().length > 0;
    return hasValidName;
  }

  // Rega de negócio: Monta a Action (Intent) indicando a ação do payload - Create/Update
  static buildSaveAction(
    name: string, 
    isEditing: boolean, 
    editingId: number | null
  ): GroupProductIntent {
    const cleanName = name.trim();
    // Se houver um ID em edição, despacha a ação de atualização
    if (isEditing && editingId !== null) {
      return {
        type: 'UPDATE',
        payload: {
          id_group: editingId,
          nm_group: cleanName
        },
      };
    }
    // Caso contrário, despacha a ação de criação de um novo registro
    return {
      type: 'CREATE',
      payload: { nm_group: cleanName },
    };
  }

}

// Instância pronta para uso na aplicação (singleton)
export const groupProductModelInstance = new GroupProductModel();