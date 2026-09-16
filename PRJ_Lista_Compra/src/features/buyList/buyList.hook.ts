// src/features/buyList/buyList.hook.ts
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { BuyListModel, BuyListModelInstance } from './buyList.model';
import { BuyListIntent, BuyListState, ProductSearchResult } from './buyList.types';

export function useBuyListViewModel(model: BuyListModel = BuyListModelInstance) {
  // Estado centralizado de carregamento, erros e lista
  const [state, setState] = useState<BuyListState>({
    items: [],          // Lista inicial de registros cadastrados (vazia)
    searchResults: [],  // Lista de resultados da busca de produtos
    loading: false,     // Flag para controle de spinner/loading durante requisições
    error: null,        // Mensagem de erro capturada nas operações (null) 
  });

  // Estados locais para controle de formulário, campo de busca e edição
  const [productId, setProductId] = useState('');                                   // Armazena o valor digitado no campo de grupo
  const [quantity, setQuantity] = useState('1');                                    // Armazena o valor digitado no campo quantidade
  const [searchText, setSearchText] = useState('');                                 // Armazena o termo de filtragem na listagem
  const [editingId, setEditingId] = useState<number | null>(null);                  // Armazena o ID do registro em edição (null indica novo cadastro)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);  // Armazena o ID do produto para adicionar a lista - Código/Nome
  const [modalSearchText, setModalSearchText] = useState('');                       // Armazena o termo de busca de produto código/nome

  // Reseta os campos do formulário para o estado inicial
  const resetForm = useCallback(() => {
    setProductId('');           // Limpa o texto do campo de ID produto
    setQuantity('1');           // Limpa o texto do campo quantidade e associa valor padrão 1
    setSelectedProductId(null); // Limpa o id do produto selecionado na busca código/nome
    setEditingId(null);         // Limpa o ID, voltando o formulário para modo de criação
  }, []);

  // Processador de intenções da interface (MVI)  
  const dispatch = useCallback(async (intent: BuyListIntent) => {
    // Ativa o estado de carregamento e reseta mensagens de erro anteriores
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      switch (intent.type) {                                                        // Obtém os valores do Intent do type 
        case 'LOAD': {                                                              // Se a intenção for igual a LOAD
          const data = await model.fetchAll();                                      // Chama a função de busca de todos os registros e armazena
          setState(prev => ({ ...prev, items: data, loading: false }));             // Atualiza o estado mantendo os anteriores
          break;
        }
        case 'CREATE': {                                                            // Se a intenção for igual a CREATE 
          await model.create(intent.payload.id_product, intent.payload.qt_product); // Envia a intenção de criar com os campos
          resetForm();                                                              // Limpa formulário
          const data = await model.fetchAll();                                      // Chama a função de busca de todos os registros
          setState(prev => ({ ...prev, items: data, loading: false }));             // Atualiza os itens do estado
          break;
        }
        case 'UPDATE': {                                                            // Se a intenção for igual a UPDATE
          await model.update(intent.payload.id_list_buy, intent.payload.qt_product);// Envia a intenção de atualização
          resetForm();                                                              // Limpa formulário                             
          const data = await model.fetchAll();                                      // Chama a função de busca de todos os registros
          setState(prev => ({ ...prev, items: data, loading: false }));             // Atualiza os itens do estado
          break;
        }
        case 'DELETE': {                                                            // Se a intenção for igual a DELETE
          await model.delete(intent.payload);                                       // Envia a intenção para deletar
          const data = await model.fetchAll();                                      // Chama a função de busca de todos os registros
          setState(prev => ({ ...prev, items: data, loading: false }));             // Atualiza os itens do estado
          break;
        }
        case 'CLEAR_LIST': {                                                        // Se a intenção for igual a Excluir toda a lista
          await model.clear();                                                      // Envia a intenção para excluir tudo
          setState(prev => ({ ...prev, items: [], loading: false }));               // Esvazia os itens do estado
          break;
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

  // Função para salvar, validar e gerar mensagem correspondente às ações do formulário
  const handleSaveData = async (): Promise<boolean> => {                // Função assíncrona que retorna boolean de confirmação
     if (!BuyListModel.isValid(productId, quantity)) {                  // Executa validações de dados obrigatórios
        Alert.alert('Aviso', 'Preencha os campos para o registro!');    // Alerta o usuário em caso de dados inválidos
      return false;                                                     // Interrompe a execução e retorna falso
    }
    const isEditing = editingId !== null;                               // Avalia se está em modo de edição (true) ou criação (false)
    const action = BuyListModel.buildSaveAction(                        // Monta o objeto de intenção para gravação
      productId, quantity, isEditing, editingId                         // Passa os valores digitados no formulário
    );
    try {
      await dispatch(action);                                           // Envia a ação MVI para processamento
      const successMessage = isEditing                                  // Define a mensagem dinâmica com base na operação
        ? 'Registro atualizado com sucesso!'                            // Exibe mensagem para atualização
        : 'Registro cadastrado com sucesso!';                           // Exibe mensagem para novo cadastro
      Alert.alert('Sucesso', successMessage);                           // Exibe caixa de diálogo confirmando o sucesso
      return true;                                                      // Retorna verdadeiro sinalizando conclusão com sucesso
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Erro ao salvar o registro.'); // Exibe mensagem caso a operação falhe
      return false;                                                     // Retorna falso sinalizando falha na gravação
    }
  };

  // Função para apresentar o modal de confirmação de exclusão
  const handleDeleteData = (id: number, name: string) => {                      // Recebe ID e nome do item para exibição na mensagem
    Alert.alert(                                                                // Exibe alerta de confirmação nativo
      'Excluir',                                                                // Título da caixa de diálogo
      `Deseja realmente excluir o registro "${name}"?`,                         // Mensagem de confirmação com o nome do item
      [                                                                         // Array de botões de ação do alerta
        { text: 'Cancelar', style: 'cancel' },                                  // Botão para cancelar a operação
        { text: 'Excluir',                                                      // Opção para confirmar a exclusão
          style: 'destructive',                                                 // Estilo visual de alerta
          onPress: async () => {                                                // Ação executada ao confirmar exclusão
            try {
              await dispatch({ type: 'DELETE', payload: id });                  // Envia a intenção MVI de exclusão passando o ID
              Alert.alert('Sucesso', `Registro ${name} excluído com sucesso!`); // Exibe mensagem após executar a operação
            } catch (err: any) {
              Alert.alert('Erro', err.message || 'Erro ao excluir o produto.'); // Exibe mensagem caso a operação falhe
            }
          },
        },
      ]
    );
  };

  // Função para apresentar o modal de confirmação de exclusão total da lista
  const handleClearList = () => {                                             // Função para limpar todos os itens da lista
    Alert.alert(                                                              // Exibe alerta de confirmação nativo
      'Limpar Lista',                                                         // Título da caixa de diálogo
      'Deseja realmente apagar todos os itens da sua lista de compras?',      // Mensagem de confirmação
      [                                                                       // Array de botões de ação do alerta
        { text: 'Cancelar', style: 'cancel' },                                // Botão para cancelar a operação
        { text: 'Confirmar',                                                  // Botão de confirmação para limpar a lista
          style: 'destructive',                                               // Estilo visual de alerta
          onPress: async () => {                                              // Ação executada ao confirmar a limpeza da lista
            try {
              await dispatch({ type: 'CLEAR_LIST' });                         // Envia a intenção para limpar os registros no estado
              Alert.alert('Sucesso', 'Lista de compras limpa!');              // Exibe confirmação após executar a operação
            } catch (err: any) {
              Alert.alert('Erro', err.message || 'Erro ao limpar a lista.');  // Exibe aviso caso a operação falhe
            }
          },
        }
      ]
    );
  };

  // Leitura de código de barras via câmera delegando a busca e criação ao Model
  const handleScanSuccess = useCallback(async (barcode: string): Promise<boolean> => {
      try {
        const addProduct = await model.createByBarcode(barcode);                // Executa função busca/inserção do produto por código de barras
        await dispatch({ type: 'LOAD' });                                       // Envia a intenção para recarrega a lista de produtos atualizada

        const product = addProduct.nm_product;                                  // Define o nome do produto

        return await new Promise<boolean>((addAnother) => {                     // Aguarda retorno para adicionar outro produto
          Alert.alert(                                                          // Exibe alerta de confirmação nativo
            'Sucesso',                                                          // Título da caixa de diálogo
            `${product} adicionado à lista!\nDeseja adicionar outro produto?`,  // Exibe mensagem para a seleção da opção
            [                                                                   // Array de botões de ação do alerta
              { text: 'Não',                                                    // Opção para encerrar a operação
                style: 'cancel',                                                // Estilo do botão
                onPress: () => {                                                // Ação executada ao clicar no botão 
                  resetForm();                                                  // Limpa os dados do formulário
                  addAnother(false);                                            // Retonar adicionar outro produto com NÃO (False)
                },
              },
              { text: 'Sim',                                                    // Opção para continuar a operação outro produto
                onPress: () => {                                                // Ação executada ao clicar no botão 
                  addAnother(true);                                             // Retonar adicionar outro produto com SIM (True)
                },
              },
            ]
          );
        });
      } catch (error: any) {                                                    // Em caso de falha da operação
        Alert.alert(                                                            // Exibe alerta de confirmação nativo
          'Erro',                                                               // Título do alerta exibido em caso de falha
          error?.message || 'Erro ao adicionar o produto por código de barras.' // Exibe messagem extraída do erro capturado
        );
        return true;                                                            // Mantém o modal código de barra aberto
      }
    },
    [dispatch, model, resetForm]                                                // Dependências do hook para garantir a atualização da função
  );

  // Realiza a busca dinâmica de produtos por nome ou código para o Modal
  const handleSearchProductByName = useCallback(
    async (product: string) => {
      try {
        const results = await model.searchProducts(product);        // Consulta os produtos no Model utilizando o termo higienizado
        setState((prev) => ({ ...prev, searchResults: results }));  // Atualiza a lita com os resultados encontrados
      } catch (err) {                                               // Em caso de falha da operação
        setState((prev) => ({ ...prev, searchResults: [] }));       // Esvazia os resultados da lista de pesquisa
      }
    },
    [model]                                                         // Dependência do Hook para garantir acesso ao Model
  );

  // Seleção direta de produto via busca no modal
  const handleSelectProductToBuy = useCallback(
    async (item: ProductSearchResult): Promise<boolean> => {
      try {
        await dispatch({                                                                // Envia a intenção create o do produto com quantidade padrão igual a 1
          type: 'CREATE',                                                               // Identificação do tipo da intenção
          payload: { id_product: item.id_product, qt_product: 1 },                      // Envia o campos para do registro
        });
        return await new Promise<boolean>((addAnother) => {                             // Aguarda retorno para adicionar outro produto
          Alert.alert(                                                                  // Exibe alerta de confirmação nativo
            'Sucesso',                                                                  // Título do alerta de confirmação
            `${item.nm_product} adicionado à lista!\nDeseja adicionar outro produto?`,  // Mensagem contendo o nome do item selecionado
            [                                                                           // Array de botões de ação do alerta
              { text: 'Não',                                                            // Opção para encerrar a operação
                style: 'cancel',                                                        // Estilo do botão
                onPress: () => {                                                        // Ação executada ao clicar no botão 
                  resetForm();                                                          // Limpa os dados do formulário
                  setModalSearchText('');                                               // Limpa o texto do campo de busca no modal
                  setState((prev) => ({ ...prev, searchResults: [] }));                 // Esvazia os resultados da lista de pesquisa
                  addAnother(false);                                                    // Retonar adicionar outro produto com NÃO (False)
                },
              },
              { text: 'Sim',                                                            // Opção para continuar a operação outro produto
                onPress: () => {                                                        // Ação executada ao clicar no botão 
                  setModalSearchText('');                                               // Limpa o texto digitado para o próximo item
                  setState((prev) => ({ ...prev, searchResults: [] }));                 // Esvazia a lista de busca atual
                  addAnother(true);                                                     // Retonar adicionar outro produto com SIM (True)
                },
              },
            ]
          );
        });
      } catch (error: any) {                                                            // Em caso de falha da operação
        Alert.alert(                                                                    // Exibe alerta de confirmação nativo
          'Erro',                                                                       // Título do alerta exibido em caso de falha
          error?.message || 'Não foi possível adicionar o produto.'                     // Exibe messagem extraída do erro capturado
        );
        return true;                                                                    // Mantem o modal de pesquisa aberto
      }
    },
    [dispatch, resetForm]                                                               // Dependências do hook para garantir a atualização da função
  );

  // Carregamento inicial ao montar o hook
  useEffect(() => {
    dispatch({ type: 'LOAD' }).catch(() => {}); // Executa a busca inicial e trata exceções
  }, [dispatch]);                               // Garante reexecução caso dispatch seja alterado

   // Função para filtrar a lista de registros cadastrados
  const filteredItems = state.items.filter(item => {
    // Converte o texto digitado para minúsculas e remove espaços
    const searchLower = searchText.toLowerCase().trim(); 
    // Retorna todos os itens se o campo de busca estiver vazio
    if (!searchLower) return true;
    // Verifica se o nome do produto contém o texto pesquisado
    const matchName = item.nm_product.toLowerCase().includes(searchLower);
    // Verifica se o grupo do produto contém o texto pesquisado (se o grupo existir)
    const matchGroup = item.nm_group ? item.nm_group.toLowerCase().includes(searchLower) : false;
    // Retorna verdadeiro se houver correspondência no nome ou no grupo
    return matchName || matchGroup;
  });

  // Função de edição para preencher campos do formulário
  const startEditing = (id: number, quantity: number) => {
    setEditingId(id);               // Salva o ID do item
    setQuantity(String(quantity));  // Preenche a quantidade no campo
  };

  return {
state: {
      ...state, // Copia o estado original
      items: filteredItems, // Subtitui a lista de itens pela lista filtrada
    },
    form: {
      productId,                      // ID do produto digitado
      setProductId,                   // Função para alterar o ID do produto
      quantity,                       // Quantidade digitada
      setQuantity,                    // Função para alterar a quantidade
      searchText,                     // Texto de busca da lista principal
      setSearchText,                  // Função para alterar o texto de busca principal
      modalSearchText,                // Texto de busca do modal
      setModalSearchText,             // Função para alterar o texto de busca do modal
      selectedProductId,              // Produto selecionado no modal
      setSelectedProductId,           // Função para alterar o produto selecionado
      isEditing: editingId !== null,  // Booleano indicando se está editando
      editingId,                      // ID do item em edição
      resetForm,                      // Função para limpar os campos
      startEditing,                   // Função para iniciar a edição de um item
    },
    handleSaveData,                   // Função para salvar/atualizar item
    handleDeleteData,                 // Função para remover item da lista
    handleClearList,                  // Função para limpar toda a lista
    handleSearchProductByName,        // Função para buscar produtos por nome
    handleSelectProductToBuy,         // Função para selecionar o produto encontrado
    handleScanSuccess,                // Função para processar a leitura do código de barras
    dispatch,                         // Disparador de ações do reducer
  };
}