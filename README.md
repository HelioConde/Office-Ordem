# Office Ordem — demonstração estática moderna

Projeto de gestão de ordens de serviço com dashboard, busca, filtros por status, criação, edição, exclusão confirmada, indicadores e exportação JSON.

## Como funciona
- **Sem servidor, PHP ou banco de dados.** Tudo ocorre no navegador por meio do `localStorage`.
- Três ordens de exemplo fictícias ao primeiro acesso.
- Persistência só no mesmo dispositivo/navegador. Não há contas, sincronização nem recuperação automática.
- Use **somente dados fictícios**. Não há salvaguardas de aplicação profissional para dados de clientes.

## Execução
Sirva a raiz por HTTP: `python -m http.server 8000` e abra http://localhost:8000.

## GitHub Pages
Workflow: `.github/workflows/pages.yml`; publica apenas o conjunto estático permitido depois de validar JS e auditoria visual.
Configuração: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
Endereço esperado: https://helioconde.github.io/Office-Ordem/

## Preservação do antigo
O repositório continha somente um build antigo React/Create React App, sem o código-fonte original. Os artefatos `static/`, `asset-manifest.json`, `manifest.json` e demais arquivos seguem versionados; o `index.html` original é recuperável pelo histórico anterior à migração. A nova UI é uma **demonstração independente**, não um sistema comercial nem recuperação integral do app antigo.

Design e decisões em [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).
