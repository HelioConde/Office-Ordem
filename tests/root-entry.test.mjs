import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(path,"utf8");
test("A raiz do GitHub Pages abre o app estático sem caminhos absolutos do CRA",()=>{
 const root=read("index.html");
 const demo=read("site/index.html");
 assert.match(root,/lang="pt-BR"/);assert.match(root,/\.\/site\/app\.js/);
 assert.match(root,/\.\/site\/style\.css/);assert.match(root,/\.\/site\/favicon\.svg/);
 assert.doesNotMatch(root,/\/static\/js\/main\./);
 assert.match(demo,/O[fF]fice/);assert.match(demo,/id="orders"/);
});
test("O workflow publica somente 4 arquivos estáticos, sem bundles legados",()=>{
 const yml=read(".github/workflows/pages.yml");
 assert.match(yml,/cp site\/index\.html site\/style\.css site\/app\.js site\/favicon\.svg dist-pages\//);
 assert.match(yml,/pull_request:/);
 assert.match(yml,/if: github\.event_name == 'push'/);
});
