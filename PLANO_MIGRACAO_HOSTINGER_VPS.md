# Plano de migracao para Hostinger VPS

## Contexto atual

O projeto e uma aplicacao Next.js 14 com Prisma e PostgreSQL. Hoje a hospedagem esta na Vercel, o banco esta no Supabase PostgreSQL e o armazenamento de imagens usa Supabase Storage.

O novo destino sera uma VPS Hostinger com 2 vCPU, 8 GB de RAM, 100 GB de disco NVMe e 8 TB de largura de banda. A aplicacao, o PostgreSQL e os arquivos enviados pelos usuarios ficarao na propria VPS. O deploy automatico sera feito via GitHub Actions.

## Avaliacao da VPS escolhida

A VPS de 2 vCPU, 8 GB RAM e 100 GB NVMe e adequada para este projeto em producao pequena ou moderada.

Pontos positivos:

1. 2 vCPU dao margem para rodar Next.js, PostgreSQL, proxy reverso, backup e deploy sem disputar um unico nucleo.
2. 8 GB RAM permitem configurar PostgreSQL e aplicacao com folga.
3. 100 GB NVMe sao suficientes para o banco, imagens, logs e alguns backups locais no inicio.
4. 8 TB de banda sao suficientes para um catalogo de veiculos com imagens, salvo trafego muito alto.

Pontos de atencao:

1. Banco, aplicacao, uploads e backups locais ficarao no mesmo servidor.
2. Backups externos continuam obrigatorios para proteger contra perda da VPS, falha de disco ou erro operacional.
3. O disco de 100 GB precisa de monitoramento para evitar crescimento descontrolado de imagens, logs e backups.

## Decisoes de arquitetura

1. Aplicacao
   - Rodar a aplicacao Next.js em container Docker na VPS.
   - Usar `docker compose` para orquestrar aplicacao, PostgreSQL e proxy reverso.
   - Expor publicamente apenas HTTP/HTTPS pelo proxy reverso.

2. Banco de dados
   - Rodar PostgreSQL 16 em container na propria VPS.
   - Persistir dados em volume Docker nomeado ou diretorio montado no host.
   - Usar `prisma migrate deploy` durante o deploy para aplicar migrations.

3. Armazenamento de arquivos
   - Substituir Supabase Storage por armazenamento em disco local persistente.
   - Salvar uploads fora da imagem Docker, em volume ou diretorio do host.
   - Caminho sugerido no host:
     - `/opt/concessionaria/storage/uploads/cars`
     - `/opt/concessionaria/storage/uploads/carousel`
   - Servir os arquivos publicamente pela aplicacao Next.js ou diretamente pelo proxy reverso.

4. Backups
   - Criar backup diario do PostgreSQL com `pg_dump`.
   - Criar backup diario dos uploads locais.
   - Manter somente os ultimos 5 dias localmente.
   - Enviar copia externa dos backups para outro destino sempre que possivel.
   - Agendar via cron no host da VPS.

5. CI/CD
   - GitHub Actions deve:
     - validar o projeto;
     - acessar a VPS via SSH;
     - atualizar o codigo;
     - executar deploy remoto com `docker compose`;
     - aplicar migrations Prisma;
     - reiniciar os containers;
     - executar health check.

## Recursos necessarios na Hostinger

1. VPS
   - Ubuntu LTS.
   - Plano recomendado: 2 vCPU, 8 GB RAM, 100 GB NVMe.
   - IP fixo ou IP publico estavel.
   - Portas abertas:
     - `22/tcp` para SSH, restrito ao necessario;
     - `80/tcp` para HTTP;
     - `443/tcp` para HTTPS.

2. DNS e TLS
   - Apontar o dominio para o IP da VPS.
   - Configurar certificado TLS com Let's Encrypt no proxy reverso.
   - Proxy recomendado:
     - Caddy, por simplicidade de HTTPS automatico; ou
     - Nginx com Certbot, se preferir controle manual.

3. Diretorios persistentes no host
   - `/opt/concessionaria/app`
   - `/opt/concessionaria/storage/uploads`
   - `/opt/concessionaria/backups`
   - `/opt/concessionaria/postgres`

## Variaveis de ambiente de producao

Na VPS, criar um arquivo `.env.production` ou equivalente usado pelo `docker compose`:

