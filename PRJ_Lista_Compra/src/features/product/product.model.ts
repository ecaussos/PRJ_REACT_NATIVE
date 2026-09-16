// src/features/product/product.model.ts
import { ProductEntity } from '../../data/entities/product.entity'; // Importa a entidade base de Produto
import { IProductRepository } from '../../data/interfaces/product.repository.interface'; // Importa a interface do repositório
import { ProductRepository } from '../../data/repositories/product.repository'; // Importa a implementação concreta do repositório
import { GroupOption, ProductIntent, ProductSearchResult } from './product.types'; // Importa os tipos e opções de intenção

// Contrato/Interface da Model de Produto
export interface IProductModel {
  fetchAll(): Promise<ProductEntity[]>;                                                                               // Assinatura para listar todos
  findByNameExact(name: string): Promise<ProductEntity | null>;                                                       // Assinatura para busca exata por nome
  findByBarcode(gtin: string): Promise<ProductEntity | null>;                                                         // Assinatura para busca por código de barras
  checkBarcode(gtin: string): Promise<ProductEntity | null>;                                                          // Assinatura alias para código de barras
  findByName(query: string): Promise<ProductSearchResult[]>;                                                          // Assinatura para busca parcial por nome
  fetchGroupOptions(): Promise<GroupOption[]>;                                                                        // Assinatura para listar grupos
  create(nm_product: string, cd_product_gtin: string, id_group: number): Promise<ProductEntity>;                      // Assinatura para criação
  update(id_product: number, data: { nm_product: string; cd_product_gtin: string; id_group: number }): Promise<void>; // Assinatura para atualização
  delete(id_product: number): Promise<void>;                                                                          // Assinatura para remoção
}

export class ProductModel implements IProductModel {
  // Recebe o repositório por contrato (interface), facilitando testes e inversão de controle
  constructor(private repository: IProductRepository) {} // Define a dependência por interface no construtor
  
  // Função para buscar todos os registros sem filtro
  async fetchAll(): Promise<ProductEntity[]> {
    return await this.repository.findAll(); // Executa a busca no repositório
  }

  // Função para buscar os registros ao digitar na caixa de texto (parcial-Like)
  async findByName(query: string): Promise<ProductSearchResult[]> {
    return await this.repository.findByName(query); // Executa a busca no repositório
  }


  // Função para buscar os registros filtrando pelo nome (Exato)
  async findByNameExact(name: string): Promise<ProductEntity | null> {
    const cleanName = name.trim();                           // Remove os espaços extras do início e fim da string
    if (!cleanName) return null;                             // Retorna nulo se a busca for vazia após a limpeza
    return await this.repository.findByNameExact(cleanName); // Executa a busca no repositório
  }

  // Função para buscar os registros filtrando pelo código GTIN 
  async findByBarcode(gtin: string): Promise<ProductEntity | null> {
    const cleanGtin = gtin.trim();                          // Remove os espaços extras do início e fim da string 
    if (!cleanGtin) return null;                            // Retorna nulo se a busca for vazia após a limpeza
    return await this.repository.findByBarcode(cleanGtin);  // Executa a busca no repositório
  }

  // Alias para manter compatibilidade com chamadas antigas ao checkBarcode
  async checkBarcode(gtin: string): Promise<ProductEntity | null> {
    return await this.findByBarcode(gtin); // Executa a busca no repositório
  }

  // Função para buscar grupo de produto para a lista de seleção
  async fetchGroupOptions(): Promise<GroupOption[]> {
    return await this.repository.findGroupProduct(); // Executa a busca no repositório
  }

