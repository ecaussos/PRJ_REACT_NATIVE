export async function up(db: any) {
  const fromToData = [
    // 1. MERCEARIA
    [21, 'Óleos, Azeites e Condimentos', 1],
    [12, 'Alimentos Básicos e Grãos', 1],
    [2,  'Mercearia Salgada', 1],
    [3,  'Mercearia Doce e Achocolatados', 1],
    [4,  'Massas, Molhos e Farinhas', 1],
    [5,  'Biscoitos, Snacks e Petiscos', 1],
    [6,  'Enlatados e Conservas', 1],
    // 2. HORTIFRÚTI
    [10, 'Frutas Frescas', 2],
    [11, 'Legumes e Verduras', 2],
    [406, 'Ovos', 2],
    [13, 'Ervas e Temperos Frescos', 2],
    // 3. FRIOS E LATICÍNIOS
    [20, 'Leites e Bebidas Lácteas', 3],
    [22, 'Queijos, Requeijão e Iogurtes', 3],
    [23, 'Manteigas e Margarinas', 3],
    [24, 'Embutidos, Frios e Charcutaria', 3],
    [25, 'Carnes, Aves e Peixes', 3],
    // 4. BEBIDAS
    [30, 'Refrigerantes e Sucos', 4],
    [31, 'Águas e Isotónicos', 4],
    [32, 'Cervejas e Bebidas Alcoólicas', 4],
    [33, 'Vinhos e Espumantes', 4],
    [34, 'Cafés e Chás', 4],
    // 5. HIGIENE E PERFUMARIA
    [40, 'Higiene Pessoal e Banho', 5],
    [41, 'Cuidados com o Cabelo', 5],
    [42, 'Higiene Bucal', 5],
    [43, 'Desodorantes e Perfumaria', 5],
    // 6. LIMPEZA
    [50, 'Limpeza de Roupas', 6],
    [51, 'Limpeza de Louças e Cozinha', 6],
    [52, 'Desinfetantes e Limpadores Gerais', 6],
    [53, 'Papéis Higiénicos e Toalhas de Papel', 6]
  ];

  for (const item of fromToData) {
    // O INSERT OR REPLACE garante que se o parent_id já existir, ele atualiza os dados
    await db.runAsync(
      `INSERT OR REPLACE INTO from_to_group (parent_id, description, id_group) VALUES (?, ?, ?);`,
      item[0], item[1], item[2]
    );
  }
}