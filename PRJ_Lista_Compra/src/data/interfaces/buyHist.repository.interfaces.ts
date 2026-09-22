// src/data/interfaces/buy.repository.interfaces.ts

import {
  BuyHistWithEntity,
} from '../entities/buyHist.entity';

export interface IBuyHistRepository {

  /** Busca todos os itens da compra junto com as informações dos produtos */
  findAll(): Promise<BuyHistWithEntity[]>;

    /** Atualiza quantidade de um item na compra */
  update(id_hist_buy: number, id_product: number, qt_product: number, vl_product: number, id_supplier: number): Promise<void>;

  /** Remove item da compra */
  delete(id_hist_buy: number): Promise<void>;
}