import { up as v1 } from './v1_supplier';
import { up as v2 } from './v2_group_product';
import { up as v3 } from './v3_product';
import { up as v4 } from './v4_list_buy';
import { up as v5 } from './v5_insert_group';
import { up as v6 } from './v6_from_to_group';
import { up as v7 } from './v7_insert_from_to';
import { up as v8 } from './v8_hist_buy';

export async function runMigrations(db: any) {
  // Habilita chave estrangeira
  await db.execAsync(`PRAGMA foreign_keys = ON;`);

  // Executa cada migration em ordem sequencial
  await v1(db);
  await v2(db);
  await v3(db);
  await v4(db);
  await v5(db);
  await v6(db);
  await v7(db);
  await v8(db);
  
  console.log('Migrações do SQLite executadas com sucesso!');
}