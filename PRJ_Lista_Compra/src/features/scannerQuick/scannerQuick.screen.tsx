import { BuyListCameraModal } from '../buyList/buyList.form';
import { useScannerQuickViewModel } from './scannerQuick.hook';

export function ScannerQuickScreen(){
  const { state, dispatch } = useScannerQuickViewModel(); // Obtém o estado e o disparador de ações do Hook

  return (
    <BuyListCameraModal
      showModal={state.visible}                                                         // Controla a exibição do modal da câmera
      onScanSuccess={(barcode) => dispatch({ type: 'SCAN_BARCODE', payload: barcode })} // Dispara o processamento do código lido
      onClose={() => dispatch({ type: 'CLOSE' })}                                       // Dispara o fechamento do modal e retorno de tela
    />
  );
}