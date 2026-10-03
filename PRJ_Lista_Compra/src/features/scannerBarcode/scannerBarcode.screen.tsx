// src/features/scannerBarcode/scannerBarcode.screen.tsx
import { CameraView } from 'expo-camera';
import { ActivityIndicator, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useScannerBarcodeViewModel } from './scannerBarcode.hook';
import { styles } from './scannerBarcode.styles';
import { BarcodeScannerProps } from './scannerBarcode.types';

// Componente para escaneamento de código de barras usando a Câmera
export default function BarcodeScannerScreen(props: BarcodeScannerProps){
  const { permission, requestPermission, state, dispatch } = useScannerBarcodeViewModel(props); // Instancia ViewModel e estados

  // 1. Caso a permissão ainda esteja sendo carregada pelo sistema
  if (!permission) {
    // Exibe indicador de carregamento
    return (
      <View style={styles.centerContainer}>
        {/* Indicador visual de carregamento */}
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // 2. Caso a permissão de acesso tenha sido negada pelo usuário
  if (!permission.granted) {
    // Exibe mensagem e botão de permissão
    return (
      <View style={styles.permissionContainer}>
        {/* Título do alerta de permissão */}
        <Text style={styles.permissionTitle}>Acesso à Câmera</Text>
        {/* Mensagem da permissão de alerta */}
        <Text style={styles.permissionMessage}>
          Precisamos da sua permissão para ler os códigos de barras dos produtos.
        </Text>
        {/* Botão para permitir o acesso */}
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          {/* Título do botão */}
          <Text style={styles.permissionButtonText}>Permitir Acesso</Text>
        </TouchableOpacity>
        {/* Botão para negar o acesso */}
        <TouchableOpacity style={styles.cancelButton} onPress={() => dispatch({ type: 'CLOSE' })}>
          {/* Título do botão */}
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

// 3. Montagem da tela - Renderização da Câmera ativa
  return (
    <View style={styles.container}>
      {/* Chama função camera */}
      <CameraView
        style={StyleSheet.absoluteFill}                                     // Ocupa toda a área disponível da tela}
        facing="back"                                                       // Utiliza a câmera traseira do dispositivo
        onBarcodeScanned={                                                  // Função para ler o código de barra
          state.scanned                                                     // Valida o estado do scanner
            ? undefined                                                     // Desativa a leitura se já foi escaneado
            : ({ data }) => dispatch({ type: 'SCAN_CODE', payload: data })  // Pega o código de barra e dispara a chamada para consultar 
        }
        barcodeScannerSettings={{                                           // Definir tipo de código de barra
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'code128'],              // Tipo de código de barra
        }}
      />
      <View style={styles.overlay}>
        {/* Quandro para posicionar o código de barra */}
        <View style={styles.scanBox}>
          {/* Linha guia visual do leitor */}
          <View style={styles.laserLine} />
        </View>
        {/* Mensagem de instrução de uso */}
        <Text style={styles.instruction}>Aponte para o código de barras</Text>
        {/* Verifica o estado do scanner */}
        {state.scanned && (
          // Verdadeiro: exibi o botão para reiniciar o scanner
          <TouchableOpacity
            style={styles.rescanButton}                       // Estilo do botão
            onPress={() => dispatch({ type: 'RESET_SCAN' })}  // Dispara intenção de resetar o leitor
          >
            {/* Títilo do botão */}
            <Text style={styles.rescanButtonText}>Escanear Novamente</Text>
          </TouchableOpacity>
        )}
        {/* Botão no rodapé */}
        <View style={styles.footerContainer}>
          {/* Botão */}
          <Button
            title="Fechar"                              // Título do botão
            color="#FF3B30"                           // Cor do botão
            onPress={() => dispatch({ type: 'CLOSE' })} // Função e intensão para fechar CLOSE
          />
        </View>
      </View>
    </View>
  );
}