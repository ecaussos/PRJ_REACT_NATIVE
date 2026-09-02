# 🛒 Projeto Lista de Compras

Aplicação backend desenvolvida em **REACT NATIVE** para gerenciamento de listas de compras e controle de histórico de abastecimento doméstico/comercial via leitura de código de barras (GTIN).

---

## 📌 1. Visão Geral & Objetivos

* **Nome do Projeto:** Lista de Compras
* **Objetivo:** Criar e gerenciar dinamicamente uma lista de compras à medida que os produtos acabam ou são descartados, utilizando a leitura do código de barras (GTIN).
* **Necessidade Atual:** Automação na criação de listas de compras com identificação rápida de produtos e integração com banco de dados local e serviços externos de catálogo.

---

## 💡 2. Solução Proposta

1. **Identificação por GTIN:** Leitura do código de barras do produto.
2. **Cadastro Automático via API Externa:**
   * **Se o produto existe na base local:** É adicionado diretamente à lista de compras.
   * **Se o produto não existe:** O sistema consulta uma API externa (Cosmos GTIN API). Ao encontrar o produto, efetua o cadastro automático e o insere na lista.
   * **Se o produto não é encontrado ou ocorre falha:** Permite o cadastro manual.
3. **Gerenciamento da Lista de Compras:**
   * Apresentação dos itens agregados com suas respectivas quantidades.
   * Organização visual e lógica agrupada por categoria/grupo de produtos.
4. **Execução e Finalização da Compra:**
   * Ao marcar o item como comprado, o usuário informa a quantidade final e o valor unitário.
   * Associação obrigatória a um **Mercado/Fornecedor (Supplier)**.
   * Cálculo automático do valor total da compra.
   * **Transferência de Estado:** Produtos comprados são removidos da lista e gravados na tabela de **Histórico de Compras** (`hist_buy`). Itens não comprados permanecem na lista para compras futuras.
   * **Fluxo sem Lista:** Suporte a compras diretas/avulsas no mercado sem necessidade de pré-existência na lista de compras.

---

## 🔄 3. Resumo dos Fluxos de Processo:

* ###  **[A]** Realizar a leitura do código de Barra Produto;
* ### **[B]** Consulta produto:
    * **Objeto**:
        * Product (Entidade do Produto)
        * Group (Entidade do Grupo/Categoria)
        * FromToGroup (Mapeamento De/Para de categorias externas)
    * **Elementos**:
        * Banco de Dados (Repositórios JPA locais)
        * API Externa (CosmosGtinClient via RestClient)
    * **Ações Principais**:
        * Consulta (Busca produto cadastrados)
        * Cadastro/Adição (Consulta produto API e cadastra)
    * **Cenários e Regras de Decisão**:
        * Se produto Existe BD: Adiciona a lista de compra;
        * Se produto Não Existe BD: Consulta na API;
        * Se produto Existe API: Cadastra e adcionar na lista de compra;
        * Se produto Não Existe API: Casdastro Manual e adciona na lista de compra;
        * Se Falha Comunicação API: Casdastro Manual e adciona na lista de compra.
* ### **[C]** Lista de compra:
    * **Objeto**:
        * Product (Entidade do Produto)
        * ListBuy (Entidade da Lista de Compras)
    * **Elementos**:
        * Banco de Dados (Repositórios JPA locais)
    * **Ações Principais**:
        * Consulta (Buscar produtos cadastrados na lista de compra)
        * Cadastro/Adição (Adicionar ou incrementar itens na lista)
    * **Cenários e Regras de Decisão**:
        * Produto existe: Atualiza quantidade no produto existente;
        * Produto não existe: Adicionar produto a lista.
* ### **[D]** Realizar compra:
    * Busca/Verifica lista compra;
    * **Cenário**:
        * Lista existe: Monta lista de compra;
        * Lista não exite: Inicia compra sem Lista.
* ### **[E]** Compra com Lista:
    * Utiliza a Lista de compra montada;
    * **Ações Principais**:
        * Apresenta lista do produto (Organiza produto por grupo);
        * Seleciona o produto, valida quantidade e informar valor;
        * Informa o fornecedor (Mercado);
        * Finaliza a compra.
    * **Cenários e Regras de Decisão**:
        * Produto selecionado: remove lista de compra e grava na "histórico de compras";
        * Produto não selecionado: Mantém produto na lista de compra.
