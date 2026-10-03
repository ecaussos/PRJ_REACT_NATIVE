// features/scannerQuick/scannerQuick.screen.tsx
import { View } from 'react-native';
import { BuyListCameraModal } from '../buyList/buyList.form';
import { ScannerQuickForm } from './scannerQuick.form';
import { useScannerQuickViewModel } from './scannerQuick.hook';

export function ScannerQuickScreen() {                                                        // Declaração do componente principal da tela de leitor rápido
  const { state, groups, saveProductAndAddToBuyList, dispatch } = useScannerQuickViewModel(); // Desestrutura dados e funções do ViewModel
  // -------- MONTAGEM DOS BOTÕES NA TELA -------- //
  return (
    // Container principal ocupando todo o espaço da tela
    <View style={{ flex: 1 }}>
      {/* 1. Modal da Câmera / Leitor */}
      <BuyListCameraModal                                                               // Modal com a interface de leitura de código de barras
        showModal={state.visible}                                                       // Controla a visibilidade da câmera/leitor
        onScanSuccess={barcode => dispatch({ type: 'SCAN_BARCODE', payload: barcode })} // Despacha a intenção de leitura ao detectar o código
        onClose={() => dispatch({ type: 'CLOSE' })}                                     // Despacha a intenção de fechar a tela do leitor
      />
      {/* 2. Formulário de Confirmação e Edição Rápida */}
      <ScannerQuickForm                         // Modal de confirmação/edição do produto lido
        visible={state.isConfirmModalOpen}      // Controla a visibilidade do modal de confirmação
        scannedProduct={state.scannedProduct}  // Dados do produto lido para pré-preenchimento
        selectedGroupId={state.selectedGroupId} // ID do grupo pré-selecionado
        groups={groups}                         // Lista de grupos para o seletor
        loading={state.loading}                 // Estado visual de carregamento do botão/formulário
        onSave={saveProductAndAddToBuyList}     // Função disparada ao salvar o produto
        dispatch={dispatch}                     // Função dispatch para ações do formulário
      />
    </View>
  );
}