```env
NODE_ENV=production
DATABASE_URL=postgresql://concessionaria:SENHA_FORTE@db:5432/concessionaria?schema=public
NEXTAUTH_URL=https://seudominio.com.br
NEXTAUTH_SECRET=gerar_um_secret_forte

POSTGRES_USER=concessionaria
POSTGRES_PASSWORD=SENHA_FORTE
POSTGRES_DB=concessionaria

UPLOAD_STORAGE_DRIVER=local
UPLOADS_DIR=/app/storage/uploads
NEXT_PUBLIC_UPLOADS_BASE_URL=/uploads
```

Se for configurado backup externo, adicionar variaveis especificas do destino escolhido, por exemplo SFTP, rsync, S3 compativel, Google Drive via rclone ou Backblaze B2.

## Mudancas previstas no codigo

1. Criar uma camada de storage local
   - Novo arquivo sugerido: `lib/storage.ts`.
   - Responsabilidades:
     - upload em desenvolvimento usando filesystem local;
     - upload em producao usando diretorio persistente montado no container;
     - remocao de arquivos locais;
     - extracao segura do caminho do arquivo a partir de URLs antigas e novas.

2. Ajustar upload
   - Atualizar `app/api/upload/route.ts`.
   - Remover dependencia direta do Supabase Storage.
   - Salvar arquivos em `UPLOADS_DIR`.
   - Retornar URL publica no formato `/uploads/cars/arquivo.ext` ou `/uploads/carousel/arquivo.ext`.

3. Ajustar exclusao de imagens
   - Atualizar:
     - `app/api/cars/[id]/route.ts`;
     - `app/(admin)/admin/carros/actions.ts`.
   - Trocar chamadas Supabase por remocao local segura.
   - Impedir path traversal ao deletar arquivos.

4. Ajustar URLs de imagem
   - Atualizar `lib/image-url.ts`.
   - Preservar compatibilidade com URLs antigas do Supabase enquanto os dados nao forem normalizados.
   - Suportar URLs locais `/uploads/...`.

5. Ajustar configuracao do Next.js
   - Atualizar `next.config.js` se necessario.
   - Se as imagens forem servidas pelo mesmo dominio, reduzir dependencia de `remotePatterns`.
   - Remover hostname fixo do projeto Supabase depois da migracao completa.

6. Dependencias
   - Remover `@supabase/supabase-js` depois que todas as chamadas diretas forem eliminadas.
   - Status: removido do runtime da aplicacao na branch de migracao.
   - Nao e necessario SDK de S3 para a arquitetura com disco interno.

## Arquivos operacionais previstos

1. `docker-compose.prod.yml`
   - Servicos:
     - `app`;
     - `db`;
     - `caddy` ou `nginx`.
   - Volumes:
     - dados PostgreSQL;
     - uploads persistentes;
     - configuracao e certificados do proxy;
     - backups locais, se o backup rodar em container.

2. `infra/hostinger/bootstrap.sh`
   - Instalar Docker e Docker Compose plugin.
   - Criar diretorios persistentes.
   - Configurar usuario de deploy.
   - Configurar permissoes de storage.
   - Preparar cron de backup.

3. `infra/hostinger/deploy.sh`
   - Receber atualizacao do codigo.
   - Garantir existencia de `.env.production`.
   - Executar `docker compose build`.
   - Executar `docker compose up -d`.
   - Executar `prisma migrate deploy`.
   - Fazer health check local.

4. `infra/hostinger/backup.sh`
   - Executar `pg_dump`.
   - Compactar dump do banco.
   - Compactar diretorio de uploads.
   - Remover backups locais com mais de 5 dias.
   - Opcionalmente enviar copia externa.

5. `.github/workflows/deploy-hostinger.yml`
   - Workflow para deploy automatico no push da branch principal.
   - Usar secrets do GitHub para SSH e configuracoes sensiveis.

## Secrets do GitHub Actions

Criar os seguintes secrets no repositorio:

```text
HOSTINGER_HOST
HOSTINGER_USER
HOSTINGER_SSH_KEY
HOSTINGER_APP_DIR
PRODUCTION_ENV_FILE
```

Opcionalmente, se o workflow montar o arquivo `.env.production` a partir de secrets separados:

```text
DATABASE_URL
NEXTAUTH_URL
NEXTAUTH_SECRET
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DB
UPLOAD_STORAGE_DRIVER
UPLOADS_DIR
NEXT_PUBLIC_UPLOADS_BASE_URL
```

## Plano de migracao de dados

1. Congelar janela de escrita
   - Definir uma janela curta de manutencao.
   - Evitar uploads e cadastros durante a exportacao final.

2. Exportar banco atual do Supabase
   - Gerar dump PostgreSQL do Supabase.
   - Preferir `pg_dump` com formato custom ou SQL plain.

