# 🛒 Projeto Lista de Compras

Aplicação backend desenvolvida em **Java / Spring Boot** para gerenciamento de listas de compras e controle de histórico de abastecimento doméstico/comercial via leitura de código de barras (GTIN).

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
    * **Classes**:
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
    * **Classes**:
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
* ### **[A]** Leitura código de barra:
```text
[CHAMADA]
   │ HTTP POST /list-buy/gtin [Corpo: {"gtin": "0000000000000"}]                     # Início da requisição HTTP POST para o endpoint
   └── controller/                                                                   # Pacote que armazena os controladores REST
       └── ListBuyController.java                                                    # Classe responsável por receber requisições da lista de compras
           ├── ListBuyGtinRequest                                                    # Objeto DTO que encapsula o código GTIN recebido
           │   └── dto/request                                                       # Pacote contendo as classes de dados de entrada
           │       └── ListBuyGtinRequest.java                                       # Arquivo Java do DTO de requisição por GTIN
           └── service.createByGtin(request)                                         # Chamada do método de negócio repassando a requisição
```

* ### **[B]** Consulta produto:
```text
   │
   └── service.createByGtin(request)                                                 # Entrada na camada de serviço para processar o GTIN
       └── service/                                                                  # Pacote que abriga os serviços com as regras de negócio
           └── ListBuyService.java                                                   # Classe de serviço principal da lista de compras
               ├── @Transactional                                                    # Anotação que gerencia transações com o banco de dados
               ├── Product product = productRepository.findByGtin(...)               # Busca inicial do produto no banco local pelo GTIN
               │   ├── Product                                                       # Referência à entidade de produto
               │   │   └── entity/                                                   # Pacote onde residem as entidades mapeadas do banco
               │   │       └── Product.java                                          # Definição da entidade Product (tabela product)
               │   └── productRepository.findByGtin                                  # Operação de busca por código de barras no repositório
               │       └── repository/                                               # Pacote contendo as interfaces de acesso ao banco
               │           └── ProductRepository.java                                # Interface Spring Data JPA para a entidade Product
               └── .orElseGet(() -> fetchAndSaveFromExternalApi(...)                 # Caso não ache localmente, busca e salva da API externa
                   ├── orElseGet                                                     # Método funcional do Optional para fallback
                   └── fetchAndSaveFromExternalApi                                   # Método auxiliar para buscar na API externa e cadastrar
                       └── service/                                                  # Localização da lógica de integração dentro do serviço
                           └── fetchAndSaveFromExternalApi(...)                      # Assinatura do método que consome a API de GTIN
                               ├── ExternalProductDTO externalDto                    # Objeto de transferência com dados vindos da API externa
                               │   └── dto.response/                                 # Pacote de DTOs de resposta da aplicação
                               │       └── ExternalProductDTO.java                   # Estrutura mapeada da resposta da API externa
                               ├── gtinClient.findProductByGtin(...)                 # Chamada ao cliente HTTP externo
                               │   └── infrastructure/client/                        # Pacote de infraestrutura para integração com APIs
                               │       ├── GtinClient.java                           # Interface contrato do cliente de GTIN
                               │       └── CosmosGtinClient.java                     # Implementação do cliente usando RestClient
                               │           ├── Optional<...>                         # Retorno opcional contendo o DTO externo
                               │           └── findProductByGtin(...)                # Método HTTP que executa a consulta na API Cosmos
                               ├── .orElseThrow(...)                                 # Lança exceção caso o produto não seja encontrado na API
                               │   └── ProductNotFoundByGtinException(...)           # Instanciação do erro de produto ausente na API
                               │       └── exception/                                # Pacote de exceções customizadas da aplicação
                               │           └── ProductNotFoundByGtinException.java   # Classe de exceção para GTIN não localizado
                               ├── Group group = resolveGroupFromDePara(...)         # Resolve o grupo/categoria do produto via regra De/Para
                               │   ├── Group                                         # Entidade de Grupo / Categoria
                               │   │   └── entity/                                   # Pacote de entidades de persistência
                               │   │       └── Group.java                            # Definição da tabela groups
                               │   └── resolveGroupFromDePara (...)                  # Método que trata o mapeamento de categorias
                               │       ├── Long parentId = externalDto.parentId()    # Extrai o ID da categoria pai da API
                               │       ├── (parentId == null)                        # Condicional caso o ID pai seja nulo
                               │       ├── return getOrCreateDefaultGroup()          # Retorna o grupo padrão se não houver categoria
                               │       │   ├── groupRepository.findById(...)         # Busca o grupo padrão (ID) no banco
                               │       │   │   └── repository/                       # Repositórios JPA
                               │       │   │       └── GroupRepository.java          # Interface de persistência para Group
                               │       │   ├── .orElseGet                            # Fallback caso o grupo padrão não exista
                               │       │   └── groupRepository.save(...)             # Salva o grupo padrão criado dinamicamente
                               │       └── fromToGroupRepository.findById(...)       # Busca mapeamento na tabela De/Para externa
                               │           └── repository/                           # Repositórios JPA
                               │               └── FromToGroupRepository.java        # Interface para o mapeamento FromToGroup
                               └── productRepository.save(...)                       # Salva o novo produto resolvido no banco de dados local
                                       repository/                                   # Pacote de repositórios JPA
                                           ProductRepository.java                    # Repositório JPA do Produto para persistência final

       ✘ Obs.: Não há chamada para a classe CosmosGtinClient, isso acontece devido a Injeção de Dependência baseada em Interfaces(design pattern), spring identifica automaticamente @Component utilizado no CosmosGtinClient que implmenta no GtinClient, ou seja na quando GtinClient é chamado, o spring injenta a unica implementação disponível no sistema.
```
* ### **[C]** Lista de compra:
```text
       │
       └── ListBuyService.java                                                       # Classe de serviço principal da lista de compras
           └── ListBuy listBuy = listBuyRepository.findByProduct(...)                # Busca se o produto já está cadastrado na lista de compras
               ├── ListBuy                                                           # Referência à entidade de item da lista de compras
               │   └── entity/                                                       # Pacote de entidades de persistência do projeto
               │       └── ListBuy.java                                              # Definição da entidade ListBuy (tabela list_buy)
               ├── listBuyRepository.findByProduct(...)                              # Consulta no repositório para verificar a existência do produto na lista
               │   └── repository/                                                   # Pacote contendo as interfaces de acesso a dados
               │       ListBuyRepository.java                                        # Interface Spring Data JPA para gerenciar os itens da lista
               └── listBuyRepository.save(listBuy)                                   # Salva ou atualiza o registro na tabela de lista de compras
```
* ### **[E]** Compra com Lista:
```text
       │ http://localhost:8080/purchase/finalize [Corpo: {...}]                      # Início da requisição HTTP POST para o endpoint
       └── controller/                                                               # Pacote que armazena os controladores REST
            └── PurchaseController.java                                              # Controlador responsável por receber as requisições de compra
                ├── FinalizePurchaseRequest                                          # Objeto de transferência de dados para finalização da compra
                │   └── dto/request/                                                 # Pacote que armazena os DTOs de requisição
                │       └── FinalizePurchaseRequest.java                             # Classe DTO contendo os campos da requisição de finalização
                └── PurchaseService                                                  # Serviço de negócio responsável por processar a compra
                    └── service/                                                     # Pacote que armazena as classes de serviço
                        └── PurchaseService.java                                     # Classe de serviço com a lógica de negócio das compras
                            └── finalizePurchase (...)                               # Método responsável por orquestrar a finalização da compra
                                ├── listBuyRepository.findById(...)                  # Busca o item pendente na lista de compras pelo ID
                                │   └── repository/                                  # Pacote que armazena os repositórios de dados
                                │       └── ListBuyRepository.java                   # Interface de acesso ao banco para a entidade ListBuy
                                │           └── extends JpaRepository<...>           # Herança do Spring Data JPA para operações de banco
                                │               └── ListBuy                          # Entidade de domínio que representa o item na lista de compra
                                │                   └── entity                       # Pacote que armazena as entidades do projeto
                                │                       └── ListBuy.java             # Classe de mapeamento JPA para a tabela de lista de compras
                                ├── supplierRepository.findById(...)                 # Busca o fornecedor no banco de dados pelo ID informado
                                │   └── repository/                                  # Pacote que armazena os repositórios de dados
                                │       └── supplierRepository.java                  # Interface de acesso ao banco para a entidade Supplier
                                │           └── extends JpaRepository<...>           # Herança do Spring Data JPA para operações de banco
                                │               └── Supplier                         # Entidade de domínio que representa o fornecedor
                                │                   └── entity                       # Pacote que armazena as entidades do projeto
                                │                       └── Supplier.java            # Classe de mapeamento JPA para a tabela de fornecedores
                                ├── new HistBuy(...)                                 # Cria instância do histórico de compra com os dados 
                                ├── histBuyRepository.save(...)                      # Salva o registro histórico da compra no banco de dados
                                │    └── repository/                                 # Pacote que armazena os repositórios de dados
                                │        └── histBuyRepository.java                  # Interface de acesso ao banco para a entidade histórico
                                │            └── extends JpaRepository<...>          # Herança do Spring Data JPA para operações de banco
                                │                └── HistBuy                         # Entidade de domínio que representa o histórico
                                │                    └── entity                      # Pacote que armazena as entidades do projeto
                                │                        └── HistBuy.java            # Classe de mapeamento JPA para a tabela de histórico
                                └── listBuyRepository.delete(listBuy)                # Remove o item da lista de compras após a finalização
```
* ### **[F]** Compra Sem Lista:
```text
       │ http://localhost:8080/purchase/buy [Corpo: {...}]                           # Início da requisição HTTP POST para o endpoint
       └── controller/                                                               # Pacote que armazena os controladores REST
            └── PurchaseController.java                                              # Controlador responsável por receber as requisições de compra
                ├── DirectPurchaseRequest                                            # Objeto de transferência de dados para finalização da compra
                │   └── dto/request/                                                 # Pacote que armazena os DTOs de requisição
                │       └── DirectPurchaseRequest.java                               # Classe DTO contendo os campos da requisição de finalização
                └── PurchaseService                                                  # Serviço de negócio responsável por processar a compra
                    └── service/                                                     # Pacote que armazena as classes de serviço
                        └── PurchaseService.java                                     # Classe de serviço com a lógica de negócio das compras
                            └── createDirectPurchase (...)                           # Método responsável por orquestrar a finalização da compra
                                ├── supplierRepository.findById(...)                 # Busca o fornecedor no banco de dados pelo ID informado
                                │   └── repository/                                  # Pacote que armazena os repositórios de dados
                                │       └── supplierRepository.java                  # Interface de acesso ao banco para a entidade Supplier
                                │           └── extends JpaRepository<...>           # Herança do Spring Data JPA para operações de banco
                                │               └── Supplier                         # Entidade de domínio que representa o fornecedor
                                │                   └── entity                       # Pacote que armazena as entidades do projeto
                                │                       └── Supplier.java            # Classe de mapeamento JPA para a tabela de fornecedores
                                ├── productRepository.findById(...)                  # Busca o produto para a compras pelo ID
                                │   └── repository/                                  # Pacote que armazena os repositórios de dados
                                │       └── productRepository.java                   # Interface de acesso ao banco para a entidade Product
                                │           └── extends JpaRepository<...>           # Herança do Spring Data JPA para operações de banco
                                │               └── Product                          # Entidade de domínio que representa o produto da compra
                                │                   └── entity                       # Pacote que armazena as entidades do projeto
                                │                       └── Product.java             # Classe de mapeamento JPA para a tabela de produto
                                ├── new HistBuy(...)                                 # Cria instância do histórico de compra com os dados 
                                └── histBuyRepository.save(...)                      # Salva o registro histórico da compra no banco de dados
                                    └── repository/                                  # Pacote que armazena os repositórios de dados
                                        └── histBuyRepository.java                   # Interface de acesso ao banco para a entidade histórico
                                            └── extends JpaRepository<...>           # Herança do Spring Data JPA para operações de banco
                                                └── HistBuy                          # Entidade de domínio que representa o histórico
                                                    └── entity                       # Pacote que armazena as entidades do projeto
                                                        └── HistBuy.java             # Classe de mapeamento JPA para a tabela de histórico
```
---

