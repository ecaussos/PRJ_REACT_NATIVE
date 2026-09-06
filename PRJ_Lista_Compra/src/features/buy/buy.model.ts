import { CreateBuyHistDTO } from '../../data/entities/buyHistEntity';
import { BuyHistRepository } from '../../data/repositories/buyHistRepository';

const buyHistRepository = new BuyHistRepository();

export const BuyModel = {
  /**
   * Insere o item comprado na tabela de histórico 'hist_buy'
   */
  async insertHistBuy(data: CreateBuyHistDTO): Promise<void> {
    try {
      console.log('🔄 Inserindo no histórico via Repositório:', data);
      await buyHistRepository.create(data);
      console.log('✅ Registro salvo com sucesso na hist_buy!');
    } catch (error) {
      console.error('❌ Erro de inserção na hist_buy:', error);
      throw error;
    }
  },
};