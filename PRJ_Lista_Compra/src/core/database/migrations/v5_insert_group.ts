export async function up(db: any) {
  const groupCount = await db.getFirstAsync(`SELECT COUNT(*) as count FROM group_product;`);
  if (groupCount && groupCount.count === 0) {
    await db.execAsync(`
      INSERT INTO group_product (nm_group) VALUES
        ('Mercearia'),             -- ID 1
        ('Hortifrúti'),            -- ID 2
        ('Frios e Laticínios'),    -- ID 3
        ('Bebidas'),               -- ID 4
        ('Higiene e Perfumaria'),  -- ID 5
        ('Limpeza'),               -- ID 6
        ('Não Classificados');     -- ID 7
    `);
  }
}