## 🏗️ 5. Arquitetura e Estrutura do Projeto

O projeto adota uma **Arquitetura em Camadas (Layered Architecture)** para garantir a separação clara de responsabilidades, testabilidade e facilidade de manutenção.

* ### O fluxo funciona de forma organizada: 
1. As requisições chegam pela pasta `controller`;
2. Passam pelas regras de negócio na pasta `service`;
3. Salva os dados no banco através do `repository`, utilizando as tabelas mapeadas em `entity`;
4. Garantindo a segurança/clareza na troca de informações, são utilizados os `dto` (divididos em `request` e `response`);
5. Padronização dos erros através da `exception`;
6. Integrações com APIs e serviços externos utilizam a `infrastructure`.
* ### Estrutura:
```text
   com.shoppinglist/
   ├── controller/       # Expõe os endpoints da API REST, recebe e retorna as requisições HTTP.
   ├── service/          # Contém a regra de negócio, chamada pelo Controller e utiliza o Repository.
   ├── repository/       # Interface responsável pela comunicação direta com o banco de dados.
   ├── entity/           # Representa as entidade e as tabela no banco de dados utilizando JPA.
   ├── dto/              # O pacote que transporta os dados com segurança.
   │   ├── request/      # Dados que chegam do cliente para a API.
   │   └── response/     # Dados que a API retorna para o cliente.
   ├── exception/        # Trata os erros da aplicação e padroniza as respostas de falha.
   └── infrastructure/   # Guarda integrações técnicas e detalhes de fora do sistema.
       └── client/       # Consome APIs e serviços externos (ex: API de terceiros).
```
### 📂 Árvore Completa de Componentes
```text
   com.shoppinglist/
   ├── controller/                               # Expõe os endpoints da API REST, recebe e retorna as requisições HTTP.
   │   ├── GlobalExceptionHandler                # Gerencia os endpoints dos Exception.
   │   ├── GroupController.java                  # Gerencia os endpoints de cadastro e consulta de grupos.
   │   ├── HistBuyController.java                # Gerencia os endpoints de cadastro e consulta histórico de compras.
   │   ├── ListBuyController.java                # Gerencia os endpoints da lista de compras e leitura de GTIN.
   │   ├── ProductController.java                # Gerencia os endpoints de cadastro e consulta de produtos.
   │   ├── PurchaseController.java               # Gerencia os endpoints de compra de produto para o histórico de compras.
   │   └── SupplierController.java               # Gerencia os endpoints de cadastro e consulta de fornecedores.
   ├── service/                                  # Contém a regra de negócio, chamada pelo Controller e utiliza o Repository.
   │   ├── GroupService.java                     # Processa as regras de negócio e validações para Grupos.
   │   ├── HistBuyService.java                   # Processa as regras de negócio e validações para o histórico de compra.
   │   ├── ListBuyService.java                   # Processa a lógica da lista de compras e integração com API de GTIN.
   │   ├── ProductService.java                   # Processa as regras de negócio e validações para Produtos.
   │   ├── PurchaseService.java                  # Processa as regras de negócio para o histórico de compras com ou sem lista.
   │   └── SupplierService.java                  # Processa as regras de negócio e validações para Fornecedores.
   ├── repository/                               # Interface responsável pela comunicação direta com o banco de dados.
   │   ├── FromToGroupRepository.java            # Comunicação com a tabela de mapeamento "De/Para" de categorias.
   │   ├── GroupRepository.java                  # Comunicação com a tabela de grupos de produtos.
   │   ├── HistBuyRepository.java                # Comunicação com a tabela de itens do hitórico de compras.
   │   ├── ListBuyRepository.java                # Comunicação com a tabela de itens da lista de compras.
   │   ├── ProductRepository.java                # Comunicação com a tabela de produtos e busca por GTIN.
   │   └── SupplierRepository.java               # Comunicação com a tabela de fornecedores.
   ├── entity/                                   # Representa a tabela no banco de dados utilizando JPA.
   │   ├── FromToGroup.java                      # Entidade que armazena o de-para de categorias externas.
   │   ├── Group.java                            # Entidade de representação do grupo de produtos.
   │   ├── HistBuy.java                          # Entidade que mapeia os itens adicionados no histórico de compras.
   │   ├── ListBuy.java                          # Entidade que mapeia os itens adicionados na lista de compras.
   │   ├── Product.java                          # Entidade que armazena os dados do produto.
   │   └── Supplier.java                         # Entidade que armazena os dados do fornecedor.
   ├── dto/                                      # O pacote que transporta os dados com segurança.
   │   ├── request/                              # Dados que chegam do cliente para a API.
   │   │   ├── DirectPurchaseRequest             # Dados de entrada para criar o histórico de compra sem lista de compra.
   │   │   ├── FinalizePurchaseRequest           # Dados de entrada para criar o histórico de compra com lista de compra.
   │   │   ├── GroupRequest.java                 # Dados de entrada para criar/atualizar um Grupo.
   │   │   ├── HistBuyRequest.java               # Dados de entrada para gerenciar o item do histórico de compras.
   │   │   ├── ListBuyGtinRequest.java           # Dados de entrada contendo apenas o GTIN para busca rápida.
   │   │   ├── ListBuyRequest.java               # Dados de entrada para gerenciar um item da lista de compras.
   │   │   ├── ProductRequest.java               # Dados de entrada para criar/atualizar um Produto.
   │   │   └── SupplierRequest.java              # Dados de entrada para criar/atualizar um Fornecedor.
   │   └── response/                             # Dados que a API retorna para o cliente.
   │       ├── CosmosProductResponse.java        # Mapeamento da resposta crua da API externa Cosmos.
   │       ├── ExternalProductDTO.java           # DTO padronizado com os dados extraídos da API externa.
   │       ├── GroupResponse.java                # Dados retornados nas consultas de Grupo.
   │       ├── HistBuyResponse.java              # Dados retornados nas consultas do Histórico de Compras.
   │       ├── ListBuyResponse.java              # Dados retornados nas consultas da Lista de Compras.
   │       ├── ProductResponse.java              # Dados retornados nas consultas de Produto.
   │       └── SupplierResponse.java             # Dados retornados nas consultas de Fornecedor.
   ├── exception/                                # Trata os erros da aplicação e padroniza as respostas de falha.
   │   ├── GroupNotFoundException.java           # Exceção disparada quando o Grupo não é encontrado.
   │   ├── HistBuyNotFoundException.java         # Exceção disparada quando o Histórico de compra não é encontrado.
   │   ├── ListBuyNotFoundException.java         # Exceção disparada quando o item da lista não é encontrado.
   │   ├── ProductNotFoundByGtinException.java   # Exceção disparada quando o GTIN não existe externamente.
   │   ├── ProductNotFoundException.java         # Exceção disparada quando o Produto não é encontrado.
   │   └── SupplierNotFoundException.java        # Exceção disparada quando o Fornecedor não é encontrado.
   └── infrastructure/                           # Guarda integrações técnicas e detalhes de fora do sistema.
       └── client/                               # Consome APIs e serviços externos (ex: API de terceiros).
           ├── CosmosGtinClient.java             # Implementação do cliente REST para a API do Cosmos GTIN.
           └── GtinClient.java                   # Interface contrato para o serviço de busca de GTIN externo.
```
## 🗄️ 6. Mapeamento de Entidades e Modelo de Dados

