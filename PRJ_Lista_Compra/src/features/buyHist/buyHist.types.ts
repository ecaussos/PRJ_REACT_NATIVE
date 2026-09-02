// src/features/buyHist/buyHist.types.ts
import { BuyHistWithDetailsEntity } from '../../data/entities/buyHistEntity';

export interface BuyHistState {
  history: BuyHistWithDetailsEntity[];
  loading: boolean;
  error: string | null;
}

export type BuyHistIntent =
  | { type: 'LOAD_HISTORY' };