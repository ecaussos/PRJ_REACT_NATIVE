// src/database/migrations/v5_insert_product.ts

/**
 * Migration para popular os produtos padrões no banco de dados
 */
async function up(db: any): Promise<void> {
  const productCount = await db.getFirstAsync(`SELECT COUNT(*) as count FROM product;`);

  if (productCount && (productCount.count === 0 || productCount.count === '0')) {
    await db.execAsync(`
      INSERT INTO product (id_product, nm_product, id_group, cd_product_gtin) VALUES
        ('1', 'FEIJÃO CARIOCA TIPO 1 PANTERA PREMIUM PACOTE 1KG', '1', '7896070800014'),
        ('2', 'TOALHA DE PAPEL FOLHA DUPLA SOCIAL CLEAN SUPER ABSORÇÃO PACOTE 2 UNIDADES', '1', '7896914000716'),
        ('3', 'ÓLEO DE MILHO TIPO 1 LIZA ESPECIAIS GARRAFA 900ML', '1', '7896036090619'),
        ('4', 'ÁGUA MINERAL PRATA COM GÁS 510ML', '2', '7897123884036'),
        ('5', 'DETERGENTE LAVA-LOUÇAS LÍQUIDO LIMPOL CRISTAL 500ML', '9', '7891022100372'),
        ('6', 'GRANOLA JASMINE INTEGRAL TRADICIONAL 250G', '1', '7896283000157'),
        ('7', 'LEITE CONDENSADO INTEGRAL MOÇA NESTLÉ LATA 395G', '1', '7891000100103'),
        ('8', 'LAVA-ROUPAS LÍQUIDO OMO LAVANDA GALÃO 3L', '9', '7891150062825');
    `);
    console.log('[Migration] v5_insert_product: Produtos padrões inseridos com sucesso.');
  } else {
    console.log('[Migration] v5_insert_product: Produtos já existem. Nenhuma ação necessária.');
  }
}

export default up;