export async function up(db: any) {
  const productCount = await db.getFirstAsync(`SELECT COUNT(*) as count FROM product;`);
  if (productCount && productCount.count <= 6) {
    await db.execAsync(`
      INSERT INTO product (nm_product, id_group, cd_product_gtin) VALUES
        ('FEIJÃO CARIOCA TIPO 1 PANTERA PREMIUM PACOTE 1KG','1','7896070800014'),
        ('TOALHA DE PAPEL FOLHA DUPLA SOCIAL CLEAN SUPER ABSORÇÃO PACOTE 2 UNIDADES','1','7896914000716'),
        ('ÓLEO DE MILHO TIPO 1 LIZA ESPECIAIS GARRAFA 900ML','1','7896036090619'),
        ('ÁGUA MINERAL PRATA COM GÁS 510ML','4','7897123884036'),
        ('DETERGENTE LAVA-LOUÇAS LÍQUIDO LIMPOL CRISTAL 500ML','6','7891022100372'),
        ('GRANOLA JASMINE INTEGRAL TRADICIONAL 250G','1','7896283000157'),
        ('LEITE CONDENSADO INTEGRAL MOÇA NESTLÉ LATA 395G','1','7891000100103'),
        ('LAVA-ROUPAS LÍQUIDO OMO LAVANDA GALÃO 3L','6','7891150062825')
    `);
  }
}