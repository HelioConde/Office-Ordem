# Design System — Office Ordem

## Essência
Painel de ordens simples, confiável e focado em legibilidade. Cores claras, ações azuis, cartões concisos, tabela acessível e modal de edição que também funciona no teclado.

## Taste Skill: tokens
| Token | Valor | Uso |
|---|---|---|
| --ink | #12243b | texto principal |
| --muted | #586a82 | descrições |
| --brand | #2567e8 | ação primária |
| --brand-dark | #164eb9 | hover |
| --surface | #ffffff | cartões |
| --outline | #dde5f0 | divisórias |
| --focus | #1a62d5 | foco visível |
| --r | 16px | borda arredondada |
| --space-1/2/3/4/6/8/12 | 4/8/12/16/24/32/48px | espaçamento |

## Web Design Guidelines
- Links e botões semânticos, rótulos explícitos e salto para conteúdo.
- Situações com texto além da cor.
- Foco visível, validação nativa e mensagens acessíveis.
- Diálogo HTML nativo com restauração de foco.
- Layout mobile sem overflow e respeito a movimento reduzido.
- Valores fornecidos pelo usuário renderizados via textContent, evitando HTML injetável.
- Confirmação antes de excluir e substituir dados em uma importação.

## Awesome Design e Image to Code
- Referência estrutural de dashboard transformada em HTML/CSS editáveis, não imagem estática.
- Ritmo visual usando escala de títulos, métricas em cartões e tabela compacta.
- Composição fluida sem recursos externos, degradês excessivos ou dependência de fontes remotas.

## Arquitetura estática
- app/ é a única pasta publicada; os assets usam caminhos relativos.
- localStorage armazena os registros na origem do navegador; não há backend ou API.
- Somente dados fictícios devem ser usados em ambientes de demonstração.

## Playwright
- Simula CRUD, busca, filtros, exportação e recarregamento com persistência.
- Capturas de tela em cinco larguras: 360, 390, 768, 1366 e 1600 pixels.
- Reprova overflow horizontal e erros JavaScript. Capturas disponíveis nos artefatos do GitHub Actions.
