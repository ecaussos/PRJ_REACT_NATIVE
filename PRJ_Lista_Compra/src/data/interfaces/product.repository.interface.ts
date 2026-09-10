// src/data/repositories/product.repository.interface.ts
import {
    CreateProductDTO,
    ProductEntity,
    ProductWithGroupEntity,
    UpdateProductDTO,
} from '../entities/product.entity';

// Contrato de abstração da camada de dados para Inversão de Dependência (DIP)
export interface IProductRepository {
  findById(id_product: number): Promise<ProductEntity | null>;
  findAll(): Promise<ProductWithGroupEntity[]>;
  findByBarcode(gtin: string): Promise<ProductEntity | null>;
  findByName(nameQuery: string): Promise<Pick<ProductEntity, 'id_product' | 'nm_product'>[]>;
  create(product: CreateProductDTO): Promise<void>;
  update(id_product: number, product: UpdateProductDTO): Promise<void>;
  delete(id_product: number): Promise<void>;
}