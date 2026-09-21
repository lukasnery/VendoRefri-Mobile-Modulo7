const baseUrl = process.env.API_BASE_URL || "http://localhost:3000"

function uniqueSuffix() {
  return `${Date.now()}${Math.floor(Math.random() * 10000)}`
}

function generateValidCpf(seed: string): string {
  const raw = seed.replace(/\D/g, "").padEnd(9, "1").slice(-9)
  const base = raw.split("").map(Number)

  // Evita a sequência de um único dígito, rejeitada pelo validador de CPF.
  if (base.every((digit) => digit === base[0])) base[8] = (base[8] + 1) % 10

  const digit = (digits: number[], start: number) => {
    const sum = digits.reduce((acc, n, i) => acc + n * (start - i), 0)
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }

  const d1 = digit(base, 10)
  const d2 = digit([...base, d1], 11)
  return [...base, d1, d2].join("")
}

async function jsonApi(path: string, options: any = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  })
  const text = await response.text()
  return { response, body: text ? JSON.parse(text) : null }
}

async function formApi(path: string, form: FormData, token: string, method = "POST") {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    body: form
  })
  const text = await response.text()
  return { response, body: text ? JSON.parse(text) : null }
}

function smallPngBlob() {
  return new Blob([Buffer.from("89504e470d0a1a0a", "hex")], { type: "image/png" })
}

describe("VendoRefri Mobile API E2E", () => {
  const suffix = uniqueSuffix()
  const testUser = {
    nome: "Usuário Mobile E2E",
    email: `mobile-${suffix}@vendorefri.com`,
    senha: "Teste@123456",
    cpf: generateValidCpf(suffix)
  }

  let userToken = ""
  let adminToken = ""
  let productId = ""
  let productImageName = ""
  let orderId = ""

  test("health check", async () => {
    const { response, body } = await jsonApi("/health")
    expect(response.status).toBe(200)
    expect(body.status).toBe("ok")
  })

  test("cadastro e login de usuário USER", async () => {
    const create = await jsonApi("/users", {
      method: "POST",
      body: JSON.stringify(testUser)
    })
    expect(create.response.status).toBe(201)
    expect(create.body.role).toBe("USER")
    expect(create.body.senha).toBeUndefined()

    const login = await jsonApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: testUser.email, senha: testUser.senha })
    })
    expect(login.response.status).toBe(200)
    userToken = login.body.token
  })

  test("perfil USER não pode cadastrar produto", async () => {
    const form = new FormData()
    form.append("nome", "Produto proibido")
    form.append("preco", "10")
    form.append("estoque", "5")

    const result = await formApi("/products", form, userToken)
    expect(result.response.status).toBe(403)
  })

  test("login do ADMIN sem expor senha", async () => {
    const login = await jsonApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: process.env.ADMIN_EMAIL || "admin@vendorefri.com",
        senha: process.env.ADMIN_PASSWORD || "Troque@123456"
      })
    })
    expect(login.response.status).toBe(200)
    expect(login.body.user.role).toBe("ADMIN")
    expect(login.body.user.senha).toBeUndefined()
    adminToken = login.body.token
  })

  test("Multer rejeita extensão/MIME inválidos", async () => {
    const form = new FormData()
    form.append("nome", "Arquivo inválido")
    form.append("preco", "8.90")
    form.append("estoque", "12")
    form.append("imagem", new Blob(["texto"], { type: "text/plain" }), "arquivo.txt")

    const result = await formApi("/products", form, adminToken)
    expect(result.response.status).toBe(400)
    expect(result.body.message).toContain("Imagem inválida")
  })

  test("Multer rejeita imagem acima de 5 MB", async () => {
    const form = new FormData()
    form.append("nome", "Imagem grande")
    form.append("preco", "8.90")
    form.append("estoque", "12")
    form.append("imagem", new Blob([Buffer.alloc(5 * 1024 * 1024 + 1)], { type: "image/jpeg" }), "grande.jpg")

    const result = await formApi("/products", form, adminToken)
    expect(result.response.status).toBe(400)
    expect(result.body.message).toContain("5 MB")
  })

  test("ADMIN cadastra produto com imagem via Multer", async () => {
    const form = new FormData()
    form.append("nome", `Refrigerante Mobile ${suffix}`)
    form.append("preco", "8.90")
    form.append("estoque", "12")
    form.append("imagem", smallPngBlob(), "produto.png")

    const result = await formApi("/products", form, adminToken)
    expect(result.response.status).toBe(201)
    expect(result.body.id).toBeDefined()
    expect(result.body.imagemUrl).toContain("/uploads/products/")
    expect(result.body.imagemNome).toBeDefined()
    productId = result.body.id
    productImageName = result.body.imagemNome
  })

  test("arquivos com o mesmo nome original não colidem e CRUD permite excluir produto sem vínculo", async () => {
    const form = new FormData()
    form.append("nome", `Produto temporário ${suffix}`)
    form.append("preco", "5.50")
    form.append("estoque", "3")
    form.append("imagem", smallPngBlob(), "produto.png")

    const create = await formApi("/products", form, adminToken)
    expect(create.response.status).toBe(201)
    expect(create.body.imagemNome).not.toBe(productImageName)

    const remove = await jsonApi(`/products/${create.body.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect(remove.response.status).toBe(200)
  })

  test("listagem autenticada retorna paginação e o produto criado", async () => {
    const list = await jsonApi("/products?page=1&limit=50", {
      headers: { Authorization: `Bearer ${userToken}` }
    })
    expect(list.response.status).toBe(200)
    expect(Array.isArray(list.body.items)).toBe(true)
    expect(list.body.items.some((p: any) => p.id === productId)).toBe(true)
  })

  test("ADMIN edita produto e respeita validações de estoque", async () => {
    const form = new FormData()
    form.append("nome", `Refrigerante Mobile Editado ${suffix}`)
    form.append("preco", "9.50")
    form.append("estoque", "10")

    const update = await formApi(`/products/${productId}`, form, adminToken, "PUT")
    expect(update.response.status).toBe(200)
    expect(update.body.preco).toBe(9.5)
    expect(update.body.estoque).toBe(10)
  })

  test("USER realiza pedido e API reduz estoque", async () => {
    const order = await jsonApi("/orders", {
      method: "POST",
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ productId, quantidade: 2 })
    })
    expect(order.response.status).toBe(201)
    expect(order.body.quantidade).toBe(2)
    orderId = order.body.id

    const product = await jsonApi(`/products/${productId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    })
    expect(product.response.status).toBe(200)
    expect(product.body.estoque).toBe(8)
  })

  test("pedido acima do estoque é rejeitado sem deixar saldo negativo", async () => {
    const order = await jsonApi("/orders", {
      method: "POST",
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ productId, quantidade: 999 })
    })
    expect(order.response.status).toBe(400)
    expect(order.body.message).toContain("Estoque insuficiente")

    const product = await jsonApi(`/products/${productId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    })
    expect(product.body.estoque).toBe(8)
  })

  test("produto com pedido vinculado não pode ser excluído", async () => {
    const remove = await jsonApi(`/products/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect(remove.response.status).toBe(400)
    expect(remove.body.message).toContain("pedidos vinculados")
  })

  test("cancelar pedido restitui estoque e libera exclusão do produto", async () => {
    const cancel = await jsonApi(`/orders/${orderId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${userToken}` }
    })
    expect(cancel.response.status).toBe(200)

    const product = await jsonApi(`/products/${productId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    })
    expect(product.body.estoque).toBe(10)

    const remove = await jsonApi(`/products/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    expect(remove.response.status).toBe(200)
  })
})
