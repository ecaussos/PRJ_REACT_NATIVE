// src/features/product/product.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Container principal que envolve toda a tela
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#f8f9fa', 
    paddingTop: 50 
  },
  // Estilo do título principal da tela
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 12, 
    textAlign: 'center', 
    color: '#333' 
  },
  // Estilo dos subtítulos de seções
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: '#444',
  },
  // Espaçamento vertical para o indicador de carregamento (ActivityIndicator)
  loader: { 
    marginVertical: 10 
  },
  // Estilo para destacar mensagens de erro na interface
  error: { 
    color: '#FF3B30', 
    marginBottom: 8, 
    textAlign: 'center', 
    fontWeight: '600' 
  },
  // Card branco que agrupa os elementos do formulário de cadastro e edição
  formCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  // Estilo padrão para as caixas de texto (Inputs)
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    color: '#333',
    marginBottom: 12,
  },
  // Card individual que exibe as informações na lista
  itemCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  // Layout interno do card para alinhar o texto à esquerda e os botões de ação à direita
  itemInfo: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  // Container que organiza os botões de ícone (editar e excluir) lado a lado
  actionButtonsContainer: { 
    flexDirection: 'row', 
    gap: 8 
  },
  // Estilo base para os botões modernos em formato de ícone quadrado com sombra
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  // Cor de fundo específica para o botão de editar (azul)
  editButton: { 
    backgroundColor: '#0051FF' 
  },
  // Cor de fundo específica para o botão de excluir (vermelho)
  deleteButton: { 
    backgroundColor: '#FF0000' 
  },
  // Estilo do nome do produto exibido no card da lista
  ItemList: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#222' 
  },
  // Estilo para os detalhes secundários do produto (como GTIN e grupo)
  details: { 
    fontSize: 12, 
    color: '#666', 
    marginTop: 2 
  },
  // Estilo do texto exibido na lista quando não há produtos cadastrados
  emptyText: { 
    textAlign: 'center', 
    color: '#888', 
    marginTop: 20 
  },
  // Container estilizado para envolver o componente Picker (seletor de grupos)
  pickerContainer: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    marginBottom: 12, 
    backgroundColor: '#fafafa' 
  }
});