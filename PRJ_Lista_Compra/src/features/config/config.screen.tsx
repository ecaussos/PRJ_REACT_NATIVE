// src/features/config/config.screen.tsx
import { useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import ConfigForm, { ConfigActions, ConfigFooter, ConfigItem, ConfigSearchModal } from './config.form';
import { useConfigViewModel } from './config.hook';
import { styles } from './config.styles';

export default function ConfigScreen() {

  /* -------- FUNÇÕES EXECUTADAS AO CARREGAR A TELA -------- */
  // Extrai estados e funções de regra de negócio do ViewModel
  const { 
    state, 
    form, 
    handleSaveData, 
    handleDeleteData, 
    handleCreateLocalFile, 
    handleDeleteLocalFile, 
    dispatch 
  } = useConfigViewModel();
  // Controla a visibilidade do modal de cadastro/edição - inicia fechado/oculto
  const [showForm, setShowForm] = useState(false);
  // Controla a visibilidade do modal/campo de busca - inicia fechado/oculto
  const [showSearchModal, setShowSearchModal] = useState(false);

  /* -------- FUNÇÕES QUE DEPENDEM DE AÇÕES -------- */
  // Função para realizar o cadastro do registro
  const handleOpenCreate = async () => {
    form.resetForm();                 // Limpa os campos do formulário para iniciar o cadastro
    await dispatch({ type: 'LOAD' }); // Recarrega os dados/tipos antes de abrir
    setShowForm(true);                // Exibe o modal do formulário na tela
  };

  // Função para realizar a edição do registro
  const handleOpenEdit = (
    id: string,                 // ID único do registro a ser editado
    tpConfig: string,           // Tipo da configuração (ex: protocolo ou serviço)
    urlConfig: string,          // URL ou endereço do servidor/host
    portConfig: number | null,  // Porta de conexão (pode ser nula se padrão)
    userConfig: string | null,  // Usuário de autenticação (pode ser nulo)
    keyConfig: string | null,   // Chave ou senha de acesso (pode ser nula)
    versConfig: string | null,  // Versão (pode ser nula)
    stSsl: number,              // Status do SSL (ex: 1 para ativo, 0 para inativo)
    stConfig: number            // Status geral da configuração (ex: ativo/inativo)
  ) => {
    form.startEditing(
      id,               // Repassa o ID para o formulário entrar em modo de edição
      tpConfig,         // Carrega o tipo de configuração no formulário
      urlConfig,        // Preenche o campo da URL
      portConfig,       // Preenche a porta definida
      userConfig ?? '', // Define o usuário (converte null para string vazia)
      keyConfig ?? '',  // Define a chave (converte null para string vazia)
      versConfig ?? '', // Define a vesão (converte null para string vazia)
      stSsl,            // Define o estado da conexão segura SSL
      stConfig          // Define o estado de ativação da configuração
    ); // Preenche o formulário com os dados do registro selecionado
    setShowForm(true);  // Exibe o modal do formulário na tela
  };

  // Função para salvar o registro e fechar o formulário
  const handleSave = async () => {
    const success = await handleSaveData(); // Chama a função para salvar os dados do registro
    if (success) setShowForm(false);        // Se a gravação der certo, fecha o modal do formulário
  };

  // Função para fechar o formulário
  const handleCloseForm = () => {
    form.resetForm();   // Limpa os campos e reseta o estado do formulário
    setShowForm(false); // Fecha/Esconde o modal do formulário na tela
  };

  /* -------- MONTAGEM DA TELA -------- */
  return (
    <View style={styles.container}>
      {/* Título da Tela */}
      <Text style={styles.title}>Configurações</Text>
      {/* Indicador visual de carregamento (Spinner) */}
      {state.loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
      {/* Exibição de mensagens de erro, caso ocorram */}
      {state.error && <Text style={styles.error}>{state.error}</Text>}

      {/* Botões principais de ação */}
      <ConfigActions
        onOpenCreateModal={handleOpenCreate}                // Ação do botão para abrir o modal de novo cadastro
        onOpenSearchModal={() => setShowSearchModal(true)}  // Ação do botão para abrir a janela/campo de busca
        onClearSearch={() => form.setSearchText('')}        // Ação do botão para limpar o filtro de pesquisa atual
        hasActiveSearch={form.searchText.length > 0}        // Passa "true" se houver algum texto digitado na busca
      />

      {/* Formulário para cadastrar ou editar */}
      <ConfigForm
        showModal={showForm}                // Controla a visibilidade do modal do formulário
        tpConfig={form.tpConfig}            // Passa o ID do tipo selecionado
        setTpConfig={form.setTpConfig}      // Passa a função para atualizar o tipo
        urlConfig={form.urlConfig}          // Passa o valor da URL/Host
        setUrlConfig={form.setUrlConfig}    // Passa a função para atualizar a URL
        portConfig={form.portConfig}        // Passa a porta digitada
        setPortConfig={form.setPortConfig}  // Passa a função para atualizar a porta
        userConfig={form.userConfig}        // Passa o nome de usuário
        setUserConfig={form.setUserConfig}  // Passa a função para atualizar o usuário
        keyConfig={form.keyConfig}          // Passa a chave ou senha
        setKeyConfig={form.setKeyConfig}    // Passa a função para atualizar a chave
        versConfig={form.versConfig}        // Passa a versão
        setVersConfig={form.setVersConfig}  // Passa a função para atualizar a versão
        stSsl={form.stSsl}                  // Passa o status do SSL (1/0)
        setStSsl={form.setStSsl}            // Passa a função para atualizar o status do SSL
        stConfig={form.stConfig}            // Passa o status da Configuração (1/0)
        setStConfig={form.setStConfig}      // Passa a função para atualizar o status da Configuração
        configTypes={state.configTypes}     // Passa a lista de tipos de configuração disponíveis
        isEditing={form.isEditing}          // Indica se o modal está em modo de edição ou novo cadastro
        onSave={handleSave}                 // Função executada ao clicar no botão de salvar
        onCancel={handleCloseForm}          // Função executada ao cancelar ou fechar o formulário
      />

      {/* Subtítulo da seção de listagem */}
      <Text style={styles.subtitle}>Configurações Cadastradas</Text>

      {/* Lista (FlatList) para renderizar os registros cadastrados e filtrados */}
      <FlatList
        // Fonte de dados obtidos para montar a lista
        data={state.configs}
        // Define ID único para identificar registros na lista
        keyExtractor={(item) => String(item.id_config)}
        // Monta os itens na tela
        renderItem={({ item }) => (
          // Apresenta dados dos registros e botões de ação
          <ConfigItem
            configTypeLabel={item.ds_tp_config} // Descrição retornado pelo JOIN
            tpConfig={item.id_tp_config}        // ID do tipo
            urlConfig={item.url_config}         // URL/Host
            portConfig={item.port_config}       // Porta
            userConfig={item.user_config}       // Usuário
            stSsl={item.st_ssl}                 // Status SSL
            stConfig={item.st_config}           // Status Ativo/Inativo
            // Editar: Ao clicar no botão pega os dados do registro - Preenche campos
            onEdit={() =>
              handleOpenEdit(
                item.id_config,         // ID do registro de configuração passado como argumento
                item.id_tp_config,      // ID do tipo de configuração
                item.url_config ?? '',  // URL da configuração (converte null/undefined para string vazia)
                item.port_config,       // Porta de conexão do serviço
                item.user_config,       // Nome de usuário para autenticação
                item.key_config,        // Chave ou senha de acesso
                item.vers_config,       // Chave ou senha de acesso
                item.st_ssl,            // Indicador de uso do protocolo SSL
                item.st_config          // Status de ativação da configuração
              )
            }
            // Deletar: Ao clicar no botão deleta o registro
            onDelete={() => handleDeleteData(item.id_config, item.url_config ?? '')}
          />
        )}
        // Mensagem exibida caso a lista filtrada esteja vazia
        ListEmptyComponent={
          !state.loading ? <Text style={styles.emptyText}>Nenhum registro encontrado.</Text> : null
        }
      />

      {/* Rodapé para gerenciamento do arquivo local e mensagem de status */}
      <ConfigFooter
        hasConfigFile={state.hasConfigFile}     // Indica se o arquivo local existe
        onCreateConfig={handleCreateLocalFile}  // Função disparada ao clicar em criar arquivo
        onDeleteConfig={handleDeleteLocalFile}  // Função disparada ao clicar em excluir arquivo
      />

      {/* Modal para filtrar/localizar registros cadastrados */}
      <ConfigSearchModal
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