// src/features/buyList/buyList.model.ts
import { BuyListItemWithProductEntity } from '../../data/entities/buyList.entity';
import { IBuyListRepository } from '../../data/interfaces/buyList.repository.interfaces';
import { BuyListRepository } from '../../data/repositories/buyList.repository';
import { BuyListIntent, ProductSearchResult } from './buyList.types';

// Contrato/Interface da Model
export interface IBuyListModel {
  fetchAll(): Promise<BuyListItemWithProductEntity[]>;            // Busca todos os itens da lista de compras
  fetchByName(name: string): Promise<ProductSearchResult[]>;      // Busca produtos cadastrados filtrando pelo nome
  fetchByBarcode(barcode: string): Promise<ProductSearchResult>;  // Busca produto cadastrado pelo código de barras
  searchProducts(query: string): Promise<ProductSearchResult[]>;  // Pesquisa genérica de produtos por termo
  create(id_product: number, qt_product: number): Promise<void>;  // Adiciona um produto à lista informando ID e quantidade
  createByBarcode(barcode: string): Promise<ProductSearchResult>; // Adiciona um produto diretamente pelo código de barras
  update(id_list_buy: number, qt_product: number): Promise<void>; // Atualiza a quantidade de um item na lista
  delete(id_list_buy: number): Promise<void>;                     // Remove um item específico da lista de compras
  clear(): Promise<void>;                                         // Remove todos os itens da lista de compras
}

export class BuyListModel implements IBuyListModel {
  // Recebe o repositório por contrato (interface), facilitando testes e inversão de controle
  constructor(private repository: IBuyListRepository) {} // Define a dependência por interface no construtor

  // Busca todos os registros com dados detalhados do produto (JOIN)
  async fetchAll(): Promise<BuyListItemWithProductEntity[]> {
    return await this.repository.findAllWithProduct();  // Executa a busca no repositório
  }

  // Busca produtos exclusivamente por nome (parcial com LIKE)
  async fetchByName(name: string): Promise<ProductSearchResult[]> {
    const cleanTerm = name.trim();                      // Remove os espaços extras do início e fim da string
    if (!cleanTerm) return [];                          // Retorna nulo se a busca for vazia após a limpeza
    return await this.repository.findByName(cleanTerm); // Executa a busca no repositório
  }

