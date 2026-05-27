#!/bin/bash

# Exit on error
set -e

echo "====================================================="
echo "   Estúdio Milla & Lipe CRM — Instalador VPS Ubuntu"
echo "====================================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Erro: Por favor, execute este script como root (ou usando sudo)."
  exit 1
fi

# Request domain name
read -p "Digite o domínio ou subdomínio que você vai usar (ex: crm.seudominio.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
  echo "Erro: O domínio não pode ser vazio."
  exit 1
fi

echo "--- 1. Atualizando pacotes do sistema ---"
apt-get update && apt-get upgrade -y

echo "--- 2. Instalando dependências essenciais (Git, Nginx, Certbot) ---"
apt-get install -y curl git wget build-essential nginx certbot python3-certbot-nginx

echo "--- 3. Instalando Node.js 20 (LTS) ---"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "--- 4. Verificando versões instaladas ---"
echo "Node.js: $(node -v)"
echo "NPM: $(npm -v)"

echo "--- 5. Instalando PM2 (Gerenciador de Processos) ---"
npm install -g pm2

echo "--- 6. Configurando o Nginx como Proxy Reverso para a porta 3001 ---"
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

cat <<EOT > "$NGINX_CONF"
server {
    listen 80;
    server_name $DOMAIN;

    # Limite máximo de upload para arquivos de mídia
    client_max_body_size 15M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        
        # Suporte a WebSockets (essencial para Socket.io)
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Repasse de headers de rede
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_cache_bypass \$http_upgrade;
    }
}
EOT

# Ativa o arquivo de configuração criando um link simbólico
ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/"

# Remove a configuração padrão do Nginx se ela existir
rm -f /etc/nginx/sites-enabled/default

# Testa a configuração do Nginx e reinicia o serviço
nginx -t
systemctl restart nginx

echo ""
echo "====================================================="
echo "   Configuração básica concluída com sucesso! 🎉"
echo "====================================================="
echo ""
echo "Siga os passos abaixo para finalizar o deploy:"
echo ""
echo "1. APONTAMENTO DNS:"
echo "   No provedor onde comprou seu domínio, crie um registro do tipo A"
echo "   apontando '$DOMAIN' para o IP desta VPS."
echo ""
echo "2. ATIVAR SSL (HTTPS) GRATUITO:"
echo "   Rode o comando abaixo e siga as instruções (digite seu e-mail e aceite os termos):"
echo "   sudo certbot --nginx -d $DOMAIN"
echo ""
echo "3. CONFIGURAR O CÓDIGO DA APLICAÇÃO:"
echo "   - Clone seu repositório Git na VPS (ex: na pasta /var/www/nexdash)."
echo "   - Crie o arquivo .env com suas variáveis de produção."
echo "   - Rode os comandos dentro da pasta do projeto:"
echo "     npm run install:all"
echo "     cd client && npm run build && cd .."
echo ""
echo "4. INICIAR COM PM2 (RODAR EM SEGUNDO PLANO):"
echo "     pm2 start server/index.js --name \"nexdash\""
echo "     pm2 save"
echo "     pm2 startup"
echo ""
echo "Pronto! O sistema estará rodando de forma 100% autônoma e segura."
