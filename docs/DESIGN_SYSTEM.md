# Office Ordem — Design System

## Identidade
Dashboard compacto de ordens de serviço; superfícies azul-petróleo (#0e1c32) e destaque verde-menta (#7de0b6), sem alterar o caráter de aplicação administrativa.

## Taste Skill
Tokens: espaçamentos 4/8/12/16/24/32 px em `site/style.css`. Componentes de cartões, botões primários/secundários, inputs, modal e estado vazio.

## Web Design Guidelines
HTML semântico; link para pular ao conteúdo; campos com labels; contornos de foco; tabela com rolagem localizada; diálogo nativo; exclusão com confirmação; movimento reduzido. O app guarda somente dados da demonstração, sem rede.

## Awesome Design
Indicadores por status, busca, filtros e hierarquia entre ação primária (Nova ordem) e demais ações. Impressão e exportação JSON com mensagens de feedback.

## Image to Code
O build histórico React não fornece fontes editáveis. A interface `site/` foi reconstruída com HTML, CSS e JavaScript independentes. Screenshots geradas no CI devem ser inspecionadas antes da homologação visual final.

## QA e publicação
`.github/workflows/pages.yml` testa sintaxe, CRUD, persistência, foco, console e ausência de overflow em quatro resoluções. Preserva capturas e pacote estático mesmo quando o GitHub Pages do repositório privado não puder publicar. Só habilita deploy automaticamente em repositório público; ver instruções de privacidade no README.
