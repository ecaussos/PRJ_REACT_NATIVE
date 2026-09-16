// src/features/product/product.screen.tsx
import { useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import ProductForm, { ProductActions, ProductItem, ProductSearchModal } from './product.form';
import { useProductViewModel } from './product.hook';
import { styles } from './product.styles';

export default function ProductScreen() {
  /* -------- FUNÇÕES EXECUTADAS AO CARREGAR A TELA -------- */
  // Extrai estados e funções de regra de negócio do ViewModel
  const { state, form, handleSaveData, handleDeleteData, dispatch } = useProductViewModel(); // Desestrutura retornos do Hook
  // Controla a visibilidade do modal de cadastro/edição - inicia fechado/oculto
  const [showForm, setShowForm] = useState(false);                                // Estado visibilidade formulário
  // Controla a visibilidade do modal/campo de busca - inicia fechado/oculto
  const [showSearchModal, setShowSearchModal] = useState(false);                  // Estado visibilidade busca (Sintaxe corrigida)

  /* -------- FUNÇÕES QUE DEPENDEM DE AÇÕES  -------- */
  // Função para realizar o cadastro do registro
  const handleOpenCreate = async () => {
    form.resetForm();  // Limpa os campos do formulário para iniciar o cadastro
    await dispatch({ type: 'LOAD' });                                              // Recarrega os dados/grupos antes de abrir
    setShowForm(true); // Exibe o modal do formulário na tela
  };
  // Função para realizar a edição do registro
  const handleOpenEdit = (id: number, name: string, barcode: string, groupId: number) => {
    form.startEditing(id, name, barcode ?? '', String(groupId)); // Preenche o formulário com os dados do registro selecionado
    setShowForm(true);           // Exibe o modal do formulário na tela
  };
  // Função para salvar o registro e fechar o formulário
  const handleSave = async () => {
    const success = await handleSaveData(); // Chama a função para salvar os dados do registro
    if (success) setShowForm(false);            // Se a gravação der certo, fecha o modal do formulário
  };
  // Função para fechar o formulário
  const handleCloseForm = () => {
    form.resetForm();    // Limpa os campos e reseta o estado do formulário
    setShowForm(false);  // Fecha/Esconde o modal do formulário na tela
  };

  /* -------- MONTAGEM DA TELA -------- */
  return (
    <View style={styles.container}>
      {/* Título da Tela */}
      <Text style={styles.title}>Produtos</Text>
      {/* Indicador visual de carregamento (Spinner) */}
      {state.loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
      {/* Exibição de mensagens de erro, caso ocorram */}
      {state.error && <Text style={styles.error}>{state.error}</Text>}

       {/* Botões principais de ação */}
      <ProductActions
        onOpenCreateModal={handleOpenCreate}               // Ação do botão para abrir o modal de novo cadastro
        onOpenSearchModal={() => setShowSearchModal(true)} // Ação do botão para abrir a janela/campo de busca
        onClearSearch={() => form.setSearchText('')}       // Ação do botão para limpar o filtro de pesquisa atual
        hasActiveSearch={form.searchText.length > 0}       // Passa "true" se houver algum texto digitado na busca
      />

      {/* Formulário para cadastrar ou editar */}
      <ProductForm
        showModal={showForm}         // Controla a visibilidade do modal do formulário
        name={form.name}             // Passa o texto do campo de nome do registro
        setName={form.setName}       // Passa a função para atualizar o texto do nome
        barcode={form.barcode}       // Passa o valor do código de barras GTIN
        setBarcode={form.setBarcode} // Passa a função para atualizar o código de barras
        groupId={form.groupId}       // Passa o ID do grupo selecionado
        setGroupId={form.setGroupId} // Passa a função para atualizar o grupo selecionado
        groups={state.groups}        // Passa a lista de grupos disponíveis no estado
        isEditing={form.isEditing}   // Indica se o modal está em modo de edição ou novo cadastro
        onSave={handleSave}          // Função executada ao clicar no botão de salvar
        onCancel={handleCloseForm}   // Função executada ao cancelar ou fechar o formulário
      />
      {/* Subtítulo da seção de listagem */}
      <Text style={styles.subtitle}>Produtos Cadastrados</Text>
      {/* Lista (FlatList) para renderizar os registros cadastrados e filtrados */}
      <FlatList
        // Fonte de dados que será obtidos os itens para montar a lista 
        data={state.products}
        // Define ID para identificar registros na lista
        keyExtractor={(item) => String(item.id_product)}
        // Monta os itens na tela
        renderItem={({ item }) => (
          // Apresenta dados dos registros e botões de ação
          <ProductItem
            // Pega a descrição no nome
            name={item.nm_product}         // Passa o nome do produto cadastrado
            barcode={item.cd_product_gtin} // Passa o código GTIN/barras vindo do banco
            groupName={item.nm_group}      // Passa o nome do grupo retornado pelo JOIN
            groupId={item.id_group}        // Passa o ID do grupo como identificador secundário
            // Editar: Ao clicar no botão pega os dados do registro - Preenche campos
            onEdit={() => handleOpenEdit(item.id_product, item.nm_product, item.cd_product_gtin ?? '', item.id_group)}
            // Deletar: Ao clicar no botão deleta o registro
            onDelete={() => handleDeleteData(item.id_product, item.nm_product)}
          />
        )}
        // Mensagem exibida caso a lista filtrada esteja vazia
        ListEmptyComponent={
          !state.loading ? <Text style={styles.emptyText}>Nenhum registro encontrado.</Text> : null // Exibe feedback caso a lista esteja vazia
        }
      />
      {/* Modal para filtrar/localizar registros cadastrados */}
      <ProductSearchModal
        visible={showSearchModal}                 // Passa o estado que controla a exibição da busca
        searchText={form.searchText}              // Passa o texto atual digitado para o filtro
        onChangeSearchText={form.setSearchText}   // Passa a função que atualiza o texto do filtro
        onClose={() => setShowSearchModal(false)} // Passa a função para fechar o modal/campo de busca
        onCancel={() => {                         // Passa a função quando cancela a pesquisa/filtragem
          form.setSearchText('');                 // Limpa o texto pesquisado
          setShowSearchModal(false);              // Esconde o modal
        }}
      />
    </View>
  );
}