export async function up(db: any): Promise<void> {
  // Array contendo: [Código NCM de 4 dígitos, Descrição detalhada, ID do Grupo no App]
  const fromToData: Array<[string, string, number]> = [
    // ==========================================
    // 1. MERCEARIA (ID 1)
    // ==========================================
    ['0901', 'Café, mesmo torrado ou descafeinado; cascas e películas de café', 1],
    ['0902', 'Chá, mesmo aromatizado', 1],
    ['0910', 'Gengibre, açafrão, tomilho, louro, caril e outras especiarias', 1],
    ['1006', 'Arroz', 1],
    ['1005', 'Milho', 1],
    ['1101', 'Farinha de trigo ou de meslã', 1],
    ['1102', 'Farinhas de cereais, exceto de trigo ou de meslã', 1],
    ['1108', 'Amidos e féculas; inulina', 1],
    ['1507', 'Óleo de soja e respectivas frações', 1],
    ['1509', 'Azeite de oliva e respectivas frações', 1],
    ['1512', 'Óleos de girassol, de cártamo ou de algodão', 1],
    ['1604', 'Preparações e conservas de peixes; caviar', 1],
    ['1701', 'Açúcares de cana ou de beterraba e sacarose química pura', 1],
    ['1702', 'Outros açúcares, incluindo as lactose, maltose, glicose e frutose', 1],
    ['1704', 'Produtos de confeitaria sem cacau (incluindo o chocolate branco)', 1],
    ['1806', 'Chocolate e outras preparações alimentícias contendo cacau', 1],
    ['1901', 'Extratos de malte; preparações alimentícias de farinhas', 1],
    ['1902', 'Massas alimentícias, mesmo cozidas ou recheadas', 1],
    ['1905', 'Produtos de padaria, pastelaria ou da indústria de bolachas e biscoitos', 1],
    ['2001', 'Vegetais, frutas e outras partes comestíveis de plantas, preparados ou conservados em vinagre', 1],
    ['2002', 'Tomates preparados ou conservados, exceto em vinagre ou ácido acético', 1],
    ['2005', 'Outros vegetais preparados ou conservados, não congelados', 1],
    ['2103', 'Preparações para molhos e molhos preparados; condimentos e temperos compostos', 1],
    ['2104', 'Sopas e caldos preparados; preparações alimentícias compostas', 1],
    ['2106', 'Preparações alimentícias não especificadas nem compreendidas noutros capítulos', 1],
    ['2209', 'Vinagres e sucedâneos do vinagre obtidos a partir de ácido acético', 1],
    ['2309', 'Alimentos preparados para animais (Rações para pets)', 1],
    ['2501', 'Sal (incluindo o sal de cozinha e o sal denaturado) e cloreto de sódio', 1],

    // ==========================================
    // 2. BEBIDAS (ID 2)
    // ==========================================
    ['2009', 'Sucos de fruta ou de produtos hortícolas, não fermentados', 2],
    ['2201', 'Águas, incluindo as águas minerais naturais e as águas gaseificadas', 2],
    ['2202', 'Águas adicionadas de açúcar ou de outros edulcorantes ou aromatizadas (Refrigerantes, energéticos, isotônicos)', 2],
    ['2203', 'Cervejas de malte', 2],
    ['2204', 'Vinhos de uvas frescas, incluindo os vinhos enriquecidos com álcool', 2],
    ['2208', 'Álcool etílico não denaturado; aguardentes, licores e outras bebidas espirituosas', 2],

    // ==========================================
    // 3. FRIOS E LATICÍNIOS (ID 3)
    // ==========================================
    ['0401', 'Leites e cremes de leite, não concentrados nem adicionados de açúcar', 3],
    ['0402', 'Leites e cremes de leite, concentrados ou adicionados de açúcar (Leite em pó e condensado)', 3],
    ['0403', 'Iogurtes; leites e cremes acidificados, kefir e outros leites fermentados', 3],
    ['0405', 'Manteiga e outras matérias gordas provenientes do leite', 3],
    ['0406', 'Queijos e requeijão', 3],
    ['1517', 'Margarinas; misturas ou preparações alimentícias de gorduras ou de óleos vegetais', 3],
    ['1601', 'Enchidos e produtos semelhantes, de carne, de miudezas ou de sangue (Salsicha, linguiça, salame)', 3],
    ['1602', 'Outras preparações e conservas de carne ou de miudezas (Presunto, mortadela, peito de peru)', 3],

    // ==========================================
    // 4. AÇOUGUE E PEIXARIA (ID 4)
    // ==========================================
    ['0201', 'Carnes de animais da espécie bovina, frescas ou resfriadas', 4],
    ['0203', 'Carnes de animais da espécie suína, frescas ou resfriadas', 4],
    ['0207', 'Carnes e miudezas comestíveis, de aves, frescas ou resfriadas', 4],
    ['0302', 'Peixes frescos ou resfriados, exceto os filés e outra carne de peixe', 4],

    // ==========================================
    // 5. HORTIFRÚTI (ID 5)
    // ==========================================
    ['0407', 'Ovos de aves, com casca, frescos', 5],
    ['0701', 'Batatas, frescas ou resfriadas', 5],
    ['0702', 'Tomates, frescos ou resfriados', 5],
    ['0709', 'Outros produtos hortícolas, frescos ou resfriados', 5],
    ['0803', 'Bananas, incluindo as plantain, frescas ou secas', 5],
    ['0808', 'Maçãs, peras e marmelos, frescos', 5],
    ['0809', 'Damascos, cerejas, pêssegos, ameixas, frescos', 5],

    // ==========================================
    // 6. PADARIA E CONFEITARIA (ID 6)
    // ==========================================
    ['1905', 'Produtos de padaria frescos (Pães, bolos, tortas e salgados do dia)', 6],
    ['1704', 'Produtos de confeitaria sem cacau (Doces, paçocas e confeitos)', 6],

    // ==========================================
    // 7. CONGELATOS (ID 7)
    // ==========================================
    ['0202', 'Carnes de animais da espécie bovina, congeladas', 7],
    ['0203', 'Carnes de animais da espécie suína, congeladas', 7],
    ['0207', 'Carnes e miudezas comestíveis, de aves, congeladas', 7],
    ['0303', 'Peixes congelados, exceto os filés e outra carne de peixe', 7],
    ['0306', 'Crustáceos (camarões, lagostas), congelados', 7],
    ['0710', 'Produtos hortícolas, cozidos ou não em água, congelados (Legumes e ervilhas)', 7],
    ['0811', 'Frutos e frutas não cozidos ou cozidos em água, congelados (Polpas)', 7],
    ['1902', 'Massas alimentícias congeladas (Lasanhas, pizzas)', 7],
    ['2004', 'Outros vegetais preparados ou conservados, congelados (Batatas pré-fritas)', 7],
    ['2105', 'Sorvetes e gelados comestíveis, mesmo contendo cacau (Açaí, picolés)', 7],

    // ==========================================
    // 8. HIGIENE E PERFUMARIA (ID 8)
    // ==========================================
    ['3004', 'Medicamentos constituídos por produtos misturados para fins terapêuticos ou profiláticos (MIPs)', 8],
    ['3005', 'Pastas de algodão, gaze, ataduras e artigos análogos (Curativos)', 8],
    ['3305', 'Produtos para os cabelos (Xampus, condicionadores, tinturas)', 8],
    ['3306', 'Preparações para higiene bucal ou dentária (Cremes dentais, fios)', 8],
    ['3307', 'Preparações para barbear, desodorantes corporais, sais de banho', 8],
    ['3401', 'Sabonetes; produtos e preparações para lavagem da pele em barra ou líquido', 8],
    ['4014', 'Artigos de higiene ou de farmácia, de borracha vulcanizada (Preservativos)', 8],
    ['4818', 'Papel higiênico e semelhantes, lenços, toalhas de papel e guardanapos', 8],
    ['9619', 'Absorventes e tampões higiênicos, fraldas para bebês e artigos semelhantes', 8],

    // ==========================================
    // 9. LIMPEZA (ID 9)
    // ==========================================
    ['2828', 'Hipocloritos, cloretos, cloratos (Água sanitária e desinfetantes clorados)', 9],
    ['3402', 'Agentes orgânicos de superfície; preparações tensoativas (Detergentes, sabão em pó, amaciantes)', 9],
    ['3405', 'Ceras, cremes e preparações similares para limpeza e polimento (Lustra-móveis, saponáceos)', 9],
    ['3605', 'Fósforos, exceto os artigos de pirotecnia (Fósforos de cozinha)', 9],
    ['3808', 'Inseticidas, rodenticidas, fungicidas, herbicidas (Desinfetantes domésticos e raticidas)', 9],
    ['3923', 'Artigos para transporte ou embalagem, de plástico (Sacos de lixo)', 9],
    ['3924', 'Outros artefatos de mesa, de cozinha, de uso doméstico, de plástico (Bacias, potes)', 9],
    ['6805', 'Papel ou cartão abrasivo (Palha de aço / esponjas de limpeza)', 9],
    ['9603', 'Vassouras, escovas, esfregões e rodos', 9],
  ];

  for (const item of fromToData) {
    await db.runAsync(
      `INSERT OR REPLACE INTO from_to_group (id_external, description, id_group) VALUES (?, ?, ?);`,
      [item[0], item[1], item[2]]
    );
  }
}