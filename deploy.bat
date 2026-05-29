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
ssh root@2.24.86.33 "cd /var/www/nexdash && echo '📦 Fazendo backup de seguranca de TODOS os bancos de dados na VPS...' && rm -rf /tmp/nexdash_backup && mkdir -p /tmp/nexdash_backup && cp *.db /tmp/nexdash_backup/ 2>/dev/null; cp -r auth_sessions /tmp/nexdash_backup/auth_sessions 2>/dev/null; echo '🧹 Limpando conflitos temporarios...' && git reset --hard HEAD && git clean -fd && echo '📥 Puxando novo codigo do Git...' && git pull origin main && echo '💾 Restaurando seus bancos de dados e login do WhatsApp...' && cp /tmp/nexdash_backup/*.db . 2>/dev/null; [ -d /tmp/nexdash_backup/auth_sessions ] && { rm -rf auth_sessions; cp -r /tmp/nexdash_backup/auth_sessions . 2>/dev/null; }; rm -rf /tmp/nexdash_backup; echo '📦 Instalando novas dependencias na VPS...' && npm install && echo '🛠️ Compilando Front-end (Vite)...' && cd client && npm run build && echo '🔄 Reiniciando Servidor (PM2)...' && pm2 restart nexdash"

echo.
echo =======================================================
echo 🎉 DEPLOY CONCLUIDO COM SUCESSO!
echo 🌐 Acesse seu painel: https://crm.legattoorg.com.br
echo =======================================================
pause
