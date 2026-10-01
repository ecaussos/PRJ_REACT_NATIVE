export async function up(db: any) {
  const groupCount = await db.getFirstAsync(`SELECT COUNT(*) as count FROM group_product;`);
  if (groupCount && groupCount.count === 0) {
    await db.execAsync(`
      INSERT INTO group_product (nm_group) VALUES
      ('MERCEARIA'),             -- ID 1
      ('BEBIDAS'),               -- ID 2
      ('FRIOS E LATICÍNIOS'),    -- ID 3
      ('AÇOUGUE E PEIXARIA'),    -- ID 4
      ('HORTIFRÚTI'),            -- ID 5
      ('PADARIA E CONFEITARIA'), -- ID 6
      ('CONGELATOS'),            -- ID 7
      ('HIGIENE E PERFUMARIA'),  -- ID 8
      ('LIMPEZA'),               -- ID 9
      ('NÃO CLASSIFICADOS');     -- ID 10
    `);
  }
}