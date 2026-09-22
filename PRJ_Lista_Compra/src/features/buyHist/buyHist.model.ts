// src/features/buyHist/buyHist.model.ts
import { BuyHistWithEntity } from '../../data/entities/buyHist.entity';
import { IBuyHistRepository } from '../../data/interfaces/buyHist.repository.interfaces';
import { BuyHistRepository } from '../../data/repositories/buyHist.repository';
import { BuyHistIntent, BuyHistItem, BuyHistSearchResult } from './buyHist.types';


// Contrato/Interface da Model
export interface IBuyHistModel {
  fetchAll(): Promise<BuyHistWithEntity[]>;                                                      // Busca todos os itens da lista de compras
  update(id_hist_buy: number, id_product:number, qt_product: number, vl_product: number, id_supplier: number): Promise<void>; // Atualiza a quantidade e valor de um item na lista
  delete(id_hist_buy: number): Promise<void>;                                                           // Remove um item específico da compra
}

export class BuyHistModel implements IBuyHistModel {
  // Recebe o repositório por contrato (interface), facilitando testes e inversão de controle
  constructor(private repository: IBuyHistRepository) {} // Define a dependência por interface no construtor
  fetchByName(name: string): Promise<BuyHistSearchResult[]> {
    throw new Error('Method not implemented.');
  }
  searchProducts(query: string): Promise<BuyHistSearchResult[]> {
    throw new Error('Method not implemented.');
  }

  // Busca todos os registros com dados detalhados
  async fetchAll(): Promise<BuyHistWithEntity[]> {
      return await this.repository.findAll();  // Executa a busca no repositório
    }

  // Atualiza a quantidade de um item existente na lista
  async update(id_hist_buy: number, id_product: number, qt_product: number, vl_product: number, id_supplier: number): Promise<void> {
    // Valida se não existe dado preenchido e for menor que zero - ID
    if (!id_hist_buy || id_hist_buy <= 0) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('Selecione um registro válido.');
    }
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
    if (!id_supplier || id_supplier <= 0) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('Selecione um registro válido.');
    }
    
    // Executa a atualização no repositório
    await this.repository.update(id_hist_buy, id_product, qt_product, vl_product, id_supplier);
  }

  // Remove um item da lista pelo seu ID
  async delete(id_hist_buy: number): Promise<void> {
    // Valida se não existe dado preenchido e for menor que zero - ID    
    if (!id_hist_buy || id_hist_buy <= 0) {
      // Verdadeiro: Gerar mensagem informativa
      throw new Error('Registro inválido para exclusão.');
    }
    // Executa a exclusão no repositório
    await this.repository.delete(id_hist_buy);
  }
  
  // Calcula o valor total acumulado dos itens no carrinho.
  static calculateTotal(items: readonly BuyHistItem[]): number {
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
  static isValid(productId: number | string, quantity: number | string, price: number | string, supplierId: number | string): boolean {
    const validProduct = Number(productId) > 0;                   // Valida se o ID do produto é maior ou igual a zero
    const validQty = Number(quantity) > 0;                        // Valida se a quantidade é maior que zero 
    const validPrc = Number(price) >= 0;                          // Valida se o preço é maior ou igual a zero
    const validSupplier = Number(supplierId) >= 0;                  // Valida se o preço é maior ou igual a zero
    return validProduct && validQty && validPrc && validSupplier; // Retorna true somente se todas as regras forem satisfeitas
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

  // Regra de negócio: Constrói a intenção (Intent) para Salvar/Editar - Fábrica de ações (Action Factory)
  static buildSaveAction(
    id_product: number | string,  // ID do produto ou do item da lista
    qt_product: number | string,  // Valor do campo de texto com a quantidade informada
    vl_product: number | string,  // Valor do campo de texto com o preço informado
    id_supplier: number | string, // ID do produto ou do item da lista
    isEditing: boolean,           // Indica se o modal é de edição (true) ou novo cadastro (false)
    editingId: number | null      // Indica se há ou não um valor (ID)
  ): BuyHistIntent {
    const parsedProduct = Number(id_product);        // Converte o ID para número
    const parsedQuantity = Number(qt_product);  // Converte a quantidade para número
    const parsedPrice = Number(vl_product);     // Converte o preço para número
    const parsedSupplier = Number(id_supplier); // Converte o ID para número
        // Verificar se o valor é true e diferente de null - SE Edição=True OU SE houver um ID 
    if (isEditing && editingId !== null) {
      // Verdadeiro: Identifica que é uma edição
      return {
        type: 'UPDATE' as const,        // Define o type utilizado no hook
        payload: {                      // Dados necessários para atualizar o registro
          id_hist_buy: editingId,
          id_product: parsedProduct,    // Atribui o ID convertido
          qt_product: parsedQuantity,   // Atribui a quantidade formatada como texto
          vl_product: parsedPrice,      // Atribui o preço formatado como texto
          id_supplier: parsedSupplier,  // Atribui o ID convertido
        },
      };
    }
    throw new Error('ID de histórico inválido para atualização.');
  }
}
  // Instância padrão injetando o repositório concreto fora da classe
  export const BuyHistModelInstance = new BuyHistModel(new BuyHistRepository()); // Cria a instância padrão com o repositório real
