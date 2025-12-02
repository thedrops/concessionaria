#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Concessionária Setup with Docker${NC}\n"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${BLUE}📝 Creating .env file...${NC}"
    cat > .env << EOF
DATABASE_URL="postgresql://concessionaria:concessionaria_password@localhost:5432/concessionaria?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
EOF
    echo -e "${GREEN}✅ .env file created${NC}\n"
else
    echo -e "${GREEN}✅ .env file already exists${NC}\n"
fi

# Start only the database for development
echo -e "${BLUE}🐘 Starting PostgreSQL database...${NC}"
docker compose -f docker-compose.dev.yml up -d

# Wait for database to be ready
echo -e "${BLUE}⏳ Waiting for database to be ready...${NC}"
sleep 5

# Run Prisma migrations
echo -e "${BLUE}🔄 Running database migrations...${NC}"
npx prisma migrate dev --name init

# Generate Prisma Client
echo -e "${BLUE}⚙️  Generating Prisma Client...${NC}"
npx prisma generate

# Create admin user
echo -e "${BLUE}👤 Creating admin user...${NC}"
npx tsx scripts/create-admin.ts

echo -e "\n${GREEN}✅ Setup complete!${NC}\n"
echo -e "${BLUE}📚 Next steps:${NC}"
echo -e "  1. Run ${GREEN}npm run dev${NC} to start the development server"
echo -e "  2. Access the application at ${GREEN}http://localhost:3000${NC}"
echo -e "  3. Login to admin panel at ${GREEN}http://localhost:3000/admin/login${NC}"
echo -e "     Email: ${GREEN}admin@concessionaria.com${NC}"
echo -e "     Password: ${GREEN}admin123${NC}\n"
echo -e "${BLUE}🛠️  Useful commands:${NC}"
echo -e "  • View database: ${GREEN}npx prisma studio${NC}"
echo -e "  • Stop database: ${GREEN}docker-compose -f docker-compose.dev.yml down${NC}"
echo -e "  • View logs: ${GREEN}docker-compose -f docker-compose.dev.yml logs -f${NC}\n"