* ### **[F]** Compra Sem Lista:
    * Adiciona produtos;
    * **Ações Principais**:
        * Adiciona produto e informa quantidade e valor;
        * Informa o fornecedor (|Mercado);
        * Finaliza a compra.
    * **Cenários e Regras de Decisão**:
        * Produto comprados: grava compra realizada no "histórico de compras".
---

## 📑 4. Detalhamento Técnico dos Fluxos

### **[A]** Leitura de Código de Barras

O usuário aciona o recurso de scanner de código de barras diretamente pela interface da aplicação móvel.

#### 📍 Pontos de Acesso (Menu)
1. **Menu Principal** -> **Leitor de Código**
2. **Menu Principal** -> **Lista de Compras** -> Adicionar Produto -> **Escanear Código**

#### ⚙️ Ações Executadas pelo Sistema
* **Navegação:** O usuário seleciona uma das opções de entrada do scanner.
* **Permissões:** O sistema solicita e valida o acesso à câmera do dispositivo físico utilizando o `expo-camera`.
* **Captura:** A câmera é ativada e o componente de leitura passa a monitorar o ambiente.
* **Processamento:** Ao enquadrar o código, o sistema aplica um mecanismo de *debounce* para evitar leituras duplicadas e extrai a string numérica correspondente.

#### 🔄 Fluxo de Componentes e Chamadas
##### **Caminho 1: Via Menu Principal**
`index.tsx` ➔ `/scanner` ➔ `_layout.tsx` ➔ `scanner.tsx` (QuickScanner) ➔ `buyList.form.tsx` (BuyListCameraModal) ➔ `barcodeScannerScreen.tsx` (CameraView / useCameraPermissions) ➔ `ProductModel.checkBarcode()` ➔ `BuyListModel.create()`

##### **Caminho 2: Via Lista de Compras**
`index.tsx` ➔ `/buyList` ➔ `_layout.tsx` ➔ `buyList.tsx` ➔ `buyList.screen.tsx` ➔ `buyList.form.tsx` (BuyListActions / handleOpenCamera) ➔ `buyList.form.tsx` (BuyListCameraModal) ➔ `barcodeScannerScreen.tsx` ➔ `ProductModel.checkBarcode()` ➔ `dispatch({ type: 'CREATE' })`


### **[B]** Consulta e Resolução de Produto

O usuário realiza a consulta de um produto para verificar sua existência na base de dados, com suporte a consulta em API externa e fallbacks para cadastro manual.

#### 📍 Pontos de Acesso (Menu)
1. **Menu Principal** -> **Catálogo de Produtos** -> Consultar Produto
2. **Menu Principal** -> **Lista de Compras** -> Adicionar Produto -> **Consulta / Código de Barras**

#### ⚙️ Ações Executadas pelo Sistema
* **Consulta Local:** O sistema verifica se o produto já existe no banco de dados utilizando repositórios JPA locais (`Product`, `Group`, `FromToGroup`).
* **Consulta Externa (Fallback 1):** Caso o produto não exista localmente, o sistema aciona o `CosmosGtinClient` via `RestClient` para buscá-lo na API externa.
* **Cadastro Automático:** Se encontrado na API, o produto é cadastrado na base local (mapeando a categoria via `FromToGroup`) e adicionado à lista de compras.
* **Cadastro Manual (Fallback 2):** Caso o produto não seja encontrado na API ou ocorra falha de comunicação, o fluxo é direcionado para o cadastro manual antes de ser adicionado à lista.

#### 🔄 Fluxo de Componentes e Chamadas
##### **Caminho 1: Produto Encontrado no Banco Local**
`ProductModel.checkBarcode()` ➔ `ProductRepository.findByGtin()` ➔ [Produto Encontrado] ➔ `BuyListModel.create()` (Adicionado à Lista)

##### **Caminho 2: Produto Encontrado na API Externa**
`ProductModel.checkBarcode()` ➔ [Não Encontrado Localmente] ➔ `CosmosGtinClient.fetch()` ➔ [Encontrado na API] ➔ `ProductRepository.save()` (Com mapeamento `FromToGroup`) ➔ `BuyListModel.create()`

##### **Caminho 3: Produto Não Encontrado na API / Falha de Comunicação**
`ProductModel.checkBarcode()` ➔ `CosmosGtinClient.fetch()` ➔ [Não Encontrado ou Erro de Rede] ➔ Tela de **Cadastro Manual** ➔ `ProductRepository.save()` ➔ `BuyListModel.create()`


