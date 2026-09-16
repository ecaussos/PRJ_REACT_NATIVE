// src/features/buy/buy.form.tsx
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ProductEntity } from '../../data/entities/product.entity';
import { SupplierEntity } from '../../data/entities/supplier.entity';
import { BuyListCameraModal } from '../buyList/buyList.form';
import { styles } from './buy.styles';
import { BuyCartItem, BuyFormProps, SearchProductResult } from './buy.types';

// Botões de ações principais - Produto Com/Sem Lista
export function BuyActions({
  onOpenBuyList,
  onToggleAddOptions,
}: {
  onOpenBuyList: () => void;
  onToggleAddOptions: () => void;
}) {
  // MONTAGEM DA TELA
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Ações Principais</Text>
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.actionButtonList} onPress={onOpenBuyList}>
          <Text style={styles.buttonText}>Carregar Lista</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButtonAdd} onPress={onToggleAddOptions}>
          <Text style={styles.buttonText}>+ Adicionar Item</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Botão de ação adicionar produto sem lista
export function BuyAddActions({
  onOpenCamera,
  onOpenNameSearch,
}: {
  onOpenCamera: () => void;
  onOpenNameSearch: () => void;
}) {
  // MONTAGEM DA TELA
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Modo de Adição</Text>
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.actionButtonCamera} onPress={onOpenCamera}>
          <Text style={styles.buttonText}>📷 Câmera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButtonName} onPress={onOpenNameSearch}>
          <Text style={styles.buttonText}>🔍 Buscar Nome</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Apresenta lista dos itens da compra e botões de ação
export function BuyCartItemCard({
  item,
  onEdit,
  onRemove,
}: {
  item: BuyCartItem;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const unitValue = item.vl_product ?? 0;
  const quantity = item.qt_product || 1;
  const hasValue = item.vl_product !== undefined && item.vl_product !== null;
  const subtotal = quantity * unitValue;
  
  // MONTAGEM DA TELA
  return (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <View>
          <Text style={styles.ItemList}>{item.nm_product}</Text>
          {item.nm_group ? <Text style={styles.details}>{item.nm_group}</Text> : null}
          <Text style={styles.quantity}>Qtd: {quantity}</Text>
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.iconButton, styles.editButton]}
            onPress={onEdit}
            accessibilityLabel="Editar item"
          >
            <Text style={styles.buttonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.deleteButton]}
            onPress={onRemove}
            accessibilityLabel="Remover item"
          >
            <Text style={styles.buttonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.details}>
        Unit: {hasValue ? `R$ ${unitValue.toFixed(2)}` : 'Não informado'} | Subtotal: {hasValue ? `R$ ${subtotal.toFixed(2)}` : 'R$ 0.00'}
      </Text>
    </View>
  );
}

// Apresenta o valor total dos registros na lista - Verifica se a lista tem registro
export function BuyFooterTotal({
  totalValue,
  onFinalize,
}: {
  totalValue: number;
  onFinalize: () => void;
}) {
  // MONTAGEM DA TELA
  return (
    <View style={styles.footer}>
      <Text style={styles.title}>Total: R$ {totalValue.toFixed(2)}</Text>
      <TouchableOpacity style={styles.actionButtonAdd} onPress={onFinalize}>
        <Text style={styles.buttonText}>Finalizar Compra</Text>
      </TouchableOpacity>
    </View>
  );
}

// Modal de ação adicionar produto por nome
export function BuyNameSearchModal({
  visible,
  onClose,
  onSearchProducts,
  onSelectProduct,
}: {
  visible: boolean;
  onClose: () => void;
  onSearchProducts: (query: string) => Promise<SearchProductResult[]>;
  onSelectProduct: (product: ProductEntity | SearchProductResult) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchProductResult[]>([]);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.trim().length > 1) {
      const data = await onSearchProducts(text);
      setResults(data);
    } else {
      setResults([]);
    }
  };

  const handleSelect = (product: SearchProductResult) => {
    onSelectProduct(product);
    setQuery('');
    setResults([]);
    onClose();
  };

  // MONTAGEM DA TELA
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Buscar Produto</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o nome..."
          value={query}
          onChangeText={handleSearch}
          autoFocus
        />
        <FlatList
          data={results}
          keyExtractor={item => String(item.id_product)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.modalOptionButton}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.modalOptionText}>{item.nm_product}</Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity style={styles.actionButtonList} onPress={onClose}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

