// src/features/buy/buy.hook.ts
import { useCallback, useState } from 'react';
import { ProductEntity } from '../../data/entities/product.entity';
import { BuyHistModel } from '../buyHist/buyHist.model';
import { buyListModelInstance } from '../buyList/buyList.model';
import { ProductModelInstance } from '../product/product.model';
import { BuyCartItem, BuyState } from './buy.types';

import { Alert } from 'react-native';
/**
 * Hook Customizado (ViewModel) seguindo a arquitetura MVI.
 * Gerencia o estado imutável da tela e expõe métodos de intenção/ação.
 */
export function useBuyViewModel() {
  const [state, setState] = useState<BuyState>({
    items: [],
    loading: false,
    error: null,
  });

  /**
   * Realiza a leitura da lista de compras gravada no banco
   */
  const loadBuyList = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const listItems = await buyListModelInstance.fetchItems();
      const formattedItems: BuyCartItem[] = listItems.map(item => ({
        ...item,
        nm_group: item.nm_group || 'Categoria Geral',
        vl_product: undefined,
      }));
      setState(prev => ({ ...prev, items: formattedItems, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao carregar a lista de compras.',
      }));
    }
  }, []);

  /**
   * Adiciona um produto temporário à memória via leitura do código de barras
   */
  const addTemporaryBarCod = useCallback(async (barcode: string): Promise<ProductEntity> => {
    const product = await ProductModelInstance.checkBarcode(barcode);
    if (!product) {
      throw new Error('Produto não encontrado pelo código de barras.');
    }

    // Verifica duplicidade convertendo para String para garantir a comparação
    const alreadyExists = state.items.some(
      i => String(i.id_product) === String(product.id_product)
    );

    if (alreadyExists) {
      throw new Error('DUPLICATED_PRODUCT');
    }

    const newItem: BuyCartItem = {
      id_product: product.id_product,
      nm_product: product.nm_product,
      cd_product_gtin: product.cd_product_gtin ?? null,
      id_group: product.id_group,
      nm_group: (product as any).nm_group || 'Categoria Geral',
      qt_product: 1,
      vl_product: undefined,
      dt_list_buy: new Date().toISOString(),
    };

    setState(prev => ({ ...prev, items: [...prev.items, newItem], error: null }));
    return product;
  }, [state.items]);

  const addTemporaryName = useCallback((product: ProductEntity | Pick<ProductEntity, 'id_product' | 'nm_product'>) => {
    // Verifica duplicidade convertendo para String
    const alreadyExists = state.items.some(
      i => String(i.id_product) === String(product.id_product)
    );

    if (alreadyExists) {
      Alert.alert('Aviso', `O produto "${product.nm_product}" já está na lista de compras!`);
      return;
    }

    const newItem: BuyCartItem = {
      id_product: product.id_product,
      nm_product: product.nm_product,
      cd_product_gtin: (product as ProductEntity).cd_product_gtin ?? null,
      id_group: (product as ProductEntity).id_group ?? 0,
      nm_group: (product as any).nm_group || 'Categoria Geral',
      qt_product: 1,
      vl_product: undefined,
      dt_list_buy: new Date().toISOString(),
    };

    setState(prev => ({ ...prev, items: [...prev.items, newItem], error: null }));
  }, [state.items]);

  /**
   * Atualiza a quantidade e o valor unitário de um item na lista de memória
   */
  const updateItemValueAndQtyByIndex = useCallback((index: number, quantity: number, value?: number): boolean => {
    if (isNaN(quantity) || quantity <= 0) {
      setState(prev => ({ ...prev, error: 'Informe uma quantidade válida.' }));
      return false;
    }

    if (value !== undefined && (isNaN(value) || value < 0)) {
      setState(prev => ({ ...prev, error: 'Informe um valor válido.' }));
      return false;
    }

    setState(prev => {
      const updatedItems = prev.items.map((item, idx) => {
        if (idx === index) {
          return { ...item, qt_product: quantity, vl_product: value };
        }
        return item;
      });
      return { ...prev, items: updatedItems, error: null };
    });

    return true;
  }, []);

  /**
   * Remove um produto da memória através do seu índice
   */
  const removeItemByIndex = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  }, []);

  /**
   * Finaliza a compra registrando os itens no Histórico e removendo da Lista de Compras do BD
   */
  const finalizePurchase = useCallback(async (id_supplier: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const validItemsToBuy = state.items.filter(
        item => item.vl_product !== undefined && item.vl_product !== null && item.vl_product >= 0
      );
      const currentDate = new Date().toISOString();

      for (const item of validItemsToBuy) {
        await BuyHistModel.create({
          id_product: item.id_product,
          id_supplier: id_supplier,
          qt_product: item.qt_product,
          vl_product: item.vl_product!,
          dt_list_buy: item.dt_list_buy || currentDate,
          dt_hist_buy: currentDate,
        });

        if (item.id_list_buy) {
          await buyListModelInstance.delete({
            id_list_buy: item.id_list_buy}
          );
        }
      }

      setState(prev => ({ ...prev, items: [], loading: false, error: null }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao finalizar a compra.',
      }));
      throw error;
    }
  }, [state.items]);

  return {
    state,
    loadBuyList,
    addTemporaryBarCod,
    addTemporaryName,
    updateItemValueAndQtyByIndex,
    removeItemByIndex,
    finalizePurchase,
  };
}