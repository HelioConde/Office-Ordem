# Auditoria de migração para GitHub Pages

O projeto original continha apenas o build compilado de React, usava recursos com caminhos absolutos e possuía um formulário apontando para http://localhost/gerador-back-end/authentication.php. Esse formulário não pode funcionar no GitHub Pages.

A nova versão usa arquivos estáticos relativos, CRUD de ordens de serviço persistido em localStorage, pesquisa, indicadores, filtros, importação e exportação. Nenhum PHP, servidor, login ou banco é necessário. O build original foi mantido em legacy.html como referência histórica, com envio desabilitado.

Publicação: integrar branch à main, selecionar GitHub Actions em Settings > Pages > Source; o workflow testa a página e publica apenas os recursos necessários. Verifique o endereço publicado e as capturas do Playwright no Actions.

Limitações: dados por navegador, sem sincronização, sem recuperação em outros aparelhos, sem autenticação nem proteção adequada para dados pessoais reais.
