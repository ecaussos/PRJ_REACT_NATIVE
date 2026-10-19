// features/scannerQuick/scannerQuick.types.ts

import { UnifiedProductDTO } from '../../core/api/api.types';

export type ProductResult = UnifiedProductDTO; // Reutiliza a tipagem centralizada das APIs

export interface ScannerQuickState {    // Define a interface do estado da tela do scanner rápido
  visible: boolean;                     // Indica se a interface do leitor está visível na tela
  loading: boolean;                     // Indica se há algum processo assíncrono em execução
  isConfirmModalOpen: boolean;          // Controla a exibição do modal de confirmação de produto
  scannedProduct: ProductResult | null; // Guarda os dados do produto obtido pela leitura/API
  selectedGroupId: string;              // Guarda o ID do grupo selecionado para o produto
}

export type ScannerQuickIntent =                                        // Define as intenções/ações disparadas pela camada de visualização
  | { type: 'CLOSE' }                                                   // Intenção para fechar a tela do leitor rápido
  | { type: 'SCAN_BARCODE'; payload: string }                           // Intenção disparada ao ler um código de barras
  | { type: 'OPEN_CONFIRM_MODAL'; payload: ProductResult }              // Intenção para abrir o modal de confirmação
  | { type: 'CLOSE_CONFIRM_MODAL' }                                     // Intenção para fechar o modal de confirmação
  | { type: 'UPDATE_SCANNED_PRODUCT'; payload: Partial<ProductResult> } // Intenção para atualizar dados do produto lido
  | { type: 'SET_GROUP_ID'; payload: string };                          // Intenção para alterar o grupo de produto selecionado