* ### `Group` (Grupo / Categoria de Produto)
  * **Tabela no Banco**: `groups`
  * **Descrição**: Representa as categorias/grupos de produtos dentro do sistema.
  * **Atributos**:
    * **id** (Long) - Identificador único gerado manualmente ou via sequência.
    * **name** (String) - Nome do grupo/categoria (obrigatório).

* ### `Product` (Produto)
  * **Tabela no Banco**: `product`
  * **Descrição**: Cadastro completo de produtos comercializados ou consumidos.
  * **Atributos**:
    * **id** (UUID) - Identificador único universal gerado automaticamente.
    * **name** (String) - Nome descritivo do produto (obrigatório, coluna `nm_product`).
    * **group** (Group) - Relacionamento ManyToOne com a entidade Group (obrigatório, coluna `id_group`).
    * **gtin** (String) - Código de barras / GTIN do produto (opcional, coluna `cd_product_gtin`).

* ### `Supplier` (Fornecedor)
  * **Tabela no Banco**: `supplier`
  * **Descrição**: Cadastro de fornecedores, estabelecimentos comerciais e supermercados.
  * **Atributos**:
    * **id** (UUID) - Identificador único universal gerado automaticamente (coluna `id_supplier`).
    * **name** (String) - Nome do fornecedor (obrigatório, coluna `name_supplier`).

