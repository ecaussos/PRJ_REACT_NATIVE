// src/features/groupProduct/groupProduct.model.ts
import { GroupProductEntity } from '../../data/entities/groupProduct.entity';
import { IGroupProductRepository } from '../../data/interfaces/groupProduct.repository.interface';
import { GroupProductRepository } from '../../data/repositories/groupProduct.repository';
import { GroupProductIntent, GroupProductSearchResult } from './groupProduct.types';

// Contrato/Interface da Model de Grupo
export interface IGroupProductModel {
  fetchAll(): Promise<GroupProductEntity[]>;                            // Assinatura para listar todos
  findByNameExact(name: string): Promise<GroupProductEntity | null>;    // Assinatura para busca exata por nome
  findByName(query: string): Promise<GroupProductSearchResult[]>;       // Assinatura para busca parcial por nome
  create(nm_group: string): Promise<GroupProductEntity>;                // Assinatura para criação
  update(id_group: number, data: { nm_group: string }): Promise<void>;  // Assinatura para atualização
  delete(id_group: number): Promise<void>;                              // Assinatura para remoção
}

export class GroupProductModel {
  // Recebe o repositório por contrato (interface), facilitando testes e inversão de controle
  constructor(private repository: IGroupProductRepository) {} // Define a dependência por interface no construtor

  // Função para buscar todos os regittros sem filtro
  async fetchAll(): Promise<GroupProductEntity[]> {
    return await this.repository.findAll(); // Executa a busca no repositório
  }

  // Função para bucar os registro filtrando exatamente o que foi digitado
  async findByNameExact(name: string): Promise<GroupProductEntity | null> {
    const cleanName = name.trim();                           // Remove os espaços extras do início e fim da string
    if (!cleanName) return null;                             // Retorna nulo se a busca for vazia após a limpeza
    return await this.repository.findByNameExact(cleanName); // Executa a busca no repositório
  }

  // Função parar buscar os registro ao digitar na caixa de texto (parcial-Like)
  async findByName(query: string): Promise<GroupProductSearchResult[]> {
    return await this.repository.findByName(query);  // Executa a busca no repositório
  }

  // Função para criar registro e valida antes de salvar no repsitório
  async create(nm_group: string): Promise<GroupProductEntity> {  
    // Remove os espaços extras do início e fim da string
    const cleanName = nm_group.trim();
    // Valida se apos a limpeza se não existe dado preenchido
    if (!cleanName) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('O nome do fornecedor não pode estar vazio.');
    }
    // Chama a função para verificar se já existe um registro identico no repsitório
    const existing = await this.findByNameExact(cleanName); 
    // Valida se existe registro identico               
    if (existing) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error(`Já existe um fornecedor cadastrado com este nome: "${cleanName}"`); 
    }
    // Executa a criação do registro no respositório
    return await this.repository.create({
      nm_group: cleanName, // Envia o dados
    });
  }

  // Função para atualizar e validar antes de salvar no respositório
  async update(id_group: number, data: { nm_group: string }): Promise<void> {
    // Remove os espaços extras do início e fim da string
    const cleanName = data.nm_group.trim();
    // Valida que o id não está entre 1 e 7 (Bloqueado)
    if (GroupProductModel.isSystemDefault(id_group)) {
      // Verdadeiro: Gerar mensagem informativa      
      throw new Error('Não é permitido alterar os registros padrão do sistema.');
    }
    // Valida se apos a limpeza se não existe dado preenchido
    if (!cleanName) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('O nome do registro não pode estar vazio.');
    }
    // Chama a função para verificar se já existe um registro identico no repsitório
    const existing = await this.findByNameExact(cleanName);
    // Valida de se o registro existe e se o ID é diferente - ID identifica se o registro é diferente do que estamos alterando
    if (existing && existing.id_group !== id_group) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('Já existe outro registro cadastrado com este nome.');
    }
    // Executa a criação do registro no respositório
    await this.repository.update(id_group, {
      nm_group: cleanName,
    });
  }

  // Função para deletar o registro utilizando o ID
  async delete(id_group: number): Promise<void> {
    if (GroupProductModel.isSystemDefault(id_group)) {
      // Verdadeiro: Gerar mensagem informativa      
      throw new Error('Não é permitido alterar os registros padrão do sistema.');
    }
    // Executa a exclusão do registro no respositório
    await this.repository.delete(id_group);
  }

  // Regra de negócio: Valida se o campo foi é preenchido corretamente
  static isValid(name: string): boolean {
    // Remove o espaço e verifica se o tamanho é maior que 0
    return name.trim().length > 0;
  }

  // Regra de negócio: Valida se o registro pertence ao padrão do sistema (IDs 1 a 7)
  static isSystemDefault(id_group: number): boolean {
    return id_group <= 7;
  }

  // Regar de negócio: Constrói a intenção (Intent) para Salvar/Edita - Fábrica de ações (Action Factory)
  static buildSaveAction(
    name: string,             // Valor do campo de texto com o nome do registro
    isEditing: boolean,       // Indica se o modal é de edição (true) ou novo cadastro (false)
    editingId: number | null  // Indica se se há ou não um valor (ID)
  ): GroupProductIntent {
    // Remove os espaços extras do início e fim da string
    const cleanName = name.trim();
    // Verificar se o valor é true e diferente de null
    if (isEditing && editingId !== null) {
      // Verdadeiro: Identifica que é uma edição
      return {
        type: 'UPDATE' as const,  // Define o type utilizado o hook
        payload: {                // Dados necessários para atualizar o registro
          id_group: editingId, // Atribui o ID recebido
          nm_group: cleanName, // Atribui o NOME limpo
        },
      };
    }
    // Falso: Identifica que é uma criação
    return {
      type: 'CREATE' as const,  // Define o type utilizado o hook
      payload: {                // Dados necessários para atualizar o registro
        nm_group: cleanName, // Atribui o NOME limpo
      },
    };
  }
}

// Instância padrão injetando o repositório concreto fora da classe
export const groupProductModelInstance = new GroupProductModel(new GroupProductRepository()); // Cria a instância padrão com o repositório real