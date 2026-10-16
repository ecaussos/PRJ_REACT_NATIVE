// src/data/interfaces/config.repository.interface.ts
import {
  ConfigEntity,
  ConfigTypeOption,
  ConfigWithTypeEntity,
  CreateConfigDTO,
  UpdateConfigDTO,
} from '../entities/config.entity';

/**
 * Contrato de abstração da camada de dados para configurações (Dependency Inversion Principle - DIP).
 * Permite desvincular a lógica de negócios da implementação concreta do banco de dados/API.
 */
export interface IConfigRepository {
  /** Busca todas as configurações cadastradas com seus respectivos tipos */
  findAll(): Promise<ConfigWithTypeEntity[]>;

  /** Busca uma configuração específica pelo seu ID */
  findById(id_config: string): Promise<ConfigEntity | null>;

  /** Retorna as opções de tipos de configuração cadastradas para vínculo na UI */
  findConfigType(): Promise<ConfigTypeOption[]>;

  /** Busca as configuração cadastradas utilizar o url */
  findByUrlExact(url: string): Promise<ConfigEntity | null>;

  /** Insere uma nova configuração no repositório */
  create(config: CreateConfigDTO): Promise<ConfigEntity>;

  /** Atualiza uma configuração existente pelo ID */
  update(id_config: string, config: UpdateConfigDTO): Promise<void>;

  /** Remove uma configuração pelo ID */
  delete(id_config: string): Promise<void>;
}