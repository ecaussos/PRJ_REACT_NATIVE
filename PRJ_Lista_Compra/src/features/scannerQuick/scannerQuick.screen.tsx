// features/scannerQuick/scannerQuick.screen.tsx
import { View } from 'react-native';

import { BuyListCameraModal } from '../buyList/buyList.form';
import { ScannerQuickForm } from './scannerQuick.form';
import { useScannerQuickViewModel } from './scannerQuick.hook';

export function ScannerQuickScreen() {
  const { state, groups, saveProductAndAddToBuyList, dispatch } = useScannerQuickViewModel();

  return (
    <View style={{ flex: 1 }}>
      {/* 1. Modal da Câmera / Leitor */}
      <BuyListCameraModal
        showModal={state.visible}
        onScanSuccess={barcode => dispatch({ type: 'SCAN_BARCODE', payload: barcode })}
        onClose={() => dispatch({ type: 'CLOSE' })}
      />

      {/* 2. Formulário de Confirmação e Edição Rápida */}
      <ScannerQuickForm
        visible={state.isConfirmModalOpen}
        scannedProduct={state.scannedProduct}
        selectedGroupId={state.selectedGroupId}
        groups={groups}
        loading={state.loading}
        onSave={saveProductAndAddToBuyList}
        dispatch={dispatch}
      />
    </View>
  );
}