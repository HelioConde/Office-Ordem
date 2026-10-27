const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const html=fs.readFileSync("site/index.html","utf8"),app=fs.readFileSync("site/app.js","utf8");
test("Página é estática, possui CRUD e opções de backup",()=>{
  for(const id of ["new","export","export-csv","import","reset","orders","editor"])assert.ok(html.includes('id="'+id+'"'),id);
  assert.match(html,/lang="pt-BR"/);
  assert.doesNotMatch(html,/action="http|localhost/i);
});
test("Backup validado, dados exibidos como texto e CSV neutralizado",()=>{
  assert.match(app,/validBackupItem/);assert.match(app,/file\.size>1024\*1024/);
  assert.match(app,/\.textContent/);assert.match(app,/csvSafe/);
  assert.doesNotMatch(app,/eval\(/);
});