* ### `ListBuy` (Item da Lista de Compras)
  * **Tabela no Banco:** `list_buy`
  * **Descrição:** Gerencia os itens atualmente presentes na lista de compras pendente.
  * **Atributos**:
    * **id** (UUID) - Identificador único universal gerado automaticamente (coluna `id_list_buy`).
    * **product** (Product) - Relacionamento ManyToOne com o produto associado (obrigatório, coluna `id_product`).
    * **quantity** (BigDecimal) - Quantidade do produto na lista (obrigatório, coluna `qt_product`).
    * **bought** (Boolean) - Indicador de status se o item já foi comprado ou não (padrão `false`, coluna `fl_bought`).
    * **date** (OffsetDateTime) - Data e hora do registro/atualização na lista (obrigatório, coluna `dt_list_product`).

* ### `FromToGroup` (De/Para de Categorias Externas)
  * **Tabela no Banco:** `from_to_group`
  * **Descrição:** Tabela de de-para para relacionar taxonomias de APIs externas aos grupos internos.
  * **Atributos**:
    * **externalParentId** (Long) - Identificador da categoria pai vindo da API externa.
    * **categoryDescription** (String) - Descrição da categoria externa mapeada.
    * **group** (Group) - Relacionamento ManyToOne com o Group interno correspondente.

