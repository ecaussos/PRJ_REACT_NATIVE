// src/features/product/product.model.ts
import { ProductEntity } from '../../data/entities/productEntity';
import { ProductRepository } from '../../data/repositories/productRepository';
import { GroupProductModel } from '../groupProduct/groupProduct.model';

// Instância do repositório para interagir diretamente com as operações do banco de dados
const productRepo = new ProductRepository();

export const ProductModel = {
  // Retorna todos os registros cadastrados no banco
  async fetchAll(): Promise<ProductEntity[]> {
    return await productRepo.findAll();
  },

  // Busca e retorna todos os grupos disponíveis para o componente de seleção (Picker)
  async getGroups() {
    return await GroupProductModel.fetchAll();
  },

  // Valide se já existe o Código de Barras (GTIN)
  async checkBarcode(gtin: string): Promise<ProductEntity | null> {
    if (!gtin) return null;
    return await productRepo.findByBarcode(gtin);
  },
  
  // Busca o registro por nome
  async findByName(query: string): Promise<ProductEntity[]> {
    return await productRepo.findByName(query);
  },
  
  // Cria o registro no banco de dados
  async create(data: { nm_product: string; id_group: number; cd_product_gtin: string }): Promise<void> {
    // Valida se o campo está preenchido
    if (!data.nm_product.trim()) {
      throw new Error('O nome do produto não pode estar vazio.');
    }
    // Valida se o campo está preenchido
    if (!data.id_group) {
      throw new Error('Selecione um grupo para o produto.');
    }
    // Valida se o campo está preenchido
    if (!data.cd_product_gtin.trim()) {
      throw new Error('O código de barra não pode estar vazio.');
    }else{
      // Chama o a validação do do Código de Barras (GTIN)
      const existing = await this.checkBarcode(data.cd_product_gtin);
      // Se já existir
      if (existing) {
        throw new Error('Já existe um produto cadastrado com o Código de Barras (GTIN).');
      }
    }
    // Persiste no banco de dados
    await productRepo.create(data);
  },

  // Atualiza o registro no banco de dados
  async update(id_product: number, data: { nm_product: string; id_group: number; cd_product_gtin: string }): Promise<void> {
    // Valida se o nome está preenchido
    if (!data.nm_product.trim()) {
      throw new Error('O nome do produto não pode estar vazio.');
    }
    // Valida se o grupo foi selecionado
    if (!data.id_group) {
      throw new Error('Selecione um grupo para o produto.');
    }
    // Valida código de barra preenchido
    if (!data.cd_product_gtin.trim()) {
      throw new Error('O código de barra não pode estar vazio.');
    // Valida se o código de barra já existe
    } else {
      // Chama a consulta do código de barra
      const existing = await this.checkBarcode(data.cd_product_gtin);
      // Valida se o código existe e se o ID é diferente
      if (existing && existing.id_product !== id_product) {
        throw new Error('Já existe outro produto cadastrado com este Código de Barras (GTIN).');
      }
    }
    // Persiste a atualização no banco de dados
    await productRepo.update(id_product, data);
  },

  //Deleta o registro no banco de dados - Utilizando o ID
  async delete(id_group: number): Promise<void> {
    // Persiste no banco de dados
    await productRepo.delete(id_group);
  }
};