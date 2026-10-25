<div align="center">
  <h1>🧾 Office Ordem</h1>
  <p><strong>Experimento de interface para ordens de serviço, preservado como build estático de React.</strong></p>
  <p><img alt="React" src="https://img.shields.io/badge/React-Compila%C3%A7%C3%A3o%20hist%C3%B3rica-149ECA?logo=react&logoColor=white"> <img alt="Status" src="https://img.shields.io/badge/status-build%20legado-64748b"></p>
</div>

## O que está disponível?

Este repositório contém **arquivos já compilados** de uma aplicação criada com React. A estrutura inclui `index.html`, `asset-manifest.json`, arquivos em `static/` e ícones.

**O código-fonte React original, os componentes editáveis e o `package.json` não estão presentes nesta versão.** Portanto, `npm install` e `npm run dev` **não são etapas suportadas aqui**.

## Como visualizar

Baixe ou clone o repositório e sirva sua raiz por HTTP:

```bash
git clone https://github.com/HelioConde/Office-Ordem.git
cd Office-Ordem
python -m http.server 8000
```

Abra `http://localhost:8000`. O build utiliza caminhos absolutos começando por `/static/`; por isso, deve ser servido **na raiz do domínio**, não necessariamente em uma subpasta do GitHub Pages.

**Compatibilidade e fluxos de ordens de serviço não foram testados nesta revisão**; a presença dos arquivos compilados não comprova funcionamento completo do sistema.

## Organização

| Arquivo | Finalidade |
| --- | --- |
| `index.html` | Entrada da aplicação |
| `static/js/` | JavaScript compilado/minificado |
| `static/css/` | Estilos compilados |
| `asset-manifest.json` | Relação dos arquivos produzidos pelo build |
| `manifest.json` / ícones | Metadados e recursos estáticos |

A compilação ainda utiliza título e descrição **padrão de Create React App**, que precisam ser corrigidos se o projeto for retomado.

## Recuperar o projeto para desenvolvimento

1. Localizar o repositório ou backup contendo o código-fonte React original.
2. Se ele não existir, reconstruir os componentes em um novo projeto.
3. Documentar os fluxos reais de ordens de serviço após validação.
4. Criar um build reproduzível, com testes de formulários e impressão.
5. Auditar qualquer dado pessoal ou configuração embutida no bundle legado.

**Status:** registro histórico — não homologado para uso comercial.

Desenvolvido por [Hélio Conde](https://github.com/HelioConde).
