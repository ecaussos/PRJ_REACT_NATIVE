// src/features/buyList/buyList.screen.tsx
import { useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import {
  BuyListActions,
  BuyListAddItemModal,
  BuyListCameraModal,
  BuyListEditModal,
  BuyListFilterModal,
  BuyListFooterModal,
  BuyListItemModal,
  BuyListSearchModal,
} from './buyList.form';
import { useBuyListViewModel } from './buyList.hook';
import { styles } from './buyList.styles';

export default function BuyListScreen() {
  /* -------- FUNÇÕES EXECUTADAS AO CARREGAR A TELA -------- */
  // Extrai estados e funções de regra de negócio do ViewModel
  const {
    state,                      // Estado global da lista de compras (itens, carregamento, erros)
    form,                       // Controle dos campos de formulário e modais
    handleSaveData,             // Salva ou atualiza um item na lista
    handleDeleteData,           // Remove um item específico da lista
    handleClearList,            // Limpa todos os itens da lista atual
    handleScanSuccess,          // Processa o produto encontrado pelo código de barras
    handleSearchProductByName,  // Executa a busca de produtos por nome
    handleSelectProductToBuy,   // Adiciona o produto selecionado à lista de compras
  } = useBuyListViewModel();

  // Controla a visibilidade do modal unificado de adição de produto (Câmera ou Nome)
  const [showAddModal, setShowAddModal] = useState(false);
  // Controla a visibilidade do modal de filtragem - inicia fechado/oculto
  const [showFilterModal, setShowFilterModal] = useState(false);
  // Controla a visibilidade do modal de Scanner (Adicionar produto) - inicia fechado/oculto
  const [showCameraModal, setShowCameraModal] = useState(false);
  // Controla a visibilidade do modal de Por Nome (Adicionar produto) - inicia fechado/oculto
  const [showSearchModal, setShowSearchModal] = useState(false);

  /* -------- FUNÇÕES QUE DEPENDEM DE AÇÕES -------- */

  // Função para realizar a edição do registro
  const handleOpenEdit = (id: number, productId: number, quantity: number) => {
    form.startEditing(id, productId, quantity); // Preenche o formulário com os dados do registro selecionado
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
  const activeEditingItem = state.items.find(item => item.id_list_buy === form.editingId);

  /* -------- MONTAGEM DA TELA -------- */
  return (
    <View style={styles.container}>
      {/* Título da Tela */}
      <Text style={styles.title}>Lista de Compra</Text>
      {/* Indicador visual de carregamento (Spinner) */}
      {state.loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
      {/* Exibição de mensagens de erro, caso ocorram */}
      {state.error && <Text style={styles.error}>{state.error}</Text>}

      {/* Botões principais de ação - Adicionar, Filtrar e Limpar */}
      <BuyListActions
        onOpenCreateModal={() => setShowAddModal(true)} // Ação do botão para mostrar modal para adicionar item Código/Nome
        onOpenFilterModal={() => setShowFilterModal(true)} // Ação do botão para mostrar modal de filtragem de registro
        onClearSearch={() => form.setSearchText('')} // Ação do botão para limpar a filtragem de registro atual
        hasActiveSearch={form.searchText.length > 0} // Passa "true" se houver algum texto digitado na busca
        onClearList={handleClearList} // Ação do botão para limpar toda a lista
      />
      {/* Subtítulo da seção de listagem */}
      <Text style={styles.subtitle}>Produtos na Lista de Compras</Text>
      {/* Lista (FlatList) para renderizar os registros cadastrados e filtrados */}
      <FlatList
        // Fonte de dados que será obtida para montar a lista
        data={state.items}
        // Define ID para identificar registros na lista
        keyExtractor={(item) => String(item.id_list_buy)}
        // Monta os itens na tela
        renderItem={({ item }) => (
          // Apresenta dados dos registros e botões de ação
          <BuyListItemModal
            // Pega a descrição no nome
            name={item.nm_product} // Passa o nome do produto cadastrado
            groupName={item.nm_group} // Passa o nome do grupo retornado pelo JOIN
            quantity={item.qt_product} // Passa a quantidade cadastrada
            // Editar: Ao clicar no botão pega os dados do registro - Preenche campos
            onEdit={() => handleOpenEdit(item.id_list_buy, item.id_product, item.qt_product)}
            // Deletar: Ao clicar no botão delete o registro
            onDelete={() => handleDeleteData(item.id_list_buy, item.nm_product)}
          />
        )}
        // Mensagem exibida caso a lista filtrada esteja vazia
        ListEmptyComponent={
          !state.loading ? <Text style={styles.emptyText}>Nenhum registro encontrado.</Text> : null
        }
      />
      {/* Apresenta a quantidade total dos registros na lista - Verifica se a lista tem registro */}
      <BuyListFooterModal
        totalRecords={state.totalRecords} // Quantidade de registro cadastrado
        onClearList={handleClearList}     // Função para excluir todos os registros cadastrados
      />
      {/* 1. Modal Opções para Adicionar produto (Código de Barra/Nome) */}
      <BuyListAddItemModal
      showModal={showAddModal}                  // Exibe ou oculta o modal principal de adição
        onOpenCamera={() => {                   // Passa a função para acionar a opção de código de barra (Câmera)
          setShowAddModal(false);               // Oculta o modal de seleção de opções
          setShowCameraModal(true);             // Exibe o modal do leitor de código de barras
        }}                                        
        onOpenSearch={() => {                   // Passa a função para acionar a busca por nome
          setShowAddModal(false);               // Oculta o modal de seleção de opções
          setShowSearchModal(true);             // Exibe o modal de pesquisa por nome para a seleção de produtos
        }}
        onClose={() => setShowAddModal(false)}  // Oculta o modal de adição ao cancelar/fechar
      />

      {/* 2. Modal para adicionar produto por código de barra (Câmera) */}
      <BuyListCameraModal
        showModal={showCameraModal}                             // Exibe ou oculta o modal do leitor de código de barra
        onScanSuccess={async (barcode) => {                     // Passa a função que executado ao ler um código de barras
          const addAnother = await handleScanSuccess(barcode);  // Processa a leitura e aguarda respota alerta finaliza operação (Hook)
          if (!addAnother) {                                    // Verfiicar se vai adicionar outro item
            setShowCameraModal(false);                          // Verdadeiro: Oculta o modal código de barra
          }
        }}
        onClose={() => setShowCameraModal(false)}               // Oculta o modal código de barra ao cancelar/fechar
      />

      {/* 3. Modal para adicionar produto por Nome (Pesquisa) */}
      <BuyListSearchModal
        showModal={showSearchModal}                                   // Exibe ou oculta o modal de pesquisa por nome
        searchText={form.modalSearchText || ''}                       // Armazena o texto digitado no campo de busca do modal
        searchResults={state.searchResults}                           // Lista com os produtos encontrados na busca
        onChangeSearchText={(text) => {                               // Função para executadar buscar ao alterar o texto
          form.setModalSearchText?.(text);                            // Atualiza o estado do texto de busca no formulário
          handleSearchProductByName(text);                            // Função para executar a busca de produtos por nome (Hook)
        }}
        onSelectProduct={async (product) => {                         // Função para executar quando um produto for selecionado
          const addAnother = await handleSelectProductToBuy(product); // Processa a inclusão no Hook e aguarda resposta do alerta
          if (!addAnother) {                                          // Verificar se vai adicionar outro item
            setShowSearchModal(false);                                // Verdadeiro: Oculta o modal pesquisa por nome
          }
        }}
        onBack={() => {                                               // Função executada ao clicar no botão de voltar
          setShowSearchModal(false);                                  // Oculta o modal de pesquisa por nome
          form.setModalSearchText?.('');                              // Limpa o texto digitado no campo de busca
          setShowAddModal(true);                                      // Exibe o modal inicial de opções
        }}
        onCancel={() => {                                             // Função executada ao cancelar a operação
          setShowSearchModal(false);                                  // Oculta o modal de pesquisa
          form.setModalSearchText?.('');                              // Limpa o texto digitado no campo de busca
        }}
      />

      {/* 4. Modal para filtrar/localizar registros cadastrados */}
      <BuyListFilterModal
        visible={showFilterModal}                 // Passa o estado que controla a exibição da busca
        searchText={form.searchText}              // Passa o texto atual digitado para o filtro
        onChangeSearchText={form.setSearchText}   // Passa a função que atualiza o texto do filtro
        onClose={() => setShowFilterModal(false)} // Passa a função para fechar o modal/campo de busca
        onCancel={() => {                         // Passa a função quando cancela a pesquisa/filtragem
          form.setSearchText('');                 // Limpa o texto pesquisado
          setShowFilterModal(false);              // Esconde o modal
        }}
      />

      {/* 5. Modal para editar a quantidade de itens da lista de compra */}
      <BuyListEditModal
        showModal={form.isEditing}                 // Exibe/oculta baseado na flag de edição
        name={activeEditingItem?.nm_product || ''} // Passa o nome do produto selecionado
        quantity={form.quantity}                   // Valor da quantidade em texto
        setQuantity={form.setQuantity}             // Função para atualizar a quantidade
        isEditing={form.isEditing}                 // Passa a flag do formulário
        onSave={handleSave}                        // Função executada ao clicar no botão de salvar
        onCancel={handleCloseForm}                 // Função executada ao cancelar ou fechar o formulário
      />
    </View>
  );
}