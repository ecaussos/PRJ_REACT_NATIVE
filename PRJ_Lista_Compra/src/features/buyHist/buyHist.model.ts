// src/features/buyHist/buyHist.model.ts
import { getDBConnection } from '../../core/database/sqliteclient';
import { BuyHistEntity, BuyHistWithDetailsEntity } from '../../data/entities/buyHistEntity';
import { BuyHistRepository } from '../../data/repositories/buyHistRepository';

const repository = new BuyHistRepository();

export const BuyHistModel = {
  // Realiza o diagnóstico e busca o histórico detalhado
  async fetchHistory(): Promise<BuyHistWithDetailsEntity[]> {
    try {
      const db = await getDBConnection();
      
      const countResult = await db.getFirstAsync<{ total: number }>(
        'SELECT COUNT(*) as total FROM hist_buy;'
      );
      const totalRows = countResult?.total ?? 0;

      const rawRows = await db.getAllAsync('SELECT * FROM hist_buy;');

      console.log(`🔍 [Diagnóstico] Total de linhas na hist_buy: ${totalRows}`);
      console.log('🔍 [Diagnóstico] Registros brutos na hist_buy:', rawRows);
    } catch (err) {
      console.error('❌ [Diagnóstico] Erro ao ler tabela hist_buy:', err);
    }

    const history = await repository.findAllWithDetails();
    console.log('📦 [Diagnóstico] Histórico retornado com JOINs:', history);

    return history;
  },

  // Insere um novo registro de compra no histórico
  async create(data: Omit<BuyHistEntity, 'id_hist_buy'>): Promise<void> {
    await repository.create(data);
  },

  // Método utilitário para checar se a tabela possui registros
  async hasHistoryRecords(): Promise<boolean> {
    try {
      const db = await getDBConnection();
      const result = await db.getFirstAsync<{ total: number }>(
        'SELECT COUNT(*) as total FROM hist_buy;'
      );
      return (result?.total ?? 0) > 0;
    } catch {
      return false;
    }
  }
};