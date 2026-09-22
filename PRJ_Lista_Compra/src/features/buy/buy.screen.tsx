// src/features/buy/buy.screen.tsx
import { useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import {
  BuyActions,
  BuyAddItemModal,
  BuyCameraModal,
  BuyEditModal,
  BuyFilterModal,
  BuyFooterTotal,
  BuyItemModal,
  BuySearchModal,
  FinishBuyModal,
} from './buy.form';
import { useBuyViewModel } from './buy.hook';
import { styles } from './buy.styles';

export default function BuyScreen(){
  /* -------- FUNÇÕES EXECUTADAS AO CARREGAR A TELA -------- */
  // Extrai estados e funções de regra de negócio do ViewModel
  const {
    state,                      // Estado global da lista de compras (itens, carregamento, erros)
    form,                       // Controle dos campos de formulário e modais
    handleSaveData,             // Salva ou atualiza um item na lista
    handleDeleteData,           // Remove um item específico da lista
    handleScanSuccess,          // Processa o produto encontrado pelo código de barras
    handleSearchProductByName,  // Executa a busca de produtos por nome
    handleSelectProductToBuy,   // Adiciona o produto selecionado à lista de compras
    handleClearBuy,             // Função para limpar/esvaziar a lista de compras atual
    handleFinalizeBuy,          // Função para executar a gravação e finalização da compra no banco
    handleImportFromList,       // Função para importar produtos de uma lista pré-existente
    handleOpenFinishModal,      // Função que valida os dados e autoriza a abertura do modal de confirmação
    totalPurchaseItem,          // Quantidade total dos itens da compra
    totalPurchaseValue,         // Valor total calculado dos itens da lista
  } = useBuyViewModel();

  // Controla a visibilidade do modal unificado de adição de produto (Câmera ou Nome)
  const [showAddModal, setShowAddModal] = useState(false);
  // Controla a visibilidade do modal de filtragem - inicia fechado/oculto
  const [showFilterModal, setShowFilterModal] = useState(false);
  // Controla a visibilidade do modal de Scanner (Adicionar produto) - inicia fechado/oculto
  const [showCameraModal, setShowCameraModal] = useState(false);
  // Controla a visibilidade do modal de Por Nome (Adicionar produto) - inicia fechado/oculto
  const [showSearchModal, setShowSearchModal] = useState(false);
  // Controla a visibilidade do modal de seleção de mercado para finalizar compra
  const [showFinishModal, setShowFinishModal] = useState(false);
  //
  const [onlyWithoutPrice, setOnlyWithoutPrice] = useState(false);

  /* -------- FUNÇÕES QUE DEPENDEM DE AÇÕES -------- */

  // Função para realizar a edição do registro
  const handleOpenEdit = (idProduct: number, quantity: number, price: number) => {
    form.startEditing(idProduct, quantity, price); // Preenche o formulário com os dados do registro selecionado
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
  const activeEditingItem = state.items.find(item => item.id_product === form.editingId);

  /* -------- MONTAGEM DA TELA -------- */
  return (
    <View style={styles.container}>
      {/* Título principal da tela */}
      <Text style={styles.title}>Realizar Compra</Text>
      {/* Indicador visual de carregamento (Spinner) */}
      {state.loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
      {/* Exibição de mensagens de erro, caso ocorram */}
      {state.error && <Text style={styles.error}>{state.error}</Text>}
      
      {/* Botões principais de ação - Adicionar, Filtrar e Limpar */} 
      <BuyActions
        onOpenCreateModal={() => setShowAddModal(true)}     // Ação do botão para mostrar modal para adicionar item Código/Nome
        onOpenFilterModal={() => setShowFilterModal(true)}  // Ação do botão para mostrar modal de filtragem de registro
        onClearSearch={form.handleClearFilters}             // Ação do botão para limpar a filtragem de registro atual
        hasActiveSearch={                                   // Propriedade booleana que define se existe algum filtro ativo
          form.searchText.length > 0 ||                     // Verifica se há texto digitado no campo de busca
          form.onlyWithoutPrice ||                          // Verifica se o filtro "apenas sem preço" está marcado
          form.selectedGroup.length > 0                     // Verifica se algum grupo está selecionado
        }                                                   // Retorna verdadeiro se pelo menos uma das condições for atingida
        onClearBuy={handleClearBuy}                         // Ação do botão para limpar toda a lista
      />
      {/* Subtítulo da seção de listagem */}
      <Text style={styles.subtitle}>Produtos para Compra</Text>
      {/* Lista (FlatList) para renderizar os registros cadastrados e filtrados */}
      <View style={{ flex: 1 }}>
        <FlatList
          // Fonte de dados que será obtida para montar a lista
          data={state.items}
          // Define ID para identificar registros na lista
          keyExtractor={(item) => String(item.id_product)}
          //Monta os items na tela
          renderItem={({ item }) => (
          // Apresenta dados dos registros e botões de ação
            <BuyItemModal
              // Campos utilizando para a listaagem
              name={item.nm_product} // Passa o nome do produto cadastrado
              groupName={item.nm_group} // Passa o nome do grupo retornado pelo JOIN
              quantity={item.qt_product} // Passa a quantidade cadastrada
              price={item.vl_product ?? 0}// Passa a quantidade cadastrada
              // Editar: Ao clicar no botão pega os dados do registro - Preenche campos
              onEdit={() => handleOpenEdit(item.id_product, item.qt_product, item.vl_product ?? 0)}
              // Deletar: Ao clicar no botão delete o registro
              onDelete={() => handleDeleteData(item.id_product, item.nm_product)}
            />
          )}
          // Mensagem exibida caso a lista filtrada esteja vazia
          ListEmptyComponent={
            !state.loading ? <Text style={styles.emptyText}>Nenhum produto selecionado para a compra.</Text> : null
          }
        />
      </View>
      {/* Apresenta o valor total dos registros na lista - Verifica se a lista tem registro */}
      {state.items.length > 0 && (
        // Verdadeiro: Apresenta o valor total.
        <BuyFooterTotal
          // Quantidade total de item 
          totalItem={totalPurchaseItem}        
          // Valor total da compra
          totalValue={totalPurchaseValue}
          // Função chamada ao clicar no botão finalizar
          onFinalize={() => {
              // Executa a função de consulta de fornecedor executa imediatamente (async)
              handleOpenFinishModal().then((canOpen) => { // then -> Aguarda a resposta: True ou False (canOpen)
                // Verdadeiro: canOpen= True - Exibe o modal de finalização
                if (canOpen) setShowFinishModal(true);
              });
            }}
          // Função chamada ao clicar no botão excluir compra
          onClearBuy={handleClearBuy}
        />
      )}
      {/* 1. Modal Opções para Adicionar produto (Código de Barra/Nome) */}
      <BuyAddItemModal
      showModal={showAddModal}                  // Exibe ou oculta o modal principal de adição
        onOpenCamera={() => {                   // Passa a função para acionar a opção de código de barra (Câmera)
          setShowAddModal(false);               // Oculta o modal de seleção de opções
          setShowCameraModal(true);             // Exibe o modal do leitor de código de barras
        }}                                        
        onOpenSearch={() => {                   // Passa a função para acionar a busca por nome
          setShowAddModal(false);               // Oculta o modal de seleção de opções
          setShowSearchModal(true);             // Exibe o modal de pesquisa por nome para a seleção de produtos
        }}
        onOpenBuyList={async () => {
          setShowAddModal(false);               // Fecha o modal de seleção
           await handleImportFromList();        // Importa os itens da BuyList para a Compra ativa
        }}
        onClose={() => setShowAddModal(false)}  // Oculta o modal de adição ao cancelar/fechar
      />
      {/* 2. Modal para adicionar produto por código de barra (Câmera) */}
      <BuyCameraModal
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
      <BuySearchModal
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
      <BuyFilterModal
        visible={showFilterModal}                                                         // Passa o estado que controla a exibição da busca
        searchText={form.searchText}                                                      // Passa o texto atual digitado para o filtro
        onChangeSearchText={form.setSearchText}                                           // Passa a função que atualiza o texto do filtro
        // Filtrar produto por grupo
        selectedGroup={form.selectedGroup}                                                // Nome do grupo atualmente selecionado para o filtro
        onChangeSelectedGroup={form.setSelectedGroup}                                     // Função para atualizar a seleção do grupo
        availableGroups={form.availableGroups}                                            // Lista com os nomes dos grupos disponíveis para seleção
        // Filtrar produto com valor zero
        onlyWithoutPrice={form.onlyWithoutPrice}                                          // Passa o estado do filtro para produtos sem valor/zerados
        onToggleOnlyWithoutPrice={() => form.setOnlyWithoutPrice(!form.onlyWithoutPrice)} // Alterna o estado do filtro de produtos sem valor
        // Ações ao fechar ou cancelar o modal
        onClose={() => setShowFilterModal(false)}                                         // Passa a função para fechar o modal/campo de busca
        onCancel={() => {                                                                 // Passa a função quando cancela a pesquisa/filtragem
          form.setSearchText('');                                                         // Limpa o texto pesquisado
          form.setOnlyWithoutPrice(false);                                                // Desativa o filtro de itens sem valor
          setShowFilterModal(false);                                                      // Esconde o modal
        }}
      />
      {/* 5. Modal para editar a quantidade de itens da lista de compra */}
      <BuyEditModal
        showModal={form.isEditing}                 // Exibe/oculta baseado na flag de edição
        name={activeEditingItem?.nm_product || ''} // Passa o nome do produto selecionado
        quantity={form.quantity}                   // Valor da quantidade em texto
        setQuantity={form.setQuantity}             // Função para atualizar a quantidade
        price={form.price}                         // Valor da quantidade em texto
        setPrice={form.setPrice}                   // Valor do preço em texto
        isEditing={form.isEditing}                 // Passa a flag do formulário
        onSave={handleSave}                        // Função executada ao clicar no botão de salvar
        onCancel={handleCloseForm}                 // Função executada ao cancelar ou fechar o formulário
      />
      {/* 6. Modal para selecionar o mercado e finalizar a compra */}
      <FinishBuyModal
        visible={showFinishModal}                         // Controla a exibição visual do modal
        suppliers={state.suppliers}                       // Lista de fornecedores para seleção
        onSelectSupplier={async (supplier) => {           // Ação disparada ao selecionar um fornecedor
          await handleFinalizeBuy(supplier.id_supplier);  // Finaliza a compra com o ID do fornecedor
          setShowFinishModal(false);                      // Fecha o modal após concluir
        }}
        onClose={() => setShowFinishModal(false)}         // Ação disparada ao cancelar/fechar o modal
      />
    </View>
  );
}