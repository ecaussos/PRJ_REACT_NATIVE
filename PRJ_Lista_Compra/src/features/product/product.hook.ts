// src/features/product/product.hook.ts
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { ProductModel, ProductModelInstance } from './product.model';
import { ProductIntent, ProductState } from './product.types';

export function useProductViewModel(model: ProductModel = ProductModelInstance) {
  // Estado centralizado de carregamento, erros e lista
  const [state, setState] = useState<ProductState>({
    products: [],                                                                 // Lista inicial de registros cadastrados (vazia)
    groups: [],                                                                   // Lista inicial de grupos cadastrados (vazia)
    loading: false,                                                               // Flag para controle de spinner/loading durante requisições
    error: null,                                                                  // Mensagem de erro capturada nas operações (null)
  });

  // Estados locais para controle de formulário, campo de busca e edição
  const [name, setName] = useState('');                                           // Armazena o valor digitado no campo de nome
  const [barcode, setBarcode] = useState('');                                     // Armazena o valor digitado no campo de código de barras
  const [groupId, setGroupId] = useState('');                                     // Armazena o valor digitado no campo de grupo
  const [searchText, setSearchText] = useState('');                               // Armazena o termo para filtragem na listagem
  const [editingId, setEditingId] = useState<number | null>(null);                // Armazena o ID do registro em edição (null indica novo cadastro)

  // Reseta os campos do formulário para o estado inicial
  const resetForm = useCallback(() => {
    setName('');                                                                  // Limpa o texto do campo de nome
    setBarcode('');                                                               // Limpa o texto do campo de código de barras
    setGroupId('');                                                               // Limpa o texto do campo de grupo
    setEditingId(null);                                                           // Limpa o ID, voltando o formulário para modo de criação
  }, []);

  // Processador de intenções da interface (MVI)
  const dispatch = useCallback(async (intent: ProductIntent) => {
    // Ativa o estado de carregamento e reseta mensagens de erro anteriores
    setState(prev => ({ ...prev, loading: true, error: null }));                   // Atualiza estado inicial da requisição
    try {
      switch (intent.type) {                                                      // Avalia o tipo de intenção solicitada
        case 'LOAD': {                                                            // Se a intenção for igual a LOAD
          const [productsData, groupsData] = await Promise.all([                  // Executa as buscas de produtos e grupos simultaneamente
            model.fetchAll(),                                                     // Busca a lista completa de produtos
            model.fetchGroupOptions()                                             // Busca as opções de grupos disponíveis
          ]);
          setState(prev => ({                                                     // Atualiza o estado centralizado com os dados carregados
            ...prev,                                                              // Mantém os valores de estado anteriores
            products: productsData,                                               // Altera o estado e vincula os produtos obtidos
            groups: groupsData,                                                   // Altera o estado e vincula os grupos obtidos
            loading: false                                                        // Desativa o indicador de carregamento
          }));
          break;                                                                  // Finaliza a execução do caso LOAD
        }

        case 'CREATE': {                                                          // Se a intenção for igual a CREATE
          await model.create(                                                     // Envia a intenção de criar com os campos informados
            intent.payload.nm_product,                                            // Nome do produto a ser cadastrado
            intent.payload.cd_product_gtin,                                       // Código de barras GTIN
            intent.payload.id_group,                                              // ID do grupo associado
          );
          resetForm();                                                            // Limpa os campos do formulário
          const data = await model.fetchAll();                                    // Rebusca todos os registros atualizados
          setState(prev => ({ ...prev, products: data, loading: false }));        // Atualiza a lista de produtos e remove o indicador de loading
          break;                                                                  // Finaliza a execução do caso CREATE
        }

        case 'UPDATE': {                                                          // Se a intenção for igual a UPDATE
          await model.update(intent.payload.id_product, {                         // Envia a intenção de atualização do registro pelo ID
            nm_product: intent.payload.nm_product,                                // Nome atualizado do produto
            cd_product_gtin: intent.payload.cd_product_gtin,                      // Código de barras atualizado
            id_group: intent.payload.id_group,                                    // ID do grupo atualizado
          });
          resetForm();                                                            // Limpa os campos do formulário
          const data = await model.fetchAll();                                    // Rebusca todos os registros atualizados
          setState(prev => ({ ...prev, products: data, loading: false }));        // Atualiza a lista de produtos e remove o indicador de loading
          break;                                                                  // Finaliza a execução do caso UPDATE
        }

        case 'DELETE': {                                                          // Se a intenção for igual a DELETE
          await model.delete(intent.payload);                                     // Executa a exclusão do registro pelo ID
          const data = await model.fetchAll();                                    // Rebusca a lista atualizada de registros
          setState(prev => ({ ...prev, products: data, loading: false }));        // Atualiza a lista e encerra o carregamento
          break;                                                                  // Finaliza a execução do caso DELETE
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
  const handleSaveData = async (): Promise<boolean> => {                          // Função assíncrona que retorna boolean de confirmação
    if (!ProductModel.isValid(name, barcode, groupId)) {                          // Executa validações de dados obrigatórios
      Alert.alert('Aviso', 'Preencha os compos para o registro!');                // Alerta o usuário em caso de dados inválidos
      return false;                                                               // Interrompe a execução e retorna falso
    }
    const isEditing = editingId !== null;                                         // Avalia se está em modo de edição (true) ou criação (false)
    const action = ProductModel.buildSaveAction(                                  // Monta o objeto de intenção para gravação
      name, barcode, groupId, isEditing, editingId                                // Passa os valores digitados no formulário
    );
    try {
      await dispatch(action);                                                     // Envia a ação MVI para processamento
      const successMessage = isEditing                                            // Define a mensagem dinâmica com base na operação
        ? 'Registro atualizado com sucesso!'                                      // Exibe mensagem para atualização
        : 'Registro cadastrado com sucesso!';                                     // Exibe mensagem para novo cadastro
      Alert.alert('Sucesso', successMessage);                                     // Exibe caixa de diálogo confirmando o sucesso
      return true;                                                                // Retorna verdadeiro sinalizando conclusão com sucesso
    } catch (err: any) {
      Alert.alert('Aviso', err.message || 'Erro ao salvar o registro.');          // Exibe mensagem caso a operação falhe
      return false;                                                               // Retorna falso sinalizando falha na gravação
    }
  };

  // Função para apresentar o modal de confirmação de exclusão
  const handleDeleteData = (id: number, name: string) => {                        // Recebe ID e nome do item para exibição na mensagem
    Alert.alert(                                                                  // Exibe alerta de confirmação nativo
      'Excluir',                                                                  // Título da caixa de diálogo
      `Deseja realmente excluir o registro "${name}"?`,                           // Mensagem de confirmação com o nome do item
      [
        { text: 'Cancelar', style: 'cancel' },                                    // Botão para cancelar a operação
        {
          text: 'Excluir',                                                        // Opção para confirmar a exclusão
          style: 'destructive',                                                   // Estilo visual de alerta no iOS
          onPress: async () => {                                                  // Ação executada ao confirmar exclusão
            try {
              await dispatch({ type: 'DELETE', payload: id });                    // Envia a intenção MVI de exclusão passando o ID
              Alert.alert('Sucesso', `Registro ${name} excluído com sucesso!`);   // Exibe confirmação após apagar o registro
            } catch (err: any) {
              Alert.alert('Erro', err.message || 'Erro ao excluir o produto.');   // Exibe mensagem caso a operação falhe
            }
          },
        },
      ]
    );
  };

  // Carregamento inicial ao montar o hook
  useEffect(() => {
    dispatch({ type: 'LOAD' }).catch(() => {});                                   // Executa a busca inicial e trata exceções
  }, [dispatch]);                                                                 // Garante reexecução caso dispatch seja alterado

  // Função para filtrar a lista de registros cadastrados
  const filteredList = state.products.filter(data =>                              // Aplica o filtro sobre a lista original
    data.nm_product.toLowerCase().includes(searchText.toLowerCase()) ||           // Compara o nome do produto com o texto buscado
    (data.cd_product_gtin && data.cd_product_gtin.includes(searchText))           // Compara o código de barras com o texto buscado
  );

  // Função para preencher os campos e ativar o modo de edição
  const startEditing = (
    id: number,                                                                   // ID do registro selecionado
    name: string,                                                                 // Nome do produto selecionado
    barcode: string,                                                              // Código de barras selecionado
    groupId: string                                                               // ID do grupo selecionado
  ) => {
    setEditingId(id);                                                             // Define o ID em edição
    setName(name);                                                                // Preenche o campo de texto do nome
    setBarcode(barcode);                                                          // Preenche o campo de texto do código de barras
    setGroupId(groupId);                                                          // Preenche o grupo selecionado
  };

  return {
    state: {
      ...state,                                                                   // Propaga o estado base (loading, error, groups)
      products: filteredList,                                                     // Substitui a lista completa pela lista filtrada
    },
    form: {
      name,                                                                       // Valor atual do campo nome
      setName,                                                                    // Setter para o campo nome
      barcode,                                                                    // Valor atual do campo código de barras
      setBarcode,                                                                 // Setter para o campo código de barras
      groupId,                                                                    // Valor atual do campo grupo
      setGroupId,                                                                 // Setter para o campo grupo
      searchText,                                                                 // Valor digitado na busca
      setSearchText,                                                              // Setter para o termo de busca
      isEditing: editingId !== null,                                              // Booleano informando se está editando
      editingId,                                                                  // ID do registro em edição ou null
      resetForm,                                                                  // Função de reset do formulário
      startEditing,                                                               // Função de inicialização de edição
    },
    handleSaveData,                                                               // Handler de salvamento/atualização
    handleDeleteData,                                                             // Handler de deleção
    dispatch,                                                                     // Despachante de intenções MVI
  };
}