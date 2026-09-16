// src/features/supplier/supplier.styles.ts
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
    fontSize: 32, 
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
  // Espaçamento vertical para o indicador de carregamento
  loader: { 
    marginVertical: 10 
  },
  // Estilo para destacar mensagens de erro
  error: { 
    color: '#FF3B30', 
    marginBottom: 8, 
    textAlign: 'center', 
    fontWeight: '600' 
  },
  // Seção superior de ações na tela principal
  sectionContainer: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  // Botão customizado principal de adicionar/ações
  actionButtonAdd: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  // Overlay ajustado para o topo para permitir a visualização da lista ao fundo
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Fundo semitransparente suave
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40, // Reduzido para posicionar bem no topo
  },
  // Container de conteúdo do Modal
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  // Container para empilhar botões (usado no cadastro)
  modalButtonsContainer: {
    gap: 8,
    marginTop: 8,
  },
  // Linha horizontal de botões para o modal de busca
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  // Estilo dos botões da linha horizontal
  modalRowButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Card branco (preservado)
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
  cancelButtonContainer: {
    marginTop: 8,
  },
  // Inputs
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    color: '#333',
    marginBottom: 10,
  },
  // Card da lista
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
  itemInfo: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  actionButtonsContainer: { 
    flexDirection: 'row', 
    gap: 8 
  },
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
  editButton: { 
    backgroundColor: '#0051FF' 
  },
  deleteButton: { 
    backgroundColor: '#FF0000' 
  },
  itemList: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#222' 
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#888', 
    marginTop: 20 
  },
});