// src/data/interfaces/groupProduct.repository.interface.ts
import {
  CreateGroupProductDTO,
  GroupProductEntity,
  UpdateGroupProductDTO,
} from '../entities/groupProduct.entity';

// Contrato/Interface do repositório para garantia do SOLID (Inversão de Dependência)
export interface IGroupProductRepository {
  findAll(): Promise<GroupProductEntity[]>;
  findById(id_group: string): Promise<GroupProductEntity | null>;
  findByNameExact(name: string): Promise<GroupProductEntity | null>;
  findByName(nameQuery: string): Promise<Pick<GroupProductEntity, 'id_group' | 'nm_group'>[]>;
  create(group: CreateGroupProductDTO): Promise<GroupProductEntity>;
  update(id_group: string, group: UpdateGroupProductDTO): Promise<void>;
  delete(id_group: string): Promise<void>;
}