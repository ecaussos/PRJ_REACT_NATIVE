export async function up(db: any) {
  const groupCount = await db.getFirstAsync(`SELECT COUNT(*) as count FROM group_product;`);
  if (groupCount && groupCount.count === 0) {
    await db.execAsync(`
      INSERT INTO group_product (nm_group) VALUES
        ('MERCEARIA'),             -- ID 1
        ('HORTIFRÚTI'),            -- ID 2
        ('FRIOS E LATICÍNIOS'),    -- ID 3
        ('BEBIDAS'),               -- ID 4
        ('HIGIENE E PERFUMARIA'),  -- ID 5
        ('LIMPEZA'),               -- ID 6
        ('NÃO CLASSIFICADOS');     -- ID 7
    `);
  }
}