// src/features/product/product.hook.ts
import { useCallback, useEffect, useState } from 'react';
import { ProductModel } from './product.model';
import { ProductIntent, ProductState } from './product.types';

export function useProductViewModel() {
  // Estado centralizado gerenciando, carregamento e erros
  const [state, setState] = useState<ProductState>({
    products: [],
    groups: [],
    currentProduct: null,
    loading: false,
    error: null,
  });

  // Função auxiliar para atualizar partes específicas do estado de forma segura
  const updateState = (updates: Partial<ProductState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Função centralizadora de intenções (MVI - Model-View-Intent), processa as ações enviadas pela tela
  const dispatch = useCallback(async (intent: ProductIntent) => {
    try {
      updateState({ loading: true, error: null });

      switch (intent.type) {
        case 'LOAD': {
          // Busca os registros
          const [productsData, groupsData] = await Promise.all([
            ProductModel.fetchAll(),
            ProductModel.getGroups(),
          ]);
          // Atualiza os estados
          updateState({ 
            products: productsData, 
            groups: groupsData, 
            loading: false 
          });
          break;
        }

        case 'CREATE':
          // Executa a criação do registro
          await ProductModel.create(intent.payload);
          // Após criar, recarrega os dados
          await dispatch({ type: 'LOAD' });
          break;

        case 'UPDATE':
          // Executa a atualição do registro
          await ProductModel.update(intent.payload.id_product, {
            nm_product: intent.payload.nm_product,
            id_group: intent.payload.id_group,
            cd_product_gtin: intent.payload.cd_product_gtin,
          });
          // Após atualizar, recarrega os dados
          await dispatch({ type: 'LOAD' });
          break;

        case 'DELETE':
          // Executa a exclusão do registro
          await ProductModel.delete(intent.payload);
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
    dispatch,
  };
}