### **[C]** Gestão da Lista de Compras

O usuário gerencia os itens dentro da sua lista de compras, realizando consultas e adicionando novos produtos ou atualizando as quantidades daqueles que já foram inseridos.

#### 📍 Pontos de Acesso (Menu)
1. **Menu Principal** -> **Lista de Compras**
2. **Tela de Adição de Produtos** -> Confirmação de Inserção na Lista

#### ⚙️ Ações Executadas pelo Sistema
* **Consulta:** O sistema busca e exibe todos os produtos cadastrados e vinculados à lista de compras ativa no momento.
* **Adição e Incremento:** O sistema gerencia a inclusão de novos itens ou a atualização de quantidades para manter a lista organizada e sem duplicidade desnecessária.
* **Persistência Local:** Todas as alterações são salvas diretamente no banco de dados local por meio dos repositórios correspondentes.

#### 🔀 Cenários e Regras de Decisão
* **Cenário 1 (Produto Já Existe na Lista):**
  * O sistema verifica que o item selecionado já está presente na lista de compras atual.
  * **Ação:** O sistema atualiza e incrementa a quantidade do produto existente, em vez de criar uma nova linha duplicada.

* **Cenário 2 (Produto Não Existe na Lista):**
  * O sistema identifica que o item ainda não foi adicionado à lista de compras.
  * **Ação:** O sistema adiciona o novo produto à lista com a quantidade inicial definida.

#### 🔄 Fluxo de Componentes e Chamadas
##### **Caminho 1: Produto já existente (Incremento de Quantidade)**
`buyList.tsx` ➔ `buyList.screen.tsx` ➔ `ListBuyRepository.findByProduct()` ➔ [Produto Existente] ➔ `ListBuyModel.updateQuantity()` ➔ Atualização de Estado

##### **Caminho 2: Novo produto (Adição à Lista)**
`buyList.tsx` ➔ `buyList.screen.tsx` ➔ `ListBuyRepository.findByProduct()` ➔ [Não Encontrado na Lista] ➔ `ListBuyModel.create()` ➔ Persistência no Banco Local


### **[E]** Compra com Lista:
 * Pendente

### **[F]** Compra Sem Lista:
 * Pendente

---

## 🏗️ 5. Arquitetura e Estrutura do Projeto
## 📐 Padrão Arquitetural: MVI (Model-View-Intent) e Modularização

O projeto adota uma arquitetura limpa combinando o padrão **MVI (Model-View-Intent)** com uma **Estrutura Modular baseada em Domínios**, garantindo fluxo de dados unidirecional, separação clara de responsabilidades, alta coesão e facilidade de manutenção.

### 🔄 Os Componentes do MVI
* **Model (Modelo):**
  * Representa o estado imutável da aplicação e a camada de dados (como o banco SQLite local). Ele dita exatamente como a interface deve se parecer em um determinado momento com base nos dados persistidos.
* **View (Visualização):**
  * Responsável por renderizar a interface gráfica e refletir o estado atual da aplicação. Ela captura as interações do usuário e as encaminha para processamento.
* **Intent (Intenção):**
  * Representa as ações ou eventos disparados quando o usuário interage diretamente com a interface do aplicativo (por exemplo, ao pressionar o botão "Adicionar Produto"), dando início ao fluxo de processamento de dados.

### 📂 Fluxo Organizacional e Camadas

O funcionamento do projeto segue uma hierarquia organizada em camadas:

1. **Apresentação:** As rotas e telas do usuário chegam através da camada de visualização (`app/` e `features/...screen.tsx`).
2. **Regras de Negócio:** Estados locais e lógicas customizadas são centralizados nos ganchos e modelos (`...hook.ts` e `...model.ts`).
3. **Persistência de Dados:** Os dados e entidades são estruturados e salvos localmente utilizando o SQLite (`core/database/` e `data/entities/`).
4. **Repositórios:** O acesso e a manipulação dos dados no banco ocorrem de forma isolada através da camada de repositórios (`data/repositories/`).
5. **Componentes de Apoio:** Elementos reutilizáveis, modais e formulários dão suporte à interface visual de cada funcionalidade (`features/`).

