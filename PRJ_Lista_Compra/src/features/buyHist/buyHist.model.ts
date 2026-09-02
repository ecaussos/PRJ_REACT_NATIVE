// src/features/buyHist/buyHist.model.ts
import { BuyHistWithDetailsEntity } from '../../data/entities/buyHistEntity';
import { BuyHistRepository } from '../../data/repositories/buyHistRepository';

const repository = new BuyHistRepository();

export const BuyHistModel = {
  async fetchHistory(): Promise<BuyHistWithDetailsEntity[]> {
    return await repository.findAllWithDetails();
  }
};