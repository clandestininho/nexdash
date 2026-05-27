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
ssh root@2.24.86.33 "cd /var/www/nexdash && echo '📦 Fazendo backup de seguranca dos dados na VPS...' && cp master.db master.db.bak 2>/dev/null; cp crm_user_14.db crm_user_14.db.bak 2>/dev/null; cp -r auth_sessions auth_sessions_bak 2>/dev/null; echo '🧹 Limpando conflitos temporarios...' && git reset --hard HEAD && git clean -fd && echo '📥 Puxando novo codigo do Git...' && git pull origin main && echo '💾 Restaurando seus bancos de dados e login do WhatsApp...' && [ -f master.db.bak ] && mv master.db.bak master.db; [ -f crm_user_14.db.bak ] && mv crm_user_14.db.bak crm_user_14.db; [ -d auth_sessions_bak ] && { rm -rf auth_sessions; mv auth_sessions_bak auth_sessions; }; echo '📦 Instalando novas dependencias na VPS...' && npm install && echo '🛠️ Compilando Front-end (Vite)...' && cd client && npm run build && echo '🔄 Reiniciando Servidor (PM2)...' && pm2 restart nexdash"

echo.
echo =======================================================
echo 🎉 DEPLOY CONCLUIDO COM SUCESSO!
echo 🌐 Acesse seu painel: https://crm.legattoorg.com.br
echo =======================================================
pause
