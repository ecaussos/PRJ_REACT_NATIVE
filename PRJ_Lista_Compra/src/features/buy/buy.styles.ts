// src/features/buyList/buyList.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Container principal que envolve toda a tela
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#f8f9fa', 
    paddingTop: 50 
  },
  // Título principal da tela
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 12, 
    textAlign: 'center', 
    color: '#333' 
  },
  // Subtítulos de seções
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
  // Destacar mensagens de erro na interface
  error: { 
    color: '#FF3B30', 
    marginBottom: 8, 
    textAlign: 'center', 
    fontWeight: '600' 
  },
  // Caixas de texto (Inputs)
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
  // Botões modernos em formato de ícone quadrado com sombra
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
  // Nome principal do item na lista
  ItemList: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#222' 
  },
  // Detalhes secundários do item na lista
  details: { 
    fontSize: 12, 
    color: '#666', 
    marginTop: 2 
  },
  // Quantidade do item na lista
  quantity: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 6,
    fontWeight: '600',
  },
  // Texto exibido na lista quando não há produtos cadastrados
  emptyText: { 
    textAlign: 'center', 
    color: '#888', 
    marginTop: 20 
  },
  // Rodapé com botão
  footer: {
    marginTop: 12,
    paddingBottom: 16,
  },
  // Fundo escurecido do modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  // Conteúdo interno do modal
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 12,
  },
  // Título do modal
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  // Botões de opção dentro do modal principal
  modalOptionButton: {
    backgroundColor: '#f1f3f5',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  // Texto dos botões de opção do modal
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  // Espaçamento entre os botões
  modalButtonsContainer:{
    gap: 8
  },

  // CAIXA BOTÇÕES ADICIONAR PRODUTO -> CÓDIGO OU NOME

  // Caixa externa agrupadora dos botões com borda e efeito Fieldset
  sectionContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
    position: 'relative',
    paddingTop: 18,
  },

  // Título flutuante posicionado na borda superior da caixa
  sectionTitle: {
    position: 'absolute',
    top: -10,
    left: 14,
    backgroundColor: '#fafafa',
    paddingHorizontal: 6,
    fontSize: 14,
    fontWeight: 'bold',
    color: "#888",
  },

  // Linha interna que distribui os botões lado a lado com espaçamento
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButtonList: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonAdd: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },

  // Estilo do botão de leitura por câmera (Código)
  actionButtonCamera: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  // Estilo do botão de consulta por nome
  actionButtonName: {
    flex: 1,
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  // Valor total
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  // Estilo de texto padrão para os botões de ação rápida
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});