### Estrutura:
```text
   src/                                  # Diretório principal do código fonte
   ├── app/                              # Rotas e telas principais do Expo Router
   ├── assets/                           # Arquivos estáticos (imagens, fontes, ícones)
   ├── core/                             # Núcleo da arquitetura, cliente SQLite e migrações
   ├── data/                             # Camada de dados (Entities e Repositories)
   │   ├── entities/                     # Definição dos modelos estruturados de dados
   │   └── repositories/                 # Regras de acesso e manipulação de dados locais
   └── features/                         # Módulos organizados por domínio/funcionalidade
       ├── buyHist/                      # Histórico de compras (Hook, Model, Screen, Types)
       ├── buyList/                      # Lista de compras e Scanner (Form, Hook, Model, Screen, Styles, Types)
       ├── groupProduct/                 # Grupos de produtos (Form, Hook, Model, Screen, Styles, Types)
       ├── product/                      # Cadastro de produtos (Form, Hook, Model, Screen, Styles, Types)
       └── supplier/                     # Gerenciamento de fornecedores (Form, Hook, Model, Screen, Styles, Types)
```

### 📂 Árvore Completa de Componentes
```text
   src/                                  # Diretório principal do código fonte
   ├── app/                              # Rotas e telas principais do Expo Router
   │   ├── buy.tsx                       # Tela de compras (gerenciamento de compras)
   │   ├── buyHist.tsx                   # Tela de histórico de compras
   │   ├── buyList.tsx                   # Tela principal da lista de compras
   │   ├── groupProduct.tsx              # Tela de grupos de produtos
   │   ├── index.style.ts                # Estilos da página inicial
   │   ├── index.tsx                     # Tela inicial (Dashboard/Home) do aplicativo
   │   ├── product.tsx                   # Tela de gerenciamento de produtos
   │   ├── scanner.tsx                   # Tela de leitura de código de barras
   │   ├── supplier.tsx                  # Tela de gerenciamento de fornecedores
   │   └── _layout.tsx                   # Layout global/navegador das rotas
   ├── assets/                           # Arquivos estáticos (imagens, fontes, ícones)
   │   └── images/                       # Imagens utilizadas no app
   │       └── logo_listbuy.jpeg         # Logotipo oficial da aplicação
   ├── core/                             # Núcleo da arquitetura e configurações globais
   │   ├── api/                          # Integrações com APIs externas (se houver)
   │   └── database/                     # Configuração e persistência local (SQLite)
   │       ├── sqliteclient.ts           # Cliente de conexão com o banco SQLite
   │       └── migrations/               # Migrações do banco de dados (evolução do schema)
   │           ├── index.ts              # Executor central das migrações
   │           ├── v1_supplier.ts        # Migração: Tabela de Fornecedores
   │           ├── v2_group_product.ts   # Migração: Tabela de Grupos de Produtos
   │           ├── v3_product.ts         # Migração: Tabela de Produtos
   │           ├── v4_list_buy.ts        # Migração: Tabela de Lista de Compras
   │           ├── v5_insert_group.ts    # Migração: Dados iniciais para Grupos
   │           ├── v6_from_to_group.ts   # Migração: Ajustes/Relacionamentos de Grupos
   │           ├── v7_insert_from_to.ts  # Migração: Inserção de dados relacionais
   │           └── v8_hist_buy.ts        # Migração: Tabela de Histórico de Compras
   ├── data/                             # Camada de dados (Entities e Repositories)
   │   ├── entities/                     # Definição dos tipos/modelos estruturados de dados
   │   │   ├── buyHistEntity.ts          # Entidade do Histórico de Compras
   │   │   ├── buyListEntity.ts          # Entidade da Lista de Compras
   │   │   ├── groupProductEntity.ts     # Entidade de Grupos de Produtos
   │   │   ├── productEntity.ts          # Entidade de Produtos
   │   │   └── supplierEntity.ts         # Entidade de Fornecedores
   │   └── repositories/                 # Regras de acesso e manipulação de dados
   │       ├── buyHistRepository.ts      # Repositório de dados do Histórico
   │       ├── buyListRepository.ts      # Repositório de dados da Lista de Compras
   │       ├── groupProductRepository.ts # Repositório de dados de Grupos
   │       ├── productRepository.ts      # Repositório de dados de Produtos
   │       └── supplierRepository.ts     # Repositório de dados de Fornecedores
   └── features                          # Módulos organizados por domínio/funcionalidade
       ├── buyHist/                      # Funcionalidade de Histórico de Compras
       │   ├── buyHist.hook.ts           # Regras e estados customizados do Histórico
       │   ├── buyHist.model.ts          # Regras de negócio do Histórico
       │   ├── buyHist.screen.tsx        # Interface visual do Histórico
       │   └── buyHist.types.ts          # Tipagens específicas do Histórico
       ├── buyList/                      # Funcionalidade da Lista de Compras
       │   ├── barcodeScanner.styles.ts  # Estilos do scanner de código de barras
       │   ├── barcodeScannerScreen.tsx  # Tela de escaneamento de produtos
       │   ├── buyList.form.tsx          # Formulário de adição/edição na Lista
       │   ├── buyList.hook.ts           # Regras e estados da Lista de Compras
       │   ├── buyList.model.ts          # Regras de negócio da Lista de Compras
       │   ├── buyList.screen.tsx        # Interface visual principal da Lista
       │   ├── buyList.styles.ts         # Estilos da Lista de Compras
       │   └── buyList.types.ts          # Tipagens específicas da Lista
       ├── groupProduct/                 # Funcionalidade de Grupos de Produtos
       │   ├── groupProduct.form.tsx     # Formulário de cadastro/edição de Grupos
       │   ├── groupProduct.hook.ts      # Regras e estados de Grupos
       │   ├── groupProduct.model.ts     # Regras de negócio de Grupos
       │   ├── groupProduct.screen.tsx   # Interface visual de Grupos
       │   ├── groupProduct.styles.ts    # Estilos de Grupos
       │   └── groupProduct.types.ts     # Tipagens específicas de Grupos
       ├── product/                      # Funcionalidade de Produtos
       │   ├── product.form.tsx          # Formulário de cadastro/edição de Produtos
       │   ├── product.hook.ts           # Regras e estados de Produtos
       │   ├── product.model.ts          # Regras de negócio de Produtos
       │   ├── product.screen.tsx        # Interface visual de Produtos
       │   ├── product.styles.ts         # Estilos de Produtos
       │   └── product.types.ts          # Tipagens específicas de Produtos
       └── supplier/                     # Funcionalidade de Fornecedores
           ├── supplier.form.tsx         # Formulário de cadastro/edição de Fornecedores
           ├── supplier.hook.ts          # Regras e estados de Fornecedores
           ├── supplier.model.ts         # Regras de negócio de Fornecedores
           ├── supplier.screen.tsx       # Interface visual de Fornecedores
           ├── supplier.styles.ts        # Estilos de Fornecedores
           └── supplier.types.ts         # Tipagens específicas de Fornecedores
```
## 🗄️ 6. Mapeamento de Entidades e Modelo de Dados
* ### `Supplier` (Fornecedor)
  * **Tabela no Banco**: `supplier`
  * **Descrição**: Cadastro de fornecedores, estabelecimentos comerciais e supermercados.
  * **Atributos**:
    * **id_supplier** (Integer) - Identificador único universal gerado automaticamente (coluna `id_supplier`).
    * **nm_supplier** (String) - Nome do fornecedor (obrigatório, coluna `name_supplier`).

