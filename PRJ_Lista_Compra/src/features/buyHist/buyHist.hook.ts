// src/features/buyHist/buyHist.hook.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { BuyHistModel, BuyHistModelInstance } from './buyHist.model';
import { BuyHistIntent, BuyHistState } from './buyHist.types';

export function useBuyHistViewModel(model: BuyHistModel = BuyHistModelInstance) {
  // Estado centralizado de carregamento, erros e lista
  const [state, setState] = useState<BuyHistState>({
    items: [],          // Lista inicial de registros cadastrados (vazia)
    searchResults: [],  // Lista de resultados da busca de produtos
    totalRecords: 0,    // apresenta quantidade de registro cadastrados
    loading: false,     // Flag para controle de spinner/loading durante requisições
    error: null,        // Mensagem de erro capturada nas operações (null)
  });

  // Estados locais para controle de formulário, campo de busca e edição
  const [productId, setProductId] = useState('');                                   // Armazena o valor digitado no campo de grupo
  const [quantity, setQuantity] = useState('1');                                    // Armazena o valor digitado no campo quantidade
  const [price, setPrice] = useState('0.00');                                       // Armazena o valor digitado no campo preço
  const [supplierId, setSupplierId] = useState('');                                       // Armazena o valor digitado no campo preço
  const [searchText, setSearchText] = useState('');                                 // Armazena o termo de filtragem na listagem
  const [editingId, setEditingId] = useState<number | null>(null);                  // Armazena o ID do registro em edição (null indica novo cadastro)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);  // Armazena o ID do produto para adicionar a lista - Código/Nome
  const [modalSearchText, setModalSearchText] = useState('');                       // Armazena o termo de busca de produto código/nome

  // Reseta os campos do formulário para o estado inicial
  const resetForm = useCallback(() => {
    setProductId('');             // Limpa o texto do campo de ID produto
    setQuantity('1');           // Limpa o texto do campo quantidade e associa valor padrão 1
    setPrice('0.00')            // Limpa o texto do campo valor
    setSupplierId('')             // Limpa o texto do campo fornecedor
    setSelectedProductId(null); // Limpa o id do produto selecionado na busca código/nome
    setEditingId(null);         // Limpa o ID, voltando o formulário para modo de criação
  }, []);

  // Processador de intenções da interface (MVI)  
  const dispatch = useCallback(async (intent: BuyHistIntent) => {
    // Ativa o estado de carregamento e reseta mensagens de erro anteriores
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      switch (intent.type) {                                                          // Obtém os valores do Intent do type 
        case 'LOAD': {                                                                // Se a intenção for igual a LOAD
          const data = await model.fetchAll();                                        // Chama a função de busca de todos os registros e armazena
          setState(prev => ({                                                         // Atualiza o estado mantendo os anteriores
            ...prev,
            items: data,
            loading: false 
          }));
          break;
        }
        case 'UPDATE': {                                                              // Se a intenção for igual a UPDATE
          await model.update(
            intent.payload.id_hist_buy,
            intent.payload.id_product,
            intent.payload.qt_product,
            intent.payload.vl_product,
            intent.payload.id_supplier,          
          );  // Envia a intenção de atualização
          resetForm();                                                                // Limpa formulário                             
          const data = await model.fetchAll();                                        // Chama a função de busca de todos os registros
          setState(prev => ({                                                         // Atualiza o estado mantendo os anteriores
            ...prev,
            items: data,
            totalRecords: data.length,
            loading: false
          }));
          break;
        }
        case 'DELETE': {                                                              // Se a intenção for igual a DELETE
          await model.delete(intent.payload);                                         // Envia a intenção para deletar
          const data = await model.fetchAll();                                        // Chama a função de busca de todos os registros
          setState(prev => ({                                                         // Atualiza o estado mantendo os anteriores
            ...prev,
            items: data,
            totalRecords: data.length,
            checkBuy: false,
            loading: false
          }));
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
     if (!BuyHistModel.isValid(productId, quantity, price, supplierId)) {                  // Executa validações de dados obrigatórios
        Alert.alert('Aviso', 'Preencha os campos para o registro!');    // Alerta o usuário em caso de dados inválidos
      return false;                                                     // Interrompe a execução e retorna falso
    }
    const isEditing = editingId !== null;                               // Avalia se está em modo de edição (true) ou criação (false)
    const action = BuyHistModel.buildSaveAction(                        // Monta o objeto de intenção para gravação
      productId, quantity, price, supplierId, isEditing, editingId                         // Passa os valores digitados no formulário
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
  const startEditing = (id: number, product:number, quantity: number, price: number, supplier: number) => {
    setEditingId(id);               // Salva o ID do item
    setProductId(String(product)); // Salva o ID do produto no estado
    setQuantity(String(quantity));  // Preenche a quantidade no campo
    setPrice(String(price));
    setSupplierId(String(supplier));
  };
  // Cálculo total da compra acumulada
  const totalPurchaseValue = useMemo(() => {
    return state.items.reduce(
      (acc, item) => acc + (item.qt_product * (item.vl_product || 0)),
      0
    );
  }, [state.items]);

  const totalPurchaseItem = useMemo(() => {
    return state.items.reduce(
      (acc, item) => acc + (item.qt_product),
      0
    );
  }, [state.items]);

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
      price,
      setPrice,
      supplierId,
      setSupplierId,
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
    totalPurchaseItem,                        // Quantidade total dos itens da compra
    totalPurchaseValue,                       // Valor total acumulado de todos os itens da compra
    dispatch,                         // Disparador de ações do reducer
  };
}
