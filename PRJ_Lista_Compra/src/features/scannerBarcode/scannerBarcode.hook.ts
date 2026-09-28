// src/features/scannerBarcode/scannerBarcode.hook.ts

import { useCameraPermissions } from 'expo-camera';
import { useCallback, useState } from 'react';
import { BarcodeScannerProps, ScannerBarcodeIntent, ScannerBarcodeState } from './scannerBarcode.types';

export function useScannerBarcodeViewModel({ onScanSuccess, onClose }: BarcodeScannerProps){
  const [permission, requestPermission] = useCameraPermissions();               // Gerencia o status e solicitação de permissão da câmera
  const [state, setState] = useState<ScannerBarcodeState>({scanned: false});    // Define estado inicial como não escaneado

  const handleBarCodeScanned = useCallback((barcode: string) => {   // Inicia a leitura do código de barra
    if (state.scanned) return;                                      // Evita múltiplos disparos simultâneos
    setState({ scanned: true });                                    // Trava novas leituras
    onScanSuccess(barcode);                                         // Chama a função e envia o código lido
  }, [state.scanned, onScanSuccess]);

  const handleResetScan = useCallback(() => {   // Reinicia a leitura do código de barra
    setState({ scanned: false });               // Libera para uma nova leitura de código
  }, []);

  // Centralizador de intenções (MVI)
  const dispatch = useCallback((intent: ScannerBarcodeIntent) => {      
    switch (intent.type) {                      // Avalia o tipo de intenção MVI
      case 'SCAN_CODE':                         // Se a intenção for igual a SCAN_CODE
        handleBarCodeScanned(intent.payload);   // Dispara a chamada leitura do código
        break;                                  // Interrompe a execução
      case 'RESET_SCAN':                        // Se a intenção for igual a RESET_SCAN
        handleResetScan();                      // Dispara a chamada para reiniciar o scaneamento
        break;                                  // Interrompe a execução
      case 'CLOSE':                             // Se a intenção for igual a CLOSE
        onClose();                              // Dispara o fechamento do modal scanner
        break;
    }
  }, [handleBarCodeScanned, handleResetScan, onClose]);

  return {
    permission,         // Objeto com status da permissão
    requestPermission,  // Função para solicitar acesso à câmera
    state,              // Estado da tela
    dispatch,           // Disparador de ações
  };
}