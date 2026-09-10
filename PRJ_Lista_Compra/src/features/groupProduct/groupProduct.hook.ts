// src/features/groupProduct/groupProduct.hook.ts
import { useCallback, useEffect, useState } from 'react';
import { GroupProductModel, groupProductModelInstance } from './groupProduct.model';
import { GroupProductIntent, GroupProductState } from './groupProduct.types';

export function useGroupProductViewModel(
  model: GroupProductModel = groupProductModelInstance
) {
  // Estado centralizado gerenciando, carregamento e erros
  const [state, setState] = useState<GroupProductState>({
    groups: [],
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

  // Função centralizadora de intenções (MVI - Model-View-Intent), processa as ações enviadas pela tela
  const dispatch = useCallback(async (intent: GroupProductIntent) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      switch (intent.type) {
        case 'LOAD': {
          // Busca os registros
          const groupsData = await model.fetchAll();
          // Atualiza os estados
          setState(prev => ({ 
            ...prev, 
            groups: groupsData, 
            loading: false 
          }));
          break;
        }

        case 'CREATE':
          // Executa a criação do registro
          await model.create(intent.payload.nm_group);
          // Limpa formulário
          resetForm();
          // Após criar, recarrega os dados
          {
            const groupsData = await model.fetchAll();
            setState(prev => ({ ...prev, groups: groupsData, loading: false }));
          }
          break;

        case 'UPDATE':
          // Executa a atualização do registro
          await model.update(intent.payload.id_group, {
            nm_group: intent.payload.nm_group
          });
          // Limpa formulário
          resetForm();
          // Após atualizar, recarrega os dados
          {
            const groupsData = await model.fetchAll();
            setState(prev => ({ ...prev, groups: groupsData, loading: false }));
          }
          break;

        case 'DELETE':
          // Executa a exclusão do registro
          await model.delete(intent.payload);
          // Após deletar, recarrega os dados
          {
            const groupsData = await model.fetchAll();
            setState(prev => ({ ...prev, groups: groupsData, loading: false }));
          }
          break;
      }
    } catch (err) {
      // Captura e formata erros lançados pela Model ou pelo Repositório
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro ao processar grupo de produtos.';
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

  // Função para orquestrar a validação, montagem de intenção e despacho ao salvar
  const saveGroupProduct = useCallback(async (): Promise<string> => {
    const isEditing = editingId !== null;

    // 1. Validação delegada à Model
    if (!GroupProductModel.isValid(name)) {
      throw new Error('Preencha o nome do grupo!');
    }

    // 2. Construção da intenção (Action) delegada à Model
    const action = GroupProductModel.buildSaveAction(
      name,
      isEditing,
      editingId
    );

    // 3. Despacha a intenção
    await dispatch(action);

    // 4. Retorna a mensagem de sucesso correspondente
    return isEditing 
      ? 'Grupo atualizado com sucesso!' 
      : 'Grupo cadastrado com sucesso!';
  }, [name, editingId, dispatch]);

  // Executa o carregamento inicial dos dados assim que o hook é montado na tela
  useEffect(() => {
    dispatch({ type: 'LOAD' });
  }, [dispatch]);

  // Filtra a lista em tempo real com base no texto pesquisado
  const filteredGroups = state.groups.filter(group =>
    group.nm_group.toLowerCase().includes(searchText.toLowerCase())
  );
  // Preenche os campos do formulário para o modo de edição
  const startEditing = (
    id: number,
    currentName: string
  ) => {
    setEditingId(id);
    setName(currentName);
  };

  // Retorna o estado atual e as funções para consumo direto na tela (View)
  return { 
    state: {
      ...state,
      groups: filteredGroups,
    },
    form: {
      name,
      setName,
      searchText,
      setSearchText,
      isEditing: editingId !== null,
      editingId,
      resetForm,
      startEditing,
    },
    saveGroupProduct,
    dispatch 
  };
}