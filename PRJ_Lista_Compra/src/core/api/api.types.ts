// src/core/api/api.types.ts

// Mapeamento dos dados do arquivo JSON local (config.json)
export interface ApiFileConfig {
  url_config: string | null;    // URL do endpoint/serviço configurado
  key_config?: string | null;   // Chave/Token de API de acesso (opcional)
  vers_config?: string | null;  // Versão da API ou nome do modelo de IA (opcional)
}
/* ------ Respostas brutas das APIs Externas ----- */

// API do Cosmos
export interface CosmosApiResponse {
  description: string;      // Descrição do produto retornada
  gtin: string;             // Código de barras (GTIN) retornado
  ncm?: {                   // Dados do NCM (opcional)
    code: string;           // Código do NCM
    description: string;    // Descrição oficial do NCM
  };
  brand?: {                 // Dados da marca (opcional)
    name: string;           // Nome da marca do produto
  };
}
// API Open Food
export interface OpenFoodApiResponse {
  status?: number | string; // Status retornado pela consulta
  status_verbose?: string;  // Descrição legível do status
  result?: {                // Resultado da requisição (v3)
    id: string;             // ID do resultado
  };
  product?: {                   // Objeto com os dados do produto (opcional)
    product_name?: string;      // Nome geral do produto
    product_name_pt?: string;   // Nome em português
    categories_tags?: string[]; // Tags das categorias
    _keywords?: string[];       // Lista de palavras-chave
    brands?: string;            // Marcas associadas
  };
}

/* ------ Resultados formatados consumidos pelos serviços internos do App ----- */
// Retorno padronizado da consulta Cosmos
export interface CosmoProductResult {
  nm_product: string; // Nome formatado do produto
  id_group: string;   // ID do grupo/categoria mapeado
  gtin: string;       // Código de barras (GTIN) do produto
}

// Retorno padronizado da consulta Open Food Facts
export interface OpenFoodProductResult {
  nm_product: string; // Nome formatado do produto
  id_group: string;   // ID do grupo/categoria mapeado
  gtin: string;       // Código de barras (GTIN) do produto
}

// Retorno padronizado da consulta Gemini AI
export interface GeminiProductResult {
  nm_product: string; // Nome comercial do produto
  id_group: string;   // ID do grupo mapeado pela IA
  gtin: string;       // Código de barras (GTIN)
}

/* ------ DTO Unificado para consumo genérico na interface (UI)  ----- */
export interface UnifiedProductDTO {
  nm_product: string;                                  // Nome padronizado do produto
  id_group: string;                                    // ID do grupo associado
  gtin: string;                                        // Código de barras (GTIN)
  source: 'cosmos' | 'openfood' | 'gemini' | 'manual'; // Origem dos dados do produto
}