* ### `HistBuy` (Histórico de Compras)
  * **Tabela no Banco:** `hist_buy`
  * **Descrição:** Registra a efetivação das compras e seu histórico para análises financeiras e de consumo.
  * **Atributos**:
    * **id** (UUID) - Identificador único universal gerado automaticamente (coluna id_hist_buy).
    * **supplier** (Supplier) - Relacionamento ManyToOne com o fornecedor onde a compra foi realizada (obrigatório, `coluna id_supplier`).
    * **product** (Product) - Relacionamento ManyToOne com o produto comprado (obrigatório, `coluna id_product`).
    * **quantity** (BigDecimal) - Quantidade do produto comprado (obrigatório, coluna `qt_product`).
    * **price** (BigDecimal) - Valor unitário pago pelo produto (obrigatório, `coluna vl_product`).
    * **dateListBuy** (OffsetDateTime) - Data e hora original em que o item foi inserido na lista de compras (obrigatório, coluna `dt_list_buy`).
    * **dateHistBuy** (OffsetDateTime) - Data e hora em que a compra foi efetivamente realizada (obrigatório, coluna `dt_hist_buy`).
---

## 🧩 7. Mapeamento de Componentes e Anotações

### 📌 Termos Fundamentais
* `class`: Define o estado (atributos/campos) e o comportamento (métodos).
* `interface`: Define o contrato (o que o objeto faz), sem focar na implementação (como faz).
* `record`: Estrutura imutável para carregar dados de forma segura (DTO), gerando métodos e construtores automaticamente.
* `migration`: Script responsável por criar e evoluir a estrutura do banco de dados.
* `entity`: Classe de domínio que mapeia tabelas e colunas do banco de dados.

