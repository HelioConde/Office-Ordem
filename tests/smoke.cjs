const { chromium } = require("playwright");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const server = spawn("python3", ["-m","http.server","4173","--bind","127.0.0.1","--directory","app"], {stdio:"ignore"});
const out = "artifacts/office-ordem";
fs.mkdirSync(out,{recursive:true});
const wait = ms => new Promise(resolve=>setTimeout(resolve,ms));
async function open(browser,viewport) {
  const context=await browser.newContext({viewport,reducedMotion:"reduce",acceptDownloads:true});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("console",msg=>{if(msg.type()==="error")errors.push(msg.text());});
  let loaded=false;
  for(let n=0;n<20;n++) {
    try {await page.goto("http://127.0.0.1:4173/",{waitUntil:"networkidle",timeout:3500});loaded=true;break;}
    catch {await wait(450);}
  }
  assert(loaded,"Servidor nao iniciou");
  await page.getByRole("heading",{name:"Ordens de serviço"}).waitFor();
  assert.deepEqual(errors,[],"Erro JavaScript no carregamento");
  return {page,context,errors};
}
async function run() {
  const browser=await chromium.launch({headless:true});
  try {
    const {page,context,errors}=await open(browser,{width:1280,height:900});
    assert.equal(await page.locator("#order-rows tr").count(),3);
    await page.getByRole("button",{name:/Nova ordem/}).click();
    await page.locator('#order-form [name="cliente"]').fill("Cliente QA Exemplo");
    await page.locator('#order-form [name="servico"]').fill("Teste de manutenção");
    await page.locator('#order-form [name="valor"]').fill("123.50");
    await page.locator('#order-form [name="status"]').selectOption("Em andamento");
    await page.getByRole("button",{name:"Salvar ordem"}).click();
    assert.equal(await page.locator("#order-dialog").evaluate(el=>el.open),false);
    await page.locator("#search").fill("Cliente QA Exemplo");
    assert.equal(await page.locator("#order-rows tr").count(),1);
    await page.reload({waitUntil:"networkidle"});
    await page.locator("#search").fill("Cliente QA Exemplo");
    assert.equal(await page.locator("#order-rows tr").count(),1,"Persistencia falhou");
    await page.getByRole("button",{name:/Editar OS-/}).click();
    await page.locator('#order-form [name="status"]').selectOption("Concluída");
    await page.getByRole("button",{name:"Salvar ordem"}).click();
    await page.locator("#search").fill("");
    await page.locator("#status-filter").selectOption("Concluída");
    assert.equal(await page.locator("#order-rows tr").count(),2);
    const [download]=await Promise.all([page.waitForEvent("download"),page.getByRole("button",{name:"Exportar CSV"}).click()]);
    assert(download.suggestedFilename().endsWith(".csv"));
    await page.locator("#status-filter").selectOption("");
    const before=await page.locator("#order-rows tr").count();
    page.once("dialog",dialog=>dialog.accept());
    await page.getByRole("button",{name:/Excluir OS-/}).last().click();
    assert.equal(await page.locator("#order-rows tr").count(),before-1);
    assert.deepEqual(errors,[]);
    await page.screenshot({path:path.join(out,"1280-crud.png"),fullPage:true});
    await context.close();
    for(const width of [360,390,768,1366,1600]) {
      const {page:mobile,context:ctx,errors:errs}=await open(browser,{width,height:width<500?844:900});
      const dim=await mobile.evaluate(()=>({scroll:document.documentElement.scrollWidth,window:innerWidth}));
      assert(dim.scroll<=dim.window+2,"Overflow horizontal: "+JSON.stringify({width,dim}));
      await mobile.screenshot({path:path.join(out,width+"px.png"),fullPage:true});
      assert.deepEqual(errs,[],"Erros JS em "+width);
      await ctx.close();
    }
    console.log("PASS: CRUD, persistencia, busca, filtros, CSV, exclusao, 5 resolucoes e screenshots");
  } finally {await browser.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.kill("SIGTERM"));
