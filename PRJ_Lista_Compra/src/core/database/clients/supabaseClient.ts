// src/core/database/supabaseClient.ts

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigItem, DbClient } from '../database';

let supabaseInstance: SupabaseClient | null = null;

export function resetSupabaseInstance(): void {
  supabaseInstance = null;
}

function cleanQuery(query: string): string {
  return query.trim().replace(/;+$/, '');
}

function replaceParams(query: string, params: any[] = []): string {
  let index = 0;
  const sanitizedQuery = cleanQuery(query);

  return sanitizedQuery.replace(/\?/g, () => {
    const param = params[index++];
    if (param === null || param === undefined) return 'NULL';
    if (typeof param === 'number' || typeof param === 'boolean') return `${param}`;
    return `'${String(param).replace(/'/g, "''")}'`;
  });
}

export async function getSupabaseAdapter(config: ConfigItem): Promise<DbClient> {
  const supabaseUrl = config.url_config || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = config.key_config || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('[Supabase] ❌ URL ou Chave não configuradas.');
  }

  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
    console.log('[Supabase] 🔌 Conexão criada com sucesso.');
  }

  const client = supabaseInstance;

  async function getAllAsync<T>(query: string, params: any[] = []): Promise<T[]> {
    const formattedQuery = replaceParams(query, params);
    console.log('[SupabaseAdapter] 📤 Enviando RPC execute_sql:', formattedQuery);

    const { data, error } = await client.rpc('execute_sql', {
      query_text: formattedQuery,
    });

    if (error) {
      console.error('[SupabaseAdapter] ❌ Erro RPC:', error.message);
      throw new Error(`[Supabase Error] ${error.message}`);
    }

    console.log('[SupabaseAdapter] 📥 Resposta RPC recebida:', data);
    return (data || []) as T[];
  }

  async function getFirstAsync<T>(query: string, params: any[] = []): Promise<T | null> {
    const results = await getAllAsync<T>(query, params);
    return results.length > 0 ? results[0] : null;
  }

  async function runAsync(query: string, params: any[] = []): Promise<{ lastInsertRowId: number; changes: number }> {
    const formattedQuery = replaceParams(query, params);
    console.log('[SupabaseAdapter] 📤 Executando runAsync via RPC:', formattedQuery);

    const { data, error } = await client.rpc('execute_sql', {
      query_text: formattedQuery,
    });

    if (error) {
      console.error('[SupabaseAdapter] ❌ Erro no runAsync RPC:', error.message);
      throw new Error(`[Supabase Error] ${error.message}`);
    }

    let insertId = 0;
    if (Array.isArray(data) && data.length > 0 && data[0] && typeof data[0] === 'object') {
      const firstRow = data[0];
      const idKey = Object.keys(firstRow).find((key) => key === 'id' || key.startsWith('id_'));
      if (idKey && firstRow[idKey] !== undefined && firstRow[idKey] !== null) {
        insertId = Number(firstRow[idKey]);
      }
    }

    console.log(`[SupabaseAdapter] 📥 Executado com sucesso. Insert ID gerado: ${insertId}`);
    return { lastInsertRowId: insertId, changes: 1 };
  }

  async function execAsync(query: string): Promise<void> {
    const formattedQuery = replaceParams(query);
    console.log('[SupabaseAdapter] 📤 Executando execAsync via RPC:', formattedQuery);

    const { error } = await client.rpc('execute_sql', { query_text: formattedQuery });

    if (error) {
      // Em vez de dar throw e quebrar a inicialização do app:
      console.warn('[SupabaseAdapter] ⚠️ DDL/Exec ignorado ou não suportado na nuvem:', error.message);
      return; // Retorna com sucesso simulado para não travar o boot do app
    }
  }

  return { getAllAsync, getFirstAsync, runAsync, execAsync };
}