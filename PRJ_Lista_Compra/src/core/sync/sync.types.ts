// src/core/database/sync/sync.types.ts

export interface BaseSyncEntity {
  at_updated?: string | null;       // Data/hora da última atualização para controle de sync
  at_delete?: string | null;        // Data/hora do soft delete (exclusão lógica)
  st_sync?: number | null;          // Status da sincronização (ex: 0 = pendente, 1 = sincronizado)
}

export interface SupplierSync extends BaseSyncEntity {
  id_supplier: string;              // Identificador único do fornecedor
  nm_supplier: string;              // Nome ou razão social do fornecedor
}

export interface GroupProductSync extends BaseSyncEntity {
  id_group: string;                 // Identificador único do grupo/categoria de produtos
  nm_group: string;                 // Nome do grupo de produtos
}

export interface ProductSync extends BaseSyncEntity {
  id_product: string;               // Identificador único do produto
  nm_product: string;               // Nome do produto
  id_group?: string | null;         // Chave estrangeira para o grupo do produto (opcional)
  cd_product_gtin?: string | null;  // Código de barras (EAN/GTIN) do produto (opcional)
}

export interface FromToGroupSync extends BaseSyncEntity {
  id_external: string;              // ID externo de de-para para mapeamento de grupos
  description?: string | null;      // Descrição complementar do mapeamento (opcional)
  keywords?: string | null;         // Palavras-chave associadas para busca (opcional)
  tag?: string | null;              // Tag de classificação externa (opcional)
  id_group: string;                 // ID do grupo correspondente no sistema local
}

export interface ListBuySync extends BaseSyncEntity {
  id_list_buy: string;              // Identificador do item da lista de compras
  id_product: string;               // ID do produto vinculado ao item da lista
  qt_product: number;               // Quantidade do produto planejada na lista
  fl_bought: number;                // Flag indicando se o item já foi comprado (0/1)
  dt_list_buy?: string | null;      // Data de criação ou previsão da lista (opcional)
}

export interface HistBuySync extends BaseSyncEntity {
  id_hist_buy: string;              // Identificador do registro no histórico de compras
  id_product: string;               // ID do produto comprado
  id_supplier?: string | null;      // ID do fornecedor onde foi realizada a compra (opcional)
  qt_product: number;               // Quantidade efetivamente comprada
  vl_product: number;               // Valor unitário ou total pago pelo produto
  dt_list_buy?: string | null;      // Data de referência da lista de origem (opcional)
  dt_hist_buy?: string | null;      // Data/hora da efetivação da compra (opcional)
}

export interface BuySync extends BaseSyncEntity {
  id_product: string;               // ID do produto na transação de compra
  qt_product: number;               // Quantidade do produto na compra
  vl_product: number;               // Valor unitário ou total do produto
  dt_list_buy?: string | null;      // Data da lista associada à compra (opcional)
}

export interface ConfigTypeSync extends BaseSyncEntity {
  id_tp_config: string;             // Identificador único do tipo de configuração
  ds_tp_config: string;             // Descrição do tipo de configuração (ex: "Servidor API")
}

export interface ConfigSync extends BaseSyncEntity {
  id_config: string;                // Identificador único da configuração
  id_tp_config: string;             // ID do tipo da configuração associada
  url_config?: string | null;       // URL do servidor/endpoint para conexão (opcional)
  port_config?: number | null;      // Porta de rede para conexão (opcional)
  user_config?: string | null;      // Usuário/login de autenticação (opcional)
  key_config?: string | null;       // Chave/token de autenticação ou API key (opcional)
  vers_config?: string | null;      // Versão da API/protocolo (opcional)
  st_ssl: number;                   // Status do uso de SSL/TLS (0 = desativado, 1 = ativado)
  st_config: number;                // Status da configuração (ex: 0 = inativo, 1 = ativo)
  dt_config?: string | null;        // Data de aplicação/registro da configuração (opcional)
}