// src/data/interfaces/buyList.repository.interfaces.ts

import {
  BuyListEntity,
  BuyListItemWithProductEntity,
  CreateBuyListDTO
} from '../entities/buyList.entity';

// Contrato de interface para Injeção de Dependência do Repositório de Lista de Compras
export interface IBuyListRepository {
  findAllWithProducts(): Promise<BuyListItemWithProductEntity[]>;
  findByProductId(id_product: number): Promise<BuyListEntity | null>;
  create(item: CreateBuyListDTO): Promise<void>;
  updateQuantity(id_list_buy: number, qt_product: number): Promise<void>;
  delete(id_list_buy: number): Promise<void>;
  clearList(): Promise<void>;
}