3. Restaurar no PostgreSQL da VPS
   - Subir container PostgreSQL vazio.
   - Restaurar dump.
   - Rodar `prisma migrate deploy` para garantir schema atualizado.

4. Migrar arquivos do Supabase Storage para disco local
   - Baixar objetos dos buckets `car-images` e `carousel-images`.
   - Copiar para os diretorios persistentes:
     - `/opt/concessionaria/storage/uploads/cars`
     - `/opt/concessionaria/storage/uploads/carousel`
   - Preservar nomes de arquivos quando possivel.
   - Atualizar URLs no banco para `/uploads/cars/...` e `/uploads/carousel/...`, ou manter compatibilidade temporaria com URLs antigas do Supabase.

5. Validar aplicacao
   - Login administrativo.
   - Catalogo publico.
   - Upload de imagem.
   - Exclusao de carro e limpeza de arquivo local.
   - Download ZIP de imagens.
   - Cadastro e leitura de leads.

6. Virada de DNS
   - Reduzir TTL antes da migracao.
   - Apontar dominio para o IP da VPS.
   - Validar HTTPS.

## Plano de backup

1. Backup diario
   - Rodar uma vez por dia via cron.
   - Banco:
     - `concessionaria-db-YYYY-MM-DD-HHMMSS.sql.gz`
   - Uploads:
     - `concessionaria-uploads-YYYY-MM-DD-HHMMSS.tar.gz`

2. Retencao local
   - Manter backups locais por ate 5 dias.
   - Remover automaticamente arquivos mais antigos.

3. Copia externa recomendada
   - Como banco e uploads ficarao no mesmo disco da VPS, manter somente backup local nao e suficiente.
   - Destinos possiveis:
     - outro servidor via `rsync`;
     - storage S3 compativel;
     - Backblaze B2;
     - Google Drive via `rclone`;
     - recurso de backup/snapshot da Hostinger.

4. Restauracao
   - Documentar comando de restore do PostgreSQL.
   - Documentar restore dos uploads.
   - Testar restore em ambiente separado antes da virada final.

## Ordem de execucao proposta

1. Criar branch de migracao.
2. Alterar storage da aplicacao para disco local persistente.
3. Remover uso direto do Supabase Storage.
4. Adicionar arquivos Docker/infra para producao na Hostinger.
5. Adicionar script de backup com retencao de 5 dias.
6. Adicionar workflow GitHub Actions.
7. Testar build local.
8. Provisionar VPS Hostinger.
9. Executar bootstrap da VPS.
10. Fazer deploy inicial sem virar DNS.
11. Migrar dump do banco.
12. Migrar arquivos do Supabase Storage para disco local.
13. Validar aplicacao em URL temporaria/IP.
14. Configurar dominio e TLS.
15. Virar DNS.
16. Monitorar logs, disco, memoria, CPU e backups por pelo menos 48 horas.

## Riscos e cuidados

1. Banco, aplicacao e arquivos na mesma VPS
   - E simples e economico, mas cria dependencia forte do mesmo servidor.
   - Mitigacao: backup externo e snapshots regulares.

2. Disco local
   - Uploads, banco, logs e backups competem pelos 100 GB.
   - Mitigacao: monitoramento de disco, rotacao de logs e retencao curta de backups.

3. URLs antigas do Supabase
   - O banco pode conter URLs absolutas antigas.
   - A migracao deve decidir entre atualizar todas as URLs ou manter compatibilidade temporaria.

4. Deploy e build na VPS
   - Build Next.js consome CPU e memoria.
   - A VPS escolhida suporta, mas deploy pode causar lentidao momentanea.
   - Alternativa futura: buildar imagem no GitHub Actions e apenas puxar na VPS.

5. Backups locais
   - Backups locais ajudam contra erro de aplicacao, mas nao protegem contra perda da VPS.
   - Backup externo deve ser tratado como obrigatorio para producao.

## Criterios de aceite

1. Aplicacao rodando na Hostinger VPS com HTTPS.
2. PostgreSQL persistente na propria VPS.
3. Uploads novos gravando em disco local persistente.
4. Exclusao de imagens removendo arquivos locais.
5. Backups diarios de banco e uploads funcionando com retencao local de 5 dias.
6. Copia externa de backup definida ou preparada.
7. Deploy automatico via GitHub Actions funcionando no push da branch principal.
8. Dados e imagens existentes migrados ou com compatibilidade garantida.
9. Comandos de restore documentados e testados.
