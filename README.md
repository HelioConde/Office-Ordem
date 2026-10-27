# Office Ordem — Modernização para GitHub Pages

Painel de ordens de serviço funcional em HTML, CSS e JavaScript, **sem banco de dados ou servidor**.

- Criar, editar e excluir serviços; acompanhar status, prioridade, valor e prazo.
- Pesquisar, filtrar, consultar indicadores e exportar CSV/JSON.
- Importar backups JSON validados e restaurar dados fictícios.
- Armazenamento somente no localStorage deste navegador.
- Navegação responsiva, teclado, foco visível, movimento reduzido e feedback acessível.

**Aviso:** sistema demonstrativo local. Não há login, contas reais nem sincronização. Evite dados pessoais reais em computadores compartilhados.

## Testar localmente
Use python -m http.server 8000 na raiz do repositório e abra http://localhost:8000/.

## GitHub Pages
Após integração na branch main, selecione Settings > Pages > Source: GitHub Actions. A publicação roda testes em Node, captura telas com Playwright e publica o site em https://helioconde.github.io/Office-Ordem/.

## Preservação histórica
A compilação React original ainda está em static/. Pode ser vista em legacy.html, com envio de formulário bloqueado. O código-fonte antigo não foi recuperado; o formulário original apontava para localhost e não funciona no GitHub Pages.

Consulte docs/DESIGN_SYSTEM.md e docs/PAGES.md para arquitetura, limites e plano de QA.
