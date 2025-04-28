
# EduNotas - Sistema de Gerenciamento de Notas Educacionais

## 📋 Sobre
EduNotas é uma aplicação web para gerenciamento de notas e cursos educacionais, permitindo que professores e alunos organizem e compartilhem anotações de forma eficiente.

## 🚀 Funcionalidades

- 👤 Autenticação de usuários
- 📚 Gerenciamento de cursos
- 📝 Sistema de anotações
- 👥 Gerenciamento de usuários
- 📊 Relatórios e estatísticas
- 🏷️ Organização por tags

## 💻 Tecnologias

- Frontend:
  - React
  - TypeScript
  - TailwindCSS
  - Shadcn/ui
  - React Query

- Backend:
  - Node.js
  - Express
  - SQLite
  - TypeScript

## 🛠️ Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 🔑 Autenticação

O sistema possui dois tipos de usuários:
- Administrador: Acesso total ao sistema
- Usuário comum: Acesso às notas e cursos

Credenciais padrão de administrador:
- Email: admin@example.com
- Senha: admin

## 🌐 Rotas da API

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/me` - Dados do usuário atual

### Notas
- `GET /api/notes` - Listar notas
- `POST /api/notes` - Criar nota
- `PUT /api/notes/:id` - Atualizar nota
- `DELETE /api/notes/:id` - Deletar nota

### Cursos
- `GET /api/courses` - Listar cursos
- `POST /api/courses` - Criar curso
- `PUT /api/courses/:id` - Atualizar curso
- `DELETE /api/courses/:id` - Deletar curso

## 👥 Contribuição

Para contribuir com o projeto:
1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Envie um pull request

## 📄 Licença

Este projeto está sob a licença MIT.
