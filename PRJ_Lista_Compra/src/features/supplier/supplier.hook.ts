// src/features/supplier/supplier.hook.ts
import { useCallback, useEffect, useState } from 'react';
import { SupplierModel, SupplierModelInstance } from './supplier.model';
import { SupplierIntent, SupplierState } from './supplier.types';

export function useSupplierViewModel(model: SupplierModel = SupplierModelInstance) {
  // Estado centralizado gerenciando, carregamento e erros
  const [state, setState] = useState<SupplierState>({
    suppliers: [],
    loading: false,
    error: null,
  });

  // Estados locais da UI encapsulados no ViewModel
  const [name, setName] = useState('');
  const [searchText, setSearchText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Reseta o formulário
  const resetForm = useCallback(() => {
    setName('');
    setEditingId(null);
  }, []);

  // Processador de intenções da interface (Intents) - MVI
  const dispatch = useCallback(async (intent: SupplierIntent) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      switch (intent.type) {
        case 'LOAD': {
          // Busca fornecedores
          const suppliersData = await model.fetchAll();
          // Atualiza os estados
          setState(prev => ({ 
            ...prev, 
            suppliers: suppliersData, 
            loading: false 
          }));
          break;
        }

        case 'CREATE':
          // Executa a criação do registro
          await model.create(intent.payload.nm_supplier);
          // Limpa formulário
          resetForm();
          // Após criar, recarrega os dados
          await dispatch({ type: 'LOAD' });
          break;

        case 'UPDATE':
          // Executa a atualização do registro
          await model.update(intent.payload.id_supplier, {
            nm_supplier: intent.payload.nm_supplier
          });
          // Limpa formulário
          resetForm();
          // Após atualizar, recarrega os dados
          await dispatch({ type: 'LOAD' });
          break;

        case 'DELETE':
          // Executa a exclusão do registro
          await model.delete(intent.payload);
          // Após deletar, recarrega os dados
          await dispatch({ type: 'LOAD' });
          break;
      }
    } catch (err) {
      // Captura e formata erros lançados pela Model ou pelo Repositório
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro na operação.';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
      //Lança a exceção para o screen
      throw err;
    }
  // Limpa formulário
  }, [model, resetForm]);

  // Ação de salvamento encapsulada no Hook (orquestra Model + Dispatch)
  const saveSupplier = async (): Promise<string> => {
    // 1. Validação delegada ao Model
    if (!SupplierModel.isValid(name)) {
      throw new Error('Preencha o nome do fornecedor!');
    }

    const isEditing = editingId !== null;
    // 2. Construção do payload/action delegada ao Model
    const action = SupplierModel.buildSaveAction(name, isEditing, editingId);

    // 3. Despacha a intenção
    await dispatch(action);

    // 4. Retorna a mensagem correspondente
    return isEditing ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor cadastrado com sucesso!';
  };

  // Executa o carregamento inicial dos dados assim que o hook é montado na tela
  useEffect(() => {
    dispatch({ type: 'LOAD' }).catch(() => {});
  }, [dispatch]);

  // Filtra a lista em tempo real com base no texto pesquisado
  const filteredSuppliers = state.suppliers.filter(supplier =>
    supplier.nm_supplier.toLowerCase().includes(searchText.toLowerCase())
  );
 
  // Preenche os campos do formulário para o modo de edição
  const startEditing = (
    id: number,
    currentName: string
  ) => {
    setEditingId(id);
    setName(currentName);
  };

  // Retorna o estado atual e a função de despacho para consumo direto na tela (View)
  return { 
    state: {
      ...state,
      suppliers: filteredSuppliers,
    },
    form: {
      name, setName,
      searchText, setSearchText,
      isEditing: editingId !== null,
      editingId,
      resetForm,
      startEditing,
    },
    saveSupplier,
    dispatch 
  };
}