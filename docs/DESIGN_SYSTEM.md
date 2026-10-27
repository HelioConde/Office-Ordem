# Office Ordem — Design System e decisão arquitetural

## Proteção do projeto histórico
O repositório guardava apenas um build Create React App compilado, com JS e CSS em `static/` e caminhos absolutos. O código fonte editável original não estava disponível. Para evitar apagar ou fingir recuperar o projeto antigo, os arquivos `static/`, `asset-manifest.json` e outros artefatos seguem no histórico Git. O arquivo `index.html` foi substituído por **uma demonstração estática explicitamente identificada**.

## Taste Skill
Tokens CSS em `demo.css` com espaçamento de 4 a 48px, `--navy`, `--blue`, superfícies, bordas e foco. Hierarquia visual de dashboard administrativo com azul-marinho, cartões claros e tabela de serviços.

## Web Design Guidelines
Sem bibliotecas, mouse-only ou dependências externas. Navegação por teclado; rótulos de formulário e validação nativa; `dialog` com foco inicial; textos inseridos via `textContent` (contra injeção HTML); confirmação explícita ao excluir e restaurar; respeito a `prefers-reduced-motion`; contraste e touch targets, tabela rolável em celular.

## Awesome Design + Image to Code
Reinterpretação conservadora do conceito de gestão de ordens. Fonte original React está ausente; portanto o redesign **não afirma recriar fielmente a UI histórica**. Sem imagens genéricas desnecessárias; novo ícone tipográfico e seções funcionais.

## GitHub Pages, privacidade e dados
A build Pages publica apenas `index.html`, `demo.css`, `demo.js` e `favicon.ico`. Nenhuma API, PHP, SQL, credencial, login real ou sincronização entre dispositivos.
Os exemplos são fictícios. Edição, criação, pesquisa, filtro, exclusão com confirmação e exportação JSON operam no `localStorage` do navegador. **Não inserir dados pessoais/operacionais reais.** Dados locais podem ser apagados pelo navegador e não devem ser usados como banco de produção.

## Verificação
Workflow `.github/workflows/pages.yml` valida sintaxe JS, publica artefatos estáticos, inicia HTTP server e testa ações/screenshot via Playwright em desktop e mobile. GitHub Pages precisa estar configurado com Source: GitHub Actions. URL planejada: `https://helioconde.github.io/Office-Ordem/`.
