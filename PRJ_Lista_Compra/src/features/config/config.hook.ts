// src/features/config/config.hook.ts
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { ConfigModel, ConfigModelInstance } from './config.model';
import { ConfigIntent, ConfigState } from './config.types';

export function useConfigViewModel(model: ConfigModel = ConfigModelInstance) {
  // Estado centralizado de carregamento, erros e lista
  const [state, setState] = useState<ConfigState>({
    configs: [],      // Lista inicial de registros cadastrados (vazia)
    configTypes: [],  // Lista inicial de tipos de configuração (vazia)
    loading: false,   // Flag para controle de spinner/loading durante requisições
    error: null,      // Mensagem de erro capturada nas operações (null)
  });

  // Estados locais para controle de formulário, campo de busca e edição
  const [tpConfig, setTpConfig] = useState('');                     // Armazena o tipo de configuração selecionado (ID em string)
  const [urlConfig, setUrlConfig] = useState('');                   // Armazena a URL ou Host
  const [portConfig, setPortConfig] = useState('');                 // Armazena a porta de conexão
  const [userConfig, setUserConfig] = useState('');                 // Armazena o usuário de autenticação
  const [keyConfig, setKeyConfig] = useState('');                   // Armazena a chave ou senha de acesso
  const [stSsl, setStSsl] = useState(0);                            // Armazena o status do SSL (1 = ativo, 0 = inativo)
  const [stConfig, setStConfig] = useState(1);                      // Armazena o status da configuração (1 = ativo, 0 = inativo)
  const [searchText, setSearchText] = useState('');                 // Armazena o termo para filtragem na listagem
  const [editingId, setEditingId] = useState<number | null>(null);  // Armazena o ID do registro em edição (null indica novo cadastro)

  // Reseta os campos do formulário para o estado inicial
  const resetForm = useCallback(() => {
    setTpConfig('');    // Limpa a seleção do tipo de configuração
    setUrlConfig('');   // Limpa o campo de URL
    setPortConfig('');  // Limpa o campo de porta
    setUserConfig('');  // Limpa o campo de usuário
    setKeyConfig('');   // Limpa o campo de chave/senha
    setStSsl(0);        // Reseta SSL para inativo (0)
    setStConfig(1);     // Reseta status para ativo (1)
    setEditingId(null); // Limpa o ID, voltando o formulário para modo de criação
  }, []);

  // Processador de intenções da interface (MVI)
  const dispatch = useCallback(async (intent: ConfigIntent) => {
    // Ativa o estado de carregamento e reseta mensagens de erro anteriores
    setState(prev => ({ ...prev, loading: true, error: null }));  // Atualiza estado inicial da requisição
    try {
      switch (intent.type) {                                    // Avalia o tipo de intenção solicitada
        case 'LOAD': {                                          // Se a intenção for igual a LOAD
          const [configsData, typesData] = await Promise.all([  // Executa as buscas de configurações e tipos simultaneamente
            model.fetchAll(),                                   // Busca a lista completa de configurações
            model.fetchConfigTypeOptions(),                     // Busca as opções de tipos de configuração disponíveis
          ]);
          setState(prev => ({                                   // Atualiza o estado centralizado com os dados carregados
            ...prev,                                            // Mantém os valores de estado anteriores
            configs: configsData,                               // Altera o estado e vincula as configurações obtidas
            configTypes: typesData,                             // Altera o estado e vincula os tipos obtidos
            loading: false,                                     // Desativa o indicador de carregamento
          }));
          break;                                                // Finaliza a execução do caso LOAD
        }

        case 'CREATE': {                                                  // Se a intenção for igual a CREATE
          await model.create(                                             // Envia a intenção de criar com os campos informados
            intent.payload.id_tp_config,                                  // Tipo de configuração
            intent.payload.url_config || '',                              // URL / Host
            intent.payload.port_config,                                   // Porta
            intent.payload.user_config,                                   // Usuário
            intent.payload.key_config,                                    // Chave de acesso / senha
            intent.payload.st_ssl,                                        // Status do SSL
            intent.payload.st_config                                      // Status da Configuração
          );
          resetForm();                                                    // Limpa os campos do formulário
          const data = await model.fetchAll();                            // Rebusca todos os registros atualizados
          setState(prev => ({ ...prev, configs: data, loading: false })); // Atualiza a lista de configurações e remove o indicador de loading
          break;                                                          // Finaliza a execução do caso CREATE
        }

        case 'UPDATE': {                                                  // Se a intenção for igual a UPDATE
          await model.update(intent.payload.id_config, {                  // Envia a intenção de atualização do registro pelo ID
            id_tp_config: intent.payload.id_tp_config,                    // Tipo de configuração atualizado
            url_config: intent.payload.url_config || '',                  // URL atualizada
            port_config: intent.payload.port_config,                      // Porta atualizada
            user_config: intent.payload.user_config,                      // Usuário atualizado
            key_config: intent.payload.key_config,                        // Chave de acesso atualizada
            st_ssl: intent.payload.st_ssl,                                // Status SSL atualizado
            st_config: intent.payload.st_config,                          // Status da configuração atualizado
          });
          resetForm();                                                    // Limpa os campos do formulário
          const data = await model.fetchAll();                            // Rebusca todos os registros atualizados
          setState(prev => ({ ...prev, configs: data, loading: false })); // Atualiza a lista de configurações e remove o indicador de loading
          break;                                                          // Finaliza a execução do caso UPDATE
        }

        case 'DELETE': {                                                  // Se a intenção for igual a DELETE
          await model.delete(intent.payload);                             // Executa a exclusão do registro pelo ID
          const data = await model.fetchAll();                            // Rebusca a lista atualizada de registros
          setState(prev => ({ ...prev, configs: data, loading: false })); // Atualiza a lista e encerra o carregamento
          break;                                                          // Finaliza a execução do caso DELETE
        }
      }
    } catch (err) {
      // Captura e formata erros lançados pela Model ou pelo Repositório
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro na operação.';
      // Mantém os estados anteriores e registra a mensagem de falha
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      // Lança a exceção para o componente chamador
      throw err;
    }
  // Recria a função caso o model ou resetForm mudem
  }, [model, resetForm]);

  // Função para salvar, validar e gerar mensagem correspondente às ações
  const handleSaveData = async (): Promise<boolean> => {                        // Função assíncrona que retorna boolean de confirmação
    if (!ConfigModel.isValid(tpConfig, urlConfig, keyConfig)) {                 // Executa validações de dados obrigatórios conforme o tipo
      Alert.alert('Aviso', 'Preencha os campos obrigatórios para o registro!'); // Alerta o usuário em caso de dados inválidos
      return false;                                                             // Interrompe a execução e retorna falso
    }
    const isEditing = editingId !== null;       // Avalia se está em modo de edição (true) ou criação (false)
    const action = ConfigModel.buildSaveAction( // Monta o objeto de intenção para gravação
      tpConfig,                                 // Tipo de configuração selecionado
      urlConfig,                                // URL/Host informado pelo usuário
      portConfig,                               // Porta de conexão
      userConfig,                               // Usuário de autenticação
      keyConfig,                                // Chave ou senha de acesso
      stSsl,                                    // Status do protocolo SSL
      stConfig,                                 // Status geral da configuração
      isEditing,                                // Indicador de modo edição
      editingId                                 // ID do registro caso seja edição
    );
    try {
      await dispatch(action);                                             // Envia a ação MVI para processamento
      const successMessage = isEditing                                    // Define a mensagem dinâmica com base na operação
        ? 'Registro atualizado com sucesso!'                              // Exibe mensagem para atualização
        : 'Registro cadastrado com sucesso!';                             // Exibe mensagem para novo cadastro
      Alert.alert('Sucesso', successMessage);                             // Exibe caixa de diálogo confirmando o sucesso
      return true;                                                        // Retorna verdadeiro sinalizando conclusão com sucesso
    } catch (err: any) {
      Alert.alert('Aviso', err.message || 'Erro ao salvar o registro.');  // Exibe mensagem caso a operação falhe
      return false;                                                       // Retorna falso sinalizando falha na gravação
    }
  };

  // Função para apresentar o modal de confirmação de exclusão
  const handleDeleteData = (id: number, label: string) => {                           // Recebe ID e rótulo/descrição do item para exibição na mensagem
    Alert.alert(                                                                      // Exibe alerta de confirmação nativo
      'Excluir',                                                                      // Título da caixa de diálogo
      `Deseja realmente excluir a configuração "${label}"?`,                          // Mensagem de confirmação com a descrição do item
      [
        { text: 'Cancelar', style: 'cancel' },                                        // Botão para cancelar a operação
        {
          text: 'Excluir',                                                            // Opção para confirmar a exclusão
          style: 'destructive',                                                       // Estilo visual de alerta no iOS
          onPress: async () => {                                                      // Ação executada ao confirmar exclusão
            try {
              await dispatch({ type: 'DELETE', payload: id });                        // Envia a intenção MVI de exclusão passando o ID
              Alert.alert('Sucesso', `Registro ${label} excluído com sucesso!`);      // Exibe confirmação após apagar o registro
            } catch (err: any) {
              Alert.alert('Erro', err.message || 'Erro ao excluir a configuração.');  // Exibe mensagem caso a operação falhe
            }
          },
        },
      ]
    );
  };

  // Carregamento inicial ao montar o hook
  useEffect(() => {
    dispatch({ type: 'LOAD' }).catch(() => {}); // Executa a busca inicial e trata exceções
  }, [dispatch]);                               // Garante reexecução caso dispatch seja alterado

  // Função para filtrar a lista de registros cadastrados
  const filteredList = state.configs.filter(data =>                                               // Aplica o filtro sobre a lista original
    (data.url_config && data.url_config.toLowerCase().includes(searchText.toLowerCase())) ||      // Compara a URL com o texto buscado
    (data.ds_tp_config && data.ds_tp_config.toLowerCase().includes(searchText.toLowerCase())) ||  // Compara a descrição do tipo
    (data.user_config && data.user_config.toLowerCase().includes(searchText.toLowerCase()))       // Compara o usuário com o texto buscado
  );

  // Função para preencher os campos e ativar o modo de edição
  const startEditing = (
    id: number,                                                         // ID do registro de configuração que será editado
    tpConfigVal: number,                                                // Valor numérico do tipo de configuração
    urlConfigVal: string | null,                                        // URL ou Host cadastrado (pode ser nulo)
    portConfigVal: number | null,                                       // Porta de conexão cadastrada (pode ser nula)
    userConfigVal: string | null,                                       // Usuário cadastrado (pode ser nulo)
    keyConfigVal: string | null,                                        // Chave ou senha cadastrada (pode ser nula)
    stSslVal: number,                                                   // Status da flag SSL (1 para ativo, 0 para inativo)
    stConfigVal: number                                                 // Status geral da configuração (1 para ativo, 0 para inativo)
  ) => {
    setEditingId(id);                                                   // Define o ID do registro no estado de edição
    setTpConfig(String(tpConfigVal));                                   // Converte o tipo para string e atualiza o estado
    setUrlConfig(urlConfigVal ?? '');                                   // Preenche o campo da URL (trata null convertendo para string vazia)
    setPortConfig(portConfigVal !== null ? String(portConfigVal) : ''); // Converte e preenche a porta (ou string vazia se nula)
    setUserConfig(userConfigVal ?? '');                                 // Preenche o campo do usuário (trata null convertendo para string vazia)
    setKeyConfig(keyConfigVal ?? '');                                   // Preenche o campo da chave/senha (trata null convertendo para string vazia)
    setStSsl(stSslVal);                                                 // Define o status do protocolo SSL no estado
    setStConfig(stConfigVal);                                           // Define o status da configuração no estado
  };

  return {
    state: {
      ...state,                       // Propaga o estado base (loading, error, configTypes)
      configs: filteredList,          // Substitui a lista completa pela lista filtrada
    },
    form: {
      tpConfig,                       // Valor atual do campo tipo de configuração
      setTpConfig,                    // Setter para tipo de configuração
      urlConfig,                      // Valor atual do campo URL
      setUrlConfig,                   // Setter para campo URL
      portConfig,                     // Valor atual do campo porta
      setPortConfig,                  // Setter para campo porta
      userConfig,                     // Valor atual do campo usuário
      setUserConfig,                  // Setter para campo usuário
      keyConfig,                      // Valor atual do campo chave/senha
      setKeyConfig,                   // Setter para campo chave/senha
      stSsl,                          // Valor atual do status SSL
      setStSsl,                       // Setter para status SSL
      stConfig,                       // Valor atual do status da configuração
      setStConfig,                    // Setter para status da configuração
      searchText,                     // Valor digitado na busca
      setSearchText,                  // Setter para o termo de busca
      isEditing: editingId !== null,  // Booleano informando se está editando
      editingId,                      // ID do registro em edição ou null
      resetForm,                      // Função de reset do formulário
      startEditing,                   // Função de inicialização de edição
    },
    handleSaveData,                   // Handler de salvamento/atualização
    handleDeleteData,                 // Handler de deleção
    dispatch,                         // Despachante de intenções MVI
  };
}