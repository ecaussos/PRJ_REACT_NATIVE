// src/data/interfaces/buy.repository.interfaces.ts

import {
  BuyHistWithEntity,
  SupplierOption,
} from '../entities/buyHist.entity';

export interface IBuyHistRepository {

  /** Busca todos os itens da compra junto com as informações dos produtos */
  findAll(): Promise<BuyHistWithEntity[]>;

  findSupplier(): Promise<SupplierOption[]>;

  /** Atualiza quantidade de um item na compra */
  update(id_hist_buy: string, id_product: string, qt_product: number, vl_product: number, id_supplier: string): Promise<void>;

  /** Remove item da compra */
  delete(id_hist_buy: string): Promise<void>;
}