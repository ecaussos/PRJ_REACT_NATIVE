// src/features/scannerBarcode/scannerBarcode.screen.tsx
import { CameraView, useCameraPermissions } from 'expo-camera'; // Módulo de câmera do Expo
import React, { useState } from 'react'; // React core e hooks
import { ActivityIndicator, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // Componentes nativos
import { styles } from './scannerBarcode.styles'; // Estilos da tela de escaneamento

// Contrato das propriedades do leitor de código de barras
export interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void; // Callback chamado ao ler o código com sucesso
  onClose: () => void; // Callback para fechar o scanner/câmera
}

// Componente para escaneamento de código de barras usando a Câmera
export default function BarcodeScannerScreen({ onScanSuccess, onClose }: BarcodeScannerProps): React.JSX.Element {
  const [permission, requestPermission] = useCameraPermissions(); // Hook para gerenciar permissões da câmera
  const [scanned, setScanned] = useState(false); // Estado para evitar leituras duplicadas seguidas

  // 1. Caso a permissão ainda esteja sendo carregada pelo sistema
  if (!permission) {
    // Exibe indicador de carregamento
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // 2. Caso a permissão de acesso tenha sido negada pelo usuário
  if (!permission.granted) {
    // Exibe mensagem e botão de permissão
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Acesso à Câmera</Text>
        <Text style={styles.permissionMessage}>
          Precisamos da sua permissão para ler os códigos de barras dos produtos.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Permitir Acesso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 3. Processamento do evento de leitura do código de barras
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return; // Evita múltiplas chamadas se já foi escaneado
    setScanned(true); // Bloqueia novas leituras até resetar
    onScanSuccess(data); // Envia a informação lida para o componente pai
  };

  // Renderização do leitor ativado
  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill} // Ocupa todo o espaço do container
        facing="back" // Ativa a câmera traseira
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned} // Desativa a leitura se scanned for true
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'code128'], // Tipos de códigos suportados
        }}
      />
      <View style={styles.overlay}>
        <View style={styles.scanBox}>
          <View style={styles.laserLine} />
        </View>
        <Text style={styles.instruction}>Aponte para o código de barras</Text>
        
        {scanned && (
          <TouchableOpacity style={styles.rescanButton} onPress={() => setScanned(false)}>
            <Text style={styles.rescanButtonText}>Escanear Novamente</Text>
          </TouchableOpacity>
        )}
        <View style={styles.footerContainer}>
          <Button title="Fechar" color="#FF3B30" onPress={onClose} />
        </View>
      </View>
    </View>
  );
}