  // Função para criar registro e valida antes de salvar no repositório
  async create(nm_product: string, cd_product_gtin: string, id_group: number): Promise<ProductEntity> {  
    // Remove os espaços extras do início e fim da string
    const cleanName = nm_product.trim();                      // Limpa string do nome
    const cleanGtin = cd_product_gtin.trim();                  // Limpa string do código de barras
    // Valida se não existe dado preenchido - NOME
    if (!cleanName) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('O nome do registro não pode estar vazio.');
    }
    // Valida se não existe dado preenchido - GTIN
    if (!cleanGtin) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('O código de barras não pode estar vazio.');
    }
    // Valida se não existe dado preenchido - ID GROUP
    if (!id_group) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('Selecione um grupo para o registro.');
    }
    // Chama a função para verificar se já existe um registro idêntico no repositório
    const [existingName, existingGtin] = await Promise.all([                      // Assíncronas paralelas
      // Chama as funções de busca
      this.findByNameExact(cleanName),                        // Busca por nome exato
      this.findByBarcode(cleanGtin)                           // Busca por código de barras
    ]);
    // Valida se existe registro idêntico - NOME
    if (existingName) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error(`Já existe um registro cadastrado com este nome: "${cleanName}"`); 
    }
    // Valida se existe registro idêntico - GTIN
    if (existingGtin) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error(`Já existe outro registro cadastrado com este Código: "${cleanGtin}".`);
    }
    // Executa a persistência do registro no repositório
    return await this.repository.create({
      nm_product: cleanName,      // Campo nome
      cd_product_gtin: cleanGtin, // Campo código de barra
      id_group,                   // Campo ID grupo
    });
  }

  // Função para atualizar e validar antes de salvar no repositório
  async update(id_product: number, data: { nm_product: string; cd_product_gtin: string; id_group: number }): Promise<void> {
    // Remove os espaços extras do início e fim da string
    const cleanName = data.nm_product.trim();                 // Limpa string do nome
    const cleanGtin = data.cd_product_gtin.trim();            // Limpa string do código de barras
    // Valida se não existe dado preenchido - NOME
    if (!cleanName) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('O nome do produto não pode estar vazio.');
    }
    // Valida se não existe dado preenchido - GTIN
    if (!cleanGtin) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('O código de barras não pode estar vazio.');
    }
    // Valida se não existe dado preenchido - ID GROUP
    if (!data.id_group) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('Selecione um grupo para o produto.');
    }
    // Chama a função para verificar se já existe um registro idêntico no repositório
    const [existingName, existingGtin] = await Promise.all([                      // Assíncronas paralelas
      // Chama as funções de busca
      this.findByNameExact(cleanName),                        // Busca por nome exato
      this.findByBarcode(cleanGtin)                           // Busca por código de barras
    ]);
    // Valida se existe registro idêntico - NOME
    if (existingName && existingName.id_product !== id_product) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error(`Já existe um registro cadastrado com este nome: "${cleanName}"`); 
    }
    // Valida se existe registro idêntico - GTIN
    if (existingGtin && existingGtin.id_product !== id_product) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error(`Já existe outro registro cadastrado com este Código: "${cleanGtin}".`);
    }
    // Executa a alteração do registro no repositório
    return await this.repository.update(id_product, {        // Mantém a chamada de atualização
      nm_product: cleanName,      // Campo nome
      cd_product_gtin: cleanGtin, // Campo código de barra
      id_group: data.id_group,    // Campo ID grupo
    });
  }

  // Função para deletar o registro utilizando o ID
  async delete(id_product: number): Promise<void> {
    // Executa a exclusão do registro no repositório
    await this.repository.delete(id_product);
  }

  // Regra de negócio: Valida se o campo foi preenchido corretamente
  static isValid(name: string, barcode: string, groupId: string | number): boolean {
    const validName = name.trim().length > 0;       // Remove o espaço e verifica se o tamanho é maior que 0
    const validBarCode = barcode.trim().length > 0; // Remove o espaço e verifica se o tamanho é maior que 0        
    const validGroup = Number(groupId) > 0;         // Verifica se o valor é maior que 0

    return validName && validBarCode && validGroup; // Retorna true se todos os campos forem válidos
  }

  // Regra de negócio: Constrói a intenção (Intent) para Salvar/Editar - Fábrica de ações (Action Factory)
  static buildSaveAction(
    name: string,             // Valor do campo de texto com o nome do registro
    barcode: string,          // Valor do campo de texto com o código de barra do registro
    groupId: string | number, // Valor do campo de texto/número com o grupo do registro
    isEditing: boolean,       // Indica se o modal é de edição (true) ou novo cadastro (false)
    editingId: number | null  // Indica se há ou não um valor (ID)
  ): ProductIntent {
    // Remove os espaços extras do início e fim da string
    const cleanName = name.trim();                             // Limpa espaços do nome
    const cleanBarcode = barcode.trim();                       // Limpa espaços do código de barras
    // Converte o tipo da variável para número
    const convetGroupId = Number(groupId);                     // Converte a propriedade grupo
    // Verificar se o valor é true e diferente de null - SE Edição=True OU SE houver um ID 
    if (isEditing && editingId !== null) {
      // Verdadeiro: Identifica que é uma edição
      return {
        type: 'UPDATE' as const,         // Define o type utilizado no hook
        payload: {                       // Dados necessários para atualizar o registro
          id_product: editingId,         // Atribui o id recebido
          nm_product: cleanName,         // Atribui o nome recebido
          cd_product_gtin: cleanBarcode, // Atribui código de barra recebido
          id_group: convetGroupId,       // Atribui o grupo recebido
        },
      };
    }
    // Falso: Identifica que é uma criação
    return {
      type: 'CREATE' as const,         // Define o type utilizado no hook
      payload: {                       // Dados necessários para criar o registro
        nm_product: cleanName,         // Atribui o nome recebido
        cd_product_gtin: cleanBarcode, // Atribui código de barra recebido
        id_group: convetGroupId,       // Atribui o grupo recebido
      },
    };
  }
}

// Instância padrão injetando o repositório concreto fora da classe
export const ProductModelInstance = new ProductModel(new ProductRepository()); // Cria a instância padrão com o repositório real