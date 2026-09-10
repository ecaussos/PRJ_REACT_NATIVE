// src/features/product/product.hook.ts
import { useCallback, useEffect, useState } from 'react';
import { ProductModel, ProductModelInstance } from './product.model';
import { ProductIntent, ProductState } from './product.types';

export function useProductViewModel(model: ProductModel = ProductModelInstance) {
  // Estado centralizado gerenciado pelo padrão MVI
  const [state, setState] = useState<ProductState>({
    products: [],
    groups: [],
    loading: false,
    error: null,
  });

  // Estados locais de UI (formulários, modais e filtros)
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [groupId, setGroupId] = useState('');
  const [searchText, setSearchText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Reseta o formulário
  const resetForm = useCallback(() => {
    setName('');
    setBarcode('');
    setGroupId('');
    setEditingId(null);
  }, []);

  // Dispatch: Processador de intenções da interface (Intents) - MVI
  const dispatch = useCallback(async (intent: ProductIntent) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      switch (intent.type) {
        case 'LOAD': {
          // Busca produtos e grupos em paralelo para otimizar tempo de execução
          const [productsData, groupsData] = await Promise.all([
            model.fetchAll(),
            model.getGroups(),
          ]);
          // Atualiza os estados
          setState(prev => ({ 
            ...prev, 
            products: productsData, 
            groups: groupsData, 
            loading: false 
          }));
          break;
        }

        case 'CREATE': {
          // Executa a criação do registro
          await model.create(intent.payload);
          // Limpa formulário
          resetForm();
          // Atualiza a lista e dados em memória
          const [productsData, groupsData] = await Promise.all([
            model.fetchAll(),
            model.getGroups(),
          ]);
          // Atualiza os estados 
          setState(prev => ({
            ...prev,
            products: productsData,
            groups: groupsData,
            loading: false,
          }));
          break;
        }

        case 'UPDATE': {
          // Executa a atualização do registro
          await model.update(intent.payload.id_product, {
            nm_product: intent.payload.nm_product,
            id_group: intent.payload.id_group,
            cd_product_gtin: intent.payload.cd_product_gtin,
          });
          // Limpa formulário
          resetForm();
          // Atualiza a lista e dados em memória
          const [productsData, groupsData] = await Promise.all([
            model.fetchAll(),
            model.getGroups(),
          ]);
          // Atualiza os estados
          setState(prev => ({
            ...prev,
            products: productsData,
            groups: groupsData,
            loading: false,
          }));
          break;
        }

        case 'DELETE': {
          // Executa a exclusão do registro
          await model.delete(intent.payload);
          // Atualiza a lista e dados em memória
          const [productsData, groupsData] = await Promise.all([
            model.fetchAll(),
            model.getGroups(),
          ]);
          // Atualiza os estados
          setState(prev => ({
            ...prev,
            products: productsData,
            groups: groupsData,
            loading: false,
          }));
          break;
        }
      }
    } catch (err) {
      // Captura e formata erros lançados pela Model ou pelo Repositório
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro inesperado.';
      // Atualiza os estados
      setState(prev => ({ 
        ...prev,
        error: errorMessage, 
        loading: false, 
      }));
      // Lança a exceção para o screen
      throw err;
    }
  }, [model, resetForm]);

  // Ação de salvamento encapsulada no Hook (orquestra Model + Dispatch)
  const saveProduct = async (): Promise<string> => {
    // 1. Validação delegada ao Model
    if (!ProductModel.isValid(name, barcode, groupId)) {
      throw new Error('Preencha o nome e selecione um grupo!');
    }

    const isEditing = editingId !== null;
    // 2. Construção do payload/action delegada ao Model
    const action = ProductModel.buildSaveAction(name, groupId, barcode, isEditing, editingId);

    // 3. Despacha a intenção
    await dispatch(action);

    // 4. Retorna a mensagem correspondente
    return isEditing ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!';
  };

  // Executa o carregamento inicial dos dados assim que o hook é montado na tela
  useEffect(() => {
    dispatch({ type: 'LOAD' }).catch(() => {});
  }, [dispatch]);

  // Filtra a lista em tempo real com base no texto pesquisado
  const filteredProducts = state.products.filter(item => 
    item.nm_product.toLowerCase().includes(searchText.toLowerCase()) ||
    (item.cd_product_gtin && item.cd_product_gtin.includes(searchText))
  );

  // Preenche os campos do formulário para o modo de edição
  const startEditing = (
    id: number, 
    currentName: string, 
    currentBarcode: string, 
    currentGroupId: string
  ) => {
    setEditingId(id);
    setName(currentName);
    setBarcode(currentBarcode);
    setGroupId(currentGroupId);
  };

  // Retorna o estado atual e a função de despacho para consumo direto na tela (View)
  return {
    state: {
      ...state,
      products: filteredProducts,
    },
    form: {
      name, setName,
      barcode, setBarcode,
      groupId, setGroupId,
      searchText, setSearchText,
      isEditing: editingId !== null,
      editingId,
      resetForm,
      startEditing,
    },
    saveProduct,
    dispatch,
  };
}