* ### `Group` (Grupo / Categoria de Produto)
  * **Tabela no Banco**: `groups`
  * **Descrição**: Representa as categorias/grupos de produtos dentro do sistema.
  * **Atributos**:
    * **id_group** (Integer) - Identificador único gerado manualmente ou via sequência.
    * **nm_group** (String) - Nome do grupo/categoria (obrigatório).

* ### `Product` (Produto)
  * **Tabela no Banco**: `product`
  * **Descrição**: Cadastro completo de produtos comercializados ou consumidos.
  * **Atributos**:
    * **id_product** (Integer) - Identificador único universal gerado automaticamente.
    * **nm_product** (String) - Nome descritivo do produto (obrigatório, coluna `nm_product`).
    * **id_group** (Integer) - Relacionamento ManyToOne com a entidade Group (obrigatório, coluna `id_group`).
    * **cd_product_gtin** (String) - Código de barras / GTIN do produto (opcional, coluna `cd_product_gtin`).

* ### `ListBuy` (Item da Lista de Compras)
  * **Tabela no Banco:** `list_buy`
  * **Descrição:** Gerencia os itens atualmente presentes na lista de compras pendente.
  * **Atributos**:
    * **id_list_buy** (Integer) - Identificador único universal gerado automaticamente (coluna `id_list_buy`).
    * **id_product** (Integer) - Relacionamento ManyToOne com o produto associado (obrigatório, coluna `id_product`).
    * **qt_product** (Real) - Quantidade do produto na lista (obrigatório, coluna `qt_product`).
    * **fl_bought** (Integer) - Indicador de status se o item já foi comprado ou não (padrão `false`, coluna `fl_bought`).
    * **dt_list_buy** (Text) - Data e hora do registro/atualização na lista (obrigatório, coluna `dt_list_product`).

