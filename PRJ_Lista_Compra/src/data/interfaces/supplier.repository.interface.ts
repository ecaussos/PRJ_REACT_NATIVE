// src/data/interfaces/supplier.repository.interface.ts
import {
  CreateSupplierDTO,
  SupplierEntity,
  UpdateSupplierDTO,
} from '../entities/supplier.entity';

// Contrato/Interface do repositório para garantia do SOLID (Inversão de Dependência)
export interface ISupplierRepository {
  findAll(): Promise<SupplierEntity[]>;
  findById(id_supplier: number): Promise<SupplierEntity | null>;
  findByNameExact(name: string): Promise<SupplierEntity | null>;
  findByName(nameQuery: string): Promise<Pick<SupplierEntity, 'id_supplier' | 'nm_supplier'>[]>;
  create(supplier: CreateSupplierDTO): Promise<SupplierEntity>;
  update(id_supplier: number, supplier: UpdateSupplierDTO): Promise<void>;
  delete(id_supplier: number): Promise<void>;
}