export function BuyItemModal({
  visible,
  item,
  quantityText,
  valueText,
  onChangeQuantity,
  onChangeValue,
  onSave,
  onClose,
}: {
  visible: boolean;
  item: BuyCartItem | null;
  quantityText: string;
  valueText: string;
  onChangeQuantity: (text: string) => void;
  onChangeValue: (text: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  if (!item) return null;

  // MONTAGEM DA TELA
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Editar Item</Text>
          <Text style={styles.subtitle}>{item.nm_product}</Text>

          <Text style={styles.label}>Quantidade:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={quantityText}
            onChangeText={onChangeQuantity}
          />

          <Text style={styles.label}>Valor Unitário (R$):</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="0.00"
            value={valueText}
            onChangeText={onChangeValue}
          />

          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity style={styles.actionButtonAdd} onPress={onSave}>
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButtonList} onPress={onClose}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function FinishBuyModal({
  visible,
  suppliers,
  onSelectSupplier,
  onClose,
}: {
  visible: boolean;
  suppliers: SupplierEntity[];
  onSelectSupplier: (supplier: SupplierEntity) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Selecione o Mercado</Text>
          <FlatList
            data={suppliers}
            keyExtractor={item => String(item.id_supplier)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalOptionButton}
                onPress={() => onSelectSupplier(item)}
              >
                <Text style={styles.modalOptionText}>{item.nm_supplier}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.actionButtonList} onPress={onClose}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// MODAIS REUTILIZÁVEIS
export function BuyForm({
  // Modal Câmera
  showCameraModal,                                   // Exibe o modal da câmera
  onScanSuccess,                                     // Ação ao ler o código de barras
  onCloseCameraModal,                                // Fecha o modal da câmera
  // Modal Busca por Nome
  showNameSearchModal,                               // Exibe o modal de busca por nome
  onSearchProductsByName,                            // Executa a busca de produtos
  onSelectProductToAdd,                              // Ação ao selecionar um produto
  onCloseNameSearchModal,                            // Fecha o modal de busca por nome
  // Modal Item / Edição
  editingItem,                                       // Item sendo editado atualmente
  qtyText,                                           // Texto da quantidade do item
  valueText,                                         // Texto do preço do item
  onChangeQtyText,                                   // Atualiza o texto da quantidade
  onChangeValueText,                                 // Atualiza o texto do preço
  onSaveItemData,                                    // Salva as edições do item
  onCloseItemModal,                                  // Fecha o modal de edição
  // Modal Finalizar
  showSupplierModal,                                 // Exibe o modal de seleção de fornecedor
  suppliers,                                         // Lista de fornecedores disponíveis
  onConfirmFinalize,                                 // Confirma a finalização com o fornecedor
  onCloseSupplierModal,                              // Fecha o modal de fornecedor
}: BuyFormProps): React.JSX.Element {
  return (
    <>
      {/* Modal Câmera */}
      <BuyListCameraModal
        visible={showModal}                   // Exibe o modal do leitor de código de barras
        onScanSuccess={onScanSuccess}               // Processa a leitura do código de barras
        onClose={onCloseCameraModal}                // Oculta o modal da câmera
      />
      {/* Modal Busca por Nome */}
      <BuyNameSearchModal
        visible={showNameSearchModal}               // Exibe o modal de busca de produto por nome
        onClose={onCloseNameSearchModal}            // Oculta o modal de busca por nome
        onSearchProducts={onSearchProductsByName}   // Busca produtos cadastrados no banco
        onSelectProduct={onSelectProductToAdd}      // Adiciona o produto selecionado à lista
      />
      {/* Modal Item / Edição */}
      <BuyItemModal
        visible={editingItem !== null}              // Exibe o modal de edição quantidade e valor
        item={editingItem?.item || null}            // Dados do item em edição (null se nenhum)
        quantityText={qtyText}                      // Texto informado no campo de quantidade
        valueText={valueText}                       // Texto informado no campo de preço
        onChangeQuantity={onChangeQtyText}          // Atualiza o estado da quantidade
        onChangeValue={onChangeValueText}           // Atualiza o estado do preço
        onSave={onSaveItemData}                     // Salva as alterações feitas no item
        onClose={onCloseItemModal}                  // Cancela e fecha a edição do item
      />
      {/* Modal Finalizar*/}
      <FinishBuyModal
        visible={showSupplierModal}                 // Exibe o modal de escolha do fornecedor
        suppliers={suppliers}                       // Lista de fornecedores disponíveis
        onSelectSupplier={onConfirmFinalize}        // Finaliza a compra vinculando o fornecedor
        onClose={onCloseSupplierModal}              // Oculta o modal de fornecedores
      />
    </>
  );
}