// src/data/interfaces/groupProduct.repository.interface.ts
import {
  CreateGroupProductDTO,
  GroupProductEntity,
  UpdateGroupProductDTO,
} from '../entities/groupProduct.entity';

// Contrato/Interface do repositório para garantia do SOLID (Inversão de Dependência)
export interface IGroupProductRepository {
  findAll(): Promise<GroupProductEntity[]>;
  findById(id_group: number): Promise<GroupProductEntity | null>;
  findByNameExact(name: string): Promise<GroupProductEntity | null>;
  findByName(nameQuery: string): Promise<Pick<GroupProductEntity, 'id_group' | 'nm_group'>[]>;
  create(group: CreateGroupProductDTO): Promise<GroupProductEntity>;
  update(id_group: number, group: UpdateGroupProductDTO): Promise<void>;
  delete(id_group: number): Promise<void>;
}