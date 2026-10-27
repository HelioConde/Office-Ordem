# Office Ordem — Demonstração estática

O projeto original contém somente um build React legado, sem seus fontes. A pasta `site/` é uma recriação independente e editável em HTML/CSS/JavaScript, preservando a ideia de gerir ordens de serviço.

## Funcionalidades
- Criar, buscar, filtrar, editar, excluir com confirmação e imprimir ordens.
- Indicadores de status, exportação JSON e recuperação de exemplos.
- Dados apenas no navegador atual (`localStorage`). Sem API, PHP, servidor ou banco.
- Design responsivo, foco visível, suporte a movimento reduzido e QA Playwright.

**Importante:** modo demonstração, sem login ou sincronização. Não use informações reais de clientes.

## GitHub Pages e privacidade

O repositório foi verificado como **privado em 27/10/2026**. A execução de publicação apresentou falha antes dos passos de deploy; não é possível afirmar que o site esteja publicado. O workflow foi separado para sempre produzir QA e um ZIP de quatro arquivos estáticos, mesmo quando a publicação não estiver habilitada.

Para hospedar no GitHub Pages público, confirme que pode tornar o repositório público em **Settings → General → Danger Zone → Change repository visibility**; isso expõe **todo o histórico do repositório**, não só os quatro arquivos estáticos. Portanto, **não mude a visibilidade antes de inspecionar o histórico e remover/revogar quaisquer segredos**, se existirem. Depois, em **Settings → Pages → Build and deployment**, selecione **GitHub Actions** e execute o workflow. Para manter o repositório privado, é necessária elegibilidade/configuração de Pages compatível; a execução atual não confirma essa disponibilidade.

O workflow publica exclusivamente os quatro arquivos de `site/` se o repositório estiver público; quando privado, guarda o pacote `office-ordem-site-estatico` em **Actions → Artefatos**, sem fingir que houve publicação.

URL esperada quando publicado: https://helioconde.github.io/Office-Ordem/

## Executar e testar
```bash
python3 -m http.server 8000 --directory site
# em outro terminal:
node --check site/app.js
npm install --no-save --package-lock=false playwright@1.56.1
npx playwright install chromium
node tests/pages.cjs
```
O Playwright cria e edita/exclui OS fictícias, testa persistência no navegador, verifica overflow, erros JS e produz oito capturas em 390/768/1366/1600 px.

Consulte `docs/DESIGN_SYSTEM.md` para Taste Skill, Guidelines, Awesome Design e Image to Code.
