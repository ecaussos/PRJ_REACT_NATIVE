// src/features/buyList/barcodeScannerScreen.tsx
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './barcodeScanner.styles';

// Funções necessárias para o funcionamento leitor código de barra - contrato
interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;   // Sucesso na leitura código de barra
  onClose: () => void;                        // Fecha a camera
}

// Gerenciamento da camera para realizar a leitura do código de barra
export default function BarcodeScannerScreen({ onScanSuccess, onClose }: BarcodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // 1. Verifica se a permissão de acesso a camera foi concedida
  if (!permission) {
    // MONTAGEM DA TELA    
    return (
      <View style={styles.centerContainer}>
        {/* Mostra indicador de carregamento */}
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // 2. Se a permissão não foi concedida - Apresenta tela de solicitação
  if (!permission.granted) {
    // MONTAGEM DA TELA
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Acesso à Câmera</Text>
        <Text style={styles.permissionMessage}>
          Precisamos da sua permissão para ler os códigos de barras dos produtos.
        </Text>
        {/* Botão Permitir*/}
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Permitir Acesso</Text>
        </TouchableOpacity>
        {/* Botão Cancelar*/}
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 3. Processamento do escaneamento código de barra
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    // Verificar se houve retorno - garantir que não processe várias vezes seguidas
    if (scanned) return;
    // Se for verdadeiro:
    setScanned(true);         // Altera status
    onScanSuccess(data);      // Chama a função e envia o código
  };
  // MONTAGEM DA TELA
  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        //Ativa a câmera traseira
        facing="back"
        // Controla leitura do código - scanned tem valor?: True -> undefined (desativado) | False -> handleBarCodeScanned (Realiza a leitura) 
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        // Tipos de códigos de barras que a camera lê
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'code128'],
        }}
      />
      <View style={styles.overlay}>
        {/*Desenho moldura leitor código de barra*/}
        <View style={styles.scanBox}>
          {/*Linha no central da moldura leitor código de barra*/}
          <View style={styles.laserLine} />
        </View>
        {/* Texto com a instrução */}
        <Text style={styles.instruction}>Aponte para o código de barras</Text>
        {/* Valida se scanned já foi executado */}
        {scanned && (
          // Se for verdadeiro: Apresenta botão para realiza a operação novamente
          <TouchableOpacity style={styles.rescanButton} onPress={() => setScanned(false)}>
            <Text style={styles.rescanButtonText}>Escanear Novamente</Text>
          </TouchableOpacity>
        )}
        {/* Botão para fechar o scanner */}
        <View style={styles.footerContainer}>
          <Button title="Fechar" color="#FF3B30" onPress={onClose} />
        </View>
      </View>
    </View>
  );
}