import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Container principal que envolve toda a tela
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  // Logotipo
  logo: {
    width: 200,
    height: 200,
    borderRadius: 22,
    marginBottom: 15,
  },
  // Título principal da tela
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  // Subtítulos de seções
  subtitulo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  // Container com os botão do menu
  menuContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  // Botões do menu
  botao: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Texto do botões do menu
  textoBotao: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
})