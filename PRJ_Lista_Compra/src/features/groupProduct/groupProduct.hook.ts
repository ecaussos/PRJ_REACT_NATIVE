// src/features/groupProduct/groupProduct.hook.ts
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { GroupProductModel, groupProductModelInstance } from './groupProduct.model';
import { GroupProductIntent, GroupProductState } from './groupProduct.types';

export function useGroupProductViewModel(model: GroupProductModel = groupProductModelInstance) {
  // Estado centralizado de carregamento, erros e lista
  const [state, setState] = useState<GroupProductState>({
    groups: [],                                                                    // Lista inicial de registros cadastrados (vazia)
    loading: false,                                                                // Flag para controle de spinner/loading durante requisições
    error: null,                                                                   // Mensagem de erro capturada nas operações (null)
  });

  // Estados locais para controle de formulário, campo de busca e edição
  const [name, setName] = useState('');                                            // Armazena o valor digitado no campo de nome
  const [searchText, setSearchText] = useState('');                                // Armazena o termo de busca para filtragem na listagem
  const [editingId, setEditingId] = useState<number | null>(null);                 // Armazena o ID do registro em edição (null indica novo cadastro)
 
  // Reseta os campos do formulário para o estado inicial
  const resetForm = useCallback(() => {
    setName('');                                                                   // Limpa o texto do campo de nome
    setEditingId(null);                                                            // Limpa o ID, voltando o formulário para modo de criação
  }, []);

  // Processador de intenções da interface (MVI)
  const dispatch = useCallback(async (intent: GroupProductIntent) => {
    // Ativa o estado de carregamento e reseta mensagens de erro anteriores
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
        switch (intent.type) {                                                     // Obten os valores do Intent do type 
        case 'LOAD': {                                                             // Se a intenção for igual a LOAD
          const Data = await model.fetchAll();                                     // Chama a função de busca todos os registro e armazena
          setState(prev => ({                                                      // Atualiza os estado
            ...prev,                                                               // Mantem estados ateriores
            groups: Data,                                                          // Altera o estado e vincula os dados da busca a varíavel
            loading: false                                                         // Altera o estado para Indicador visual de carregamento
          }));
          break;
        }

        case 'CREATE':{                                                            // Se a intenção for igual a CREATE 
          await model.create(intent.payload.nm_group);                             // Envia a intenção de criar com o campo
          resetForm();                                                             // Limpar formulário                             
          const Data = await model.fetchAll();                                     // Chama a função de busca todos os registro
          setState(prev => ({...prev, groups: Data, loading: false }));            // Mantem status anteriores e atualiza os especificos                                        // Mantem os estados ateriores
          break;
        }

        case 'UPDATE': {                                                           // Se a intenção for igual a UPDATE
          await model.update(intent.payload.id_group, {                            // Envia a intenção de atualização do ID
            nm_group: intent.payload.nm_group                                      // Envia os campos a serem atualizados
          });
          resetForm();                                                             // Limpar formulário                             
          const Data = await model.fetchAll();                                     // Chama a função de busca todos os registro
          setState(prev => ({...prev, groups: Data, loading: false }));            // Mantem status anteriores e atualiza os especificos                                       // Mantem os estados ateriores
          break;
        }

        case 'DELETE': {                                                           // Se a intenção for igual a DELETE
          await model.delete(intent.payload);                                      // Envia a intenção para deletar
          const Data = await model.fetchAll();                                     // Chama a função de busca todos os registro
          setState(prev => ({...prev, groups: Data, loading: false }));            // Mantem status anteriores e atualiza os especificos                                      // Mantem os estados ateriores
          break;
        }
      }
    } catch (err) {
      // Captura e formata erros lançados pela Model ou pelo Repositório
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro na operação.';
      // Mantem status anteriores e atualiza os especificos 
      setState(prev => ({...prev, error: errorMessage, loading: false }));
      //Lança a exceção para o screen
      throw err;
    }
  }, [model, resetForm]);  // Limpar formulário   

  // Função para salvar validar e gerar mensagem correspondente as ações
  const handleSaveData = async (): Promise<boolean> => {                           // Função assíncrona que retorna verdadeiro ou falso
    if (!GroupProductModel.isValid(name)) {                                        // Chama a função de validação de dados e valida retorno
      Alert.alert('Aviso', 'Preencha o nome do fornecedor!');                      // Falso: Gerar mensagem informativa
      return false;                                                                // Para o processo e retorna falso
    }
    const isEditing = editingId !== null;                                          // Verificar se é edição (true) ou criação (false)
    const action = GroupProductModel.buildSaveAction(name, isEditing, editingId);  // Cria o objeto da ação para salvar
    try {                                                                          
      await dispatch(action);                                                      // Envia a ação para ser processada
      const successMessage = isEditing                                             // Escolhe a mensagem de acordo com a ação
        ? 'Registro atualizado com sucesso!'                                       // Mensagem caso seja edição
        : 'Registro cadastrado com sucesso!';                                      // Mensagem caso seja criação
      Alert.alert('Sucesso', successMessage);                                      // Mostra mensagem de sucesso na tela
      return true;                                                                 // Retorna verdadeiro indicando sucesso
    } catch (err: any) {
      Alert.alert('Aviso', err.message || 'Erro ao salvar o registro.');           // Mostra o erro capturado na tela
      return false;                                                                // Retorna falso indicando falha
    }
  };

  // Função para apresentar o modal de confirmação de operação - Delete
  const handleDeleteData = (id: number, name: string) => {                         // Função e parametros recebidos
    Alert.alert(                                                                   // Tipo de mensagem                                                      
      'Excluir',                                                                   // Título da caixa de diálogo
      `Deseja realmente excluir o registro "${name}"?`,                            // Mensagem informativa
      [                                                                            // Botões de ação
        { text: 'Cancelar', style: 'cancel' },                                     // Botão cancelar
        { text: 'Excluir',                                                         // Botão confirmar
          style: 'destructive',                                                    // Aplica estilo visual no iOS
          onPress: async () => {                                                   // Ação a precionar o botão de confirmação
            try {
              await dispatch({ type: 'DELETE', payload: id });                     // Envia a intenção MVI de exclusão passando o ID
              Alert.alert('Sucesso', `Registro ${name} excluído com sucesso!`);    // Mensagem informativa
            } catch (err: any) {
              Alert.alert('Erro', err.message || 'Erro ao excluir o fornecedor.'); // Exibe mensagem de erro customizada ou genérica em caso de falha
            }
          },
        },
      ]
    );
  };

  // Carregamento inicial ao montar o hook
  useEffect(() => {                                                                // Executa quando a tela é aberta
    dispatch({ type: 'LOAD' }).catch(() => {});                                    // Carrega a lista inicial e ignora erros não tratados
  }, [dispatch]);                                                                  // Dependência para garantir execução correta

  //Função parar filtrar lista de registros cadastrados
  const filteredList = state.groups.filter(data =>                                 // Percorre e filtra a lista de fornecedores
    data.nm_group.toLowerCase().includes(searchText.toLowerCase())                 // Compara o nome e o texto da busca (minúsculas)
  );

  // Função de edição para preencher campos do formulario
  const startEditing = (id: number, name: string) => {                             // Inicia o modo de edição com o ID e nome selecionados
    setEditingId(id);                                                              // Salva o ID do item a ser editado
    setName(name);                                                                 // Preenche o campo de texto com o nome atual
  };

  return { 
    state: {                                                                       // Objeto com os dados de estado da tela
      ...state,                                                                    // Copia os valores atuais (loading e error)
      groups: filteredList,                                                        // Substitui a lista pela versão filtrada pela busca
    },
    form: {                                                                        // Objeto com os controles e valores do formulário
      name,                                                                        // Texto atual do campo de nome
      setName,                                                                     // Função para atualizar o texto do campo de nome
      searchText,                                                                  // Texto atual do campo de busca
      setSearchText,                                                               // Função para atualizar o texto do campo de busca
      isEditing: editingId !== null,                                               // Indica se está em modo de edição (true) ou criação (false)
      editingId,                                                                   // ID do registro que está sendo editado (ou null)
      resetForm,                                                                   // Função para limpar os campos do formulário
      startEditing,                                                                // Função para preparar os campos para edição
    },
    handleSaveData,                                                                // Função para salvar ou atualizar o registro
    handleDeleteData,                                                              // Função para confirmar e excluir o registro
    dispatch,                                                                      // Processador de intenções MVI
  };
}