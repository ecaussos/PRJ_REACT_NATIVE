// src/features/buyList/buyList.form.tsx
import { ActivityIndicator, Button, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BarcodeScannerScreen from './barcodeScannerScreen';
import { styles } from './buyList.styles';

// COMPONENTE DE BOTÕES DE AÇÃO
interface BuyListActionsProps {
  onOpenCamera: () => void;       // Busca Registro: Código de Barra
  onOpenNameSearch: () => void;   // Busca Registro: Nome
}
// Função para mostrar os botões adicionar registro
export function BuyListActions({ onOpenCamera, onOpenNameSearch }: BuyListActionsProps) {
  // MONTAGEM DA TELA
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

// COMPONENTE ISOLADO DO MODAL DA CÂMERA (REUTILIZÁVEL)
interface BuyListCameraModalProps {
  visible: boolean;
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
}

// função para mostrar a camera
export function BuyListCameraModal({ visible, onScanSuccess, onClose }: BuyListCameraModalProps) {
  // MONTAGEM DA TELA
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

// COMPONENTE PRINCIPAL DE MODAIS
interface BuyListFormProps {
  // Props do Modal da Câmera
  showCameraModal: boolean;                             // Visibilidade da câmera
  onScanSuccess: (barcode: string) => void;             // Sucesso no escaneamento
  onCloseCameraModal: () => void;                       // Fecha a câmera
  
  // Props do Modal de Busca por Nome
  showNameSearchModal: boolean;                         // Visibilidade da busca por nome
  productQuery: string;                                 // Texto da busca
  foundProducts: any[];                                 // Produtos encontrados
  isSearching: boolean;                                 // Status de carregamento
  onSearchProductQueryChange: (query: string) => void;  // Atualiza a busca
  onSelectProductToBuy: (product: any) => void;         // Seleciona o produto
  onCloseNameSearchModal: () => void;                   // Fecha a busca

  // Props do Modal de Edição de Quantidade
  editingQuantityItem: { id_list_buy: number;
                         nm_product: string;
                         qt_product: number } | null;   // Item em edição
  newQuantityText: string;                              // Texto da quantidade
  onChangeQuantityText: (text: string) => void;         // Atualiza a quantidade
  onSaveQuantity: () => void;                           // Salva a quantidade
  onCloseQuantityModal: () => void;                     // Fecha a edição
}

//
export function BuyListForm({
  // MODAL DA CÂMERA
  showCameraModal,                  // Mostra a câmera
  onScanSuccess,                    // Sucesso na leitura
  onCloseCameraModal,               // Fecha a câmera

  // MODAL DE BUSCA POR NOME
  showNameSearchModal,              // Mostra a busca
  productQuery,                     // Texto da busca
  foundProducts,                    // Produtos encontrados
  isSearching,                      // Status de carregamento
  onSearchProductQueryChange,       // Atualiza busca 
  onSelectProductToBuy,             // Seleciona o produto
  onCloseNameSearchModal,           // Fecha a busca

  // MODAL DE ATUALIZAR QUANTIDADE
  editingQuantityItem,              // Item em edição
  newQuantityText,                  // Texto da quantidade
  onChangeQuantityText,             // Atualiza quantidade
  onSaveQuantity,                   // Salva a alteração
  onCloseQuantityModal,             // Fecha a edição
}: BuyListFormProps) {
  // MONTAGEM DA TELA
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

            {/* Caixa de texto para pesquisar na lista */}
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

            {/* Lista com os resultados encontrados no banco */}
            <FlatList
              data={foundProducts}
              keyExtractor={(item) => String(item.id_product)}
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

            {/* Caixa de texto para informar o novo valor */}
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={newQuantityText}
              onChangeText={onChangeQuantityText}
              placeholder="Nova quantidade"
              placeholderTextColor="#888"
              autoFocus
            />

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