# Sistema de Concessionária de Carros

Sistema completo de gestão de concessionária com área pública para clientes e painel administrativo.

## 🚀 Tecnologias Utilizadas

- **Next.js 14+** com App Router
- **TypeScript** para type safety
- **Tailwind CSS** com tema personalizado
- **PostgreSQL** com Prisma ORM
- **NextAuth.js v5** para autenticação
- **React Hook Form + Zod** para validação
- **Lucide React** para ícones
- **XLSX** para exportação de dados

## 🎨 Design System

### Cores Personalizadas

- **Primary (Azul Marinho)**: Confiança e profissionalismo
- **Secondary (Cinza Prata)**: Modernidade e elegância
- **Accent (Vermelho Vibrante)**: Chamadas para ação

## 📁 Estrutura do Projeto

```
concessionaria/
├── app/
│   ├── (public)/          # Área pública
│   │   ├── page.tsx       # Home
│   │   ├── catalogo/      # Catálogo de veículos
│   │   └── layout.tsx     # Layout público
│   ├── (admin)/           # Área administrativa
│   │   └── admin/
│   │       ├── page.tsx   # Dashboard
│   │       ├── carros/    # Gestão de carros
│   │       ├── leads/     # Gestão de leads
│   │       ├── usuarios/  # Gestão de usuários
│   │       ├── posts/     # Gestão de posts
│   │       └── login/     # Login
│   ├── api/               # API Routes
│   │   ├── auth/          # Autenticação
│   │   ├── cars/          # CRUD de carros
│   │   ├── leads/         # CRUD de leads
│   │   └── export/        # Exportação de dados
│   └── globals.css        # Estilos globais
├── components/
│   ├── public/            # Componentes públicos
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── CarCard.tsx
│   │   ├── CatalogFilters.tsx
│   │   └── InterestModal.tsx
│   └── admin/             # Componentes admin
│       └── AdminSidebar.tsx
├── lib/
│   └── prisma.ts          # Cliente Prisma
├── prisma/
│   └── schema.prisma      # Schema do banco
├── auth.ts                # Configuração NextAuth
└── middleware.ts          # Middleware de autenticação
```

## 🔧 Configuração e Instalação

### Opção 1: Setup Rápido com Docker (Recomendado) 🐳

O jeito mais fácil de começar é usar Docker com o script de setup automático:

```bash
# 1. Instalar dependências
npm install

# 2. Executar o script de setup (configura banco de dados e cria usuário admin)
./setup.sh
```

O script vai:

- ✅ Criar o arquivo `.env` automaticamente
- ✅ Iniciar o PostgreSQL no Docker
- ✅ Executar as migrations do Prisma
- ✅ Criar um usuário administrador padrão

Depois execute:

```bash
# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

### Opção 2: Docker Completo (Produção) 🚀

Para executar a aplicação completa em containers Docker:

```bash
# Build e iniciar todos os serviços (app + banco)
./docker-start.sh
```

Ou manualmente:

```bash
docker-compose up -d
```

### Opção 3: Setup Manual (Sem Docker) 🛠️

#### 1. Instalar Dependências

```bash
npm install
```

#### 2. Configurar PostgreSQL

Certifique-se de ter o PostgreSQL instalado e rodando localmente.

#### 3. Configurar Variáveis de Ambiente

#### 3. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/concessionaria?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
```

#### 4. Configurar o Banco de Dados

```bash
# Gerar o cliente Prisma
npx prisma generate

# Executar as migrations
npx prisma migrate dev --name init

# (Opcional) Abrir o Prisma Studio para visualizar o banco
npx prisma studio
```

#### 5. Criar Usuário Administrador

```bash
npx tsx scripts/create-admin.ts
```

#### 6. Executar o Projeto

```bash
npm run dev
```

### 🔑 Acesso ao Sistema

Acesse:

- **Área Pública**: http://localhost:3000
- **Painel Admin**: http://localhost:3000/admin/login

**Credenciais padrão:**

- Email: `admin@concessionaria.com`
- Senha: `admin123`

⚠️ **Importante**: Altere a senha padrão após o primeiro login!

## 📱 Funcionalidades

### Área Pública

- ✅ **Home Page**: Banner hero, destaques de carros, últimas notícias
- ✅ **Catálogo**: Grid de carros com filtros (marca, ano, preço)
- ✅ **Detalhes do Carro**: Galeria de fotos, especificações, descrição
- ✅ **Formulário de Interesse**: Captura de leads com validação
- ✅ **Integração WhatsApp**: Redirecionamento automático após cadastro
- ✅ **Responsivo**: Design adaptável para mobile, tablet e desktop

### Área Administrativa

- ✅ **Dashboard**: Estatísticas e resumo do sistema
- ✅ **Gestão de Carros**: CRUD completo com upload de imagens
- ✅ **Gestão de Leads**: Visualização de contatos interessados
- ✅ **Gestão de Usuários**: Controle de operadores (apenas admin)
- ✅ **Gestão de Posts**: Blog/notícias para a área pública
- ✅ **Exportação**: Download de carros disponíveis em Excel
- ✅ **Autenticação**: Login seguro com NextAuth

## 🔐 Segurança

- Senhas hasheadas com bcrypt
- Rotas protegidas com middleware
- Validação de dados com Zod
- Session JWT com NextAuth v5

## 📊 Models do Banco de Dados

### User

- id, name, email, password, role (ADMIN/OPERATOR)

### Car

- id, brand, model, year, price, description, images[], status (AVAILABLE/SOLD)

### Lead

- id, name, email, phone, carId, createdAt

### Post

- id, title, slug, content, excerpt, image, published, authorId

## 🎯 Próximos Passos

1. Implementar upload de imagens (pode usar Cloudinary ou AWS S3)
2. Adicionar páginas de CRUD para usuários e posts
3. Implementar busca avançada no catálogo
4. Adicionar paginação nas listagens
5. Criar dashboard com gráficos (usando Chart.js ou Recharts)
6. Implementar notificações por email
7. Adicionar testes automatizados

## 📝 Scripts Disponíveis

```bash
npm run dev      # Inicia o servidor de desenvolvimento
npm run build    # Cria a build de produção
npm run start    # Inicia o servidor de produção
npm run lint     # Executa o linter
```

## 🐳 Docker Commands

```bash
# Desenvolvimento (apenas banco de dados)
docker-compose -f docker-compose.dev.yml up -d      # Iniciar
docker-compose -f docker-compose.dev.yml down       # Parar
docker-compose -f docker-compose.dev.yml logs -f    # Ver logs

# Produção (app + banco)
docker-compose up -d                                # Iniciar
docker-compose down                                 # Parar
docker-compose logs -f                              # Ver logs
docker-compose ps                                   # Status dos containers
docker-compose restart                              # Reiniciar
docker-compose exec app npx prisma studio           # Abrir Prisma Studio no container
```

## 🗄️ Comandos Úteis do Prisma

```bash
npx prisma studio           # Interface visual do banco
npx prisma generate         # Gerar Prisma Client
npx prisma migrate dev      # Criar e aplicar migration
npx prisma migrate deploy   # Aplicar migrations (produção)
npx prisma db push          # Sincronizar schema (desenvolvimento)
npx prisma db seed          # Popular banco com dados de teste
```

## 🤝 Contribuindo

Este é um projeto de exemplo. Sinta-se livre para adaptá-lo às suas necessidades!

## 📄 Licença

MIT License - Sinta-se livre para usar este projeto como base para seus próprios projetos.
