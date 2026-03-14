# Studio Nails - Gestão de Salão

Sistema de gestão completo para salões de beleza, focado em agilidade, controle financeiro e fidelização de clientes.

## 🚀 Tecnologias

- **Frontend**: React 19 + Vite
- **Estilização**: Tailwind CSS 4
- **Backend/Banco de Dados**: Supabase (PostgreSQL, Auth, Storage)
- **Ícones**: Lucide React
- **Datas**: date-fns

## ✨ Funcionalidades

- **Dashboard**: Visão geral de atendimentos e métricas.
- **Agenda**: Controle total de horários e serviços.
- **Clientes**: Gestão de base de clientes com histórico e preferências.
- **Finanças**: Controle de entradas, saídas e status de pagamento.
- **Configurações**: Personalização do sistema.

## 🛠️ Instalação e Desenvolvimento

1. Clone o repositório:
   ```bash
   git clone [url-do-repositorio]
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto com:
   ```env
   VITE_SUPABASE_URL=seu_projeto_url
   VITE_SUPABASE_ANON_KEY=sua_anon_key
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 📦 Build e Deploy

Para gerar o build de produção:
```bash
npm run build
```

O sistema está configurado para deploy imediato no **Vercel**, utilizando o arquivo `vercel.json` para gerenciamento de rotas SPA.

## 📄 Licença

Este projeto está sob a licença ISC.
