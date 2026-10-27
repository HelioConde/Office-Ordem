# Office Ordem — Demonstração modernizada
A versão antiga deste repositório contém **apenas um build histórico React**, sem fontes editáveis. A pasta `site/` é uma **recriação independente** com código-fonte novo (HTML, CSS, JavaScript), preservando a ideia de gerenciar ordens de serviço.

## Funcionalidades
- Criar, buscar, filtrar, editar, excluir e imprimir ordens de serviço.
- Acompanhar indicadores por status.
- Guardar dados localmente, exportar JSON e restaurar exemplos.
- Design responsivo e QA Playwright automatizado.

**Aviso:** a demo não é sistema de produção, não utiliza backend ou autenticação, e não deve receber dados reais de clientes.

Abra `site/index.html` através de um servidor HTTP (por exemplo `python -m http.server 8000 --directory site`). O GitHub Actions tenta publicar só os quatro arquivos estáticos, dependendo da disponibilidade do Pages para este repositório privado.

Consulte `docs/DESIGN_SYSTEM.md` para decisões visuais.
## Entrada do GitHub Pages por branch

Além da publicação recomendada por GitHub Actions, `index.html` na raiz agora carrega `./site/style.css`, `./site/app.js` e `./site/favicon.svg`, todos caminhos relativos. Isso evita tela branca quando o Pages está configurado para servir a raiz da branch `main` sob `/Office-Ordem/`. O build CRA antigo não é executado. Para publicar **somente** o aplicativo estático (e não arquivos históricos), selecione GitHub Actions em Settings → Pages.
