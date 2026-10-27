const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
test("entrada Pages principal usa a demo estática, sem caminhos absolutos", () => {
 const root=fs.readFileSync("index.html","utf8");
 const site=fs.readFileSync("site/index.html","utf8");
 for(const token of ['id="orders"','id="new"','id="import"','id="export-csv"']){
   assert.ok(root.includes(token),"Raiz ausente: "+token);
   assert.ok(site.includes(token),"Site ausente: "+token);
 }
 for(const relative of ["site/app.js","site/style.css","site/favicon.svg"]) assert.ok(root.includes("./"+relative), relative);
 assert.doesNotMatch(root,/(?:src|href)="\/(?:static|src)\//);
 assert.doesNotMatch(root,/React App|created using create-react-app/);
 assert.match(root,/lang="pt-BR"/);
});
