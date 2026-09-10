// src/features/buyList/buyList.hook.ts
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { ProductEntity } from '../../data/entities/product.entity';
import { BuyListModel, BuyListModelInstance, EditingQuantityItem, ProductSearchResult } from './buyList.model';
import { BuyListFormState, BuyListIntent, BuyListState } from './buyList.types';

export function useBuyListViewModel(model: BuyListModel = BuyListModelInstance) {
  // Estado centralizado gerenciado pelo padrão MVI
  const [state, setState] = useState<BuyListState>({
    items: [],
    loading: false,
    error: null,
  });

  // Estados locais de UI (formulários, modais e filtros)
  // Camera
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Busca por Nome 
  const [searchText, setSearchText] = useState('');
  const [showNameSearchModal, setShowNameSearchModal] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const [foundProducts, setFoundProducts] = useState<ProductSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Edição de Quantidade
  const [editingQuantityItem, setEditingQuantityItem] = useState<EditingQuantityItem | null>(null);
  const [newQuantityText, setNewQuantityText] = useState('');

  // Reseta o formulário e fecha modais abertos
  const resetForm = useCallback(() => {
    setShowCameraModal(false);
    setShowNameSearchModal(false);
    setProductQuery('');
    setFoundProducts([]);
    setIsSearching(false);
    setEditingQuantityItem(null);
    setNewQuantityText('');
  }, []);

  // Auxiliar para atualização imutável do estado do ViewModel
  const updateState = (updates: Partial<BuyListState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Dispatch: Processador de intenções da interface (Intents) - MVI
  const dispatch = useCallback(
    async (intent: BuyListIntent): Promise<ProductEntity | void> => {
      try {
        updateState({ loading: true, error: null });

        switch (intent.type) {
          case 'LOAD': {
            // Busca registros na lista de compra
            const itemsData = await model.fetchItems();
            // Atualiza os estados
            setState(prev => ({ ...prev, items: itemsData, loading: false }));
            break;
          }

          case 'CREATE': {
            // Executa a criação do registro
            await model.create(intent.payload);
            // Limpa formulário
            resetForm();
            // Atualiza a lista e dados em memória
            const itemsData = await model.fetchItems();
            // Atualiza os estados
            setState(prev => ({ ...prev, items: itemsData, loading: false }));
            break;
          }

          case 'CREATE_BY_BARCODE': {
            // Executa a criação do registro utilizando código de barras
            const product = await model.createByBarcode(intent.payload.barcode);
            // Limpa formulário
            resetForm();
            // Atualiza a lista e dados em memória
            const itemsData = await model.fetchItems();
            // Atualiza os estados
            setState(prev => ({ ...prev, items: itemsData, loading: false }));
            // Retorna o produto cadastrado
            return product;
          }

          case 'UPDATE_QUANTITY': {
            // Executa a atualização do registro - quantidade
            await model.updateQuantity(intent.payload);
            // Limpa formulário
            resetForm();
            // Atualiza a lista e dados em memória            
            const itemsData = await model.fetchItems();
            // Atualiza os estados
            setState(prev => ({ ...prev, items: itemsData, loading: false }));
            break;
          }

          case 'DELETE': {
            // Executa a exclusão do registro
            await model.delete(intent.payload);
            // Atualiza a lista e dados em memória
            const itemsData = await model.fetchItems();
            // Atualiza os estados
            setState(prev => ({ ...prev, items: itemsData, loading: false }));
            break;
          }

          case 'CLEAR': {
            // Executa a exclusão de todos os registros
            await model.clear();
            // Atualiza os estados
            updateState({ items: [], loading: false });
            break;
          }
        }
      } catch (err: any) {
        // Captura e formata erros lançados pela Model ou pelo Repositório
        const errorMessage = err?.message || 'Erro ao processar intenção na lista de compras.';
        // Atualiza os estados
        updateState({ error: errorMessage, loading: false });
        // Lança a exceção para o caller
        throw err;
      }
    },
    // Conclui se houver alteração de status
    [model, resetForm]
  );

  // ORQUESTRAÇÃO DA SCREEN E INTERAÇÃO COM A MODEL
  // Busca de produtos por nome no modal
  const searchProductsByName = useCallback(
    async (query: string) => {
      //Pega o texto digitado
      setProductQuery(query);
      // Revemos os espaço ini/fim do texto digitado
      const cleanQuery = query.trim();
      // Validar se o texto está vazio
      if (cleanQuery.length === 0) {
        // Verdadeiro: limpa a lista de resultados caso o campo esteja vazio
        setFoundProducts([]);
        return;
      }
      try {
        // Ativa: Indicador visual de carregamenteo
        setIsSearching(true);
        // Realizar a busca do produto 
        const results = await model.searchProductsByName(cleanQuery);
        // Amazenar e retorno os produtos encontrados
        setFoundProducts(results);
      } catch (error) {
        // Gera mensagem informativa
        console.error('Erro ao buscar produtos por nome:', error);
        // Limpa a lista de resultados caso o campo esteja vazio
        setFoundProducts([]);
      } finally {
        // Desativa: Indicador visual de carregamenteo
        setIsSearching(false);
      }
    },
    // Conclui se houver alteração de status
    [model]
  );

  // Seleção de produto na busca por nome
  const handleSelectProductToBuy = useCallback(
    // Recebe o produto selecionado na busca por nome
    async (item: ProductSearchResult) => {
      try {
        // envia a intenção de realizar a adição de produto selecionado
        await dispatch({
          // Processa a adição do registro
          type: 'CREATE',
          // Envia o dados do produto selecionado
          payload: { id_product: item.id_product, qt_product: 1 },
        });
        // Gerar mensagem informativa
        Alert.alert('Sucesso', `${item.nm_product} adicionado à lista!`);
      } catch (error: any) {
        // Limpa o fomulário
        resetForm();
        // Gerar mensagem informativa
        Alert.alert('Erro', error?.message || 'Não foi possível adicionar o produto selecionado.');
      }
    },
    // Conclui se houver alteração de status
    [dispatch, resetForm]
  );

  // Busca produto utilizando Leitura de código de barras - Câmera
  const handleScanSuccess = useCallback(
    async (barcode: string) => {
      try {
        // envia a intenção de realizar a adição de produto por código de barra
        const product = await dispatch({
          // Processa o cadastro via código de barra
          type: 'CREATE_BY_BARCODE',
          // Envia o código de barra capturado
          payload: { barcode },
        });
        // Verificar se retorno um produto
        if (product) {
          // Verdadeiro: Gera mensagem informativa
          Alert.alert('Sucesso', `${product.nm_product} adicionado à lista!`);
        }
      } catch (error: any) {
        // Limpar formulário
        resetForm();
        // Gerar mensagem informativa
        Alert.alert('Aviso', error?.message || 'Não foi possível adicionar o produto.');
      }
    },
    // Conclui se houver alteração de status
    [dispatch, resetForm]
  );

  // Altera a quantidade de produto no lista de compras
  const handleSaveQuantity = useCallback(async () => {
    // Verifica não tem item selecionado - Verdadeiro para a operação
    if (!editingQuantityItem) return;
    // Chama o model para validar se a quantidade dígitada não é valida
    if (!BuyListModel.isValidQuantity(newQuantityText)) {
      // Verdadeiro: Gerar mensagem informativa
      Alert.alert('Atenção', 'Informe uma quantidade válida e maior que zero.');
      return;
    }
    try {
      // Chama o model para atualizar a quantidade
      const action = BuyListModel.buildSaveQuantityAction(
        // Passa o id do item que está sendo alterado
        editingQuantityItem.id_list_buy,
        // Passa a nova quantidade informada
        newQuantityText
      );
      // Envia a solicitação
      await dispatch(action);
      // Gerar mensagem informativa
      Alert.alert('Sucesso', 'Quantidade atualizada com sucesso!');
    } catch (error: any) {
      // Limpa Formulário
      resetForm();
      // Gerar mensagem informativa
      Alert.alert('Aviso', error?.message || 'Erro ao salvar a quantidade.');
    }
    // Conclui se houver alteração de status
  }, [editingQuantityItem, newQuantityText, dispatch, resetForm]);

  // Contrato do status do Formulário
  const form: BuyListFormState = {
    searchText,
    setSearchText,
    editingQuantityItem,
    setEditingQuantityItem,
    newQuantityText,
    setNewQuantityText,
    showNameSearchModal,
    setShowNameSearchModal,
    productQuery,
    setProductQuery,
    foundProducts,
    setFoundProducts,
    isSearching,
    setIsSearching,
    showCameraModal,
    setShowCameraModal,
  };

  // Executa o carregamento inicial dos dados assim que o hook é montado na tela
  useEffect(() => {
    dispatch({ type: 'LOAD' }).catch(() => {});
  }, [dispatch]);

  // Filtra a lista em tempo real com base no texto pesquisado
  const filteredItems = state.items.filter(item => {
    const searchLower = searchText.toLowerCase();
    const matchName = item.nm_product.toLowerCase().includes(searchLower);
    const matchGroup = item.nm_group ? item.nm_group.toLowerCase().includes(searchLower) : false;
    return matchName || matchGroup;
  });
  
  // Preenche os campos do formulário para o modo de edição de quantidade
  const startEditing = useCallback((item: {
    id_list_buy: number;
    id_product: number;
    nm_product: string;
    qt_product: number;
  }) => {
    setEditingQuantityItem({
      id_list_buy: item.id_list_buy,
      id_product: item.id_product,
      nm_product: item.nm_product,
      qt_product: item.qt_product,
    });
    setNewQuantityText(String(item.qt_product));
  }, []);

  // Retorna o estado atual e a função de despacho para consumo direto na tela (View)
  return {
    state,
    form,
    dispatch,
    filteredItems,
    searchProductsByName,
    handleScanSuccess,
    handleSelectProductToBuy,
    handleSaveQuantity,
    startEditing,
    resetForm,
  };
}