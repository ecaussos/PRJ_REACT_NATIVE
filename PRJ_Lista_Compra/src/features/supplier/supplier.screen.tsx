// src/features/supplier/supplier.screen.tsx
import { useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import SupplierForm, { SupplierActions, SupplierItem, SupplierSearchModal } from './supplier.form';
import { useSupplierViewModel } from './supplier.hook';
import { styles } from './supplier.styles';

export default function SupplierScreen(){
  /* -------- FUNÇÕES EXECUTADAS AO CARREGA A TELA -------- */
  // Extrai estados e funções de regra de negócio do ViewModel
  const { state, form, handleSaveData, handleDeleteData } = useSupplierViewModel();
  // Controla a visibilidade do modal de cadastro/edição - inicia fechado/oculto
  const [showForm, setShowForm] = useState(false);
  // Controla a visibilidade do modal/campo de busca - inicia fechado/oculto
  const [showSearchModal, setShowSearchModal] = useState(false);

  /* -------- FUNÇÕES QUE DEPENENDE DE AÇÕES  -------- */
  // Função para realizar o cadasto do registro
  const handleOpenCreate = () => {
    form.resetForm();  // Limpa os campos do formulário para iniciar o cadastro
    setShowForm(true); // Exibe o modal do formulário na tela
  };
  // Função para realizar a edição do registro
  const handleOpenEdit = (id: number, name: string) => {
    form.startEditing(id, name); // Preenche o formulário com os dados do registro selecionado
    setShowForm(true);           // Exibe o modal do formulário na tela
  };
  // Função para salvar o registro e fechar o formulário
  const handleSave = async () => {
    const success = await handleSaveData(); // Chama a função parar salvar os dados do registro
    if (success) setShowForm(false);            // Se a gravação der certo, fecha o modal do formulário
  };
  // Função para fechar o formulário
  const handleCloseForm = () => {
    form.resetForm();    //Limpa os campos e reseta o estado do formulário
    setShowForm(false);  // Fecha/Esconde o modal do formulário na tela
  };
  /* -------- MONTAGEM DA TELA -------- */
  return (
    <View style={styles.container}>
      {/* Indicador visual de carregamento (Spinner) */}
      <Text style={styles.title}>Fornecedores</Text>
      {/* Feedback de Carregamento e Erros */}
      {state.loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
      {/* Exibição de mensagens de erro, caso ocorram */}
      {state.error && <Text style={styles.error}>{state.error}</Text>}

       {/* Botões principais de ação */}
      <SupplierActions
        onOpenCreateModal={handleOpenCreate}               // Ação do botão para abrir o modal de novo cadastro
        onOpenSearchModal={() => setShowSearchModal(true)} // Ação do botão para abrir a janela/campo de busca
        onClearSearch={() => form.setSearchText('')}       // Ação do botão para limpar o filtro de pesquisa atual
        hasActiveSearch={form.searchText.length > 0}       // Passa "true" se houver algum texto digitado na busca
      />

      {/* Formulário para cadastrar ou editar */}
      <SupplierForm
        showModal={showForm}       // Controla a visibilidade do modal do formulário
        name={form.name}           // Passa o texto do campo de nome do registro
        setName={form.setName}     // Passa a função para atualizar o texto do nome
        isEditing={form.isEditing} // Indica se o modal está em modo de edição ou novo cadastro
        onSave={handleSave}        // Função executada ao clicar no botão de salvar
        onCancel={handleCloseForm} // Função executada ao cancelar ou fechar o formulário
      />
      {/* Subtítulo da seção de listagem */}
      <Text style={styles.subtitle}>Fornecedores Cadastrados</Text>
      {/* Lista (FlatList) para renderizar os registros cadastrados e filtrados */}
      <FlatList
        // Fonte de dados que será obtidos os itens para monta lista 
        data={state.suppliers}
        // Define ID para identificar registros na lista
        keyExtractor={(item) => String(item.id_supplier)}
        //Monta os items na tela
        renderItem={({ item }) => (
          // Apresenta dados dos registros e botões de ação
          <SupplierItem
            // Pega a descrição no nome
            name={item.nm_supplier}
            // Editar: Ao clicar no botão pega os dados do registro - Preenche campos
            onEdit={() => handleOpenEdit(item.id_supplier, item.nm_supplier)}
            // Deletar: Ao clicar no botão delete o registo
            onDelete={() => handleDeleteData(item.id_supplier, item.nm_supplier)}
          />
        )}
        // Mensagem exibida caso a lista filtrada esteja vazia
        ListEmptyComponent={
          !state.loading ? <Text style={styles.emptyText}>Nenhum registro encontrado.</Text> : null
        }
      />
      {/* Modal para Buscar/Filtro registros */}
      <SupplierSearchModal
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