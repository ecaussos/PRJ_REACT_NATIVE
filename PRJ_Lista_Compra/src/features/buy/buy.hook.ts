// src/features/buy/buy.hook.ts
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { ProductEntity } from '../../data/entities/product.entity';
import { SupplierEntity } from '../../data/entities/supplier.entity';
import { BuyHistModel } from '../buyHist/buyHist.model';
import { BuyListModelInstance } from '../buyList/buyList.model';
import { ProductModelInstance } from '../product/product.model';
import { SupplierModelInstance } from '../supplier/supplier.model';
import { BuyModel } from './buy.model';
import {
  BuyCartItem,
  BuyFormState,
  BuyIntent,
  BuyState,
  SearchProductResult,
} from './buy.types';

export function useBuyViewModel(): BuyFormState {
  const [state, setState] = useState<BuyState>({
    items: [],
    suppliers: [],
    loading: false,
    error: null,
    showAddOptions: false,
    showCameraModal: false,
    showNameSearchModal: false,
    showSupplierModal: false,
    editingItem: null,
  });

  const [searchText, setSearchText] = useState('');
  const [qtyText, setQtyText] = useState('');
  const [valueText, setValueText] = useState('');

  // Dispatch focado estritamente em operações de negócio e dados
  const dispatch = useCallback(async (intent: BuyIntent): Promise<void> => {
    switch (intent.type) {
      case 'LOAD_BUY_LIST': {
        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
          const listItems = await BuyListModelInstance.fetchItems();
          const formattedItems: BuyCartItem[] = listItems.map(item => ({
            ...item,
            nm_group: item.nm_group || 'Categoria Geral',
            vl_product: undefined,
          }));
          // Atualiza os estados
          setState(prev => ({ ...prev, items: formattedItems, loading: false, showAddOptions: false }));
        } catch {
          // Atualiza os estados
          setState(prev => ({ ...prev, loading: false, error: 'Erro ao carregar a lista de compras.' }));
        }
        break;
      }

      case 'ADD_BY_BARCODE': {
        setState(prev => ({ ...prev, showCameraModal: false }));
        const product = await ProductModelInstance.checkBarcode(intent.payload.barcode);
        if (!product) {
          throw new Error('Produto não encontrado pelo código de barras.');
        }

        setState(prev => {
          const alreadyExists = prev.items.some(i => String(i.id_product) === String(product.id_product));
          if (alreadyExists) {
            throw new Error('Este produto já foi adicionado à lista de compras!');
          }

          const newItem: BuyCartItem = {
            id_product: product.id_product,
            nm_product: product.nm_product,
            cd_product_gtin: product.cd_product_gtin ?? null,
            id_group: product.id_group,
            nm_group: (product as { nm_group?: string }).nm_group || 'Categoria Geral',
            qt_product: 1,
            vl_product: undefined,
            dt_list_buy: new Date().toISOString(),
          };

          return { ...prev, items: [...prev.items, newItem], error: null, showAddOptions: false };
        });
        break;
      }

      case 'ADD_BY_PRODUCT': {
        const { product } = intent.payload;

        setState(prev => {
          const alreadyExists = prev.items.some(i => String(i.id_product) === String(product.id_product));
          if (alreadyExists) {
            throw new Error(`O produto "${product.nm_product}" já está na lista de compras!`);
          }

          const newItem: BuyCartItem = {
            id_product: product.id_product,
            nm_product: product.nm_product,
            cd_product_gtin: (product as ProductEntity).cd_product_gtin ?? null,
            id_group: (product as ProductEntity).id_group ?? 0,
            nm_group: (product as { nm_group?: string }).nm_group || 'Categoria Geral',
            qt_product: 1,
            vl_product: undefined,
            dt_list_buy: new Date().toISOString(),
          };

          return { ...prev, items: [...prev.items, newItem], error: null, showAddOptions: false };
        });
        break;
      }

      case 'UPDATE_ITEM': {
        const { index, quantityText, valueText } = intent.payload;
        const { quantity, value } = BuyModel.parseInputValues(quantityText, valueText);

        setState(prev => {
          const updatedItems = prev.items.map((item, idx) => {
            if (idx === index) return { ...item, qt_product: quantity, vl_product: value };
            return item;
          });
          return { ...prev, items: updatedItems, editingItem: null, error: null };
        });
        break;
      }

      case 'REMOVE_ITEM': {
        setState(prev => ({
          ...prev,
          items: prev.items.filter((_, idx) => idx !== intent.payload.index),
        }));
        break;
      }

      case 'FINALIZE': {
        setState(prev => ({ ...prev, loading: true, showSupplierModal: false, error: null }));
        try {
          let currentItems: BuyCartItem[] = [];
          setState(prev => {
            currentItems = prev.items;
            return prev;
          });

          const validItemsToBuy = currentItems.filter(
            item => item.vl_product !== undefined && item.vl_product !== null && item.vl_product >= 0
          );
          const currentDate = new Date().toISOString();

          for (const item of validItemsToBuy) {
            await BuyHistModel.create({
              id_product: item.id_product,
              id_supplier: intent.payload.id_supplier,
              qt_product: item.qt_product,
              vl_product: item.vl_product!,
              dt_list_buy: item.dt_list_buy || currentDate,
              dt_hist_buy: currentDate,
            });

            if (item.id_list_buy) {
              await BuyListModelInstance.delete({ id_list_buy: item.id_list_buy });
            }
          }

          setState(prev => ({ ...prev, items: [], loading: false, error: null }));
        } catch {
          setState(prev => ({ ...prev, loading: false, error: 'Erro ao finalizar a compra.' }));
          throw new Error('Não foi possível finalizar a compra.');
        }
        break;
      }
    }
  }, []);

  // Manipulação de estados visuais feita diretamente via setState
  const setCameraModal = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showCameraModal: show }));
  }, []);

  const setNameSearchModal = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showNameSearchModal: show }));
  }, []);

  const setSupplierModal = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showSupplierModal: show }));
  }, []);

  const toggleAddOptions = useCallback(() => {
    setState(prev => ({ ...prev, showAddOptions: !prev.showAddOptions }));
  }, []);

  const searchProductsByName = useCallback(async (query: string): Promise<SearchProductResult[]> => {
    return await ProductModelInstance.findByName(query);
  }, []);

  const handleStartEditItem = useCallback((item: BuyCartItem, index: number) => {
    setState(prev => ({ ...prev, editingItem: { item, index } }));
    setQtyText(String(item.qt_product || 1));
    setValueText(item.vl_product !== undefined && item.vl_product !== null ? String(item.vl_product) : '');
  }, []);

  const handleScanSuccess = useCallback(async (barcode: string) => {
    try {
      await dispatch({ type: 'ADD_BY_BARCODE', payload: { barcode } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao ler código de barras.';
      Alert.alert('Aviso', message);
    }
  }, [dispatch]);

  const handleSaveItemData = useCallback(async () => {
    if (!state.editingItem) return;
    try {
      await dispatch({
        type: 'UPDATE_ITEM',
        payload: {
          index: state.editingItem.index,
          quantityText: qtyText,
          valueText: valueText,
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar dados do item.';
      Alert.alert('Erro', message);
    }
  }, [dispatch, state.editingItem, qtyText, valueText]);

  const handleAddProductSelect = useCallback(async (product: ProductEntity | SearchProductResult) => {
    try {
      await dispatch({ type: 'ADD_BY_PRODUCT', payload: { product } });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao adicionar produto.';
      Alert.alert('Aviso', message);
    }
  }, [dispatch]);

  const handleOpenFinishModal = useCallback(async () => {
    try {
      if (!state.items || state.items.length === 0) {
        Alert.alert('Aviso', 'Adicione produtos à lista antes de finalizar a compra.');
        return;
      }

      if (!BuyModel.canFinalize(state.items)) {
        Alert.alert('Aviso', 'Informe o valor de pelo menos um produto para finalizar a compra.');
        return;
      }

      const suppliers = await SupplierModelInstance.fetchAll();
      if (!suppliers || suppliers.length === 0) {
        Alert.alert('Aviso', 'Cadastre pelo menos um fornecedor/mercado antes de finalizar a compra.');
        return;
      }

      setState(prev => ({ ...prev, suppliers, showSupplierModal: true }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao abrir modal de finalização.';
      Alert.alert('Erro', message);
    }
  }, [state.items]);

  const handleConfirmFinalize = useCallback(async (supplier: SupplierEntity) => {
    try {
      await dispatch({ type: 'FINALIZE', payload: { id_supplier: supplier.id_supplier } });
      Alert.alert('Sucesso', 'Compra finalizada e registrada no histórico!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao finalizar compra.';
      Alert.alert('Erro', message);
    }
  }, [dispatch]);

  const filteredItems = useMemo(
    () => BuyModel.filterItems(state.items, searchText),
    [state.items, searchText]
  );

  const totalPurchaseValue = useMemo(
    () => BuyModel.calculateTotal(state.items),
    [state.items]
  );

  return {
    state,                    // Estado global da tela
    dispatch,                 // Disparador de ações de negócio
    // Filtra lista
    filteredItems,            // Itens filtrados para exibição
    // Adicionar produto
    toggleAddOptions,         // Alterna visibilidade dos botões de adição
    // Câmera
    setCameraModal,           // Controla exibição do modal da câmera
    handleScanSuccess,        // Processa código de barras lido
    // Busca por Nome
    setNameSearchModal,       // Controla exibição do modal de busca por nome
    searchText,               // Texto da busca de produtos
    setSearchText,            // Atualiza texto da busca
    searchProductsByName,     // Busca produtos pelo nome no banco
    handleAddProductSelect,   // Adiciona produto selecionado à lista
    // Quantidade/Valor
    handleStartEditItem,      // Inicia edição de um item
    qtyText,                  // Texto da quantidade do item
    setQtyText,               // Atualiza texto da quantidade
    valueText,                // Texto do valor do item
    setValueText,             // Atualiza texto do valor
    handleSaveItemData,       // Salva alterações do item editado
    totalPurchaseValue,       // Valor total calculado da compra
    // Finaliza/Fornecedor
    handleOpenFinishModal,    // Valida e abre modal de finalização
    setSupplierModal,         // Controla exibição do modal de fornecedores
    handleConfirmFinalize,    // Finaliza a compra e salva histórico
  };
}


