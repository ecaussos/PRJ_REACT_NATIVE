// features/quickScanner/scannerQuick.types.ts

// Contrato de entrada do componente de tela
export interface ScannerQuickState {
  visible: boolean; // Controla se a câmera/modal está ativo
  loading: boolean; // Indica processamento assíncrono durante a leitura
}

// Intenções MVI suportadas pelo módulo
export type ScannerQuickIntent =
  | { type: 'CLOSE' }                           // Intenção de fechar a câmera e voltar de tela
  | { type: 'SCAN_BARCODE'; payload: string };  // Intenção disparada ao ler um código de barras