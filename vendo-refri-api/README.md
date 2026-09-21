# VendoRefri Mobile - API

API REST em Node.js, Express, Prisma e MySQL. Esta versão evolui a API do VendoRefri do módulo anterior para suportar o aplicativo React Native e os critérios da rubrica atual.

## Recursos principais

- autenticação JWT com perfis `ADMIN` e `USER`;
- senhas protegidas com bcrypt;
- CRUD de produtos;
- upload de imagem de produto com Multer 2.x;
- validação de extensão, MIME e tamanho máximo de 5 MB;
- geração de nome único para evitar colisão de arquivos;
- regras de estoque e pedidos executadas em transações Prisma;
- usuário comum visualiza apenas seus pedidos; administrador visualiza todos;
- respostas de usuários não expõem a senha.

## Rotas principais

- `POST /auth/login`
- `POST /users` - cadastro público como USER
- `GET /users/me` - perfil autenticado
- `GET /users` - somente ADMIN
- `GET /products` - autenticado
- `POST /products` - somente ADMIN, `multipart/form-data`
- `PUT /products/:id` - somente ADMIN, `multipart/form-data`
- `DELETE /products/:id` - somente ADMIN
- `POST /orders` - autenticado
- `GET /orders` - USER recebe os próprios; ADMIN recebe todos
- `DELETE /orders/:id` - cancela e devolve a quantidade ao estoque

## Upload de produto

Campo de arquivo: `imagem`.

Formatos: JPG, JPEG, PNG e WEBP. Limite: 5 MB.