### 📂 Entity/ (Persistência e Domínio)
* `@Entity`: Define a classe como uma entidade gerenciada pelo JPA/Hibernate.
* `@Table`: Especifica o nome da tabela no banco de dados.
* `@Getter` / `@Setter`: *Lombok* — Gera automaticamente os métodos de acesso `get` e `set`.
* `@NoArgsConstructor` / `@AllArgsConstructor`: *Lombok* — Gera construtores sem argumentos e com todos os argumentos.
* `@Id`: Identifica o campo que representa a chave primária (PK).
* `@GeneratedValue`: Define a estratégia de geração/incremento da chave primária.
* `@Column`: Configura propriedades da coluna (nome, obrigatoriedade, tamanho, etc.).
* `@ManyToOne`: Estabelece um relacionamento de *Muitos-para-Um* entre entidades.

### 📂 Repository/ (Acesso aos Dados)
* `@Repository`: Indica que a interface/classe é um componente de acesso a dados do Spring.
* `@Query`: Permite escrever consultas JPQL ou SQL customizadas diretamente no método.
* `extends JpaRepository`: Herda operações padrão de CRUD, paginação e ordenação.
* `List<T>`: Retorna uma coleção com múltiplos registros.
* `Optional<T>`: Contêiner que evita exceções do tipo `NullPointerException` ao tratar retornos nulos.
* `findByGtin`: Método derivado para buscar um produto pelo código de barras GTIN.
* `findByProduct`: Método derivado para buscar um item da lista associado a um produto.
* `findAllWithProductAndGroup`: Consulta personalizada para carregar a lista junto com produto e grupo.

### 📂 Controller/ (Endpoints REST)
* `@RestController`: Define a classe como um controlador REST que retorna respostas em JSON/XML.
* `@RequestMapping("/...")`: Define o caminho/URL base para os endpoints do controlador.
* `@PostMapping` / `@GetMapping` / `@PatchMapping` / `@DeleteMapping`: Mapeiam os verbos HTTP correspondentes (Criação, Leitura, Atualização Parcial e Remoção).
* `@RequestBody`: Converte o corpo (JSON) da requisição HTTP em um objeto Java.
* `@Valid`: Dispara as validações configuradas nas anotações do DTO recebido.
* `@PathVariable`: Extrai parâmetros passados diretamente na URL (ex: `/{id}`).
* `HttpStatus.CREATED` (201) / `HttpStatus.NO_CONTENT` (204): Códigos de status HTTP para recurso criado e sucesso sem retorno de corpo.
* **Ações Padrão:** `create`, `createByGtin`, `list`, `read`, `update`, `delete`.

