// src/features/buyList/buyList.model.ts
import { BuyListItemWithProductEntity } from '../../data/entities/buyListEntity';
import { BuyListRepository } from '../../data/repositories/buyListRepository';

const repository = new BuyListRepository();

export const BuyListModel = {
  // Retorna todos os registros cadastrados no banco
  async fetchItems(): Promise<BuyListItemWithProductEntity[]> {
    return await repository.findAllWithProducts();
  },

  // Cria o registro no banco de dados
  async create(id_product: number, qt_product: number): Promise<void> {
    // consulta o produto
    const existing = await repository.findByProductId(id_product);
    // Verifica se existe
    if (existing) {
      // Se existir soma quantidade 
      const newQty = existing.qt_product + qt_product;
      // Chama atualiza o registro no banco de dados
      await repository.updateQuantity(existing.id_list_buy, newQty);
    // Se não existir
    } else {
      // criar o registro
      const data = {
        id_product,
        qt_product,
        dt_list_buy: new Date().toISOString(),
      };
      // Persiste no banco de dados
      await repository.create(data);
    }
  },

  //Atualiza o registro no banco de dados - Utilizando o ID
  async updateQuantity(id_list_buy: number, qt_product: number): Promise<void> {
    // Persiste a atualização no banco de dados
    await repository.updateQuantity(id_list_buy, qt_product);
  },

  //Deleta o registro no banco de dados - Utilizando o ID
  async delete(id_list_buy: number): Promise<void> {
    // Persiste no banco de dados
    await repository.delete(id_list_buy);
  },
  
  //Deleta todos os registro no banco de dados
  async clear(): Promise<void> {
    // Persiste no banco de dados
    await repository.clearList();
  }
};