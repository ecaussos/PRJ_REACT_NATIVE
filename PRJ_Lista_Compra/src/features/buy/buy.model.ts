// src/features/buy/buy.model.ts
import { BuyCartItem } from './buy.types';

/**
 * Model da camada Domain / Business Logic do Módulo Buy.
 * Contém funções puras de regra de negócio, cálculos e validações.
 */
export class BuyModel {
  /**
   * Calcula o valor total da compra somando os itens válidos
   */
  static calculateTotal(items: BuyCartItem[]): number {
    return items.reduce((sum, item) => {
      const val = item.vl_product || 0;
      const qty = item.qt_product || 0;
      return sum + val * qty;
    }, 0);
  }

  /**
   * Valida se a compra pode ser finalizada (pelo menos 1 item com valor informado)
   */
  static canFinalize(items: BuyCartItem[]): boolean {
    if (!items || items.length === 0) return false;
    return items.some(item => item.vl_product !== undefined && item.vl_product >= 0);
  }

  /**
   * Filtra os itens da lista local por nome de produto ou grupo
   */
  static filterItems(items: BuyCartItem[], searchText: string): BuyCartItem[] {
    if (!searchText.trim()) return items;
    const searchLower = searchText.toLowerCase();
    return items.filter(item => {
      const matchName = item.nm_product.toLowerCase().includes(searchLower);
      const matchGroup = item.nm_group ? item.nm_group.toLowerCase().includes(searchLower) : false;
      return matchName || matchGroup;
    });
  }
}