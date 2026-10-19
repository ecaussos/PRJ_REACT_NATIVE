// src/database/migrations/migration.ts

import v10 from './scripts/v10_buy';
import v11 from './scripts/v11_config_tp';
import v12 from './scripts/v12_insert_config_tp';
import v13 from './scripts/v13_config';
import v14 from './scripts/v14_insert_config';
import v1 from './scripts/v1_supplier';
import v2 from './scripts/v2_group_product';
import v3 from './scripts/v3_insert_group';
import v4 from './scripts/v4_product';
import v5 from './scripts/v5_insert_product';
import v6 from './scripts/v6_from_to_group';
import v7 from './scripts/v7_insert_from_to';
import v8 from './scripts/v8_list_buy';
import v9 from './scripts/v9_hist_buy';

let migrationsPromise: Promise<void> | null = null;
let isMigrated = false;

export async function runMigrations(db: any): Promise<void> {
  // Se já rodou com sucesso nesta sessão do app, pula a execução
  if (isMigrated) {
    return;
  }

  // Se já existe uma execução em andamento, reaproveita a mesma Promessa
  if (migrationsPromise) {
    return migrationsPromise;
  }

  migrationsPromise = (async () => {
    try {
      console.log('[Migrations] 🚀 Executando migrations...');

      await v1(db);
      await v2(db);
      await v3(db);
      await v4(db);
      await v5(db);
      await v6(db);
      await v7(db);
      await v8(db);
      await v9(db);
      await v10(db);
      await v11(db);
      await v12(db);
      await v13(db);
      await v14(db);

      isMigrated = true;
      console.log('[Migrations] ✅ Todas as migrations foram concluídas com sucesso!');
    } catch (error) {
      console.error('[Migrations] ❌ Erro ao executar migrations:', error);
      throw error;
    } finally {
      migrationsPromise = null;
    }
  })();

  return migrationsPromise;
}