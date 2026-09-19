// src/data/interfaces/buyList.repository.interfaces.ts

import { ProductSearchResult } from '../../features/buyList/buyList.types';
import {
  BuyListEntity,
  BuyListItemWithProductEntity,
  CreateBuyListDTO
} from '../entities/buyList.entity';

export interface IBuyListRepository {
  
  findAllWithProduct(): Promise<BuyListItemWithProductEntity[]>;

  /** Busca todos os itens da lista de compras junto com as informações dos produtos */
  findAll(): Promise<BuyListItemWithProductEntity[]>;

  /** Pesquisa produto por código de barras exato (retorna a lista de correspondências do banco) */
  findByBarcode:(barcode: string) => Promise<ProductSearchResult | null>;

  /** Pesquisa produtos por nome (busca parcial) */
  findByName(nm_product: string): Promise<ProductSearchResult[]>;

  /** Verifica se o produto já está na lista */
  findByProductId(id_product: number): Promise<BuyListEntity | null>;

  /** Verifica se existe compra ativa, tabela buy com registro */
  findByActiveBuy(): Promise<boolean>;

  /** Adiciona novo item */
  create(item: CreateBuyListDTO): Promise<void>;

  /** Atualiza quantidade de um item da lista */
  update(id_list_buy: number, qt_product: number): Promise<void>;

  /** Remove item individual */
  delete(id_list_buy: number): Promise<void>;

  /** Limpa toda a lista */
  clearList(): Promise<void>;
}