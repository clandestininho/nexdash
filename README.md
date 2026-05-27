# Estúdio Milla & Lipe CRM — CRM Automático de Leads via WhatsApp

Este é um sistema de CRM completo e automatizado para o estúdio criativo **Estúdio Milla & Lipe**. A principal funcionalidade é a leitura de conversas de WhatsApp em tempo real, utilizando Inteligência Artificial (Claude 3.5 da Anthropic) para classificar o estágio de vendas do cliente no funil e aplicar a etiqueta correta no WhatsApp automaticamente — sem necessidade de intervenção humana.

---

## 🎨 Sistema de Design e Estética Premium

O sistema foi construído seguindo uma identidade visual sofisticada, com inspiração artística e aconchegante, fugindo do visual padrão de SaaS genéricos:
- **Cores Harmoniosas:** Creme (`#F5F0E8`), Dourado (`#C9A84C`), Escuro (`#1A1611`), Sálvia (`#7A8C6E`) e Terracota (`#B05C3A`).
- **Tipografia Elegante:** Fontes display (serifadas) da Google Fonts (`Playfair Display` para títulos e `DM Sans` para leitura/corpo).
- **Interface Flutuante (Glassmorphism):** Painéis e cartões translúcidos com bordas suaves e micro-animações de interação.

---

## 🚀 Principais Funcionalidades

1. **Leitura em Tempo Real:** Conexão com o WhatsApp Business via biblioteca `Baileys`.
2. **Classificação por IA (Claude):** Análise contextual das últimas 10-20 mensagens da conversa para identificar a intenção de compra do cliente.
3. **Sincronização e Aplicação de Etiquetas:** Atualização em tempo real das etiquetas das conversas no WhatsApp Business de acordo com o estágio.
4. **Kanban Interativo:** Visualização em colunas dos contatos no funil de vendas, permitindo arrastar para forçar uma transição (override manual).
5. **Painel de Auditoria e Logs:** Histórico detalhado de todas as classificações feitas pela IA ou de forma manual.
6. **Métricas de Conversão:** Visualização de leads totais, contatos por estágio, conversões do dia e nível médio de confiança da IA.
7. **Controle de Frequência (Cooldown):** Evita chamadas repetidas da API da Anthropic para a mesma conversa em um curto período (configurável, padrão de 30 minutos).
8. **Lista Negra (Blacklist):** Filtro de contatos para ignorar chats pessoais, familiares ou de equipe.

---

## 🏗️ Arquitetura do Sistema

```
                        ┌────────────────────────┐
                        │      Client (React)    │
                        └───────────┬────────────┘
                                    │ HTTP / WebSockets
                                    ▼
                        ┌────────────────────────┐
                        │    Express + Socket    │
                        └───────────┬────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
┌───────────────────────┐ ┌───────────────────┐ ┌───────────────────────┐
│     sql.js Database   │ │  Claude API (AI)  │ │   Baileys WhatsApp    │
└───────────────────────┘ └───────────────────┘ └───────────────────────┘
```

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- Conta no **WhatsApp Business** (recomendado para suporte completo às etiquetas de conversa)
- Uma chave de API da [Anthropic Console](https://console.anthropic.com/) (para o modelo Claude)

---

## ⚙️ Instalação e Configuração

### 1. Clonar o repositório ou abrir a pasta do projeto

Certifique-se de que os arquivos do servidor e do cliente estão devidamente organizados nas pastas `/server` e `/client`.

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (copiando do `.env.example` se disponível):

```bash
PORT=3001
DB_PATH=./crm.db
SESSION_PATH=./auth_session
ANTHROPIC_API_KEY=sua_chave_do_claude_aqui
```

### 3. Instalar Dependências

O projeto utiliza pacotes separados no servidor e no cliente React. Para instalar tudo de uma vez, execute o seguinte script a partir da raiz:

```bash
npm run install:all
```

Isso instalará os módulos do servidor e, em seguida, entrará na pasta `/client` para instalar as dependências do React.

---

## 💻 Executando o Sistema localmente

Com todas as dependências instaladas e o arquivo `.env` configurado, você pode rodar o servidor e o cliente simultaneamente com um único comando na raiz do projeto:

```bash
npm run dev
```

Este comando inicia:
- O backend rodando em `http://localhost:3001`
- O frontend Vite rodando em `http://localhost:5173`

---

## 🧪 Estrutura de Estágios de Vendas

A inteligência artificial irá classificar os clientes nos seguintes estágios padrão:

| ID do Estágio | Nome de Exibição | Emoji | Descrição/Critério |
| :--- | :--- | :--- | :--- |
| `novo-lead` | Novo Lead | 🟢 | Primeiro contato, pedindo orçamentos ou demonstrando interesse inicial. |
| `qualificando` | Qualificando | 🔵 | Conversando sobre datas, locais, estilos e detalhes do evento/projeto. |
| `proposta-enviada`| Proposta Enviada | 🟡 | Envio do orçamento detalhado, termos ou PDF de valores. |
| `negociando` | Negociando | 🟠 | Discussão de preços, descontos, formas de parcelamento ou "vou pensar". |
| `fechado` | Fechado | ✅ | Confirmação da data, envio de PIX, assinatura de contrato ou aceite verbal final. |
| `em-producao` | Em Produção | 🔨 | Sessão/vídeo ocorrendo, edição de fotos, montagem ou pós-produção ativa. |
| `entregue` | Entregue | 🎉 | Entrega do material editado, link do drive e elogios de conclusão. |
| `perdido` | Perdido | 🔴 | Desistência explícita, "ficou caro" ou silêncio prolongado sem resposta. |

---

## 🛠️ Resolução de Problemas Comuns

### 1. O QR Code não carrega ou demora a aparecer
- Certifique-se de que a porta `3001` está livre e o servidor backend iniciou sem erros de banco de dados.
- Verifique o console do terminal para ver se não há problemas de conexão de rede externa.

### 2. A classificação com IA não está funcionando
- Verifique se você salvou sua chave Anthropic correta na página de **Configurações** do sistema ou no arquivo `.env`.
- Verifique se as mensagens estão chegando e sendo salvas no histórico do cliente.
- Certifique-se de que o contato não está na **Lista Negra** do sistema.
- Lembre-se do **Cooldown** (padrão 30 minutos): a mesma conversa só é reclassificada uma vez a cada meia hora para economizar tokens de API.

### 3. As etiquetas não atualizam no celular
- O recurso de etiquetas (Labels) é nativo do **WhatsApp Business**. Se você conectar um número de WhatsApp pessoal, a sincronização de etiquetas pode não ser suportada pela infraestrutura do WhatsApp, embora o sistema continue funcionando perfeitamente no painel Kanban web.

---

## 📄 Licença

Desenvolvido exclusivamente para o **Estúdio Milla & Lipe**. Uso interno ou sob permissão explícita dos autores.
