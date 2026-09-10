// src/features/buyList/buyList.model.ts
import { BuyListItemWithProductEntity } from '../../data/entities/buyList.entity';
import { ProductEntity } from '../../data/entities/product.entity';
import { IBuyListRepository } from '../../data/interfaces/buyList.repository.interfaces';
import { BuyListRepository } from '../../data/repositories/buyList.repository';
import { ProductModelInstance } from '../product/product.model';
import { BuyListIntent } from './buyList.types';

// Tipo simplificado de produto retornado na busca rápida por nome
export type ProductSearchResult = Pick<ProductEntity, 'id_product' | 'nm_product'>;

// Tipo simplificado de edição quantidade de produto
export type EditingQuantityItem = Pick<BuyListItemWithProductEntity, 'id_list_buy' | 'id_product' | 'nm_product' | 'qt_product'>;

export class BuyListModel {
  // Injeção de dependência via construtor com fallback padrão do repositório
  constructor(
    private repository: IBuyListRepository = new BuyListRepository()
  ) {}

  // Busca todos os registros cadastrados com informações do produto e grupo
  async fetchItems(): Promise<BuyListItemWithProductEntity[]> {
    return await this.repository.findAllWithProducts();
  }

  // Busca registros cadastrados por nome
  async searchProductsByName(query: string): Promise<ProductSearchResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];
    return await ProductModelInstance.findByName(cleanQuery);
  } 

  // Cria um novo registro ou incrementa a quantidade se o produto já existir na lista
  async create(payload: { id_product: number; qt_product: number }): Promise<void> {
    const { id_product, qt_product } = payload;
    const numericQty = Number(qt_product);

    if (!id_product) throw new Error('Selecione um produto válido.');
    if (numericQty <= 0) {
      throw new Error('A quantidade deve ser um número maior que zero.');
    }

    const existing = await this.repository.findByProductId(id_product);

    if (existing) {
      const newQty = existing.qt_product + numericQty;
      await this.repository.updateQuantity(existing.id_list_buy, newQty);
    } else {
      const data = {
        id_product,
        qt_product: numericQty,
        dt_list_buy: new Date().toISOString(),
      };
      await this.repository.create(data);
    }
  }

  // Atualiza a quantidade de um registro existente na lista recebendo DTO
  async updateQuantity(payload: { id_list_buy: number; qt_product: number }): Promise<void> {
    const { id_list_buy, qt_product } = payload;

    if (qt_product <= 0) {
      throw new Error('A quantidade deve ser maior que zero.');
    }

    await this.repository.updateQuantity(id_list_buy, qt_product);
  }

  // Remove um item específico da lista pelo seu ID
  async delete(payload: { id_list_buy: number }): Promise<void> {
    if (!payload?.id_list_buy) throw new Error('Identificador do registro inválido.');
    await this.repository.delete(payload.id_list_buy);
  }

  // Remove todos os registros da lista de compras de uma só vez
  async clear(): Promise<void> {
    await this.repository.clearList();
  }

  // Salva Método estático para construir a Action de atualização de quantidade no padrão do MVI
  static buildSaveQuantityAction(id_list_buy: number, quantityText: string): BuyListIntent {
    const qt_product = parseFloat(quantityText.trim());
    return {
      type: 'UPDATE_QUANTITY',
      payload: { id_list_buy, qt_product },
    };
  }

  // Adicionar produto a lista de compra utilizando o código de barra
  async createByBarcode(barcode: string): Promise<ProductEntity> {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) throw new Error('Código de barras inválido.');

    // 1. Busca o produto
    const product = await ProductModelInstance.checkBarcode(cleanBarcode);
    if (!product) {
      throw new Error(`Nenhum produto cadastrado com o código ${cleanBarcode}.`);
    }
    
    // 2. Cria ou incrementa o item na lista (reaproveitando a regra existente)
    await this.create({ id_product: product.id_product, qt_product: 1 });

    return product;
  }

  // Regra de negócio: Verifica se existe um produto pelo código de barras (GTIN)
  async checkBarcodeProduct(barcode: string): Promise<ProductEntity | null> {
    return await ProductModelInstance.checkBarcode(barcode);
  }

  // Regra de negócio: verifica se a quantidade informada é um número válido e positivo
  static isValidQuantity(quantityText: string): boolean {
    const qty = parseFloat(quantityText.trim());
    return !isNaN(qty) && qty > 0;
  }


}

// Instância padrão mantendo o nome do módulo
export const BuyListModelInstance = new BuyListModel();