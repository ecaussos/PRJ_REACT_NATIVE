import { BuyCartItem } from './buy.types';

export class BuyModel {
  // Calcula o valor total acumulado dos itens no carrinho.
  static calculateTotal(items: readonly BuyCartItem[]): number {
    // Verifica se lista está vazia
    if (!items || items.length === 0) return 0; // Verdadeiro: retorna 0
    // Percorre a lista e armazena o item 
    return items.reduce((sum, item) => {
      // Obtem o valor e verifica se é null/undefined
      const val = item.vl_product ?? 0; // Verdadeiro retorna 0
      const qty = item.qt_product ?? 0; // Verdadeiro retorna 0
      //Retorna o calculo total
      return sum + (val * qty);
    }, 0);
  }

  // Filtra a lista de itens pelo nome do produto ou nome do grupo.
  static filterItems(items: readonly BuyCartItem[], searchText: string): BuyCartItem[] {
    // Valida se o existe item no array
    if (!items) return []; // Verdadeiro: Retorna array vazio
    // Valida se o campo de pesquisa não possui valor ou espaço
    if (!searchText || !searchText.trim()) return [...items]; // Verdadeiro: Retorna a lista sem filtro
    // Falso: Converte o campo da pequisa para minusculo e remove os espaços ini/fim
    const searchLower = searchText.trim().toLowerCase();
    // Percorre a lista realizando o filtro
    return items.filter(item => {
      // Converte o item para minusculo e compara com o campo da pesquisa
      const matchName = item.nm_product?.toLowerCase().includes(searchLower) ?? false; // Se o resultado for null retorna false
      const matchGroup = item.nm_group?.toLowerCase().includes(searchLower) ?? false; // Se o resultado for null retorna false
      // Retorna a lista com os itens encontrados
      return matchName || matchGroup;
    });
  }

  //Valida strings enviadas pelos inputs, convertendo-as em números. - parse(analisar)
  static parseInputValues(
    quantityText: string,
    valueText: string
  // Defini o valor que será recebido - número
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
    // Retonar a quantidade e o valor limpos e validados
    return { quantity, value };
  }

  // Valida se a compra pode ser finalizada.
  static canFinalize(items: readonly BuyCartItem[]): boolean {
    // Verifica se lista está vazia
    if (!items || items.length === 0) return false; // Verdadeiro: retorna false
    // Verifica se uma das validações é verdadeira
    return items.some(
      // Validações: valor do produto possui valor valido
      item => item.vl_product !== undefined && item.vl_product !== null && item.vl_product >= 0
    );
  }
}