* ### `FromToGroup` (De/Para de Categorias Externas)
  * **Tabela no Banco:** `from_to_group`
  * **Descrição:** Tabela de de-para para relacionar taxonomias de APIs externas aos grupos internos.
  * **Atributos**:
    * **parent_id** (Integer) - Identificador da categoria pai vindo da API externa.
    * **description** (String) - Descrição da categoria externa mapeada.
    * **id_group** (Integer) - Relacionamento ManyToOne com o Group interno correspondente.

* ### `HistBuy` (Histórico de Compras)
  * **Tabela no Banco:** `hist_buy`
  * **Descrição:** Registra a efetivação das compras e seu histórico para análises financeiras e de consumo.
  * **Atributos**:
    * **id_hist_buy** (Integer) - Identificador único universal gerado automaticamente (coluna id_hist_buy).
    * **id_supplier** (Integer) - Relacionamento ManyToOne com o fornecedor onde a compra foi realizada (obrigatório, `coluna id_supplier`).
    * **id_product** (Integer) - Relacionamento ManyToOne com o produto comprado (obrigatório, `coluna id_product`).
    * **qt_product** (Real) - Quantidade do produto comprado (obrigatório, coluna `qt_product`).
    * **vl_product** (Real) - Valor unitário pago pelo produto (obrigatório, `coluna vl_product`).
    * **dt_list_buy** (Text) - Data e hora original em que o item foi inserido na lista de compras (obrigatório, coluna `dt_list_buy`).
    * **dt_hist_buy** (Text) - Data e hora em que a compra foi efetivamente realizada (obrigatório, coluna `dt_hist_buy`).
---

## 🧩 7. Mapeamento de Componentes e Estrutura de Dados

Esta seção detalha a arquitetura de componentes da aplicação mobile, focando na estrutura de dados local, modelos e gerenciamento de estado utilizados no ambiente React Native com Expo.

#### 🗂️ Modelos e Entidades Locais
* **Product (Produto):**
  * **Tipo:** Interface / TypeScript Model
  * **Atributos Principais:** `id_product` (Identificador Único), `cd_product_gtin` (Código de Barras), `nm_product` (Nome), `id_group_product` (Chave estrangeira para o grupo/categoria)..
  * **Relacionamentos:** Vinculado a uma categoria/grupo (`Group`).
* **Group (Categoria/Grupo):**
  * **Tipo:** Interface / TypeScript Model
  * **Atributos Principais:** `id_group_product` (Identificador Único), `nm_group` (Nome da Categoria/Grupo).
* **ListBuy (Lista de Compras):**
  * **Tipo:** Interface / TypeScript Model
  * **Atributos Principais:** `id_list_buy` (Identificador), `id_product` (Referência ao Produto), `qt_product` (Quantidade do item na lista).

#### 🔌 Camada de Dados e Serviços
* **ProductModel / ProductRepository:**
  * **Função:** Responsável por gerenciar as regras de negócio locais do produto, verificar códigos de barras e realizar chamadas à API externa de produtos (via `fetch` / cliente HTTP).
* **ListBuyModel / ListBuyRepository:**
  * **Função:** Gerencia a persistência local da lista de compras utilizando métodos como `BuyListModel.create` e atualiza o estado da aplicação através de ações mapeadas..
* **Expo Camera & Barcode Scanner:**
  * **Função:** Integração nativa via `expo-camera` por meio de `CameraView` e do hook `useCameraPermissions` para leitura de códigos GTIN/EAN
* **CosmosGtinClient:**
  * **Função:** Serviço cliente responsável por consumir a API externa de consulta de GTIN diretamente do aplicativo mobile.