### 📂 Service/ (Regras de Negócio)
* `@Service`: Marca a classe como um componente de serviço contendo a regra de negócio.
* `@Transactional`: Garante a atomicidade das operações de banco de dados (commit/rollback).
* `public` / `private` / `final`: Modificadores de acesso para visibilidade, encapsulamento e imutabilidade.
* `this`: Referência à instância atual da classe.
* `.map(...)`: Função utilitária para transformação de tipos (ex: converter Entidade para DTO).
* `orElseThrow` / `orElseGet`: Tratamento de `Optional` para lançar exceção ou executar lógica alternativa.
* `if`, `==`, `!=`, `->`: Estuturas condicionais, operadores de comparação e expressões lambda.
* `BigDecimal.ONE`: Constante numérica que representa o valor `1` com precisão decimal.
* `throw` / `new`: Comandos para lançar exceções e instanciar novos objetos.

### 📂 DTO/ (Request & Response)
* `@NotBlank`: Valida que uma string não é nula e não possui apenas espaços em branco.
* `@NotNull`: Valida que o atributo não pode ser nulo (aceita tipos numéricos, objetos e booleanos).
* `@Positive`: Garante que o valor numérico seja estritamente maior que zero (`> 0`).
* `record`: Estrutura padrão Java para tráfego imutável de dados entre camadas.

### 📂 Client/ (Integrações Externas)
* `@Component`: Registra a classe no contexto de injeção de dependências do Spring.
* `@Value`: Injeta propriedades declaradas no `application.properties`.
* `@Override`: Sobrescreve a assinatura de um método definido na interface.
* `RestClient`: Cliente HTTP síncrono e moderno introduzido no Spring Boot 6.1+.
* `.baseUrl(...)` / `.defaultHeader(...)` / `.build()`: Métodos encadeados para configurar URL base, cabeçalhos padrão e construir o cliente HTTP.

### 🛠️ Utilitários e Tipos de Dados
* `UUID`: Identificador único universal de 128 bits.
* `BigDecimal`: Tipo numérico de alta precisão para valores monetários e quantidades.
* `OffsetDateTime`: Data e hora incluindo o fuso horário (ISO-8601).
* `@JsonIgnoreProperties`: Anotação Jackson para ignorar campos desconhecidos no JSON recebido.
* `@JsonProperty`: Mapeia o nome exato da chave do JSON para o atributo Java.
---

## 🌐 8. Métodos e Endpoints

| Controller | Método HTTP | Endpoint | Descrição Principal |
| :--- | :---: | :--- | :--- |
| **SupplierController** | `POST` | `/supplier` | Cadastra um novo fornecedor |
| | `GET` | `/supplier` | Lista todos os fornecedores |
| | `GET` | `/supplier/{id}` | Busca um fornecedor pelo ID |
| | `PATCH` | `/supplier/{id}` | Atualiza um fornecedor existente |
| | `DELETE` | `/supplier/{id}` | Remove um fornecedor pelo ID |
| **ProductController** | `POST` | `/product` | Cadastra um novo produto |
| | `GET` | `/product` | Lista todos os produtos |
| | `GET` | `/product/{id}` | Busca um produto pelo ID |
| | `PATCH` | `/product/{id}` | Atualiza um produto existente |
| | `DELETE` | `/product/{id}` | Remove um produto pelo ID |
| **GroupController** | `POST` | `/group` | Cria um novo grupo de produtos |
| | `GET` | `/group` | Lista todos os grupos |
| | `GET` | `/group/{id}` | Busca um grupo pelo ID |
| | `PATCH` | `/group/{id}` | Atualiza um grupo existente |
| | `DELETE` | `/group/{id}` | Remove um grupo pelo ID |
| **ListBuyController** | `POST` | `/list-buy` | Adiciona um item manualmente à lista |
| | `POST` | `/list-buy/gtin` | Adiciona um item via consulta GTIN |
| | `GET` | `/list-buy` | Lista todos os itens pendentes |
| | `GET` | `/list-buy/{id}` | Busca um item da lista pelo ID |
| | `PATCH` | `/list-buy/{id}` | Atualiza um item da lista |
| | `DELETE` | `/list-buy/{id}` | Remove um item da lista |
| **HistBuyController** | `POST` | `/hist-buy` | Registra manualmente um histórico |
| | `GET` | `/hist-buy` | Lista o histórico de compras |
| | `GET` | `/hist-buy/{id}` | Busca um registro do histórico pelo ID |
| | `PATCH` | `/hist-buy/{id}` | Atualiza um registro do histórico |
| | `DELETE` | `/hist-buy/{id}` | Remove um registro do histórico |
| **PurchaseController** | `POST` | `/purchase/finalize` | Finaliza um item da lista (vai para o histórico) |
| | `POST` | `/purchase/direct` | Realiza uma compra direta no histórico |

---

