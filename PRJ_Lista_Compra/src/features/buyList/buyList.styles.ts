// src/features/buyList/buyList.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Container principal que envolve toda a tela
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
    paddingTop: 50,
  },
  // Estilo do título principal da tela
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
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
    marginVertical: 10,
  },
  // Estilo para destacar mensagens de erro
  error: {
    color: '#FF3B30',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },

  // AGRUPADOR DE BOTÕES PRINCIPAIS (FIELDSET)
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
  sectionTitle: {
    position: 'absolute',
    top: -10,
    left: 14,
    backgroundColor: '#fafafa',
    paddingHorizontal: 6,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
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

  // LISTA E ITENS
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
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  itemList: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  details: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },

  // BOTÕES DE AÇÃO DOS ITENS
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
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
    backgroundColor: '#0051FF',
  },
  deleteButton: {
    backgroundColor: '#FF0000',
  },

  // INPUTS E FORMULÁRIOS
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },

  // ESTRUTURA GENÉRICA DE MODAIS E OVERLAY
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
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
  modalButtonsContainer: {
    gap: 8,
    marginTop: 8,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  modalRowButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

// Estilos específicos para o Modal de Edição de Quantidade
  editModalProductName: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
    fontWeight: '600',
  },
  editModalInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    color: '#333',
    marginBottom: 10,
    width: '100%',
    textAlign: 'center',
  },
  saveButtonColor: {
    backgroundColor: '#34C759',
  },
  cancelButtonColor: {
    backgroundColor: '#FF3B30',
  },

// MODAL ADICIONAR PRODUTO - CÓDIGO/NOME 

  // Estilo do botão de leitura por câmera (Código)
  actionButtonCamera: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Estilo do botão de consulta por nome
  actionButtonName: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Estilo dos botões da linha horizontal do modal
  fullWidthCancelButton: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8E8E93',
    marginTop: 15,
  },

  // RODAPÉ E MODAL FINALIZAR COMPRA
  footer: {
    backgroundColor: '#ededed',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  titlefooter:{
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },

  actionButtonFooter: {
    backgroundColor: '#ff0000',
    width: '45%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  }

});