#### 🔤 Glossário de Componentes e Padrões
* **Action / Dispatch:** Funções ou objetos que descrevem uma intenção de mudança de estado na aplicação, muito comuns no gerenciamento de estado global ou local (ex: dispatch({ type: 'CREATE' })).
* **Form:** Componentes ou arquivos focados na captura de entrada de dados do usuário (formulários, validações, campos de texto e modais de input, ex: `buyList.form.tsx`).
* **Hook:** Funções personalizadas do React/React Native que encapsulam lógica reutilizável e gerenciamento de estado ou efeitos colaterais (ex: gerenciamento de permissões de câmera ou requisições).
* **Layout:** Componentes de estrutura ou navegação global (ex: `_layout.tsx`) que definem o esqueleto visual compartilhado ou os wrappers de rotas da aplicação.
* **Mock / API Externa:** Serviço web utilizado para buscar informações complementares do produto através do código de barras quando ele não é encontrado localmente no dispositivo.
* **Modal:** Componentes flutuantes ou sobrepostos que aparecem em cima da tela atual para interações rápidas e pontuais (ex: modais de câmera ou formulários rápidos).
* **Model:** Camada responsável pelas regras de negócio, manipulação de dados locais e lógica interna das entidades do aplicativo.
* **Persistência Local:** Mecanismo de armazenamento de dados diretamente no dispositivo móvel (como SQLite, MMKV ou AsyncStorage) para manter o histórico da lista de compras e o catálogo de produtos salvos mesmo após fechar o aplicativo.
* **Reducer:** Função que determina como o estado da aplicação é atualizado em resposta a uma ação disparada.
* **Screen:** Componentes que representam telas completas da aplicação, mapeadas diretamente para as rotas de navegação (ex: `buyList.screen.tsx`, `barcodeScannerScreen.tsx`).
* **Service / Repository:** Camadas ou funções isoladas responsáveis por gerenciar o acesso a dados locais, persistência ou comunicação com serviços externos.
* **Styles:** Arquivos ou objetos dedicados exclusivamente à estilização visual dos componentes utilizando o StyleSheet do React Native, garantindo a separação de responsabilidades.
* **Types:** Arquivos de definição de tipos e interfaces em TypeScript (`.ts`), garantindo a tipagem estática de entidades, estados, rotas e propriedades do sistema.
---

## 🗄️ 8. Estrutura do Banco de Dados (`listbuy`)
* **supplier**
  * `id_supplier` `[PK]`
  * `nm_supplier`
* **group_product**
  * `id_group` `[PK]`
  * `nm_group`
* **product**
  * `id_product` `[PK]`
  * `nm_product`
  * `id_group` `[FK]`
  * `cd_product_gtin`
* **from_to_group**
  * `parent_id` `[PK]`
  * `description`
  * `id_group` `FK`
* **list_buy**
  * `id_list_buy`
  * `id_product` `[FK]`
  * `qt_product`
  * `fl_bought`
  * `dt_list_buy`
* **hist_buy**
  * `id_hist_buy` `[PK]`
  * `id_supplier` `[FK]`
  * `id_product` `[FK]`
  * `vl_product`
  * `qt_product`
  * `dt_buy`
  * `dt_list_buy`

### 📐 Diagrama de Entidade-Relacionamento (DER) / Diagrama de Classes UML
```text
   +-----------------------+          +-----------------------+   +-----------------+
   | PRODUCT               |          | GROUP_PRODUCT         |   | SUPPLIER        |
   +-----------------------+(1)       +-----------------------+   +-----------------+
   | PK | id_product       |----------| PK | id_group_product |   | PK |id_supplier |
   | FK | id_group_product |       (*)|    | nm_group_product |   |    |nm_supplier |
   |    | nm_product       |          +-----------------------+   +-----------------+
   |    | cd_product_gtin  |(1)            |(1)                       |(1)
   +-----------------------+---------------|---------------+          |
     |(1)                                  |(*)            |(*)       |(*)
     |   +-------------------+   +------------------+   +------------------+
     |   | LIST_BUY          |   | FROM_TO_GROUP    |   | HIST_BUY         |
     |   +-------------------+   +------------------+   +------------------+
     |   | PK | id_list_item |   | PK | parent_id   |   | PK | id_hist_buy |
     |(1)| FK | id_product   |   |    | description |   | FK | id_supplier |
     +-- |    | id_list_buy  |   | FK | id_group    |   | FK | id_product  |
         |    | qt_product   |   +------------------+   |    | vl_product  |
         |    | fl_bought    |                          |    | qt_product  |
         |    | dt_list_buy  |                          |    | dt_buy      |
         +-------------------+                          |    | dt_list_buy |
                                                        +------------------+
```

