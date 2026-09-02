// src/features/buyHist/buyHist.hook.ts
import { useCallback, useEffect, useState } from 'react';
import { BuyHistModel } from './buyHist.model';
import { BuyHistIntent, BuyHistState } from './buyHist.types';

export function useBuyHistViewModel() {
  const [state, setState] = useState<BuyHistState>({
    history: [],
    loading: false,
    error: null,
  });

  const dispatch = useCallback(async (intent: BuyHistIntent) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      switch (intent.type) {
        case 'LOAD_HISTORY':
          const history = await BuyHistModel.fetchHistory();
          setState({ history, loading: false, error: null });
          break;
      }
    } catch (e: any) {
      setState((prev) => ({ ...prev, loading: false, error: e.message || 'Erro ao carregar histórico' }));
    }
  }, []);

  useEffect(() => {
    dispatch({ type: 'LOAD_HISTORY' });
  }, [dispatch]);

  return { state, dispatch };
}