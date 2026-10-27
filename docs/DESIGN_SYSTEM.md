# Office Ordem — QA visual e acessibilidade

## Identidade e Image to Code
A recriação utiliza a marca Office Ordem, superfícies azul-petróleo (navy) e destaque verde-menta do produto. O código editável está em \`site/\`. A comparação com o build antigo é uma referência histórica, não equivalência visual pixel a pixel.

## Taste Skill e Awesome Design
- Fundo \`#0b1424\`, painel \`#162740\`, verde-menta \`#7de0b6\` e bordas \`#374a64\`.
- Espaçamento com escala 4, 8, 12, 16, 24 e 32 px.
- Ação principal "Nova ordem"; ações secundárias para backup, filtros e impressão.
- Indicadores de status, formulário modal, tabela e estado vazio com comportamento consistente.

## Web Design Guidelines
- Estrutura semântica, skip link, labels associados e controles nativos.
- Contorno de foco visível. Confirmar antes de excluir ou sobrescrever backups.
- Modo de movimento reduzido, largura mínima 320 px e tabela com rolagem local em telas pequenas.
- Textos de usuário renderizados com \`textContent\` e dados confinados ao navegador.

## Playwright CLI / QA automatizado
\`tests/pages.cjs\` sobe um servidor estático temporário e captura home e CRUD em **320, 390, 768, 1024, 1366 e 1600px**; observa erros HTTP/JS/console, overflow horizontal, abertura de diálogo, criação, edição, conclusão, exclusão e persistência.
Em 1366px valida também downloads CSV, importação JSON válida, rejeição de backup inválido e neutralização de fórmulas CSV (\`=2+2\`).

O arquivo \`screenshots/qa-report.json\` distingue PASS e FAIL. O workflow precisa estar verde antes de integrar alterações. A captura visual ajuda, mas não substitui verificação humana.

## GitHub Pages
O deploy deve incluir **somente** \`site/index.html\`, \`site/style.css\`, \`site/app.js\`, \`site/favicon.svg\` em \`dist-pages/\`. Não publicar o build React antigo ou dados reais. Persistência é localStorage; sem backend, login, API ou banco remoto.
