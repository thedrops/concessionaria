#!/bin/bash

# Script para copiar imagens do sistema antigo para o novo
#
# USO:
# ./scripts/copy-images.sh /caminho/para/pasta/antiga/imagens

SOURCE_DIR="$1"
TARGET_DIR="./public/uploads/cars"

# Verifica se foi passado o diretório origem
if [ -z "$SOURCE_DIR" ]; then
  echo "❌ Erro: Especifique o diretório de origem das imagens"
  echo ""
  echo "Uso: $0 /caminho/para/pasta/antiga/imagens"
  echo ""
  echo "Exemplo:"
  echo "  $0 /var/www/html/storage/app/public/veiculos"
  echo "  $0 ~/old-site/public/uploads/veiculos"
  exit 1
fi

# Verifica se o diretório existe
if [ ! -d "$SOURCE_DIR" ]; then
  echo "❌ Erro: Diretório não encontrado: $SOURCE_DIR"
  exit 1
fi

# Cria diretório de destino se não existir
mkdir -p "$TARGET_DIR"

echo "📁 Diretório origem: $SOURCE_DIR"
echo "📁 Diretório destino: $TARGET_DIR"
echo ""

# Conta quantas imagens existem
TOTAL=$(find "$SOURCE_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) | wc -l)
echo "📊 Total de imagens encontradas: $TOTAL"
echo ""

if [ $TOTAL -eq 0 ]; then
  echo "⚠️  Nenhuma imagem encontrada no diretório especificado"
  exit 0
fi

# Confirma antes de copiar
read -p "Deseja copiar todas as imagens? (s/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
  echo "❌ Operação cancelada"
  exit 0
fi

echo "🚀 Copiando imagens..."
echo ""

COPIED=0
SKIPPED=0

# Copia as imagens
find "$SOURCE_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) | while read -r file; do
  filename=$(basename "$file")

  if [ -f "$TARGET_DIR/$filename" ]; then
    echo "  ⏩ Pulando (já existe): $filename"
    ((SKIPPED++))
  else
    cp "$file" "$TARGET_DIR/"
    echo "  ✓ Copiado: $filename"
    ((COPIED++))
  fi
done

echo ""
echo "✅ Cópia concluída!"
echo "   - Imagens copiadas: $COPIED"
echo "   - Imagens puladas: $SKIPPED"
echo ""
echo "💡 Agora você pode acessar o sistema e as imagens devem aparecer corretamente!"
