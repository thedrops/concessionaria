# 🚀 Quick Start Guide

## Para desenvolvedores que querem começar AGORA

### 1️⃣ Setup Rápido (5 minutos)

```bash
# Clone o repositório (se ainda não fez)
cd /caminho/do/projeto

# Instale as dependências
npm install

# Execute o setup automático
./setup.sh
```

✅ Pronto! O script vai fazer tudo por você:

- Criar arquivo .env
- Iniciar PostgreSQL no Docker
- Configurar o banco de dados
- Criar usuário admin

### 2️⃣ Iniciar o Projeto

```bash
npm run dev
```

### 3️⃣ Acessar

- 🌐 Site: http://localhost:3000
- 🔐 Admin: http://localhost:3000/admin/login
  - Email: `admin@concessionaria.com`
  - Senha: `admin123`

---

## 🐛 Problemas Comuns

### Erro: "Port 5432 already in use"

Você já tem PostgreSQL rodando. Escolha uma opção:

**Opção A**: Usar o PostgreSQL local

```bash
# Pare o container Docker
docker-compose -f docker-compose.dev.yml down

# Configure .env para usar seu PostgreSQL local
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/concessionaria"
```

**Opção B**: Parar o PostgreSQL local e usar Docker

```bash
# Linux/Mac
sudo service postgresql stop

# Depois reinicie o Docker
./setup.sh
```

### Erro: "Cannot connect to database"

```bash
# Verifique se o container está rodando
docker ps

# Se não estiver, inicie-o
docker-compose -f docker-compose.dev.yml up -d

# Aguarde 5 segundos e tente novamente
```

### Erro: "Prisma Client not generated"

```bash
npx prisma generate
```

---

## 📱 Testando a Aplicação

### Área Pública

1. Acesse http://localhost:3000
2. Navegue pelo catálogo (mesmo sem carros cadastrados)
3. Teste o formulário de interesse

### Área Admin

1. Faça login em http://localhost:3000/admin/login
2. Adicione alguns carros
3. Veja os leads que foram capturados
4. Exporte a lista de carros para Excel

---

## 🛠️ Comandos Úteis

```bash
# Ver o banco de dados visualmente
npx prisma studio

# Parar o banco de dados Docker
docker-compose -f docker-compose.dev.yml down

# Ver logs do banco de dados
docker-compose -f docker-compose.dev.yml logs -f

# Resetar tudo (⚠️ apaga dados!)
docker-compose -f docker-compose.dev.yml down -v
rm -rf prisma/migrations
npx prisma migrate dev --name init
npx tsx scripts/create-admin.ts
```

---

## 📚 Próximos Passos

1. ✅ Adicionar alguns carros no painel admin
2. ✅ Testar o fluxo de interesse de um cliente
3. ✅ Criar posts no blog
4. ✅ Explorar o código e customizar

---

## 💡 Dicas

- Use `npx prisma studio` para visualizar e editar dados facilmente
- O Prisma Studio abre em http://localhost:5555
- Todos os emails de teste podem usar qualquer domínio
- O WhatsApp usa o número `5511999999999` - altere em `InterestModal.tsx`

---

**Precisa de ajuda?** Consulte o [README.md](./README.md) completo!
