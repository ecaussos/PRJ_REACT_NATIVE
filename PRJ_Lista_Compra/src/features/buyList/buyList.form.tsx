// src/features/buyList/buyList.form.tsx
import React from 'react';
import { ActivityIndicator, Button, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BarcodeScannerScreen from '../scannerBarcode/scannerBarcode.screen';
import { styles } from './buyList.styles';
import { BuyListFormProps } from './buyList.types';

// Botões para adicionar produtos
export interface BuyListActionsProps {
  onOpenCamera: () => void;         // Câmera para leitura de código de barras
  onOpenNameSearch: () => void;     // Consulta de produto por nome
}

// Modal com os botões para adicionar produtos
export function BuyListActions({ onOpenCamera, onOpenNameSearch }: BuyListActionsProps): React.JSX.Element {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Adicionar Produto</Text>
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.actionButtonCamera} onPress={onOpenCamera}>
          <Text style={styles.buttonText}>📷 Código</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButtonName} onPress={onOpenNameSearch}>
          <Text style={styles.buttonText}>🔍 Nome</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Modal Câmera para leitura código de barra
export interface BuyListCameraModalProps {
  visible: boolean;
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
}

export function BuyListCameraModal({ visible, onScanSuccess, onClose }: BuyListCameraModalProps): React.JSX.Element {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { height: '50%', padding: 0, overflow: 'hidden' }]}>
          {visible && (
            <BarcodeScannerScreen
              onScanSuccess={onScanSuccess}
              onClose={onClose}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

// MODAIS PRINCIPAIS PARA TELA DE LISTA DE COMPRA
export function BuyListForm({
  // MODAL DA CÂMERA
  showCameraModal,
  onScanSuccess,
  onCloseCameraModal,

  // MODAL DE BUSCA POR NOME
  showNameSearchModal,
  productQuery,
  foundProducts,
  isSearching,
  onSearchProductQueryChange,
  onSelectProductToBuy,
  onCloseNameSearchModal,

  // MODAL DE ATUALIZAR QUANTIDADE
  editingQuantityItem,
  newQuantityText,
  onChangeQuantityText,
  onSaveQuantity,
  onCloseQuantityModal,
}: BuyListFormProps): React.JSX.Element {

  return (
    <>
      {/* MODAL DA CÂMERA */}
      <BuyListCameraModal
        visible={showCameraModal}
        onScanSuccess={onScanSuccess}
        onClose={onCloseCameraModal}
      />

      {/* MODAL DE BUSCA POR NOME */}
      <Modal
        visible={showNameSearchModal}
        animationType="slide"
        transparent={true}
        onRequestClose={onCloseNameSearchModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <Text style={styles.modalTitle}>Consultar por Nome</Text>

            {/* Caixa de texto para pesquisar produto por nome */}
            <TextInput
              style={styles.input}
              placeholder="Digite o nome do produto..."
              placeholderTextColor="#888"
              value={productQuery}
              onChangeText={onSearchProductQueryChange}
              autoFocus
            />

            {/* Indicador visual de carregamento (Spinner) */}
            {isSearching && <ActivityIndicator size="small" color="#007AFF" style={{ marginVertical: 10 }} />}

            {/* Lista com os resultados encontrados */}
            <FlatList
              data={foundProducts}
              keyExtractor={(item) => String(item.id_product)}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                  onPress={() => onSelectProductToBuy(item)}
                >
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#222' }}>{item.nm_product}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                productQuery.trim().length > 0 && !isSearching ? (
                  <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>Nenhum produto encontrado.</Text>
                ) : null
              }
            />

            {/* Botão para fechar o modal */}
            <View style={{ marginTop: 12 }}>
              <Button title="Fechar" color="#FF3B30" onPress={onCloseNameSearchModal} />
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL DE ATUALIZAR QUANTIDADE */}
      <Modal
        visible={editingQuantityItem !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={onCloseQuantityModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Quantidade</Text>
            <Text style={{ textAlign: 'center', marginBottom: 10, color: '#333', fontWeight: '600' }}>
              {editingQuantityItem?.nm_product}
            </Text>

            {/* Caixa de texto para editar a quantidade */}
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={newQuantityText}
              onChangeText={onChangeQuantityText}
              placeholder="Nova quantidade"
              placeholderTextColor="#888"
              selectTextOnFocus
              autoFocus
            />

            {/* Botões de ação */}
            <View style={styles.modalButtonsContainer}>
              <Button title="Salvar" onPress={onSaveQuantity} />
              <Button title="Cancelar" color="#6c757d" onPress={onCloseQuantityModal} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}