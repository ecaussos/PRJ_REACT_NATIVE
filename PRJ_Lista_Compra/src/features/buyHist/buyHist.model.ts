import { getDBConnection } from '../../core/database/sqliteclient';
import { BuyHistWithDetailsEntity } from '../../data/entities/buyHistEntity';
import { BuyHistRepository } from '../../data/repositories/buyHistRepository';

const repository = new BuyHistRepository();

export const BuyHistModel = {
  async fetchHistory(): Promise<BuyHistWithDetailsEntity[]> {
    // 1. Diagnóstico: Verifica a contagem e os registros brutos na tabela hist_buy (sem JOIN)
    try {
      const db = await getDBConnection();
      
      // Consulta a quantidade total de linhas
      const countResult = await db.getFirstAsync<{ total: number }>(
        'SELECT COUNT(*) as total FROM hist_buy;'
      );
      const totalRows = countResult?.total ?? 0;

      // Consulta os registros brutos
      const rawRows = await db.getAllAsync('SELECT * FROM hist_buy;');

      console.log(`🔍 [Diagnóstico] Total de linhas na hist_buy: ${totalRows}`);
      console.log('🔍 [Diagnóstico] Registros brutos na hist_buy:', rawRows);
    } catch (err) {
      console.error('❌ [Diagnóstico] Erro ao ler tabela hist_buy:', err);
    }

    // 2. Busca com os detalhes (JOINs)
    const history = await repository.findAllWithDetails();
    console.log('📦 [Diagnóstico] Histórico retornado com JOINs:', history);

    return history;
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