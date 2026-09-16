// src/features/buy/buy.screen.tsx
import React from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TextInput, View } from 'react-native';
import {
  BuyActions,
  BuyAddActions,
  BuyCartItemCard,
  BuyFooterTotal,
  BuyForm,
} from './buy.form';
import { useBuyViewModel } from './buy.hook';
import { styles } from './buy.styles';

export default function BuyScreen(): React.JSX.Element {
  // Obtém o estado, manipuladores e funções de orquestração diretamente do ViewModel
  const {
    state,                    // Estado global da tela
    dispatch,                 // Disparador de ações de negócio
    // Filtra lista
    filteredItems,            // Itens filtrados para exibição
    // Adicionar produto
    toggleAddOptions,         // Alterna visibilidade dos botões de adição
    // Câmera
    setCameraModal,           // Controla exibição do modal da câmera
    handleScanSuccess,        // Processa código de barras lido
    // Busca por Nome
    setNameSearchModal,       // Controla exibição do modal de busca por nome
    searchText,               // Texto da busca de produtos
    setSearchText,            // Atualiza texto da busca
    searchProductsByName,     // Busca produtos pelo nome no banco
    handleAddProductSelect,   // Adiciona produto selecionado à lista
    // Quantidade/Valor
    handleStartEditItem,      // Inicia edição de um item
    qtyText,                  // Texto da quantidade do item
    setQtyText,               // Atualiza texto da quantidade
    valueText,                // Texto do valor do item
    setValueText,             // Atualiza texto do valor
    handleSaveItemData,       // Salva alterações do item editado
    totalPurchaseValue,       // Valor total calculado da compra
    // Finaliza/Fornecedor
    handleOpenFinishModal,    // Valida e abre modal de finalização
    setSupplierModal,         // Controla exibição do modal de fornecedores
    handleConfirmFinalize,    // Finaliza a compra e salva histórico
  } = useBuyViewModel();

  // MONTAGEM DA TELA
  return (
    <View style={styles.container}>
      {/* Título principal da tela */}
      <Text style={styles.title}>Realizar Compra</Text>
      {/* Indicador visual de carregamento (Spinner) */}
      {state.loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
      {/* Exibição de mensagens de erro, caso ocorram */}
      {state.error && <Text style={styles.error}>{state.error}</Text>}
      {/* Botões de ações principais - Produto Com/Sem Lista */}
      <BuyActions
        onOpenBuyList={() => dispatch({ type: 'LOAD_BUY_LIST' })}   // Adicionar produto lista de compra
        onToggleAddOptions={toggleAddOptions}                       // Adicionar produto sem lista
      />
      {/* Botão de ação adicionar produto sem lista */}      
      {state.showAddOptions && (
        <BuyAddActions
          onOpenCamera={() => setCameraModal(true)}          // Código de barra - Câmera
          onOpenNameSearch={() => setNameSearchModal(true)}  // Por nome do produto
        />
      )}
      {/* Subtítulo da seção de listagem */}
      <Text style={styles.subtitle}>Produtos da Compra</Text>
      {/* Caixa de texto para pesquisar produtos na lista */}
      <TextInput
        style={styles.input}
        placeholder="Pesquisar Produto"
        value={searchText}
        onChangeText={setSearchText}
      />
      {/* Lista (FlatList) para renderizar os registros cadastrados e filtrados */}
      <FlatList
        // Fonte de dados que será obtidos os itens para monta lista 
        data={filteredItems}
        // Define Id para identificar registros na lista
        keyExtractor={(item, index) => String(item.id_list_buy || item.id_product || index)}
        //Monta os items na tela
        renderItem={({ item }) => {
          // Identifica o index definido para o registro
          const realIndex = state.items.findIndex(i => i === item);
          return (
            // Apresenta dados dos registros e botões de ação
            <BuyCartItemCard
              // Passa os dados do registro
              item={item}
              // Editar: Ao clicar no botão preenche o campo com a edição
              onEdit={() => handleStartEditItem(item, realIndex)}
              // Excluir: Revome o registro da lista
              onRemove={() => {
                // Validar se ID é negativo - Identifica que o registro deve ser removido da lista
                if (realIndex === -1) return;
                // Verdadeiro: Gera mensagem informativa
                Alert.alert('Remover Item', `Deseja remover "${item.nm_product}" desta compra?`, [
                  // Botão cancelar
                  { text: 'Cancelar', style: 'cancel' },
                  // Botão remover
                  { text: 'Remover',
                    style: 'destructive',
                    // Chama a função para remover registro da lista
                    onPress: () => dispatch({ type: 'REMOVE_ITEM', payload: { index: realIndex } }),
                  },
                ]);
              }}
            />
          );
        }}
        // Mensagem exibida caso a lista filtrada esteja vazia
        ListEmptyComponent={
          !state.loading ? <Text style={styles.emptyText}>Nenhum produto selecionado para a compra.</Text> : null
        }
      />
      {/* Apresenta o valor total dos registros na lista - Verifica se a lista tem registro */}
      {state.items.length > 0 && (
        // Verdadeiro: Apresenta o valor total.
        <BuyFooterTotal totalValue={totalPurchaseValue} onFinalize={handleOpenFinishModal} />
      )}
      {/* Modais de ação do Formulário - Camera, Busca nome e Quantidade */}
      <BuyForm
        // Modal Câmera
        showCameraModal={state.showCameraModal}                         // Exibe o modal do leitor de código de barras
        onScanSuccess={handleScanSuccess}                               // Processa a leitura do código de barras
        onCloseCameraModal={() => setCameraModal(false)}                // Oculta o modal da câmera
        // Modal Busca por Nome
        showNameSearchModal={state.showNameSearchModal}                 // Exibe o modal de busca de produto por nome
        onSearchProductsByName={searchProductsByName}                   // Busca produtos cadastrados no banco
        onSelectProductToAdd={handleAddProductSelect}                   // Adiciona o produto selecionado à lista
        onCloseNameSearchModal={() => setNameSearchModal(false)}        // Oculta o modal de busca por nome
        // Modal Item / Edição
        editingItem={state.editingItem}                                 // Dados do item em edição (null se nenhum)
        qtyText={qtyText}                                               // Texto informado no campo de quantidade
        valueText={valueText}                                           // Texto informado no campo de preço
        onChangeQtyText={setQtyText}                                    // Atualiza o estado da quantidade
        onChangeValueText={setValueText}                                // Atualiza o estado do preço
        onSaveItemData={handleSaveItemData}                             // Salva as alterações feitas no item
        onCloseItemModal={() => handleStartEditItem(null as any, -1)}   // Cancela e fecha a edição do item
        // Modal Finalizar
        showSupplierModal={state.showSupplierModal}                     // Exibe o modal de escolha do fornecedor
        suppliers={state.suppliers}                                     // Lista de fornecedores disponíveis
        onConfirmFinalize={handleConfirmFinalize}                       // Finaliza a compra vinculando o fornecedor
        onCloseSupplierModal={() => setSupplierModal(false)}            // Oculta o modal de fornecedores
      />
    </View>
  );
}