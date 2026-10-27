# Office Ordem — Design System

## Propósito
Recriar a interface de ordens de serviço com código editável, sem depender do build React histórico nem banco de dados.

## Taste Skill
Espaçamentos 4/8/12/16/24/32px, verde menta #7de0b6 sobre azul petróleo escuro #0e1c32, cartões com bordas suaves.

## Web Design Guidelines
Skip link, labels, foco visível, tabela semântica, modal dialog, ações com confirmação, ausência de animações em reduced-motion.

## Awesome Design e Image to Code
Dashboard compacto com contadores, busca e filtros; CRUD e comprovante para impressão. Ícone geométrico original na marca.

## GitHub Pages
Deploy automático somente dos arquivos site/*; usa localStorage, sem backend. Nunca usar dados reais ou credenciais neste protótipo.

## Playwright
Testa CRUD, persistência após reload, responsividade e ausência de overflow em 390/768/1366/1600px.
## Refinamento de QA e dados
Botões secundários para exportação CSV e importação JSON validada; foco visível no seletor de arquivo, mensagens acessíveis no painel, sem dependências externas. Registros inseridos por APIs de texto do DOM para evitar execução de HTML fornecido pelo usuário.

## Testes de regressão ampliados
- Tabela: ações com nome acessível individualizado por número da ordem.
- Edição, atualização de status, busca, filtros, exclusão confirmada, exportação CSV e rejeição de backup JSON inválido.
- Persistência local após recarregar, console sem erros e viewport sem overflow em 320/390/768/1024/1366/1600.
- CSS: tokens de raio e foco, alvos de toque responsivos e etiquetas de status legíveis.

## Segurança da persistência no modo Pages
O estado restaurado de localStorage é revalidado com o mesmo esquema do importador JSON, limite de 500 linhas e verificação de IDs únicos. Registros inválidos são descartados em favor dos exemplos fictícios. O QA valida importação de backup válido, persistência após reload e recuperação de dados malformados, além do CRUD e CSV existentes.
