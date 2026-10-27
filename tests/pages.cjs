const {chromium}=require('playwright');
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const assert=require('node:assert/strict');
fs.mkdirSync('screenshots',{recursive:true});
const server=spawn('python3',['-m','http.server','8733','--bind','127.0.0.1','--directory','site'],{stdio:'ignore'});
(async()=>{
 let browser;
 try{
  browser=await chromium.launch();
  for(const width of [320,390,768,1024,1366,1600]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce',acceptDownloads:true});
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
   await page.goto('http://127.0.0.1:8733/',{waitUntil:'domcontentloaded'});
   await page.locator('#new').click();
   await page.locator('#client').fill('Teste fictício');
   await page.locator('#device').fill('Notebook');
   await page.locator('#service').fill('Diagnóstico local');
   await page.locator('#price').fill('120');
   await page.getByRole('button',{name:'Salvar ordem'}).click();
   await page.reload();
   const row=page.locator('#orders tr').filter({hasText:'Teste fictício'});
   assert.equal(await row.count(),1,width+': não persistiu ordem');
   await row.getByRole('button',{name:/Editar ordem/}).click();
   await page.locator('#service').fill('Diagnóstico concluído');
   await page.locator('#status').selectOption('Concluída');
   await page.getByRole('button',{name:'Salvar ordem'}).click();
   assert.match(await row.innerText(),/Concluída/);
   await page.locator('#filter').selectOption('Concluída');
   assert.equal(await row.count(),1,width+': filtro não manteve ordem concluída');
   await page.locator('#filter').selectOption('Aberta');
   assert.equal(await row.count(),0,width+': filtro aberto mostrou ordem concluída');
   await page.locator('#filter').selectOption('all');
   await page.locator('#search').fill('Teste fictício');
   await page.screenshot({path:'screenshots/'+width+'.png',fullPage:true});
   const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#export-csv').click()]);
   assert.match(download.suggestedFilename(),/\.csv$/);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=2,width+': overflow horizontal '+overflow);
   assert.deepEqual(errors,[],width+': erros JavaScript');
   await page.locator('#search').fill('');
   const edited=page.locator('#orders tr').filter({hasText:'Teste fictício'});
   page.once('dialog',dialog=>dialog.accept());
   await edited.getByRole('button',{name:/Excluir ordem/}).click();
   assert.equal(await edited.count(),0,width+': exclusão falhou');
   await page.locator('#import').setInputFiles({name:'backup-invalido.json',mimeType:'application/json',buffer:Buffer.from('{"unexpected":true}')});
   // File.text() é assíncrono: aguardar o feedback antes de verificar o resultado.
   await page.waitForFunction(()=>document.querySelector('#alert')?.textContent?.includes('incompatível'),{timeout:5000});
   assert.match(await page.locator('#alert').innerText(),/incompatível/i,width+': importação inválida não bloqueada');
   await page.close();
  }
  console.log('Playwright aprovado: CRUD completo, status, filtros, persistência, CSV, backup inválido, 6 resoluções.');
 }finally{await browser?.close();server.kill();}
})().catch(error=>{console.error(error);process.exitCode=1;server.kill()});
