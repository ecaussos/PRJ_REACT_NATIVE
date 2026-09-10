// src/features/product/product.model.ts
import { ProductEntity, ProductWithGroupEntity } from '../../data/entities/product.entity';
import { IProductRepository } from '../../data/interfaces/product.repository.interface';
import { ProductRepository } from '../../data/repositories/product.repository';
import { GroupProductModel } from '../groupProduct/groupProduct.model';
import { ProductIntent } from './product.types';

export class ProductModel {
  // Injeção de dependência via construtor com fallback padrão do repositório
  constructor(
    private repository: IProductRepository = new ProductRepository(),
    private groupModel: GroupProductModel = new GroupProductModel()
  ) {}

  // Busca todos os registros cadastrados no banco com informações do produto e grupo
  async fetchAll(): Promise<ProductWithGroupEntity[]> {
    return await this.repository.findAll();
  }

  // Delega a busca de grupos de produtos para a Model especializada
  async getGroups() {
    return await this.groupModel.fetchAll();
  }

  // Verifica se já existe um registro associado a um código de barras (GTIN)
  async checkBarcode(gtin: string): Promise<ProductEntity | null> {
    if (!gtin.trim()) return null;
    return await this.repository.findByBarcode(gtin.trim());
  }

  // Busca registros cadastrados por nome
  async findByName(query: string) {
    return await this.repository.findByName(query);
  }

  // Valida e cadastra um novo produto no sistema
  async create(data: { nm_product: string; id_group: number; cd_product_gtin: string }): Promise<void> {
    const cleanName = data.nm_product.trim();
    const cleanGtin = data.cd_product_gtin.trim();
    // Valida se o campo está preenchido
    if (!cleanName) {
      throw new Error('O nome do produto não pode estar vazio.');
    }
    // Valida se o campo está preenchido
    if (!data.id_group) {
      throw new Error('Selecione um grupo para o produto.');
    }
    // Valida se o campo está preenchido
    if (!cleanGtin) {
      throw new Error('O código de barras não pode estar vazio.');
    }
    // Regra de negócio: impede duplicidade de GTIN
    const existing = await this.checkBarcode(cleanGtin);
    if (existing) {
      throw new Error(`Já existe outro produto cadastrado com este Código de Barras: "${cleanGtin}".`);
    }
    // Persiste no banco de dados
    await this.repository.create({
      nm_product: cleanName,
      id_group: data.id_group,
      cd_product_gtin: cleanGtin,
    });
  }

  // Valida e atualiza um produto existente
  async update(id_product: number, data: { nm_product: string; id_group: number; cd_product_gtin: string }): Promise<void> {
    const cleanName = data.nm_product.trim();
    const cleanGtin = data.cd_product_gtin.trim();

    if (!cleanName) {
      throw new Error ('O nome do produto não pode estar vazio.');
    }
    if (!data.id_group) {
      throw new Error ('Selecione um grupo para o produto.');
    }
    if (!cleanGtin) {
      throw new Error ('O código de barras não pode estar vazio.');
    }

    // Regra de negócio: impede duplicação do GTIN com outro produto cadastrado
    const existing = await this.checkBarcode(cleanGtin);
    // Valida para ver se o ID é diferente
    if (existing && existing.id_product !== id_product) {
      throw new Error (`Já existe outro produto cadastrado com este Código de Barras: "${cleanGtin}".`);
    }
    // Persiste no banco de dados
    return await this.repository.update(id_product, {
      nm_product: cleanName,
      id_group: data.id_group,
      cd_product_gtin: cleanGtin,
    });
  }

  // Deleta o registro no banco de dados - Utilizando o ID
  async delete(id_product: number): Promise<void> {
    // Persiste no banco de dados
    await this.repository.delete(id_product);
  }

  // Regra de negócio: Valida se os dados foram preenchidos nos campos
  static isValid(name: string, barcode: string, groupId: string | number): boolean {
    const hasValidName = name.trim().length > 0;
    const hasValidBarCode = barcode.trim().length > 0;
    const hasValidGroup = String(groupId ?? '').trim() !== '' && Number(groupId) > 0;

    return hasValidName && hasValidBarCode && hasValidGroup;
  }

  // Regra de negócio: Monta a Action (Intent) indicando a ação do payload - Create/Update
  static buildSaveAction(
    name: string,
    groupId: string | number,
    barcode: string,
    isEditing: boolean, 
    editingId: number | null
  ): ProductIntent {
    const cleanName = name.trim();
    const cleanBarcode = barcode.trim();
    const parsedGroupId = Number(groupId);
    // Se houver um ID em edição, despacha a ação de atualização
    if (isEditing && editingId !== null) {
      return {
        type: 'UPDATE',
        payload: {
          id_product: editingId,
          nm_product: cleanName,
          id_group: parsedGroupId,
          cd_product_gtin: cleanBarcode,
        },
      };
    }
    // Caso contrário, despacha a ação de criação de um novo registro
    return {
      type: 'CREATE',
      payload: {
        nm_product: cleanName,
        id_group: parsedGroupId,
        cd_product_gtin: cleanBarcode,
      },
    };
  }

}

// Instância pronta para uso na aplicação (singleton)
export const ProductModelInstance = new ProductModel();