## 🗄️ 9. Estrutura do Banco de Dados (`ShoppingList`)

* **supplier**
  * `id_supplier` `[PK]`
  * `nm_supplier`
* **group**
  * `id_group` `[PK]`
  * `nm_group`
* **product**
  * `id_product` `[PK]`
  * `nm_product`
  * `id_group` `[FK]`
  * `cd_product_gtin`
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
   +-----------------------+          +-----------------------+       +------------------------+
   |        PRODUCT        |          |     GROUP_PRODUCT     |       |   SUPPLIER_PRODUCT     |
   +-----------------------+(1)       +-----------------------+       +------------------------+
   | PK | id_product       |----------| PK | id_group_product |       | PK |id_supplier_produc |
   | FK | id_group_product |       (*)|    | nm_group_product |       |    |nm_supplier_produc |
   |    | nm_product       |          +-----------------------+       +------------------------+
   |    | cd_product_gtin  |(1)            |(1)                                |(1)
   +-----------------------+---------------|-----------------------------+     |
     |(1)                                  |(*)                          |(*)  |(*)
     |   +-------------------+   +--------------------------+   +------------------+
     |   |       LIST_BUY    |   |      FROM_TO_GROUP       |   |     HIST_BUY     |
     |   +-------------------+   +--------------------------+   +------------------+
     |   | PK | id_list_item |   |    | externalParentId    |   | PK | id_hist_buy |
     |(1)| FK | id_product   |   |    | categoryDescription |   | FK | id_supplier |
     +-- |    | id_list_buy  |   | FK | id_group            |   | FK | id_product  |
         |    | qt_product   |   +--------------------------+   |    | vl_product  |
         |    | fl_bought    |                                  |    | qt_product  |
         |    | dt_list_buy  |                                  |    | dt_buy      |
         +-------------------+                                  |    | dt_list_buy |
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

## 🛠️ Ambiente de Desenvolvimento

### 🧰 Ferramentas e Softwares Essenciais
* `JDK 21`: Kit de desenvolvimento Java.
* `IntelliJ IDEA`: IDE recomendada para escrita e gestão do código.
* `Apache Maven`: Gerenciador de dependências e automação de build.
* `Docker`: Gerenciamento do banco de dados em ambiente local/testes.

### 📦 Dependências e Bibliotecas
**Spring Boot**
* `spring-boot-starter-web`: Suporte para construção de APIs REST e cliente HTTP (`RestClient`).
* `spring-boot-starter-data-jpa`: Persistência de dados via Hibernate e JPA.
* `spring-boot-starter-validation`: Validação de dados via anotações (`@Valid`, `@NotBlank`, etc.).

**Outras Bibliotecas**
* `Lombok`: Redução de código boilerplate (Getters, Setters, Construtores).
* `Flyway`: Migração e versionamento automatizado do banco de dados via scripts SQL.
* `PostgreSQL`: Driver de conexão com o banco de dados relacional.

### 🚀 Passo a Passo para Montagem do Ambiente

#### 1. Instalação das Ferramentas
* **IntelliJ IDEA**
  * **URL:** [Download IntelliJ](https://www.jetbrains.com/pt-br/idea/download/)
  * **Versão:** Última versão disponível.
* **Docker**
  * **URL:** [Instalação do Docker](https://docs.docker.com/desktop/setup/install/windows-install/)
  * **Versão:** `4.78.0` ou superior.

#### 2. Configuração do Projeto via Spring Initializr
Acesse o site [start.spring.io](https://start.spring.io/) e configure com as seguintes opções:

* **Project:** `Maven`
* **Language:** `Java`
* **Metadata:**
  * **Group:** `com.shoppinglist`
  * **Artifact:** `api`
  * **Name:** `api`
  * **Description:** `Backend for shopping list`
  * **Package Name:** `com.shoppinglist.api`

**Dependências a Adicionar:**
* **PostgreSQL Driver:** Comunicação JDBC/R2DBC com o banco de dados.
* **Spring Web:** Criação de rotas e endpoints RESTful.
* **Spring Data JPA:** Abstração de operações no banco via métodos Java.
* **Validation:** Garante que as requisições enviadas sejam válidas e seguras.
* **Lombok:** Automação de Getters, Setters e construtores via anotações.
* **Flyway Migration:** Controle de versão e criação automatizada das tabelas.
* **Spring Boot DevTools:** Restart automático do servidor ao salvar alterações.

> Clique no botão **GENERATE** para baixar o projeto base.

#### 3. Clonar o Projeto do GitHub
    ...

#### 4. Configurações:
    ...
