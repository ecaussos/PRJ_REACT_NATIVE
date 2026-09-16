// src/features/supplier/supplier.model.ts
import { SupplierEntity } from '../../data/entities/supplier.entity';
import { ISupplierRepository } from '../../data/interfaces/supplier.repository.interface';
import { SupplierRepository } from '../../data/repositories/supplier.repository';
import { SupplierIntent, SupplierSearchResult } from './supplier.types';

// Contrato/Interface da Model
export interface ISupplierModel {
  fetchAll(): Promise<SupplierEntity[]>;                                          // Assinatura para listar todos os fornecedores sem filtro
  findByNameExact(name: string): Promise<SupplierEntity | null>;                  // Assinatura para busca exata por nome
  findByName(query: string): Promise<SupplierSearchResult[]>;                     // Assinatura para busca parcial por nome (LIKE)
  create(nm_supplier: string): Promise<void>;                                     // Assinatura para validação e criação
  update(id_supplier: number, data: { nm_supplier: string }): Promise<void>;      // Assinatura para validação e atualização
  delete(id_supplier: number): Promise<void>;                                     // Assinatura para remoção pelo ID
}

export class SupplierModel {
  // Recebe o repositório por contrato (interface), facilitando testes e inversão de controle
  constructor(private repository: ISupplierRepository) {} // Define a dependência por interface no construtor

  // Função para buscar todos os regittros sem filtro
  async fetchAll(): Promise<SupplierEntity[]> {
    return await this.repository.findAll(); // Executa a busca no repositório
  }

  // Função para bucar os registro filtrando exatamente o que foi digitado
  async findByNameExact(name: string): Promise<SupplierEntity | null> {
    const cleanName = name.trim();                           // Remove os espaços extras do início e fim da string
    if (!cleanName) return null;                             // Retorna nulo se a busca for vazia após a limpeza
    return await this.repository.findByNameExact(cleanName); // Executa a busca no repositório
  }

  // Função parar buscar os registro ao digitar na caixa de texto (parcial-Like)
  async findByName(query: string): Promise<SupplierSearchResult[]> {
    return await this.repository.findByName(query);  // Executa a busca no repositório
  }

  // Função para criar registro e valida antes de salvar no repsitório
  async create(nm_supplier: string): Promise<SupplierEntity> {  
    // Remove os espaços extras do início e fim da string
    const cleanName = nm_supplier.trim();
    // Valida se não existe dado preenchido - NOME
    if (!cleanName) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('O nome do registro não pode estar vazio.');
    }
    // Chama a função para verificar se já existe um registro identico no repsitório
    const existing = await this.findByNameExact(cleanName); 
    // Valida se existe registro identico               
    if (existing) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error(`Já existe um registro cadastrado com este nome: "${cleanName}"`); 
    }
    // Executa a criação do registro no respositório
    return await this.repository.create({
      nm_supplier: cleanName, // Envia o dados
    });
  }

  // Função para atualizar e validar antes de salvar no respositório
  async update(id_supplier: number, data: { nm_supplier: string }): Promise<void> {
    // Remove os espaços extras do início e fim da string
    const cleanName = data.nm_supplier.trim();
    // Valida se não existe dado preenchido - NOME
    if (!cleanName) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('O nome do registro não pode estar vazio.');
    }
    // Chama a função para verificar se já existe um registro identico no repsitório
    const existing = await this.findByNameExact(cleanName);
    // Valida de se o registro existe e se o ID é diferente - ID identifica se o registro é diferente do que estamos alterando
    if (existing && existing.id_supplier !== id_supplier) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('Já existe outro registro cadastrado com este nome.');
    }
    // Executa a criação do registro no respositório
    await this.repository.update(id_supplier, {
      nm_supplier: cleanName,
    });
  }

  // Função para deletar o registro utilizando o ID
  async delete(id_supplier: number): Promise<void> {
    // Executa a exclusão do registro no respositório
    await this.repository.delete(id_supplier);
  }

  // Regra de negócio: Valida se o campo foi é preenchido corretamente
  static isValid(name: string): boolean {
    // Remove o espaço e verifica se o tamanho é maior que 0
    return name.trim().length > 0;

  }
  // Regar de negócio: Constrói a intenção (Intent) para Salvar/Edita - Fábrica de ações (Action Factory)
  static buildSaveAction(
    name: string,             // Valor do campo de texto com o nome do registro
    isEditing: boolean,       // Indica se o modal é de edição (true) ou novo cadastro (false)
    editingId: number | null  // Indica se se há ou não um valor (ID)
  ): SupplierIntent {
    // Remove os espaços extras do início e fim da string
    const cleanName = name.trim();
    // Verificar se o valor é true e diferente de null
    if (isEditing && editingId !== null) {
      // Verdadeiro: Identifica que é uma edição
      return {
        type: 'UPDATE' as const,  // Define o type utilizado o hook
        payload: {                // Dados necessários para atualizar o registro
          id_supplier: editingId, // Atribui o ID recebido
          nm_supplier: cleanName, // Atribui o NOME limpo
        },
      };
    }
    // Falso: Identifica que é uma criação
    return {
      type: 'CREATE' as const,  // Define o type utilizado o hook
      payload: {                // Dados necessários para atualizar o registro
        nm_supplier: cleanName, // Atribui o NOME limpo
      },
    };
  }
}

// Instância padrão injetando o repositório concreto fora da classe
export const SupplierModelInstance = new SupplierModel(new SupplierRepository()); // Cria a instância padrão com o repositório real