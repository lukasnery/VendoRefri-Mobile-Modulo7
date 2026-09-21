# VendoRefri Mobile - Projeto Integrador TADS 7

Evolução do **VendoRefri** para dispositivos móveis, construída a partir do backend do projeto acadêmico anterior. A entrega foi organizada para concentrar em um único repositório os itens de Desenvolvimento para Dispositivos Móveis, Engenharia/Análise de Software e Tech Forge.

## O que está pronto

- aplicativo React Native/Expo;
- autenticação JWT com sessão armazenada via Expo SecureStore;
- perfis `ADMIN` e `USER`;
- CRUD completo de produtos: **app -> API -> Prisma -> MySQL**;
- upload de imagem com **Multer**;
- validação de extensão, MIME, 5 MB e colisão de nomes;
- regras de estoque e pedidos;
- documentação de RF/RNF e regras de negócio;
- DER;
- 2 diagramas de casos de uso;
- 2 diagramas de atividades;
- 2 diagramas de sequência;
- matriz de rastreabilidade da rubrica;
- roteiro de validação manual;
- relatório de validação técnica da entrega;
- testes E2E da API.

## Estrutura

```text
VendoRefri-Mobile-Modulo7/
├── vendo-refri-api/              # Node + Express + TypeScript + Prisma + Multer
├── vendo-refri-mobile/           # React Native + Expo
├── database/                     # SQL de referência
├── docs/
│   ├── Documentacao_VendoRefri_Mobile.docx
│   ├── Documentacao_VendoRefri_Mobile.pdf
│   ├── DOCUMENTACAO_PROJETO.md
│   ├── AVALIACAO_RUBRICA.md
│   ├── ROTEIRO_VALIDACAO.md
│   ├── RELATORIO_VALIDACAO_TECNICA.md
│   ├── COMO_APRESENTAR.md
│   └── diagramas/
├── docker-compose.yml
├── .env.example
└── README.md
```

## 1. Executar API e banco

Pré-requisito: Docker Desktop ou Docker Engine com Compose.

Na raiz:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Depois:

```bash
docker compose up --build -d
```

Teste:

```text
http://localhost:3000/health
```

Resposta esperada:

```json
{"status":"ok","app":"VendoRefri Mobile API"}
```

### Administrador inicial

Por padrão do `.env.example`:

```text
E-mail: admin@vendorefri.com
Senha: Troque@123456
```

## 2. Executar aplicativo

Abra outro terminal:

```bash
cd vendo-refri-mobile
cp .env.example .env
npm install
npx expo start
```

No Windows PowerShell:

```powershell
cd vendo-refri-mobile
Copy-Item .env.example .env
npm install
npx expo start
```

### Android Emulator

O `.env.example` já usa:

```text
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

### Celular físico

Computador e celular precisam estar na mesma rede. Descubra o IPv4 do computador e altere `.env`, por exemplo:

```text
EXPO_PUBLIC_API_URL=http://192.168.0.20:3000
```

Reinicie o Expo após alterar a variável.

## 3. Fluxo recomendado para demonstrar

1. Entre como `ADMIN`.
2. Cadastre um produto com imagem.
3. Edite o produto.
4. Mostre que imagem, preço e estoque persistem no banco.
5. Saia e cadastre um usuário comum.
6. Mostre que `USER` não possui botões de CRUD.
7. Faça um pedido e mostre a redução do estoque.
8. Cancele o pedido e mostre a restituição do estoque.
9. Volte ao `ADMIN` e mostre a visualização administrativa.

## 4. Upload por Multer

Arquivo principal:

```text
vendo-refri-api/src/middlewares/upload.ts
```

Regras implementadas:

- JPG/JPEG/PNG/WEBP;
- extensão e MIME precisam ser compatíveis;
- máximo 5 MB;
- um arquivo por requisição;
- timestamp + UUID no nome;
- verificação física adicional para evitar colisão;
- remoção de upload se o cadastro/edição falhar.

## 5. Controle ADMIN e USER

A autorização não depende apenas da interface. O backend valida o perfil em cada rota administrativa.

- `ADMIN`: CRUD de produtos, listagem de usuários e todos os pedidos.
- `USER`: consulta de produtos e operações sobre os próprios pedidos.

Assim, tentar chamar a API diretamente como `USER` para cadastrar um produto retorna `403`.

## 6. Documentação para entregar

O documento principal está em:

```text
docs/Documentacao_VendoRefri_Mobile.pdf
```

Também foi mantida a versão `.docx` para edição e a versão `.md` como fonte textual.

A conferência direta da rubrica está em:

```text
docs/AVALIACAO_RUBRICA.md
```

## 7. Testes E2E da API

Com a API já em execução:

```bash
cd vendo-refri-api
npm install
npm run test:e2e
```

O conjunto cobre autenticação, papéis, CRUD, upload, validação de extensão/tamanho/colisão, paginação, pedido/estoque, cancelamento e regras de integridade.

## 8. Observação sobre segurança local

O projeto usa HTTP para o teste acadêmico em rede local porque facilita a conexão do Expo Go com o computador. Em produção, a API deve ser publicada por HTTPS. Segredos reais não devem ser versionados: apenas `.env.example` está incluído.
