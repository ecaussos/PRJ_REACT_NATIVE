// src/features/buyHist/buyHist.screen.tsx
import { useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import {
  BuyHistActions,
  BuyHistEditModal,
  BuyHistFilterModal,
  BuyHistFooterTotal,
  BuyHistItemModal
} from './buyHist.form';
import { useBuyHistViewModel } from './buyHist.hook';
import { styles } from './buyHist.styles';

export default function BuyHistScreen() {
  /* -------- FUNÇÕES EXECUTADAS AO CARREGAR A TELA -------- */
  // Extrai estados e funções de regra de negócio do ViewModel
  const {
    state,                      // Estado global da lista de compras (itens, carregamento, erros)
    form,                       // Controle dos campos de formulário e modais
    handleSaveData,             // Salva ou atualiza um item na lista
    handleDeleteData,           // Remove um item específico da lista
    totalPurchaseItem,          // Quantidade total dos itens da compra
    totalPurchaseValue,         // Valor total calculado dos itens da lista
  } = useBuyHistViewModel();


  // Controla a visibilidade do modal unificado de adição de produto (Câmera ou Nome)
  const [showAddModal, setShowAddModal] = useState(false);
  // Controla a visibilidade do modal de filtragem - inicia fechado/oculto
  const [showFilterModal, setShowFilterModal] = useState(false);
  // Controla a visibilidade do modal de Scanner (Adicionar produto) - inicia fechado/oculto

  /* -------- FUNÇÕES QUE DEPENDEM DE AÇÕES -------- */

  // Função para realizar a edição do registro
  const handleOpenEditModal = ( id: number, Product: number, quantity: number, price: number, supplier: number) => {
    form.startEditing(id, Product, quantity, price, supplier); // Preenche o formulário com os dados do registro selecionado
  };

  // Função para salvar o registro e fechar o formulário de edição
  const handleSave = async () => {
    await handleSaveData(); // Chama a função para salvar os dados do registro
  };

  // Função para fechar o formulário de edição
  const handleCloseForm = () => {
    form.resetForm(); // Limpa os campos e reseta o estado do formulário
  };

  // Obtém o item em edição para passar as propriedades (ex: nm_product) ao modal de edição
  const activeEditingItem = state.items.find(item => item.id_hist_buy === form.editingId);

  /* -------- MONTAGEM DA TELA -------- */
  return (
    <View style={styles.container}>
      {/* Título principal da tela */}
      <Text style={styles.title}>Histórico de Compras</Text>
      {/* Indicador visual de carregamento (Spinner) */}
      {state.loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
      {/* Exibição de mensagens de erro, caso ocorram */}
      {state.error && <Text style={styles.error}>{state.error}</Text>}
      {/* Botões principais de ação - Adicionar, Filtrar e Limpar */}
      <BuyHistActions
        onOpenFilterModal={() => setShowFilterModal(true)} // Ação do botão para mostrar modal de filtragem de registro
        onClearSearch={() => form.setSearchText('')} // Ação do botão para limpar a filtragem de registro atual
        hasActiveSearch={form.searchText.length > 0} // Passa "true" se houver algum texto digitado na busca
      />
      {/* Caixa de texto para pesquisar produtos na lista */}
      <Text style={styles.subtitle}>Produtos Comprados</Text>
      {/* Lista (FlatList) para renderizar os registros cadastrados e filtrados */}
      <FlatList
        // Fonte de dados que será obtida para montar a lista
        data={state.items}
        // Define ID para identificar registros na lista
        keyExtractor={(item) => item.id_hist_buy.toString()}
        //Monta os items na tela
        renderItem={({ item }) => (
          // Apresenta dados dos registros e botões de ação
          <BuyHistItemModal
            // Campos utilizando para a listaagem         
            name={item.nm_product} // Passa o nome do produto cadastrado
            quantity={item.qt_product} // Passa a quantidade cadastrada
            price={item.vl_product}// Passa a quantidade cadastrada
            groupName={item.nm_group ?? undefined} // Passa o nome do grupo retornado pelo JOIN
            supplierName={item.nm_supplier ?? undefined}
            dateBuy={item.dt_hist_buy}
            onEdit={() => handleOpenEditModal(item.id_hist_buy, item.id_product, item.qt_product, item.vl_product ?? 0, item.id_supplier)}
            onDelete={() => handleDeleteData(item.id_hist_buy, item.nm_product)}
          />
        )}
        // Mensagem exibida caso a lista filtrada esteja vazia
        ListEmptyComponent={
          !state.loading ? <Text style={styles.emptyText}>Nenhum compra registra no histórico.</Text> : null
        }
      />
      {/* Apresenta o valor total dos registros na lista - Verifica se a lista tem registro */}
      {state.items.length > 0 && (
        // Verdadeiro: Apresenta o valor total.
        <BuyHistFooterTotal
          // Quantidade total de item 
          totalItem={totalPurchaseItem}        
          // Valor total da compra
          totalValue={totalPurchaseValue}
          // Função chamada ao clicar no botão finalizar
        />
      )}
      {/* 1. Modal para filtrar/localizar registros cadastrados */}
      <BuyHistFilterModal
        visible={showFilterModal}                 // Passa o estado que controla a exibição da busca
        searchText={form.searchText}              // Passa o texto atual digitado para o filtro
        onChangeSearchText={form.setSearchText}   // Passa a função que atualiza o texto do filtro
        onClose={() => setShowFilterModal(false)} // Passa a função para fechar o modal/campo de busca
        onCancel={() => {                         // Passa a função quando cancela a pesquisa/filtragem
          form.setSearchText('');                 // Limpa o texto pesquisado
          setShowFilterModal(false);              // Esconde o modal
        }}
      />
      {/* 2. Modal para editar a quantidade de itens da lista de compra */}
      <BuyHistEditModal
        showModal={form.isEditing}                 // Exibe/oculta baseado na flag de edição
        name={activeEditingItem?.nm_product || ''} // Passa o nome do produto selecionado
        quantity={form.quantity}                   // Valor da quantidade em texto
        setQuantity={form.setQuantity}             // Função para atualizar a quantidade
        price={form.price}                         // Valor da quantidade em texto
        setPrice={form.setPrice}
        supplierId={form.supplierId}
        setSupplierId={form.setSupplierId}
        isEditing={form.isEditing}                 // Passa a flag do formulário
        onSave={handleSave}                        // Função executada ao clicar no botão de salvar
        onCancel={handleCloseForm}                 // Função executada ao cancelar ou fechar o formulário
      />
    </View>
  );
}