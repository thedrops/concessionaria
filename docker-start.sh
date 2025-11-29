#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Building and starting Concessionária with Docker (Production Mode)${NC}\n"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Stop any running containers
echo -e "${BLUE}🛑 Stopping any running containers...${NC}"
docker-compose down

# Build and start the services
echo -e "${BLUE}🔨 Building Docker images...${NC}"
docker-compose build

echo -e "${BLUE}🚢 Starting services...${NC}"
docker-compose up -d

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 10

echo -e "\n${GREEN}✅ Application is running!${NC}\n"
echo -e "${BLUE}📚 Access:${NC}"
echo -e "  • Application: ${GREEN}http://localhost:3000${NC}"
echo -e "  • Admin Panel: ${GREEN}http://localhost:3000/admin/login${NC}"
echo -e "  • Database: ${GREEN}localhost:5432${NC}\n"
echo -e "${BLUE}🛠️  Useful commands:${NC}"
echo -e "  • View logs: ${GREEN}docker-compose logs -f${NC}"
echo -e "  • Stop services: ${GREEN}docker-compose down${NC}"
echo -e "  • Restart services: ${GREEN}docker-compose restart${NC}"
echo -e "  • View running containers: ${GREEN}docker-compose ps${NC}\n"
