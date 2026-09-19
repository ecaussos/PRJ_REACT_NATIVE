// src/features/buy/buy.model.ts
import { BuyWithProductEntity } from '../../data/entities/buy.entity';
import { IBuyRepository } from '../../data/interfaces/buy.repository.interfaces';
import { BuyRepository } from '../../data/repositories/buy.repository';
import { BuyIntent, BuyItem, ProductSearchResult } from './buy.types';

// Contrato/Interface da Model
export interface IBuyModel {
  fetchAll(): Promise<BuyWithProductEntity[]>;                                          // Busca todos os itens da lista de compras
  fetchByName(name: string): Promise<ProductSearchResult[]>;                            // Busca produtos cadastrados filtrando pelo nome
  fetchByBarcode(barcode: string): Promise<ProductSearchResult>;                        // Busca produto cadastrado pelo código de barras
  searchProducts(query: string): Promise<ProductSearchResult[]>;                        // Pesquisa genérica de produtos por termo
  create(id_product: number, qt_product?: number, vl_product?: number): Promise<void>;  // Adiciona um produto à lista informando ID, quantidade e preço
  createByBarcode(barcode: string): Promise<ProductSearchResult>;                       // Adiciona um produto diretamente pelo código de barras
  update(id_product: number, qt_product: number, vl_product: number): Promise<void>;    // Atualiza a quantidade e valor de um item na lista
  delete(id_product: number): Promise<void>;                                            // Remove um item específico da compra
  deleteBuyList(id_product: number): Promise<void>;                                     // Remove um item específico da lista de compra
  deleteByProductId(id_product: number): Promise<void>;                                 // Remove um item específico da compra
  clear(): Promise<void>;                                                               // Remove todos os itens da lista de compras
}

export class BuyModel implements IBuyModel {
  // Recebe o repositório por contrato (interface), facilitando testes e inversão de controle
  constructor(private repository: IBuyRepository) {} // Define a dependência por interface no construtor
  
  async deleteBuyList(id_product: number): Promise<void> {
    if (!id_product || id_product <= 0) {
      throw new Error('ID do produto inválido para exclusão na lista.');
    }
    await this.repository.deleteBuyList(id_product);
  }

  deleteByProductId(id_product: number): Promise<void> {
    throw new Error('Method not implemented.');
  }

  // Busca todos os registros com dados detalhados do produto (JOIN)
  async fetchAll(): Promise<BuyWithProductEntity[]> {
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
    // Verifica se o campo está vazio
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
    // Retorna o primeiro produto encontrado
    return results;
  }

