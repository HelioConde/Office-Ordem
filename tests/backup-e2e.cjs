'use strict';
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const { readFileSync, mkdirSync, writeFileSync } = require('node:fs');
const assert = require('node:assert/strict');
const BASE = 'http://127.0.0.1:8733/';
const server = spawn('python3', ['-m','http.server','8733','--bind','127.0.0.1','--directory','site'], {stdio:'ignore'});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const results=[];
mkdirSync('screenshots',{recursive:true});

async function waitForServer(){
  for(let attempt=0;attempt<50;attempt++){
    if(server.exitCode!==null)throw new Error('O servidor local encerrou antes do teste.');
    try{if((await fetch(BASE)).ok)return;}catch{/* tentativa seguinte */}
    await pause(200);
  }
  throw new Error('O servidor de QA nao respondeu.');
}

async function scenario(width){
  const browser=await chromium.launch();
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce',acceptDownloads:true});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});
  try{
    const response=await page.goto(BASE,{waitUntil:'domcontentloaded'});
    assert.equal(response?.status(),200);
    await page.locator('#orders').waitFor();
    const item={id:901,client:'=2+2',device:'Computador teste',service:'Backup seguro em memoria local',price:150,status:'Aberta',date:'2026-10-27'};
    page.once('dialog',dialog=>dialog.accept());
    await page.locator('#import').setInputFiles({name:'valido.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify([item]))});
    const row=page.locator('#orders tr').filter({hasText:'=2+2'});
    await row.waitFor({state:'visible',timeout:6000});
    assert.match(await row.innerText(),/Backup seguro/,'Importação JSON válida falhou');
    await page.screenshot({path:'screenshots/backup-valido-'+width+'.png',fullPage:true,animations:'disabled'});
    await page.reload({waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('#orders tr').filter({hasText:'=2+2'}).count(),1,'O backup não persistiu');
    const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#export-csv').click()]);
    const csv=readFileSync(await download.path(),'utf8');
    assert.match(csv,/office|id|client/i);
    assert.ok(csv.includes("'=2+2"),'Campo iniciando por = não foi neutralizado no CSV');
    const invalid=[{id:902,client:'',device:'X',service:'Y',price:1,status:'Aberta',date:'2026-10-27'}];
    await page.locator('#import').setInputFiles({name:'invalido.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalid))});
    await page.waitForFunction(()=>document.querySelector('#alert')?.textContent?.includes('incompatível'),null,{timeout:6000});
    assert.equal(await page.locator('#orders tr').filter({hasText:'=2+2'}).count(),1,'Backup inválido alterou dados salvos');
    await page.locator('.skip').focus();
    assert.equal(await page.locator('.skip').evaluate(el=>document.activeElement===el&&getComputedStyle(el).outlineStyle!=='none'),true,'Foco invisível no skip link');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert.ok(overflow<=2,'Overflow horizontal '+width+': '+overflow);
    assert.deepEqual(errors,[],'Erro de navegador');
    results.push({width,status:'PASS',checks:['import-valid','import-invalid','reload','csv-formula','focus','overflow','console']});
    console.log('PASS backup/csv/a11y em '+width+'px');
  } finally{await page.close();await browser.close();}
}

(async()=>{await waitForServer();for(const width of [390,1366])await scenario(width);})()
.catch(error=>{console.error(error);process.exitCode=1;results.push({status:'FAIL',message:error.message});})
.finally(()=>{writeFileSync('screenshots/backup-e2e-report.json',JSON.stringify(results,null,2));server.kill();});
