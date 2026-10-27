# Office Ordem — Gestão local de ordens de serviço

**Demonstração estática moderna** | HTML, CSS e JavaScript | GitHub Pages | sem PHP, MySQL e API.

[Abrir a edição web](https://helioconde.github.io/Office-Ordem/)

## Estado do projeto

O repositório original continha apenas o build React já compilado, sem fontes editáveis. A versão histórica segue preservada na raiz (arquivos static/, asset-manifest.json, manifest.json e demais recursos). A nova edição é independente e vive no diretório app/. O GitHub Pages publica apenas app/.

A reconstrução **não promete compatibilidade funcional com o sistema antigo**: oferece uma demonstração local de ordens de serviço, baseada nos objetivos documentados.

## O que funciona

- Cadastro, edição e exclusão confirmada de ordens.
- Número automático, cliente, serviço, prazo, valor, status e observações.
- Indicadores de total, em andamento, concluídas e valor em aberto.
- Busca e filtro por status, com validação de dados.
- Salvamento local no navegador com localStorage, sem conta ou sincronização.
- Exportação CSV, backup JSON e importação validada com confirmação de substituição.
- Interface responsiva, foco de teclado, mensagens acessíveis e movimento reduzido.
- Testes Playwright com capturas de 360, 390, 768, 1366 e 1600px no Actions.

### Privacidade e limites

Os três exemplos iniciais são fictícios. **Não use dados reais de clientes, financeiros ou sensíveis** nesta versão, que não possui autenticação, criptografia, recuperação em nuvem nem controle de permissões. Dados ficam somente neste navegador e podem desaparecer quando armazenamento for limpo. Exporte backups JSON e não os envie para um repositório público.

## Rodar localmente

Execute a partir da raiz do repositório:

~~~bash
python -m http.server 4173 --directory app
~~~

Abra http://localhost:4173 para a nova edição.

## Testar e publicar

~~~bash
npm install
npx playwright install chromium
npm run qa
~~~

O workflow de Actions em .github/workflows/pages.yml executa CRUD, busca, filtros, exclusão, exportação, erros JS, overflow e screenshots e então publica app/ quando estiver em main. Os prints são guardados como artefatos do Actions.

Para ativação inicial, em **Settings → Pages**, selecione **GitHub Actions**. Publicação externa só deve ser considerada concluída após um workflow verde e conferência da URL.

Leia docs/DESIGN_SYSTEM.md e docs/IMPLEMENTATION_PLAN.md para conhecer as regras e os limites.

Projeto demonstrativo desenvolvido por [Hélio Conde](https://github.com/HelioConde).