  // Busca produto por código de barras exato (Câmera/Scanner)
  async fetchByBarcode(barcode: string): Promise<ProductSearchResult> {
    // Remove os espaços extras do início e fim da string
    const cleanBarcode = barcode.trim();
    // Verifica se o campo está vazia
    if (!cleanBarcode) {          
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('Código de barras inválido ou não informado.');
    }
    // Executa a busca no repositório
    const results = await this.repository.findByBarcode(cleanBarcode);
    // Valida se o repositório não retornou nenhum registro
    if (!results) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('Registro não encontrado para este código de barras.');
    }
    // Retorna o primeio produto encontrado
    return results;
  }

  // Cria registro ou atualiza tuilizando o leitor código de barra - Câmera
  async createByBarcode(barcode: string): Promise<ProductSearchResult> {
    // Remove os espaços extras do início e fim da string
    const cleanBarcode = barcode.trim();
    // Verifica se o campo está vazia
    if (!cleanBarcode) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('Código de barras inválido.'); 
    }
    // Chama a função para busca por código de barras
    const product = await this.fetchByBarcode(cleanBarcode);
    // Executa a criação no  repositório
    await this.create(product.id_product, 1); // Adiciona o produto à lista com quantidade padrão igual a 1
    // Retorna o produto adicionado;
    return product;
  }

  // Alias mantido para a busca por nome acionada pelo Modal/Hook
  async searchProducts(product: string): Promise<ProductSearchResult[]> {
    const cleanProduct = product.trim();
    // Verifica se o campo está vazia
    if (!cleanProduct || cleanProduct.length < 2) {
      // Verdadeiro: Retorna vazio sem executar a busca no repositório
      return [];
    }
    // Executa a busca no repositório
    return await this.fetchByName(cleanProduct);
  }

  // Função para criar registro e valida antes de salvar no repositório
  async create(id_product: number, qt_product: number = 1): Promise<void> {
    // Valida se não existe dado preenchido e for menor que zero - ID
    if (!id_product || id_product <= 0) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('Selecione um produto válido.');
    }
    // Valida se não existe dado preenchido e for menor que zero - Quantidade
    if (!qt_product || qt_product <= 0) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('A quantidade deve ser um número maior que zero.');
    }
    // Executa a busca no repositório
    const existing = await this.repository.findByProductId(id_product);
    // Verificar se existe produto
    if (existing) {
      // Verdadeiro: Pega a quantidade do produto encontrado e soma + 1
      const newQty = existing.qt_product + qt_product;
      // Executa a atualização no repositório
      await this.repository.update(existing.id_list_buy, newQty);
      // Falso:
    } else {
      // Executa a criação no  repositório
      await this.repository.create({
        id_product,                            // ID do produto a ser inserido na lista
        qt_product,                            // Quantidade do produto selecionado
        dt_list_buy: new Date().toISOString(), // Data e hora atual do cadastro no formato ISO
      });
    }
  }

  // Atualiza a quantidade de um item existente na lista
  async update(id_list_buy: number, qt_product: number): Promise<void> {
    // Valida se não existe dado preenchido e for menor que zero - ID
    if (!id_list_buy || id_list_buy <= 0) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('Selecione um registro válido.');
    }
    // Valida se não existe dado preenchido e for menor que zero - Quantidade
    if (!qt_product || qt_product <= 0) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('A quantidade deve ser um número maior que zero.');
    }
    // Executa a criação no  repositório
    await this.repository.update(id_list_buy, qt_product);
  }

  // Remove um item da lista pelo seu ID
  async delete(id_list_buy: number): Promise<void> {
    // Valida se não existe dado preenchido e for menor que zero - ID    
    if (!id_list_buy || id_list_buy <= 0) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('Registro inválido para exclusão.');
    }
    // Executa a criação no  repositório
    await this.repository.delete(id_list_buy);
  }

  // Remove todos os registros da lista
  async clear(): Promise<void> {
    // Executa a criação no  repositório
    await this.repository.clearList();
  }

  // Regra de negócio: Valida dados de entrada
  static isValid(productId: number | string, quantity: number | string): boolean {
    const validProduct = Number(productId) > 0;
    const validQty = Number(quantity) > 0;
    return validProduct && validQty;
  }

  // Regra de negócio: Constrói a intenção (Intent) para Salvar/Editar - Fábrica de ações (Action Factory)
  static buildSaveAction(
    id_product: number | string,  // ID do produto ou do item da lista
    quantity: number | string,    // Valor do campo de texto com a quantidade informada
    isEditing: boolean,           // Indica se o modal é de edição (true) ou novo cadastro (false)
    editingId: number | null      // Indica se há ou não um valor (ID)
  ): BuyListIntent {
    const parsedId = Number(id_product);      // Converte o ID para número
    const parsedQuantity = Number(quantity);  // Converte a quantidade para número
    // Verificar se o valor é true e diferente de null - SE Edição=True OU SE houver um ID 
    if (isEditing && editingId !== null) {
      // Verdadeiro: Identifica que é uma edição
      return {
        type: 'UPDATE' as const,      // Define o type utilizado no hook
        payload: {                    // Dados necessários para atualizar o registro
          id_list_buy: parsedId,      // Atribui o id convertido
          qt_product: parsedQuantity, // Atribui a quantidade convertida
        },
      };
    }
    // Falso: Identifica que é uma criação
    return {
      type: 'CREATE' as const,      // Define o type utilizado no hook
      payload: {                    // Dados necessários para atualizar o registro
        id_product: parsedId,       // Atribui o id do produto convertido    
        qt_product: parsedQuantity, // Atribui a quantidade convertida
      },
    };
  }
}
// Instância padrão injetando o repositório concreto fora da classe
export const BuyListModelInstance = new BuyListModel(new BuyListRepository()); // Cria a instância padrão com o repositório real