// features/scannerQuick/scannerQuick.types.ts
import { GeminiProductResult } from '../../core/api/geminiProduct.api';

export interface ScannerQuickState {
  visible: boolean;
  loading: boolean;
  // Novos campos para a Modal
  isConfirmModalOpen: boolean;
  scannedProduct: GeminiProductResult | null;
  selectedGroupId: string;
}

export type ScannerQuickIntent =
  | { type: 'CLOSE' }
  | { type: 'SCAN_BARCODE'; payload: string }
  | { type: 'OPEN_CONFIRM_MODAL'; payload: GeminiProductResult }
  | { type: 'CLOSE_CONFIRM_MODAL' }
  | { type: 'UPDATE_SCANNED_PRODUCT'; payload: Partial<GeminiProductResult> }
  | { type: 'SET_GROUP_ID'; payload: string };