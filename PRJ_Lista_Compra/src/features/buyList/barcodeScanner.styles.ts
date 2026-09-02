import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Container principal que envolve toda a tela
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  // Indicador de carregamento
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  // Container eue envolve a tela permissão câmera
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  // Título permissão câmera
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  // Messagem permissão câmera
  permissionMessage: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  // Botão permissão câmera
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  // Texto botão permissão câmera
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Botão cancelar
  cancelButton: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  // Texto botão cancelar
  cancelButtonText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  // Estrutura do leitor código de barra
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  // Desenho moldura leitor código de barra
  scanBox: {
    width: 230,
    height: 130,
    borderWidth: 2,
    borderColor: '#00FF00',
    borderRadius: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Linha no central da moldura leitor código de barra
  laserLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#FF3B30',
  },
  // Texto com a instrução
  instruction: {
    color: '#fff',
    fontSize: 15,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  // Botão para realiza a operação novamente
  rescanButton: {
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  // Texto botão para realiza a operação novamente
  rescanButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  // Botão para fechar o scanner
  footerContainer: {
    marginTop: 24,
    width: '100%',
  },
});