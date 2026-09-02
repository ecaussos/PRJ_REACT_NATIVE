// src/features/groupProduct/groupProduct.model.ts
import { GroupProductEntity } from '../../data/entities/groupProductEntity';
import { GroupProductRepository } from '../../data/repositories/groupProductRepository';

// Instância do repositório para interagir diretamente com as operações do banco de dados
const repository = new GroupProductRepository();

export const GroupProductModel = {
  // Retorna todos os registros cadastrados no banco
  async fetchAll(): Promise<GroupProductEntity[]> {
    return await repository.findAll();
  },

  // Cria o registro no banco de dados
  async create(nm_group: string): Promise<void> {
    // Valida se o campo está preenchido
    if (!nm_group.trim()) {
      throw new Error('O nome do grupo não pode estar vazio.');
    }
    // Persiste no banco de dados
    await repository.create({
      nm_group: nm_group.trim(),
    });
  },

// Atualiza o registro no banco de dados - Utilizando o ID
  async update(id_group: number, nm_group: string): Promise<void> {
    // Valida que o id não está entre 1 e 7 (Bloqueado)  
    if (id_group <= 7) {
      throw new Error('Não é permitido alterar os grupos padrão do sistema.');
    }
    // Valida se o campo está preenchido
    if (!nm_group.trim()) {
      throw new Error('O nome do grupo não pode estar vazio.');
    }
    // Persiste no banco de dados
    await repository.update(id_group, {
      nm_group: nm_group.trim(),
    });
  },

  //Deleta o registro no banco de dados - Utilizando o ID
  async delete(id_group: number): Promise<void> {
    // Valida que o id não está entre 1 e 7 (Bloqueado)  
    if (id_group <= 7) {
      throw new Error('Não é permitido excluir os grupos padrão do sistema.');
    }
    // Persiste no banco de dados
    await repository.delete(id_group);
  },
};