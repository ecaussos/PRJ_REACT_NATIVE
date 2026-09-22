// src/data/interfaces/buy.repository.interfaces.ts

import { ProductSearchResult } from '../../features/buy/buy.types';
import {
  BuyEntity,
  BuyWithProductEntity,
  CreateBuyDTO,
  CreateBuyHistDTO,
} from '../entities/buy.entity';

export interface IBuyRepository {

  /** Busca todos os itens da compra junto com as informações dos produtos */
  findAll(): Promise<BuyEntity[]>;

  findAllWithProduct(): Promise<BuyWithProductEntity[]>;

  /** Pesquisa produto por código de barras exato (retorna a lista de correspondências do banco) */
  findByBarcode:(barcode: string) => Promise<ProductSearchResult | null>;

  /** Pesquisa produtos por nome (busca parcial) */
  findByName(nm_product: string): Promise<ProductSearchResult[]>;

  /** Verifica se o produto já está na compra */
  findByProductId(id_product: number): Promise<BuyEntity | null>;

  /** Adiciona novo item na compra*/
  create(item: CreateBuyDTO): Promise<void>;

  /** Adiciona registros no histórico apos finalizar a compra */
  createBuyHist(item: CreateBuyHistDTO): Promise<void>; // ✅ Assinatura com o tipo de entrada correto

  /** Atualiza quantidade de um item na compra */
  update(id_product: number, qt_product: number, vl_product: number): Promise<void>;

  /** Remove item da compra */
  delete(id_product: number): Promise<void>;

  /** Remove o produto da lista de compra */
  deleteBuyList(id_product: number): Promise<void>;

  /** Limpa toda a compra */
  clearBuy(): Promise<void>;
}