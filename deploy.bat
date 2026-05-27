@echo off
echo =======================================================
echo 🚀 INICIANDO DEPLOY AUTOMATICO - NEXDASH
echo =======================================================
echo.

echo 📦 1. Salvando e enviando alteracoes locais para o Git...
git add .
git commit -m "feat: atualizacoes e melhorias de layout do sistema"
git push origin main
echo.
echo -------------------------------------------------------

echo ☁️ 2. Conectando a VPS (2.24.86.33) e atualizando codigo...
ssh root@2.24.86.33 "cd /var/www/nexdash && echo '📥 Puxando novo codigo do Git...' && git pull origin main && echo '🛠️ Compilando Front-end (Vite)...' && cd client && npm run build && echo '🔄 Reiniciando Servidor (PM2)...' && pm2 restart nexdash"

echo.
echo =======================================================
echo 🎉 DEPLOY CONCLUIDO COM SUCESSO!
echo 🌐 Acesse seu painel: https://crm.legattoorg.com.br
echo =======================================================
pause
