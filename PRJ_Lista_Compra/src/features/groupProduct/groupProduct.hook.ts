// src/features/groupProduct/groupProduct.hook.ts
import { useCallback, useEffect, useState } from 'react';
import { GroupProductModel } from './groupProduct.model';
import { GroupProductIntent, GroupProductState } from './groupProduct.types';

export function useGroupProductViewModel() {
  // Estado centralizado gerenciando, carregamento e erros
  const [state, setState] = useState<GroupProductState>({
    groups: [],
    loading: false,
    error: null,
  });

  // Função auxiliar para atualizar partes específicas do estado de forma segura
  const updateState = (updates: Partial<GroupProductState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Função centralizadora de intenções (MVI - Model-View-Intent), processa as ações enviadas pela tela
  const dispatch = useCallback(async (intent: GroupProductIntent) => {
    try {
      updateState({ loading: true, error: null });

      switch (intent.type) {
        case 'LOAD': {
          // Busca os registros
          const groupsData = await GroupProductModel.fetchAll();
          // Atualiza os estados
          updateState({ 
            groups: groupsData, 
            loading: false 
          });
          break;
        }

        case 'CREATE':
          // Executa a criação do registro
          await GroupProductModel.create(intent.payload.nm_group);
          // Após criar,  recarrega os dados
          await dispatch({ type: 'LOAD' });
          break;

        case 'UPDATE':
          // Executa a atualição do registro
          await GroupProductModel.update(intent.payload.id_group, intent.payload.nm_group);
          // Após atualizar, recarrega os dados
          await dispatch({ type: 'LOAD' });
          break;

        case 'DELETE':
          // Executa a exclusão do registro
          await GroupProductModel.delete(intent.payload);
          // Após deletar, recarrega os dados
          await dispatch({ type: 'LOAD' });
          break;
      }
    } catch (err: any) {
      updateState({ 
        error: err.message || 'Ocorreu um erro ao processar grupo de produtos.', 
        loading: false 
      });
    }
  }, []);

  // Executa o carregamento inicial dos dados assim que o hook é montado na tela
  useEffect(() => {
    dispatch({ type: 'LOAD' });
  }, [dispatch]);

  // Retorna o estado atual e a função de despacho para consumo direto na tela (View)
  return { 
    state, 
    dispatch 
  };
}