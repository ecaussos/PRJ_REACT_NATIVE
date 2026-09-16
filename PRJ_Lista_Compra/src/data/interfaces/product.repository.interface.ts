// src/data/interfaces/product.repository.interface.ts
import {
  CreateProductDTO,
  GroupOption,
  ProductEntity,
  ProductWithGroupEntity,
  UpdateProductDTO,
} from '../entities/product.entity';

/**
 * Contrato de abstração da camada de dados para produtos (Dependency Inversion Principle - DIP).
 * Permite desvincular a lógica de negócios da implementação concreta do banco de dados/API.
 */
export interface IProductRepository {
  /** Busca todos os produtos cadastrados com seus respetivos grupos */
  findAll(): Promise<ProductWithGroupEntity[]>;

  /** Busca um produto específico pelo seu ID */
  findById(id_product: number): Promise<ProductEntity | null>;

  /** Busca um produto pelo seu código GTIN/código de barras */
  findByBarcode(gtin: string): Promise<ProductEntity | null>;

  /** Realiza busca de nomes por correspondência parcial (LIKE) */
  findByName(nameQuery: string): Promise<Pick<ProductEntity, 'id_product' | 'nm_product'>[]>;

  /** Realiza busca de produtos pelo nome exato (insensível a maiúsculas/minúsculas) */
  findByNameExact(name: string): Promise<ProductEntity | null>;

  /** Retorna as opções de grupos cadastradas para vínculo na UI */
  findGroupProduct(): Promise<GroupOption[]>;

  /** Insere um novo produto no repositório */
  create(product: CreateProductDTO): Promise<ProductEntity>;

  /** Atualiza um produto existente pelo ID */
  update(id_product: number, product: UpdateProductDTO): Promise<void>;

  /** Remove um produto pelo ID */
  delete(id_product: number): Promise<void>;
}