// src/features/scannerBarcode/scannerBarcode.types.ts

// Contrato de entrada do componente de tela
export interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void; // Callback executado quando o código é lido com sucesso
  onClose: () => void;                      // Callback executado para fechar o scanner
}

// Estado centralizado do leitor de código de barras
export interface ScannerBarcodeState {
  scanned: boolean;                         // Indica se o código atual já foi capturado
}

// Intenções MVI suportadas pelo módulo
export type ScannerBarcodeIntent =
  | { type: 'SCAN_CODE'; payload: string }  // Intenção para registrar leitura do código
  | { type: 'RESET_SCAN' }                  // Intenção para liberar uma nova leitura
  | { type: 'CLOSE' };                      // Intenção para encerrar a câmera