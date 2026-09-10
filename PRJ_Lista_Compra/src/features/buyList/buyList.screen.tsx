// src/features/buyList/buyList.screen.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Alert, Button, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BuyListActions, BuyListForm } from './buyList.form';
import { useBuyListViewModel } from './buyList.hook';
import { styles } from './buyList.styles';

export default function BuyListScreen(): React.JSX.Element {
  // Obtém o estado, manipuladores e funções de orquestração diretamente do ViewModel
  const {
    state,
    form,
    dispatch,
    filteredItems,
    searchProductsByName,
    handleScanSuccess,
    handleSelectProductToBuy,
    handleSaveQuantity,
    startEditing,
  } = useBuyListViewModel();

  // MONTAGEM DA TELA
  return (
    <View style={styles.container}>
      {/* Título principal da tela */}
      <Text style={styles.title}>Lista de Compras</Text>
      {/* Indicador visual de carregamento (Spinner) */}
      {state.loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
      {/* Exibição de mensagens de erro, caso ocorram */}
      {state.error && <Text style={styles.error}>{state.error}</Text>}

      {/* Componente das Ações Principais - Adicionar Produto */}
      <BuyListActions
        onOpenCamera={() => form.setShowCameraModal(true)}
        onOpenNameSearch={() => {
          form.setProductQuery('');
          form.setFoundProducts([]);
          form.setShowNameSearchModal(true);
        }}
      />

      {/* Subtítulo da seção de listagem */}
      <Text style={styles.subtitle}>Produtos Listados</Text>
      {/* Caixa de texto para pesquisar produtos na lista */}
      <TextInput
        style={styles.input}
        placeholder="Pesquisar Produto"
        placeholderTextColor="#888"
        value={form.searchText}
        onChangeText={form.setSearchText}
      />
      {/* Lista (FlatList) para renderizar os registros cadastrados e filtrados */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => String(item.id_list_buy)}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemInfo}>
              {/* Apresenta a lista com campos */}
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.ItemList}>{item.nm_product}</Text>
                <Text style={styles.details}>{item.nm_group || 'Categoria Geral'}</Text>
                <Text style={styles.quantity}>Quantidade: {item.qt_product}</Text>
              </View>
              {/* Container dos botões de ação */}
              <View style={styles.actionButtonsContainer}>
                {/* Botão de Edição: preenche o formulário com os dados do item selecionado */}
                <TouchableOpacity
                  style={[styles.iconButton, styles.editButton]}
                  onPress={() => startEditing(item)}
                > 
                  {/* Ícone botão de Edição */}
                  <MaterialCommunityIcons name="pencil-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                {/* Botão de Exclusão: exibe alerta de confirmação antes de remover o registros */}
                <TouchableOpacity
                  style={[styles.iconButton, styles.deleteButton]}
                  onPress={() => {
                    Alert.alert(
                      'Remover',
                      `Deseja remover "${item.nm_product}" da lista?`,
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Remover',
                          style: 'destructive',
                          onPress: () => dispatch({ type: 'DELETE', payload: { id_list_buy: item.id_list_buy } }),
                        },
                      ]
                    );
                  }}
                >
                  {/* Ícone botão de Exclusão */}
                  <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        // Mensagem exibida caso a lista filtrada esteja vazia
        ListEmptyComponent={
          !state.loading ? <Text style={styles.emptyText}>Nenhum registro encontrado.</Text> : null
        }
      />

      {/* Botão remove todos os produtos da lista de compra*/}
      {state.items.length > 0 && (
        <View style={styles.footer}>
          <Button
            title="Limpar Lista Completa"
            color="#FF3B30"
            onPress={() => {
              Alert.alert('Limpar Lista', 'Deseja realmente apagar todos os itens?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Limpar', style: 'destructive', onPress: () => dispatch({ type: 'CLEAR' }) },
              ]);
            }}
          />
        </View>
      )}

      {/* Modais de ação do Formulário - Camera, Busca nome e Quantidade */}
      <BuyListForm
        // Modal Câmera
        showCameraModal={form.showCameraModal}
        onScanSuccess={handleScanSuccess}
        onCloseCameraModal={() => form.setShowCameraModal(false)}

        // Modal Busca por Nome
        showNameSearchModal={form.showNameSearchModal}
        productQuery={form.productQuery}
        foundProducts={form.foundProducts}
        isSearching={form.isSearching}
        onSearchProductQueryChange={searchProductsByName}
        onSelectProductToBuy={handleSelectProductToBuy}
        onCloseNameSearchModal={() => form.setShowNameSearchModal(false)}

        // Modal Atualizar Quantidade
        editingQuantityItem={form.editingQuantityItem}
        newQuantityText={form.newQuantityText}
        onChangeQuantityText={form.setNewQuantityText}
        onSaveQuantity={handleSaveQuantity}
        onCloseQuantityModal={() => form.setEditingQuantityItem(null)}
      />
    </View>
  );
}