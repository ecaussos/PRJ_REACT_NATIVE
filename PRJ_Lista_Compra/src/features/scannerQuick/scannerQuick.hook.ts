// features/quickScanner/quickScanner.hook.tsx

import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { BuyListModelInstance } from '../buyList/buyList.model';
import { ProductModelInstance } from '../product/product.model';
import { ScannerQuickIntent, ScannerQuickState } from './scannerQuick.types';

export function useScannerQuickViewModel() {
  const [state, setState] = useState<ScannerQuickState>({
    visible: true,  // Estado inicial do modal da câmera
    loading: false, // Estado de carregamento do processamento
  });

  const handleClose = useCallback(() => {
    setState(prev => ({ ...prev, visible: false }));  // Esconde o modal da câmera
    router.back();                                    // Retorna para a tela anterior
  }, []);

  const handleScanSuccess = useCallback(async (barcode: string) => {
    const cleanBarcode = barcode.trim();            //Remove espaços em branco da leitura
    if (!cleanBarcode) return;                      // Interrompe se o código estiver vazio

    setState(prev => ({ ...prev, loading: true })); // Ativa indicador de carregamento

    try {
      // 1. Busca produto pelo código de barras
      const product = await ProductModelInstance.checkBarcode(cleanBarcode);
      // Valida se o produto não existir (Falso)
      if (!product) {
        // Verdadeiro gerar alertar informativo
        Alert.alert('Aviso', `Nenhum produto cadastrado com o código ${cleanBarcode}.`);
        // Finaliza execução se não encontrar
        return;
      }

      // 2. Chama a função para adicionar o produto na lista de compra
      await BuyListModelInstance.create(product.id_product, 1);
      Alert.alert('Sucesso', `${product.nm_product} adicionado à lista!`, [               // Exibe alerta de confirmação nativo
        { text: 'OK', onPress: handleClose },                                             // Exibe Títilo botão e ação
      ]);
    } catch (error) {                                                                     // Em caso de falha da operação
      Alert.alert('Erro', 'Não foi possível adicionar o produto pelo código de barras.'); // Exibe alerta de confirmação nativo
    } finally {
      setState(prev => ({ ...prev, loading: false }));                                    // Mantém os estados anteriores e atualiza loading
    }
  }, [handleClose]);                                                                      // Chama a função para fechar modal.

  // Dispatcher centralizado MVI
  const dispatch = useCallback((intent: ScannerQuickIntent) => {
    switch (intent.type) {                  // Avalia o tipo de intenção MVI
      case 'CLOSE':                         // Se a intenção for igual a CLOSE
        handleClose();                      // Dispara o fechamento do modal scanner
        break;                              // Interrompe a execução
      case 'SCAN_BARCODE':                  // Se a intenção for igual a SCAN_BARCODE
        handleScanSuccess(intent.payload);  // Dispara a chamada leitura do código
        break;                              // Interrompe a execução
    }
  }, [handleClose, handleScanSuccess]);     // Chama as funções para fechar o modal e relizar a leitura do código de barra

  return {
    state,    // Retorna o estado atualizado
    dispatch, // Retorna a função dispatch MVI
  };
}