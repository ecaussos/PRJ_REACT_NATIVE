// src/database/migrations/v7_insert_from_to.ts

/**
 * Migration para popular os de-para de NCM/Tags com seus respectivos grupos
 */
async function up(db: any): Promise<void> {
  try {
    // ON CONFLICT (id_external) DO UPDATE funciona nativamente no PostgreSQL e no SQLite (>= 3.2.4)
    await db.execAsync(`
      INSERT INTO from_to_group (id_external, description, keywords, tag, id_group) VALUES
      ('0901', 'Café e derivados', 'en:coffees', 'CAFE, CAFE TORRADO, CAFE MOIDO, SOLUVEL', '1'),
      ('0902', 'Chás e infusões', 'en:teas', 'CHA, ERBA MATE, INFUSAO', '1'),
      ('0910', 'Especiarias e condimentos', 'en:spices', 'TEMPERO, CONDIMENTO, GENGIBRE, CRAVO, CANELA', '1'),
      ('1006', 'Arroz', 'en:rices', 'ARROZ, ARROZ BRANCO, ARROZ INTEGRAL, ARROZ PARBOILIZADO', '1'),
      ('1005', 'Milho', 'en:corn', 'MILHO, PIPOCA, MILHO PARA PIPOCA', '1'),
      ('1101', 'Farinha de trigo', 'en:wheat-flours', 'FARINHA DE TRIGO, FARINHA TRIGO', '1'),
      ('1102', 'Outras farinhas', 'en:flours', 'FARINHA DE MILHO, FARINHA DE MANDIOCA, FUBA', '1'),
      ('1108', 'Amidos e féculas', 'en:starches', 'MAIZENA, AMIDO DE MILHO, POLVILHO, TAPIOCA', '1'),
      ('1507', 'Óleo de soja', 'en:soybean-oils', 'OLEO DE SOJA, OLEO SOJA', '1'),
      ('1509', 'Azeite de oliva', 'en:olive-oils', 'AZEITE DE OLIVA, AZEITE, AZEITE EXTRA VIRGEM', '1'),
      ('1512', 'Outros óleos vegetais', 'en:sunflower-oils', 'OLEO DE GIRASSOL, OLEO DE CANOLA, OLEO DE MILHO', '1'),
      ('1604', 'Conservas de peixes', 'en:canned-fishes', 'SARDINHA, ATUM, SARDINHA EM CONSERVA, ATUM EM CONSERVA', '1'),
      ('1701', 'Açúcares', 'en:sugars', 'ACUCAR, ACUCAR REFINADO, ACUCAR CRISTAL, ACUCAR DEMERARA', '1'),
      ('1702', 'Adoçantes e xaropes', 'en:sweeteners', 'ADOÇANTE, ADOCANTE, GLICOSE, XAROPE', '1'),
      ('1806', 'Chocolates e cacau', 'en:chocolates', 'CHOCOLATE, CACAU, BOMBOM, CHOCOLATE EM PO, CACAU EM PO', '1'),
      ('1901', 'Achocolatados e cereais', 'en:chocolate-powders', 'ACHOCOLATADO, NESCAU, TODDY, CERAPO', '1'),
      ('1902', 'Massas secas', 'en:pastas', 'MACARRAO, MASSA, SPAGHETTI, MIOJO, MASSA SECA', '1'),
      ('2001', 'Vegetais em conserva/vinagre', 'en:pickles', 'CONSERVA, PALMITO, ACEITONA, PICLES, COGUMELO', '1'),
      ('2002', 'Molhos e extratos de tomate', 'en:tomato-sauces', 'MOLHO DE TOMATE, EXTRATO DE TOMATE, TOMATE PELADO, MASSA DE TOMATE', '1'),
      ('2005', 'Outros vegetais em conserva', 'en:canned-vegetables', 'MILHO EM CONSERVA, ERVILHA, SELECAO DE VEGETAIS', '1'),
      ('2103', 'Molhos e condimentos compostos', 'en:sauces', 'KETCHUP, MAIONESE, MOSTARDA, SHOYU, MOLHO DE ALHO, TARÊ', '1'),
      ('2104', 'Sopas e caldos', 'en:soups', 'CALDO DE GALINHA, CALDO DE CARNE, SOPA, CANJA', '1'),
      ('2106', 'Misturas e fermentos', 'en:baking-powders', 'FERMENTO, GELATINA, FLAN, MISTURA PARA BOLO', '1'),
      ('2209', 'Vinagres', 'en:vinegars', 'VINAGRE, VINAGRE DE MAÇA, VINAGRE DE VINHO', '1'),
      ('2309', 'Alimentos para pets', 'en:pet-food', 'RACAO, PETISCO CANINO, SACHE CAT, RACAO CAO, RACAO GATO', '1'),
      ('2501', 'Sal de cozinha', 'en:salts', 'SAL, SAL REFINADO, SAL GROSSO, SAL DE PARRILLA', '1'),

      -- 2. BEBIDAS (ID '2')
      ('2009', 'Sucos de frutas', 'en:juices, en:fruit-juices', 'SUCO, SUCO DE LARANJA, SUCO INTEGRAL, NECTAR, SUCO DE UVA', '2'),
      ('2201', 'Águas', 'en:waters, en:spring-waters', 'AGUA MINERAL, AGUA COM GAS, AGUA SEM GAS', '2'),
      ('2202', 'Refrigerantes e energéticos', 'en:sodas, en:beverages, en:soft-drinks, en:carbonated-drinks, en:sweetened-beverages', 'REFRIGERANTE, COCA COLA, GUARANA, ISOTONICO, ENERGETICO, RED BULL', '2'),
      ('2203', 'Cervejas', 'en:beers', 'CERVEJA, CHOPP, CERVEJA PURO MALTE, CERVEJA ZERO', '2'),
      ('2204', 'Vinhos e espumantes', 'en:wines', 'VINHO, VINHO FINO, ESPUMANTE, CHAMPAGNE, PROSECCO', '2'),
      ('2208', 'Destilados e licores', 'en:distilled-beverages, en:spirits', 'CACHACA, VODKA, WHISKY, GIN, LICOR, RUM', '2'),

      -- 3. FRIOS E LATICÍNIOS (ID '3')
      ('0401', 'Leite fresco e creme de leite', 'en:milks', 'LEITE INTEGRAL, LEITE DESNATADO, LEITE SEMI, CREME DE LEITE', '3'),
      ('0402', 'Leite em pó e condensado', 'en:condensed-milks, en:powdered-milks', 'LEITE EM PO, LEITE CONDENSADO', '3'),
      ('0403', 'Iogurtes e leites fermentados', 'en:yogurts, en:fermented-milks', 'IOGURTE, KEFIR, LEITE FERMENTADO, YOGURT, YAKULT', '3'),
      ('0405', 'Manteiga', 'en:butters', 'MANTEIGA, MANTEIGA COM SAL, MANTEIGA SEM SAL', '3'),
      ('0406', 'Queijos e requeijão', 'en:cheeses, en:dairies', 'QUEIJO, REQUEIJAO, QUEIJO MUSSARELA, QUEIJO PRATO, PARMESAO, MINAS', '3'),
      ('1517', 'Margarinas', 'en:margarines', 'MARGARINA, MARGARINA COM SAL, MARGARINA SEM SAL', '3'),
      ('1601', 'Embutidos e linguiças', 'en:sausages', 'SALSICHA, LINGUICA, SALAME, LINGUICA CALABRESA, PAIO', '3'),
      ('1602', 'Frios fatiados e presuntos', 'en:hams', 'PRESUNTO, MORTADELA, PEITO DE PERU, APONTADO, BLANQUET', '3'),

      -- 4. AÇOUGUE E PEIXARIA (ID '4')
      ('0201', 'Carnes bovinas frescas', 'en:meats, en:beef', 'CARNE BOVINA, ALCATRA, CONTRA FILE, PICANHA, CARNE MOIDA, COSTELA', '4'),
      ('0203', 'Carnes suínas frescas', 'en:pork', 'CARNE SUINA, BISTECA, LOMBO, PERNIL, COSTELINHA SUINA', '4'),
      ('0207', 'Aves frescas', 'en:poultry, en:chickens', 'FRANGO, PEITO DE FRANGO, COXA DE FRANGO, SOBRECOXA, PERU', '4'),
      ('0302', 'Peixes frescos', 'en:fishes', 'PEIXE FRESCO, FILE DE PEIXE, SALMAO, TAMPANHO, TILAPIA', '4'),

      -- 5. HORTIFRÚTI (ID '5')
      ('0407', 'Ovos', 'en:eggs', 'OVO, OVOS, OVO BRANCO, OVO VERMELHO, OVO DE CODORNA', '5'),
      ('0701', 'Batatas frescas', 'en:potatoes', 'BATATA, BATATA MONALISA, BATATA DOCE, BATATA ASTERIX', '5'),
      ('0702', 'Tomates frescos', 'en:tomatoes', 'TOMATE, TOMATE ITALIANO, TOMATE CEREJA, TOMATE SWEET', '5'),
      ('0709', 'Hortaliças e legumes', 'en:vegetables', 'CEBOLA, ALHO, CENOURA, ALFACE, VERDURA, LEGUME, CHUCHU, ABOBORA', '5'),
      ('0803', 'Bananas frescas', 'en:bananas', 'BANANA, BANANA NANICA, BANANA PRATA, BANANA MACA', '5'),
      ('0808', 'Maçãs e peras', 'en:apples, en:pears', 'MACA, PERA, MACA FUJI, MACA GALA, PERA WILLIANS', '5'),
      ('0809', 'Outras frutas frescas', 'en:fruits', 'MAMAO, LARANJA, LIMAO, FRUTA, MELANCIA, MELAO, UVA', '5'),

      -- 6. PADARIA E CONFEITARIA (ID '6')
      ('1905', 'Pães, biscoitos e bolos', 'en:breads, en:toasts, en:biscuits-and-cakes, en:pastries, en:biscuits', 'PAO, TORRADA, BISCOITO, BOLACHA, BOLO, SALGADO, CROISSANT, PAO DE FORMA, PAO FRANCES', '6'),
      ('1704', 'Produtos de confeitaria', 'en:candies, en:confectioneries', 'DOCE, PAÇOCA, BALA, CHICLETE, CONFEITO, PIRULITO', '6'),

      -- 7. CONGELATOS (ID '7')
      ('0202', 'Carnes congeladas e hambúrgueres', 'en:frozen-meats', 'CARNE CONGELADA, HAMBURGUER, HAMBURGUER BOVINO', '7'),
      ('0303', 'Peixes congelados', 'en:frozen-fishes', 'PEIXE CONGELADO, POSTA DE PEIXE, FILE CONGELADO', '7'),
      ('0306', 'Crustáceos e frutos do mar congelados', 'en:seafood', 'CAMARAO, CAMARAO CONGELADO, LAGOSTA, LULA', '7'),
      ('0710', 'Vegetais e legumes congelados', 'en:frozen-vegetables', 'LEGUMES CONGELADOS, ERVILHA CONGELADA, SELECAO CONGELADA', '7'),
      ('0811', 'Polpas de frutas congeladas', 'en:frozen-fruits', 'POLPA DE FRUTA, POLPA, POLPA CONGELADA', '7'),
      ('1902_FROZEN', 'Massas e pratos prontos congelados', 'en:frozen-pizzas, en:frozen-ready-meals', 'LASANHA, PIZZA CONGELADA, PIZZA, PAO DE QUEIJO CONGELADO, ESCONDIDINHO', '7'),
      ('2004', 'Batatas congeladas', 'en:frozen-french-fries', 'BATATA PRÉ-FRITA, BATATA PALITO CONGELADA, BATATA CONGELADA', '7'),
      ('2105', 'Sorvetes e sobremesas geladas', 'en:ice-creams, en:desserts', 'SORVETE, PICOLÉ, AÇAI, GELATO, CASQUINHA', '7'),

      -- 8. HIGIENE E PERFUMARIA (ID '8')
      ('3004', 'Medicamentos isentos de prescrição', 'en:medicines', 'MEDICAMENTO, ANALGESICO, DIPIRONA, PARACETAMOL, DORFLEX', '8'),
      ('3005', 'Artigos de curativo', 'en:bandages', 'ALGODAO, GAZE, CURATIVO, BAND AID, ESPARADRAPO', '8'),
      ('3305', 'Cuidados com o cabelo', 'en:shampoos, en:hair-care', 'SHAMPOO, CONDICIONADOR, CREME DE PENTEAR, MASCARA CAPILAR, TINTURA', '8'),
      ('3306', 'Higiene bucal', 'en:toothpastes, en:oral-hygiene', 'CREME DENTAL, PASTA DE DENTE, ESCOVA DE DENTES, FIO DENTAL, ENXAGUANTE BUCAL', '8'),
      ('3307', 'Desodorantes e barbear', 'en:deodorants', 'DESODORANTE, ANTITRANSPIRANTE, ESPUMA DE BARBEAR, APARELHO DE BARBEAR, CARGA GILLETTE', '8'),
      ('3401', 'Sabonetes', 'en:soaps', 'SABONETE, SABONETE LIQUIDO, SABONETE EM BARRA', '8'),
      ('4014', 'Preservativos', 'en:condoms', 'PRESERVATIVO, CAMISINHA', '8'),
      ('4818', 'Papéis de higiene e lenços', 'en:toilet-papers', 'PAPEL HIGIENICO, LENCO UMEDECIDO, TOALHA DE PAPEL, GUARDANAPO', '8'),
      ('9619', 'Absorventes e fraldas', 'en:diapers, en:sanitary-pads', 'ABSORVENTE, FRALDA, FRALDA GERIATRICA, TAMPÃO', '8'),

      -- 9. LIMPEZA (ID '9')
      ('2828', 'Água sanitária e cloro', 'en:bleaches', 'AGUA SANITARIA, CLORO, DESINFETANTE CLORADO, QBOA', '9'),
      ('3402', 'Detergentes, sabões e amaciantes', 'en:detergents, en:dishwashing-detergents, en:laundry-detergents', 'DETERGENTE, SABAO EM PO, SABAO LIQUIDO, AMACIANTE, LAVA LOUÇAS, OMO, YPE', '9'),
      ('3405', 'Ceras e polidores', 'en:polishes', 'LUSTRA MOVEIS, SAPONACEO, CERA, CERA PARA PISO, SILVO', '9'),
      ('3605', 'Fósforos', 'en:matches', 'FOSFORO, FOSFORO DE COZINHA', '9'),
      ('3808', 'Insecticidas e desinfetantes', 'en:insecticides', 'INSETICIDA, DESINFETANTE, VENENO DE MOSQUITO, LISOFORM, RAID, BAYGON', '9'),
      ('3923', 'Sacos de lixo', 'en:trash-bags', 'SACO DE LIXO, SACO PARA LIXO', '9'),
      ('3924', 'Utilidades de plástico', 'en:housewares', 'BACIA, POTE, BALDE, UTENSILIO DE PLASTICO', '9'),
      ('6805', 'Abrasivos e esponjas', 'en:sponges', 'ESPONJA DE AÇO, PALHA DE AÇO, BOMBRIL, ESPONJA DE LAVA LOUÇA, ESPONJA', '9'),
      ('9603', 'Vassouras, rodos e esfregões', 'en:brooms', 'VASSOURA, RODO, ESFREGAO, ESCOVA DE LIMPEZA, MOP', '9')
      ON CONFLICT (id_external) DO UPDATE SET
        description = EXCLUDED.description,
        keywords = EXCLUDED.keywords,
        tag = EXCLUDED.tag,
        id_group = EXCLUDED.id_group;
    `);

    console.log('[Migration] v7_insert_from_to: Registros de De-Para inseridos/atualizados com sucesso.');
  } catch (error) {
    console.error('[Migration] v7_insert_from_to: Erro ao popular tabela de-para:', error);
    throw error;
  }
}

export default up;