### 🚀 Scripts de Criação do Banco de Dados (Flyway Migrations)
```text
  \src\main\resources\db\migration
     │
     ├── V1__create_table_supplier.sql         # Criação da tabela de fornecedores (`supplier`)
     ├── V2__create_table_group.sql            # Criação da tabela de grupos ou categorias (`groups`)
     ├── V3__create_table_product.sql          # Criação da tabela de produtos (`product`) vinculada aos grupos
     ├── V4__create_table_list_buy.sql         # Criação da tabela de itens da lista de compras (`list_buy`) vinculada aos produtos
     ├── V5__insert_table_group.sql            # Inserção de registros iniciais (dados padrão) na tabela de grupos
     ├── V6__create_table_from_to_group.sql    # Criação da tabela de De/Para de categorias externas (`from_to_group`)
     ├── V7__insert_table_from_to_group.sql    # Inserção de dados iniciais de mapeamento na tabela `from_to_group`
     └── V8__insert_table_hist_buy.sql         # Criação da tabela de histórico (`hist_buy`) vinculada aos produtos e supplier.
```
---

## 9. 🛠️  Ambiente de Desenvolvimento

### 🧰 Ferramentas e Softwares Essenciais
* `Node.js (LTS):` Ambiente de execução JavaScript e gerenciamento de pacotes (npm).
* `Visual Studio Code(VS Code):` IDE recomendada para escrita e gestão do código mobile.
* `Git:` Sistema de controle de versão para o código-fonte.
* `Expo Go:` Aplicativo para testes e execução rápida no dispositivo físico via QR Code.

### 📦 Dependências e Bibliotecas
**React Native / Expo SDK:**
* `expo:` Framework principal e ecossistema de desenvolvimento mobile (v57).
* `expo-router:` Sistema de navegação baseado em arquivos para telas e rotas.
* `expo-sqlite:` Persistência de dados local no dispositivo móvel.

**Outras Bibliotecas**
* `TypeScript:` Superset do JavaScript para tipagem estática e segurança no código.
* `Expo Camera:` Acesso à câmera do dispositivo para leitura de códigos de barras.
* `@expo/vector-icons:` Biblioteca de ícones padronizados para a interface.

### 🚀 Passo a Passo para Montagem do Ambiente

#### 1. Instalação das Ferramentas
* **Visual Studio Code (VS Code)**
  * **URL:** [Download VS Code](https://code.visualstudio.com/)
  * **Versão:** Última versão disponível.
* **Node.js**
  * **URL:** [Donwload Node.js](https://nodejs.org/)
  * **Versão:** LTS (Long Term Support) recomendada.
* **Git**
  * **URL:** [Download Git](https://git-scm.com/)
  * **Versão:** Última versão disponível.


#### 2. Configuração do Projeto React Native / Expo

Como o projeto utiliza a estrutura nativa do Expo baseada em rotas de arquivos, a inicialização é feita diretamente via linha de comando (CLI) ou clonagem do repositório existente:

* **Gerenciador de Pacotes:** `npm`
* **Metadados do Projeto:**
  * **Nome do App:** `PRJ_Lista_Compra`
  * **Versão:** `1.0.0`
  * **Framework:** `React Native com Expo SDK 57`

**Dependências a Adicionar:**
* **Expo Router:** Sistema de navegação baseado em arquivos para gerenciamento de telas.
* **Expo SQLite:** Persistência de dados local integrada no dispositivo.
* **Expo Camera:** Acesso à câmera para leitura de códigos de barras (Scanner).
* **TypeScript:** Superset do JavaScript para tipagem estática e segurança do código.

#### 3. Clonar o Projeto do GitHub
Abra o terminal na pasta onde deseja salvar o projeto e execute o comando:
  ```bash
  git clone <url-do-seu-repositorio>
  cd list-buy-app
  ```

#### 4. Instalação das Dependências
Abra o terminal na pasta do projeto e execute os comandos:

* Dependências gerais do projeto
  ```bash
  npm install
```
* Módulo de banco de dados local SQLite
  ```bash
  npx expo install expo-sqlite
  ```
* Módulo de câmera para o leitor de código de barras
  ```bash
  npx expo install expo-camera
  ```
* Componente de seleção (Picker) para formulários
  ```bash
  npx expo install @react-native-picker/picker
  ```
* Instalação do pacote de ícones padronizados
  ```bash
  npx expo install @expo/vector-icons
  ```

#### 4. Executar
Abra o terminal na pasta do projeto e execute os comandos:
  ```Bash
  npx expo start -c
  ```
  
###  Outros comandos utilizados:
* Pendente