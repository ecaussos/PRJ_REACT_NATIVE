// src/core/database/cloudClient.ts

import 'react-native-url-polyfill/auto';
// NOTA: Usar 'import type' evita que o bundler crie a dependência circular no JS compilado
import type { ConfigItem, DbClient } from '../database';
import { getSupabaseAdapter, resetSupabaseInstance } from './supabaseClient';
import { getTursoAdapter, resetTursoInstance } from './tursoClient';

export function resetCloudInstances(): void {
  resetSupabaseInstance();
  resetTursoInstance();
}

export async function getCloudConnection(config: ConfigItem): Promise<DbClient> {
  if (!config || !config.url_config) {
    throw new Error('[CloudClient] ❌ Configuração de BD Cloud inválida.');
  }

  const isTurso = config.url_config.includes('turso.io') || config.url_config.startsWith('libsql://');

  if (isTurso) {
    console.log('[CloudClient] ⚡ Direcionando para o adaptador Turso Cloud...');
    return await getTursoAdapter(config);
  }

  console.log('[CloudClient] 🌐 Direcionando para o adaptador Supabase Cloud...');
  return await getSupabaseAdapter(config);
}