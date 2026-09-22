// src/features/buy/buy.hook.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { BuyListModelInstance } from '../buyList/buyList.model';
import { SupplierModelInstance } from '../supplier/supplier.model';
import { BuyModel, BuyModelInstance } from './buy.model';
import { BuyIntent, BuyState, ProductSearchResult } from './buy.types';

export function useBuyViewModel(model: BuyModel = BuyModelInstance) {
  const [state, setState] = useState<BuyState>({
    items: [],          // Lista inicial de registros cadastrados (vazia)
    searchResults: [],  // Lista de resultados da busca de produtos
    suppliers: [],      // Lista com os fornecedores cadastrados
    loading: false,     // Flag para controle de spinner/loading durante requisições
    error: null,        // Mensagem de erro capturada nas operações (null)
  });

  // Estados locais para controle de formulário, campo de busca e edição
  const [productId, setProductId] = useState('');                                   // Armazena o valor digitado no campo do ID do produto
  const [quantity, setQuantity] = useState('1');                                    // Armazena o valor digitado no campo quantidade
  const [price, setPrice] = useState('0.00');                                       // Armazena o valor digitado no campo preço
  const [searchText, setSearchText] = useState('');                                 // Armazena o termo de filtragem na listagem
  const [editingId, setEditingId] = useState<number | null>(null);                  // Armazena o ID do registro em edição (null indica novo cadastro)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);  // Armazena o ID do produto para adicionar à lista - Código/Nome
  const [modalSearchText, setModalSearchText] = useState('');                       // Armazena o termo de busca do produto no modal por código/nome
  const [onlyWithoutPrice, setOnlyWithoutPrice] = useState(false);                  // Armazena o estado do filtro para produtos sem preço/zerados
  const [selectedGroup, setSelectedGroup] = useState<string>('');                   // Armazena o nome do grupo selecionado no filtro

  // Reseta os campos do formulário para o estado inicial
  const resetForm = useCallback(() => {
    setProductId('');           // Limpa o texto do campo de ID produto
    setQuantity('1');           // Limpa o texto do campo quantidade e associa valor padrão 1
    setPrice('0.00');           // Limpa o texto do campo preço
    setSelectedProductId(null); // Limpa o id do produto selecionado na busca código/nome
    setEditingId(null);         // Limpa o ID, voltando o formulário para modo de criação
  }, []);

// Função para limpar explicitamente todos os filtros
  const handleClearFilters = useCallback(() => {
    setSearchText('');          // Reseta a busca por texto do nome do produto
    setOnlyWithoutPrice(false); // Desativa o filtro de produtos sem preço/zerados
    setSelectedGroup('');       // Reseta a seleção do grupo no filtro
  }, []);

  // Reducer / Dispatch MVI responsável pelas ações assíncronas do estado
  const dispatch = useCallback(async (intent: BuyIntent) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      switch (intent.type) {
        case 'LOAD': {
          const data = await model.fetchAll();
          setState(prev => ({ ...prev, items: data, loading: false }));
          break;
        }
        case 'CREATE': {
          await model.create(intent.payload.id_product,intent.payload.qt_product,intent.payload.vl_product);
          resetForm();
          const data = await model.fetchAll();
          setState(prev => ({ ...prev, items: data, loading: false }));
          break;
        }
        case 'UPDATE': {
          await model.update(intent.payload.id_product, intent.payload.qt_product, intent.payload.vl_product);
          resetForm();
          const data = await model.fetchAll();
          setState(prev => ({ ...prev, items: data, loading: false }));
          break;
        }
        case 'DELETE': {
          await model.delete(intent.payload.id_product);
          const data = await model.fetchAll();
          setState(prev => ({ ...prev, items: data, loading: false }));
          break;
        }
        case 'CLEAR': {
          await model.clear();
          setState(prev => ({ ...prev, items: [], loading: false }));
          break;
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro na operação.';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw err;
    }
  }, [model, resetForm]);

  // Função para salvar, validar e gerar mensagem correspondente às ações do formulário
  const handleSaveData = async (): Promise<boolean> => {                // Função assíncrona que retorna boolean de confirmação
     if (!BuyModel.isValid(productId, quantity, price)) {               // Executa validações de dados obrigatórios
        Alert.alert('Aviso', 'Preencha os campos para o registro!');    // Alerta o usuário em caso de dados inválidos
      return false;                                                     // Interrompe a execução e retorna falso
    }
    const isEditing = editingId !== null;                               // Avalia se está em modo de edição (true) ou criação (false)
    const action = BuyModel.buildSaveAction(                            // Monta o objeto de intenção para gravação
      productId, quantity, price, isEditing, editingId                  // Passa os valores digitados no formulário
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
  const handleDeleteData = (id_product: number, nm_product: string) => {              // Recebe ID e nome do item para exibição na mensagem
    Alert.alert(                                                                      // Exibe alerta de confirmação nativo
      'Excluir',                                                                      // Título da caixa de diálogo
      `Deseja realmente excluir o registro "${nm_product}"?`,                         // Mensagem de confirmação com o nome do item
      [                                                                               // Array de botões de ação do alerta
        { text: 'Cancelar', style: 'cancel' },                                        // Botão para cancelar a operação
        { text: 'Excluir',                                                            // Opção para confirmar a exclusão
          style: 'destructive',                                                       // Estilo visual de alerta
          onPress: async () => {                                                      // Ação executada ao confirmar exclusão
            try {
              await dispatch({ type: 'DELETE', payload: { id_product }});              // Envia a intenção MVI de exclusão passando o ID
              Alert.alert('Sucesso', `Registro ${nm_product} excluído com sucesso!`); // Exibe mensagem após executar a operação
            } catch (err: any) {
              Alert.alert('Erro', err.message || 'Erro ao excluir o produto.');       // Exibe mensagem caso a operação falhe
            }
          },
        },
      ]
    );
  };

  // Função para apresentar o modal de confirmação de exclusão total da lista
  const handleClearBuy = () => {                                              // Função para limpar todos os itens da lista
    Alert.alert(                                                              // Exibe alerta de confirmação nativo
      'Limpar Lista',                                                         // Título da caixa de diálogo
      'Deseja realmente apagar todos os itens da sua compra?',                // Mensagem de confirmação
      [                                                                       // Array de botões de ação do alerta
        { text: 'Cancelar', style: 'cancel' },                                // Botão para cancelar a operação
        { text: 'Confirmar',                                                  // Botão de confirmação para limpar a lista
          style: 'destructive',                                               // Estilo visual de alerta
          onPress: async () => {                                              // Ação executada ao confirmar a limpeza da lista
            try {
              await dispatch({ type: 'CLEAR' });                              // Envia a intenção para limpar os registros no estado
              Alert.alert('Sucesso', 'Compra limpa!');                        // Exibe confirmação após executar a operação
            } catch (err: any) {
              Alert.alert('Erro', err.message || 'Erro ao limpar a compra.'); // Exibe aviso caso a operação falhe
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
    [dispatch, model, resetForm]            // Dependências do hook para garantir a atualização da função
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
          payload: {                                                                     // Envia o campos para do registro
            id_product: item.id_product,
            qt_product: 1,
            vl_product: 0.00
          },
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

  // Chama a função para importa os produto da lista de compra
  const handleImportFromList = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));                  // Atualiza o estado mantendo os anteriores
    try {
      const listItems = await BuyListModelInstance.fetchAll();                        // Busca os registro da lista de compra
      if (!listItems || listItems.length === 0) {                                     // Verifica se a lista está vazia
        Alert.alert('Aviso', 'Não há produtos cadastrados na sua Lista de compra.');  // Verdadeiro: Gerar mensagem informativa
        setState(prev => ({ ...prev, loading: false }));                              // Atualiza o estado mantendo os anteriores
        return;                                                                       // Retorna os registros encontrados
      }
      for (const item of listItems) {                                                 // Pega os registros um por um até o final da lista
        await dispatch({                                                              // Chama a intenção para criar os registros
          type: 'CREATE',                                                             // Tipo da inteção
          payload: {                                                                  // Lista dos campos com os dados
            id_product: item.id_product,                                              // Campo ID produto
            qt_product: item.qt_product,                                              // Campo Quantidade
            vl_product: 0,                                                            // Campo valor
          },
        });
      }
      Alert.alert('Sucesso', 'Produtos importados da Lista com sucesso!');            // Exibe mensagem de conclusão da operação
    } catch (error: any) {
      Alert.alert('Erro', error?.message || 'Erro ao importar itens da lista.');      // Exibe mensagem caso a operação falhe
    } finally {
      setState(prev => ({ ...prev, loading: false }));                                // Atualiza o estado mantendo os anteriores
    }
  }, [dispatch]);

  // Chama a função para finaliza a compra e Valida a busca para os fornecedores antes de autorizar a abertura do modal
  const handleOpenFinishModal = useCallback(async (): Promise<boolean> => {
    try {
      // Verifica se a lista não existe ou se está sem itens 
      if (!state.items || state.items.length === 0) {                                       
        // Verdadeiro: Gerar mensagem informativa
        Alert.alert('Aviso', 'Adicione produtos à lista antes de finalizar a compra.');
        // Retorna false
        return false;
      }
      // Valida se os itens da lista possuem preço e desestrutura o resultado
      const { isValid, invalidItemName } = BuyModel.canFinalize(state.items);
      // Se a validação falhar (preço zerado, nulo ou ausente)
      if (!isValid) {                                               // ! = NÃO 
        // Verdadeiro: pega o nome do produto
        const product = invalidItemName;
        // Gerar mensagem informativa com o nome do produto
        Alert.alert('Aviso', `O produto "${product}" está sem preço, por favor, informe o preço para finalizar a compra.`);
        // Retorna false        
        return false;
      }
      // Garante que os fornecedores mais recentes sejam buscados no banco
      const suppliers = await SupplierModelInstance.fetchAll(); // Chama a função para buscar os fornecedores cadastrados 
      
      // Valida se não retornou nenhum fornecedor
      if (!suppliers || suppliers.length === 0) {
        // Verdadeiro: Gera mensagem informativa
        Alert.alert('Aviso', 'Cadastre pelo menos um fornecedor/mercado antes de finalizar a compra.');
        // retornar false
        return false;
      }
      // Atualiza o estado mantendo os anteriores
      setState(prev => ({ ...prev, suppliers }));
      // Retorna autorização para abrir o modal
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar fornecedores.';
      Alert.alert('Erro', message);
      return false;
    }
  }, [state.items]);

  // Executa o envio final do registro de compras para o histórico e limpa as tabelas
  const handleConfirmFinalize = useCallback((supplierId: number) => {
    // 1. Aplica a Regra de Negócio: Não permite prosseguir se houver QUALQUER item sem valor válido
    if (!BuyModel.canFinalize(state.items)) {
      Alert.alert(
        'Atenção',
        'Existe produto na lista de compra que não possuem preço, adicione um preço para finalizar a compra.'
      );
      return;
    }
    // 2. Apresenta o alerta de confirmação antes de executar as operações no banco
    Alert.alert(
      'Confirmar Finalização',
      'Deseja realmente finalizar a compra e mover os itens para o histórico?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Finalizar',
          onPress: async () => {
            try {
              // Ativa o estado de carregamento
              setState(prev => ({ ...prev, loading: true, error: null }));
              // Pèga a data ataual e associa ao campo
              const currentDate = new Date().toISOString();
              // Processa a gravação no histórico e a remoção das tabelas 'buy' e 'buy_list'
              for (const item of state.items) {
                // 1. Insere na tabela de Histórico (buy_history)
                await model.createBuyHist({
                  id_product: item.id_product,                  // Identificador único do produto cadastrado
                  id_supplier: supplierId,                      // Identificador do fornecedor associado à compra
                  qt_product: item.qt_product,                  // Quantidade comprada do produto
                  vl_product: item.vl_product!,                 // Valor unitário do produto (assumido como não nulo)
                  dt_list_buy: item.dt_list_buy || currentDate, // Data de criação na lista de compras (ou data atual caso nula)
                  dt_hist_buy: currentDate,                     // Data do registro histórico da compra
                });
                // 2. Remove da buy_list através do método dedicado por id_product no repositório
                await model.deleteBuyList(item.id_product);
                // 3. Remove da tabela de compras ativas (buy)
                await model.delete(item.id_product);
              }
              // Reseta o estado local da tela (limpa a lista exibida)
              setState(prev => ({
                ...prev,
                items: [],
                loading: false,
                error: null,
              }));

              Alert.alert('Sucesso', 'Compra finalizada e registrada no histórico!');
            } catch (error: unknown) {
              console.error('[ERRO FINALIZE BUY]:', error);
              const message = error instanceof Error ? error.message : 'Erro ao finalizar compra.';

              setState(prev => ({ ...prev, loading: false, error: message }));
              Alert.alert('Erro', message);
            }
          },
        },
      ]
    );
  }, [state.items, model]);

  // Carregamento inicial ao montar o hook
  useEffect(() => {                             // Executa quando a tela é aberta
    dispatch({ type: 'LOAD' }).catch(() => {}); // Carrega a lista inicial e ignora erros não tratados
  }, [dispatch]);                               // Dependência para garantir execução correta

  // Função para filtrar a lista de registros cadastrados
  const filteredItems = state.items.filter(item => {
    // Converte o texto digitado para minúsculas e remove espaços
    const searchLower = searchText.toLowerCase().trim(); 
    // 1. Validação do texto: Busca exclusivamente pelo Nome do Produto
    const matchName = item.nm_product.toLowerCase().includes(searchLower);
    const matchText = !searchLower || matchName;
    // 2. Validação do preço (zerado ou nulo)
    const isPriceZeroOrEmpty = item.vl_product === null || item.vl_product === undefined || item.vl_product === 0;
    const matchPriceFilter = onlyWithoutPrice ? isPriceZeroOrEmpty : true;
    // 3. Validação do Grupo selecionado no ListBox
    const matchGroupSelect = selectedGroup ? item.nm_group === selectedGroup : true;
    // Retorna o produto apenas se atender a TODOS os critérios
    return matchText && matchPriceFilter && matchGroupSelect;
  });

  // Filtra o registro os grupos presentes na compra
const availableGroups = useMemo(() => {                                           // Memoiza a lista de grupos para evitar reprocessamento desnecessário
    const groups = state.items                                                    // Mapeia a lista de itens da compra
      .map(item => item.nm_group)                                                 // Extrai apenas os nomes dos grupos de cada item
      .filter((group): group is string => Boolean(group && group.trim() !== '')); // Remove valores nulos, indefinidos ou em branco
    return Array.from(new Set(groups));                                           // Converte para um Set para remover os nomes duplicados
  }, [state.items]);                                                              // Recalcula apenas quando a lista de itens for alterada

  // Prepara o formulário para modo de edição
  const startEditing = (idProduct: number, quantity: number, price: number) => {
    setEditingId(idProduct);          // Define o ID do produto em edição
    setProductId(String(idProduct));  // Converte e armazena o ID como texto
    setSelectedProductId(idProduct);  // Atualiza o produto selecionado no estado
    setQuantity(String(quantity));    // Converte a quantidade para texto e salva
    setPrice(String(price));          // Converte o preço para texto e salva
  };

// Cálculo total do valor usando a lista filtrada (filteredItems)
  const totalPurchaseValue = useMemo(() => {                            // Memoiza o cálculo do valor total da compra
    return filteredItems.reduce(                                        // Percorre a lista de itens filtrados acumulando os valores
      (acc, item) => acc + (item.qt_product * (item.vl_product || 0)),  // Multiplica a quantidade pelo preço do item (ou zero) e soma
      0                                                                 // Valor inicial do acumulador
    );
  }, [filteredItems]);                                                  // Recalcula apenas quando a lista filtrada for alterada

  // Cálculo da quantidade total de itens usando a lista filtrada (filteredItems)
  const totalPurchaseItem = useMemo(() => { // Memoiza o cálculo do total de itens na compra
    return filteredItems.reduce(            // Percorre a lista de itens filtrados acumulando as quantidades
      (acc, item) => acc + item.qt_product, // Soma a quantidade do produto ao total acumulado
      0                                     // Valor inicial do acumulador
    );
  }, [filteredItems]);                      // Recalcula apenas quando a lista filtrada for alterada

  // Estado computado com itens filtrados
  return {
    state: {
      ...state, // Copia o estado original
      items: filteredItems, // Subtitui a lista de itens pela lista filtrada
    },
    form: {
      productId,                              // ID do produto digitado
      setProductId,                           // Função para alterar o ID do produto
      quantity,                               // Quantidade digitada
      setQuantity,                            // Função para alterar a quantidade
      price,                                  // Preço digitado
      setPrice,                               // Função para alterar o preço
      searchText,                             // Texto de busca da lista principal
      setSearchText,                          // Função para alterar o texto de busca principal
      modalSearchText,                        // Texto de busca do modal
      setModalSearchText,                     // Função para alterar o texto de busca do modal
      selectedProductId,                      // Produto selecionado no modal
      setSelectedProductId,                   // Função para alterar o produto selecionado
      isEditing: editingId !== null,          // Booleano indicando se está editando
      editingId,                              // ID do item em edição
      selectedGroup,                          // Nome do grupo atualmente selecionado no filtro
      setSelectedGroup,                       // Função para atualizar o grupo selecionado
      availableGroups,                        // Lista com os nomes dos grupos disponíveis para seleção
      onlyWithoutPrice,                       // Estado do filtro para itens sem preço/zerados
      setOnlyWithoutPrice,                    // Função para alterar o estado do filtro sem preço
      handleClearFilters,                     // Função para resetar todos os parâmetros de filtragem
      resetForm,                              // Função para limpar os campos
      startEditing,                           // Função para iniciar a edição de um item
    },
    handleSaveData,                           // Função para salvar/atualizar item
    handleDeleteData,                         // Função para remover item da lista
    handleClearBuy,                           // Função para limpar toda a lista
    handleSearchProductByName,                // Função para buscar produtos por nome
    handleSelectProductToBuy,                 // Função para selecionar o produto encontrado
    handleScanSuccess,                        // Função para processar a leitura do código de barras
    handleOpenFinishModal,                    // Função para abrir o modal de finalização da compra
    handleFinalizeBuy: handleConfirmFinalize, // Renomeia e atribui a função de confirmação e encerramento da compra
    handleImportFromList,                     // Função para importar itens a partir de uma lista existente
    totalPurchaseItem,                        // Quantidade total dos itens da compra
    totalPurchaseValue,                       // Valor total acumulado de todos os itens da compra
    dispatch,                                 // Disparador de ações do reducer
  };
}