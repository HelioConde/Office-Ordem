# Office Ordem — Demonstração modernizada
A versão antiga deste repositório contém **apenas um build histórico React**, sem fontes editáveis. A pasta `site/` é uma **recriação independente** com código-fonte novo (HTML, CSS, JavaScript), preservando a ideia de gerenciar ordens de serviço.

## Funcionalidades
- Criar, buscar, filtrar, editar, excluir e imprimir ordens de serviço.
- Acompanhar indicadores por status.
- Guardar dados localmente, exportar JSON e restaurar exemplos.
- Design responsivo e QA Playwright automatizado.

**Aviso:** a demo não é sistema de produção, não utiliza backend ou autenticação, e não deve receber dados reais de clientes.

Abra `site/index.html` através de um servidor HTTP (por exemplo `python -m http.server 8000 --directory site`). O GitHub Actions testa a aplicação com Playwright e publica somente os quatro arquivos estáticos, sem backend nem banco remoto. Confira as execuções na aba Actions e a configuração em Settings → Pages.

Consulte `docs/DESIGN_SYSTEM.md` para decisões visuais.
## Portabilidade adicionada
- Exportação CSV segura para planilhas, neutralizando prefixos de fórmulas.
- Importação de backups JSON com validação de campos, IDs, 500 ordens e 1 MB, confirmação antes de sobrescrever.
- O armazenamento continua apenas no navegador; isso não cria contas ou banco externo.

## Validação de datas e dados locais
O importador de JSON rejeita datas inexistentes (por exemplo, 2026-02-31) e preserva os registros anteriores quando o backup é inválido. O cadastro usa a data local do navegador, evitando diferenças de fuso horário na emissão das ordens. O Playwright testa esse cenário em diferentes resoluções.
