# Publicação do Office-Ordem no GitHub Pages

Este repositório contém um build histórico (React/CRA) e uma implementação nova **estática e editável** em `site/`.

## Arquivos e navegação

- `site/index.html`: aplicação principal estática; CSS e JS com caminhos relativos.
- `index.html`: ponto de entrada na raiz, atualizado para carregar os arquivos de `site/`.
- `gh-pages`: branch mínima de cinco arquivos (HTML/CSS/JS/favicon e `.nojekyll`), sem bundles React históricos.
- `.github/workflows/pages.yml`: validação e deploy via GitHub Actions.

A aplicação funciona **sem banco de dados**, salva demonstrações em `localStorage` e permite exportar/importar backup JSON ou CSV. Não é adequada para dados reais.

## Publicar por GitHub Actions

No repositório, em Settings → Pages → Build and deployment, selecionar **GitHub Actions**. O workflow `Office Ordem - Static Pages e QA` prepara os quatro arquivos de `site/` e publica o artefato após o QA.

Se aparecer falha de job **sem logs e sem passos executados**, a infraestrutura/conta do GitHub pode impedir a inicialização do runner. É um bloqueio distinto de falhas no código e precisa ser visto no aviso do próprio GitHub Actions.

## Alternativa sem depender de Actions

No mesmo menu Settings → Pages, selecionar **Deploy from a branch** e escolher branch `gh-pages`, pasta `/(root)`. A branch contém apenas arquivos estáticos.

Alternativa secundária: `main` + `/(root)`. O `index.html` dessa branch carrega `./site/style.css`, `./site/app.js` e `./site/favicon.svg`; os caminhos não começam com `/`.

O endereço esperado, quando a publicação estiver ativa, é:

https://helioconde.github.io/Office-Ordem/

## Testes

`node --test tests/smoke.cjs tests/pages-entry.cjs` valida estrutura. `node tests/pages.cjs` executa Playwright, desde que o pacote e Chromium estejam disponíveis.

O modo Pages não usa backend, credenciais nem sincroniza dispositivos; acesso público não significa hospedagem de dados privados.
