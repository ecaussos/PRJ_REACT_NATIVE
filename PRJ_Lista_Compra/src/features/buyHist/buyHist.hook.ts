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
    suppliers: [],      // Lista os fornecedores cadastrados
    totalRecords: 0,    // apresenta quantidade de registro cadastrados
    loading: false,     // Flag para controle de spinner/loading durante requisições
    error: null,        // Mensagem de erro capturada nas operações (null)
  });

  // Estados locais para controle de formulário, campo de busca e edição
  const [productId, setProductId] = useState('');                                   // Armazena o valor digitado no campo de grupo
  const [quantity, setQuantity] = useState('1');                                    // Armazena o valor digitado no campo quantidade
  const [price, setPrice] = useState('0.00');                                       // Armazena o valor digitado no campo preço
  const [supplierId, setSupplierId] = useState('');                                 // Armazena o valor digitado no campo preço
  const [searchText, setSearchText] = useState('');                                 // Armazena o termo de filtragem na listagem
  const [editingId, setEditingId] = useState<number | null>(null);                  // Armazena o ID do registro em edição (null indica novo cadastro)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);  // Armazena o ID do produto para adicionar a lista - Código/Nome
  const [modalSearchText, setModalSearchText] = useState('');                       // Armazena o termo de busca de produto código/nome
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');             // Armazena o nome do fornecedor selecionado no filtro

  // Reseta os campos do formulário para o estado inicial
  const resetForm = useCallback(() => {
    setProductId('');           // Limpa o texto do campo de ID produto
    setQuantity('1');           // Limpa o texto do campo quantidade e associa valor padrão 1
    setPrice('0.00')            // Limpa o texto do campo valor
    setSupplierId('')           // Limpa o texto do campo fornecedor
    setSelectedProductId(null); // Limpa o id do produto selecionado na busca código/nome
    setEditingId(null);         // Limpa o ID, voltando o formulário para modo de criação
  }, []);

  // Função para limpar explicitamente todos os filtros
  const handleClearFilters = useCallback(() => {
    setSearchText('');          // Reseta a busca por texto do nome do produto
    setSelectedSupplier('');    // Reseta a seleção do grupo no filtro
  }, []);

  // Processador de intenções da interface (MVI)  
  const dispatch = useCallback(async (intent: BuyHistIntent) => {
    // Ativa o estado de carregamento e reseta mensagens de erro anteriores
    setState(prev => ({ ...prev, loading: true, error: null }));
try {
      switch (intent.type) {                              // Avalia o tipo de intenção recebida
        case 'LOAD': {                                    // Trata o carregamento inicial dos dados
          const [data, suppliers] = await Promise.all([   // Executa as buscas de historico e fornecedores em paralelo
            model.fetchAll(),                             // Busca todos os registros do histórico de compras
            model.fetchSupplier()                         // Busca todos os fornecedores cadastrados
          ]);
          setState(prev => ({                             // Atualiza o estado da aplicação
            ...prev,                                      // Preserva as propriedades existentes no estado
            items: data,                                  // Armazena a lista de compras
            suppliers: suppliers,                         // Armazena a lista de fornecedores
            loading: false                                // Finaliza o estado de carregamento
          }));
          break;
        }
        case 'UPDATE': {                                  // Trata a atualização de um registro existente
          await model.update(                             // Executa a atualização no banco de dados
            intent.payload.id_hist_buy,                   // ID do registro de histórico
            intent.payload.id_product,                    // ID do produto
            intent.payload.qt_product,                    // Quantidade do produto
            intent.payload.vl_product,                    // Valor do produto
            intent.payload.id_supplier,                   // ID do fornecedor
          );
          resetForm();                                    // Reseta os campos do formulário
          const [data, suppliers] = await Promise.all([   // Recarrega os dados atualizados em paralelo
            model.fetchAll(),                             // Rebusca o histórico de compras
            model.fetchSupplier()                         // Rebusca a lista de fornecedores
          ]);
          setState(prev => ({                             // Atualiza o estado com os novos dados
            ...prev,                                      // Preserva as propriedades existentes no estado
            items: data,                                  // Atualiza a lista de compras
            suppliers: suppliers,                         // Atualiza a lista de fornecedores
            totalRecords: data.length,                    // Atualiza o total de registros
            loading: false                                // Finaliza o estado de carregamento
          }));
          break;
        }
        case 'DELETE': {                                  // Trata a exclusão de um registro
          await model.delete(intent.payload);             // Remove o registro selecionado do banco de dados
          const data = await model.fetchAll();            // Rebusca a lista de compras atualizada
          setState(prev => ({                             // Atualiza o estado da aplicação
            ...prev,                                      // Preserva as propriedades existentes (incluindo suppliers)
            items: data,                                  // Atualiza a lista de compras
            totalRecords: data.length,                    // Atualiza o total de registros
            checkBuy: false,                              // Reseta a flag de checagem
            loading: false                                // Finaliza o estado de carregamento
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
  const handleSaveData = async (): Promise<boolean> => {                  // Função assíncrona que retorna boolean de confirmação
     if (!BuyHistModel.isValid(productId, quantity, price, supplierId)) { // Executa validações de dados obrigatórios
        Alert.alert('Aviso', 'Preencha os campos para o registro!');      // Alerta o usuário em caso de dados inválidos
      return false;                                                       // Interrompe a execução e retorna falso
    }
    const isEditing = editingId !== null;                                 // Avalia se está em modo de edição (true) ou criação (false)
    const action = BuyHistModel.buildSaveAction(                          // Monta o objeto de intenção para gravação
      productId, quantity, price, supplierId, isEditing, editingId        // Passa os valores digitados no formulário
    );
    try {
      await dispatch(action);                                             // Envia a ação MVI para processamento
      const successMessage = isEditing                                    // Define a mensagem dinâmica com base na operação
        ? 'Registro atualizado com sucesso!'                              // Exibe mensagem para atualização
        : 'Registro cadastrado com sucesso!';                             // Exibe mensagem para novo cadastro
      Alert.alert('Sucesso', successMessage);                             // Exibe caixa de diálogo confirmando o sucesso
      return true;                                                        // Retorna verdadeiro sinalizando conclusão com sucesso
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Erro ao salvar o registro.');   // Exibe mensagem caso a operação falhe
      return false;                                                       // Retorna falso sinalizando falha na gravação
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
    // 1. Validação do texto: Busca exclusivamente pelo Nome do Produto
    const matchName = item.nm_product.toLowerCase().includes(searchLower);
    const matchText = !searchLower || matchName;
    // 2. Validação do Grupo selecionado no ListBox
    const matchSupplierSelect = selectedSupplier ? item.nm_supplier === selectedSupplier : true;
    // Retorna verdadeiro se houver correspondência no nome ou no grupo
    return matchText && matchSupplierSelect;
  });

  // Filtra o registro dos fornecedores presentes no histórico compra
  const availableSupplier = useMemo(() => {                                                   // Memoiza a lista de grupos para evitar reprocessamento desnecessário
    const suppliers = state.items                                                             // Mapeia a lista de itens da compra
      .map(item => item.nm_supplier)                                                          // Extrai apenas os nomes dos grupos de cada item
      .filter((supplier): supplier is string => Boolean(supplier && supplier.trim() !== '')); // Remove valores nulos, indefinidos ou em branco
    return Array.from(new Set(suppliers));                                                    // Converte para um Set para remover os nomes duplicados
  }, [state.items]);                                                                          // Recalcula apenas quando a lista de itens for alterada

  // Função de edição para preencher campos do formulário
  const startEditing = (id: number, product: number, quantity: number, price: number, supplier?: number | null) => {
    setEditingId(id);                                                   // Preenche o ID do item sendo editado
    setProductId(String(product ?? ''));                                // Preenche o ID do produto convertido em texto
    setQuantity(String(quantity ?? '1'));                               // Preenche a quantidade convertida em texto
    setPrice(String(price ?? '0.00'));                                  // Preenche o preço convertido em texto
    setSupplierId(supplier && supplier !== 0 ? String(supplier) : '');  // Preenche o ID do fornecedor convertido em texto
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

  return {
    state: {
      ...state,                       // Copia o estado original
      items: filteredItems,           // Substitui a lista de itens pela lista filtrada
    },
    form: {
      productId,                      // ID do produto selecionado ou digitado
      setProductId,                   // Função para alterar o ID do produto
      quantity,                       // Quantidade digitada do produto
      setQuantity,                    // Função para alterar a quantidade
      price,                          // Preço unitário digitado
      setPrice,                       // Função para alterar o preço
      supplierId,                     // ID do fornecedor selecionado
      setSupplierId,                  // Função para alterar o fornecedor
      selectedSupplier,               // Nome do fornecedor atualmente selecionado no filtro
      setSelectedSupplier,            // Função para atualizar o fornecedor selecionado
      availableSupplier,              // Lista com os nomes dos fornecedor disponíveis para seleção
      searchText,                     // Texto de busca da lista principal
      setSearchText,                  // Função para alterar o texto de busca principal
      modalSearchText,                // Texto de busca do modal
      setModalSearchText,             // Função para alterar o texto de busca do modal
      handleClearFilters,             // Função para resetar todos os parâmetros de filtragem
      selectedProductId,              // Produto selecionado no modal
      setSelectedProductId,           // Função para alterar o produto selecionado
      isEditing: editingId !== null,  // Booleano indicando se o formulário está em modo de edição
      editingId,                      // ID do item que está sendo editado
      resetForm,                      // Função para limpar e resetar os campos do formulário
      startEditing,                   // Função para iniciar a edição de um item da lista
    },
    handleSaveData,                   // Função para salvar ou atualizar o registro
    handleDeleteData,                 // Função para remover um item da lista
    totalPurchaseItem,                // Quantidade total acumulada dos itens da compra
    totalPurchaseValue,               // Valor total financeiro acumulado da compra
    dispatch,                         // Disparador de ações para o reducer
  };
}