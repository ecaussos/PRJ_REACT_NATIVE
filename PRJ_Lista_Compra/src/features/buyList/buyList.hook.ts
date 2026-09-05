// src/features/buyList/buyList.hook.ts
import { useCallback, useEffect, useState } from 'react';
import { BuyListModel } from './buyList.model';
import { BuyListIntent, BuyListState } from './buyList.types';

// Função de gerenciamento dos componente na tela
export function useBuyListViewModel() {
  // Estado centralizado gerenciando, carregamento e erros
  const [state, setState] = useState<BuyListState>({
    items: [],
    loading: false,
    error: null,
  });

  // Função auxiliar para atualizar partes específicas do estado de forma segura
  const updateState = (updates: Partial<BuyListState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Função centralizadora de intenções (MVI - Model-View-Intent), processa as ações enviadas pela tela
  const dispatch = useCallback(async (intent: BuyListIntent) => {
    try {
      updateState({ loading: true, error: null });

      switch (intent.type) {
        case 'LOAD': {
          // Busca os registros
          const itemsData = await BuyListModel.fetchItems();
          // Atualiza os estados
          updateState({ 
            items: itemsData, 
            loading: false 
          });
          break;
        }

        case 'CREATE':
          // Executa a criação do registro
          await BuyListModel.create(intent.payload.id_product, intent.payload.qt_product);
          // Após criar, recarrega os dados
          await dispatch({ type: 'LOAD' });
          break;

        case 'UPDATE_QUANTITY':
          // Executa a atualição do registro - QUANTIDADE
          await BuyListModel.updateQuantity(intent.payload.id_list_buy, intent.payload.qt_product);
          // Após atualizar, recarrega os dados
          await dispatch({ type: 'LOAD' });
          break;

        case 'DELETE':
          // Executa a exclusão do registro
          await BuyListModel.delete(intent.payload.id_list_buy);
          // Após deletar, recarrega os dados
          await dispatch({ type: 'LOAD' });
          break;

        case 'CLEAR':
          // Limpa todos os itens da lista de compras de uma só vez
          await BuyListModel.clear();
          updateState({ 
            items: [], 
            loading: false 
          });
          break;
      }
    } catch (err: any) {
      updateState({ 
        error: err.message || 'Erro ao processar intenção na lista de compras.', 
        loading: false 
      });
    }
  }, []);

  // Executa o carregamento inicial dos dados assim que o hook é montado na tela
  useEffect(() => {
    dispatch({ type: 'LOAD' });
  }, [dispatch]);

  // Retorna o estado atual e a função de despacho para consumo direto na tela (View)
  return { state, dispatch };
}