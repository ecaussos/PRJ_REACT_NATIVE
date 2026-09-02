// src/features/supplier/supplier.hook.ts
import { useCallback, useEffect, useState } from 'react';
import { SupplierModel } from './supplier.model';
import { SupplierIntent, SupplierState } from './supplier.types';

export function useSupplierViewModel() {
  // Estado centralizado gerenciando, carregamento e erros
  const [state, setState] = useState<SupplierState>({
    suppliers: [],
    loading: false,
    error: null,
  });

  // Função auxiliar para atualizar partes específicas do estado de forma segura
  const updateState = (updates: Partial<SupplierState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Função centralizadora de intenções (MVI - Model-View-Intent), processa as ações enviadas pela tela
  const dispatch = useCallback(async (intent: SupplierIntent) => {
    try {
      updateState({ loading: true, error: null });

      switch (intent.type) {
        case 'LOAD': {
          // Busca os registros
          const suppliersData = await SupplierModel.fetchAll();
          // Atualiza os estados
          updateState({ 
            suppliers: suppliersData, 
            loading: false 
          });
          break;
        }

        case 'CREATE':
          // Executa a criação do registro
          await SupplierModel.create(intent.payload.nm_supplier);
          // Após criar, recarrega os dados
          await dispatch({ type: 'LOAD' });
          break;

        case 'UPDATE':
          // Executa a atualição do registro
          await SupplierModel.update(intent.payload.id_supplier, intent.payload.nm_supplier);
          // Após atualizar, recarrega os dados
          await dispatch({ type: 'LOAD' });
          break;

        case 'DELETE':
          // Executa a exclusão do registro
          await SupplierModel.delete(intent.payload);
          // Após deletar, recarrega os dados
          await dispatch({ type: 'LOAD' });
          break;
      }
    } catch (err: any) {
      updateState({ 
        error: err.message || 'Ocorreu um erro na operação.', 
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