  async createByBarcode(barcode: string): Promise<ProductSearchResult> {
    // Remove os espaços extras do início e fim da string
    const cleanBarcode = barcode.trim();
    // Verifica se o campo está vazio
    if (!cleanBarcode) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('Código de barras inválido.'); 
    }
    // Chama a função para busca por código de barras
    const product = await this.fetchByBarcode(cleanBarcode);
    // Executa a criação no repositório
    await this.create(product.id_product, 1); // Adiciona o produto à lista com quantidade padrão igual a 1
    // Retorna o produto adicionado
    return product;
  }

  // Alias mantido para a busca por nome acionada pelo Modal/Hook
  async searchProducts(product: string): Promise<ProductSearchResult[]> {
    const cleanProduct = product.trim();
    // Verifica se o campo está vazio
    if (!cleanProduct || cleanProduct.length < 2) {
      // Verdadeiro: Retorna vazio sem executar a busca no repositório
      return [];
    }
    // Executa a busca no repositório
    return await this.fetchByName(cleanProduct);
  }

  // Função para criar registro e valida antes de salvar no repositório
  async create(id_product: number, qt_product: number = 1, vl_product: number = 0.00): Promise<void> {
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
    // Valida se não existe dado preenchido e for menor que zero - Preço
    if (vl_product === undefined || vl_product === null || vl_product < 0) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('O valor do produto não pode ser negativo.');
    }
    // Executa a busca no repositório
    const existing = await this.repository.findByProductId(id_product);
    // Verificar se existe produto
    if (existing) {
      // Verdadeiro: Pega a quantidade do produto encontrado e soma + 1
      const newQty = existing.qt_product + qt_product;
      // Executa a atualização no repositório
      await this.repository.update(existing.id_product, newQty, vl_product);
    } else {
      // Falso: Executa a criação no repositório
      await this.repository.create({
        id_product,                             // ID do produto a ser inserido na lista
        qt_product,                             // Quantidade do produto selecionado
        vl_product,                             // Valor do produto selecionado
        dt_list_buy: new Date().toISOString(),  // Data e hora atual do cadastro no formato ISO
      });
    }
  }

  // Atualiza a quantidade de um item existente na lista
  async update(id_product: number, qt_product: number, vl_product: number): Promise<void> {
    // Valida se não existe dado preenchido e for menor que zero - ID
    if (!id_product || id_product <= 0) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('Selecione um registro válido.');
    }
    // Valida se não existe dado preenchido e for menor que zero - Quantidade
    if (!qt_product || qt_product <= 0) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('A quantidade deve ser um número maior que zero.');
    }
    // Valida se não existe dado preenchido e for menor que zero - Valor
    if (vl_product === undefined || vl_product === null || vl_product < 0) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('O valor deve ser um número maior ou igual a zero.');
    }
    // Executa a atualização no repositório
    await this.repository.update(id_product, qt_product, vl_product);
  }

  // Remove um item da lista pelo seu ID
  async delete(id_product: number): Promise<void> {
    // Valida se não existe dado preenchido e for menor que zero - ID    
    if (!id_product || id_product <= 0) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('Registro inválido para exclusão.');
    }
    // Executa a exclusão no repositório
    await this.repository.delete(id_product);
  }

  // Remove todos os registros da lista
  async clear(): Promise<void> {
    // Executa a limpeza no repositório
    await this.repository.clearBuy();
  }

  // Calcula o valor total acumulado dos itens no carrinho.
  static calculateTotal(items: readonly BuyItem[]): number {
    // Verifica se lista está vazia
    if (!items || items.length === 0) return 0; // Verdadeiro: retorna 0
    // Percorre a lista e armazena o item 
    return items.reduce((sum, item) => {
      // Obtem o valor e verifica se é null/undefined
      const val = item.vl_product ?? 0; // Verdadeiro retorna 0
      const qty = item.qt_product ?? 0; // Verdadeiro retorna 0
      // Retorna o calculo total
      return sum + (val * qty);
    }, 0);
  }

  // Regra de negócio: Valida dados de entrada
  static isValid(productId: number | string, quantity: number | string, price: number | string): boolean {
    const validProduct = Number(productId) > 0;   // Valida se o ID do produto é maior ou igual a zero
    const validQty = Number(quantity) > 0;        // Valida se a quantidade é maior que zero 
    const validPrc = Number(price) >= 0;          // Valida se o preço é maior ou igual a zero
    return validProduct && validQty && validPrc;  // Retorna true somente se todas as regras forem satisfeitas
  }

  // Valida strings enviadas pelos inputs, convertendo-as em números. - parse(analisar)
  static parseInputValues(
    quantityText: string,
    valueText: string
  // Define o valor que será recebido - número
  ): { quantity: number; value?: number } {
    // Remove o ponto, vírgula e os espaços ini/fim
    const cleanQty = quantityText.replace(',', '.').trim();
    // Converte para número
    const quantity = parseFloat(cleanQty);
    // Verifica se não é um número ou negativo
    if (isNaN(quantity) || quantity <= 0) {
      // Verdadeiro: Gera mensagem informativa
      throw new Error('Informe uma quantidade válida e maior que zero.');
    }
    // Remove o ponto, vírgula e os espaços ini/fim
    const cleanValue = valueText.replace(',', '.').trim();
    // Converte para número
    const value = parseFloat(cleanValue);
    // Verifica se não é um número ou negativo
    if (isNaN(value) || value < 0) {
      // Verdadeiro: Gera mensagem informativa        
      throw new Error('Informe um valor unitário válido.');
    }
    // Retorna a quantidade e o valor limpos e validados
    return { quantity, value };
  }

    // Valida se a compra pode ser finalizada.
  static canFinalize(items: readonly BuyItem[]): { isValid: boolean; invalidItemName?: string } {
    // Verifica se a lista não existe ou está vazia
    if (!items || items.length === 0) {
      // Verdadeiro: Retorna vazia - False
      return { isValid: false };
    }
    // Procura e armazena o registro sem preço
    const invalidItem = items.find(             // Armazena o produto encontrado
      item => item.vl_product === undefined ||  // Verifica se o preço é indefinido
              item.vl_product === null ||       // Verifica se o preço é nulo
              Number(item.vl_product) <= 0      // Verifica se o preço é menor ou igual a zero
    );
    // Verifica se algum produto foi encantrado
    if (invalidItem) {
      // Verdadeiro: Retornar dados para o hook
      return {
        isValid: false,                         // Define a validação como falsa
        invalidItemName: invalidItem.nm_product // Captura o nome do produto com erro
      };
    }
    // Retorna sucesso caso todos os produtos tenham preço válido
    return { isValid: true };
  }

  // Regra de negócio: Constrói a intenção (Intent) para Salvar/Editar - Fábrica de ações (Action Factory)
  static buildSaveAction(
    id_product: number | string,  // ID do produto ou do item da lista
    qt_product: number | string,  // Valor do campo de texto com a quantidade informada
    vl_product: number | string,  // Valor do campo de texto com o preço informado
    isEditing: boolean,           // Indica se o modal é de edição (true) ou novo cadastro (false)
    editingId: number | null      // Indica se há ou não um valor (ID)
  ): BuyIntent {
    const parsedId = Number(id_product);        // Converte o ID para número
    const parsedQuantity = Number(qt_product);  // Converte a quantidade para número
    const parsedPrice = Number(vl_product);     // Converte o preço para número
    // Verificar se o valor é true e diferente de null - SE Edição=True OU SE houver um ID 
    if (isEditing && editingId !== null) {
      // Verdadeiro: Identifica que é uma edição
      return {
        type: 'UPDATE' as const,      // Define o type utilizado no hook
        payload: {                    // Dados necessários para atualizar o registro
          id_product: parsedId,       // Atribui o id convertido
          qt_product: parsedQuantity, // Atribui a quantidade formatada como texto
          vl_product: parsedPrice,    // Atribui o preço formatado como texto
        },
      };
    }
    // Falso: Identifica que é uma criação
    return {
      type: 'CREATE' as const,      // Define o type utilizado no hook
      payload: {                    // Dados necessários para criar o registro
        id_product: parsedId,       // Atribui o id do produto convertido    
        qt_product: parsedQuantity, // Atribui a quantidade convertida
        vl_product: parsedPrice,    // Atribui o valor convertido
      },
    };
  }
}

// Instância padrão injetando o repositório concreto fora da classe
export const BuyModelInstance = new BuyModel(new BuyRepository()); // Cria a instância padrão com o repositório real