// features/scannerQuick/scannerQuick.hook.tsx
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { fetchProductFromCosmos } from '../../core/api/cosmosProduct.api';
import { fetchProductInfoByGTIN, GeminiProductResult } from '../../core/api/geminiProduct.api';

// Repositórios e Models
import { ConfigRepository } from '../../data/repositories/config.repository';
import { BuyListModelInstance } from '../buyList/buyList.model';
import { groupProductModelInstance } from '../groupProduct/groupProduct.model';
import { ProductModelInstance } from '../product/product.model';
import { ScannerQuickIntent, ScannerQuickState } from './scannerQuick.types';

const configRepo = new ConfigRepository();

export function useScannerQuickViewModel() {
  const [state, setState] = useState<ScannerQuickState>({
    visible: true,
    loading: false,
    isConfirmModalOpen: false,
    scannedProduct: null,
    selectedGroupId: '',
  });

  // Lista local de grupos para popular o Picker/Select da modal
  const [groups, setGroups] = useState<Array<{ id_group: number; nm_group: string }>>([]);

  // Carrega grupos locais ao iniciar
  useEffect(() => {
    async function loadGroups() {
      try {
        const localGroups = await groupProductModelInstance.fetchAll();
        setGroups(localGroups || []);
      } catch (err) {
        console.error('[ScannerQuick] Erro ao carregar grupos:', err);
      }
    }
    loadGroups();
  }, []);

  const handleClose = useCallback(() => {
    setState(prev => ({ ...prev, visible: false, isConfirmModalOpen: false }));
    router.back();
  }, []);

  const handleCloseModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isConfirmModalOpen: false,
      scannedProduct: null,
      selectedGroupId: '',
    }));
  }, []);

  // Grava o produto no banco e adiciona à lista de compras
  const saveProductAndAddToBuyList = useCallback(async () => {
    if (!state.scannedProduct) return;

    setState(prev => ({ ...prev, loading: true }));
    try {
      const groupIdNumber = state.selectedGroupId ? Number(state.selectedGroupId) : 0;

      const createdProduct = await ProductModelInstance.create(
        state.scannedProduct.nm_product,
        state.scannedProduct.gtin,
        groupIdNumber
      );

      if (createdProduct) {
        await BuyListModelInstance.create(createdProduct.id_product, 1);
        handleCloseModal();
        Alert.alert('Sucesso', `${createdProduct.nm_product} adicionado à lista!`, [
          { text: 'OK', onPress: handleClose },
        ]);
      } else {
        Alert.alert('Erro', 'Não foi possível cadastrar o produto.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o produto.');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.scannedProduct, state.selectedGroupId, handleCloseModal, handleClose]);

  // Prepara a modal com os dados retornados da API
  const confirmProductRegistration = useCallback((productData: GeminiProductResult) => {
    // Tenta casar o ID vindo da API com um grupo local existente
    const matchingGroup = groups.find(g => g.id_group === Number(productData.id_group));
    const initialGroupId = matchingGroup ? String(matchingGroup.id_group) : '';

    setState(prev => ({
      ...prev,
      isConfirmModalOpen: true,
      scannedProduct: productData,
      selectedGroupId: initialGroupId,
    }));
  }, [groups]);

  // Consulta API externa
  const fetchProductByConfiguredApi = async (gtin: string): Promise<GeminiProductResult | null> => {
    const config = await configRepo.getConfig();
    const provider = String(config.productApiProvider).toUpperCase();

    if (provider === 'COSMOS') {
      const cosmosResult = await fetchProductFromCosmos(gtin);
      if (cosmosResult) {
        return {
          nm_product: cosmosResult.nm_product,
          id_group: cosmosResult.id_group,
          gtin: cosmosResult.gtin || gtin,
          tag: cosmosResult.tag,
        };
      }
      return null;
    }

    if (provider === 'GEMINI') {
      return await fetchProductInfoByGTIN(gtin);
    }

    return null;
  };

  // Leitura do código de barras
  const handleScanSuccess = useCallback(async (barcode: string) => {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      // 1. Verifica no banco local
      const existingProduct = await ProductModelInstance.checkBarcode(cleanBarcode);

      if (existingProduct) {
        await BuyListModelInstance.create(existingProduct.id_product, 1);
        Alert.alert('Sucesso', `${existingProduct.nm_product} adicionado à lista!`, [
          { text: 'OK', onPress: handleClose },
        ]);
        return;
      }

      // 2. Consulta API externa
      const apiResult = await fetchProductByConfiguredApi(cleanBarcode);

      if (apiResult) {
        confirmProductRegistration(apiResult);
        return;
      }

      // 3. Não encontrado
      Alert.alert('Produto Não Encontrado', `GTIN: ${cleanBarcode}`, [
        { text: 'OK', onPress: handleClose },
      ]);
    } catch (error) {
      console.error('[ScannerQuick] Erro na leitura:', error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [confirmProductRegistration, handleClose]);

  const dispatch = useCallback((intent: ScannerQuickIntent) => {
    switch (intent.type) {
      case 'CLOSE':
        handleClose();
        break;
      case 'SCAN_BARCODE':
        handleScanSuccess(intent.payload);
        break;
      case 'CLOSE_CONFIRM_MODAL':
        handleCloseModal();
        break;
      case 'UPDATE_SCANNED_PRODUCT':
        setState(prev => ({
          ...prev,
          scannedProduct: prev.scannedProduct
            ? { ...prev.scannedProduct, ...intent.payload }
            : null,
        }));
        break;
      case 'SET_GROUP_ID':
        setState(prev => ({ ...prev, selectedGroupId: intent.payload }));
        break;
    }
  }, [handleClose, handleScanSuccess, handleCloseModal]);

  return {
    state,
    groups,
    saveProductAndAddToBuyList,
    dispatch,
  };
}