'use strict';
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const { mkdirSync, writeFileSync, readFileSync } = require('node:fs');
const { join } = require('node:path');

const BASE = 'http://127.0.0.1:8733/';
const OUT = 'screenshots';
const SIZES = [320, 390, 768, 1024, 1366, 1600];
mkdirSync(OUT, { recursive: true });
const server = spawn('python3', ['-m', 'http.server', '8733', '--bind', '127.0.0.1', '--directory', 'site'], { stdio: 'ignore' });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const results = [];
let browser;

async function ready() {
  for (let i = 0; i < 50; i++) {
    if (server.exitCode !== null) throw Error('Servidor de teste encerrou antes do QA');
    try { if ((await fetch(BASE)).ok) return; } catch { /* ainda iniciando */ }
    await delay(250);
  }
  throw Error('Servidor local nao respondeu');
}
function ensure(condition, message) {
  if (!condition) throw Error(message);
}
async function assertNoOverflow(page, width, stage) {
  const overflow = await page.evaluate(() =>
    Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth);
  ensure(overflow <= 2, 'Overflow de ' + overflow + 'px em ' + width + ' (' + stage + ')');
}
async function screenshot(page, width, tag) {
  await page.screenshot({ path: join(OUT, width + '-' + tag + '.png'), fullPage: true, animations: 'disabled' });
}
async function run() {
  await ready();
  browser = await chromium.launch();
  for (const width of SIZES) {
    const page = await browser.newPage({ viewport: {width, height: 900}, reducedMotion: 'reduce', acceptDownloads: true });
    const errors = [];
    page.on('pageerror', error => errors.push('JS: ' + error.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push('Console: ' + msg.text()); });
    page.on('response', response => {
      if (response.url().startsWith(BASE) && response.status() >= 400) errors.push('HTTP ' + response.status() + ' ' + response.url());
    });
    try {
      const response = await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 20000 });
      ensure(response?.status() === 200, 'HTTP inicial != 200');
      await page.locator('#new').waitFor({ state: 'visible' });
      await assertNoOverflow(page, width, 'inicio');
      await screenshot(page, width, 'inicio');
      const label = 'Cliente QA ' + width;
      await page.locator('#new').click();
      await page.locator('#client').fill(label);
      await page.locator('#device').fill('Notebook de testes');
      await page.locator('#service').fill('Diagnostico inicial');
      await page.locator('#price').fill('120');
      await page.getByRole('button', {name:'Salvar ordem'}).click();
      let row = page.locator('#orders tr').filter({hasText:label});
      ensure(await row.count() === 1, 'CRUD: criar em ' + width);

      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('#search').fill(label);
      row = page.locator('#orders tr').filter({hasText:label});
      ensure(await row.count() === 1, 'Persistencia local em ' + width);

      await row.getByRole('button', {name:'Editar'}).click();
      await page.locator('#service').fill('Reparo e teste de regressao');
      await page.locator('#status').selectOption('Concluída');
      await page.getByRole('button', {name:'Salvar ordem'}).click();
      row = page.locator('#orders tr').filter({hasText:label});
      ensure((await row.innerText()).includes('Reparo e teste de regressao'), 'CRUD: editar em ' + width);
      ensure((await row.innerText()).includes('Concluída'), 'Estado nao atualizado em ' + width);
      await assertNoOverflow(page, width, 'edicao');
      await screenshot(page, width, 'crud');

      if (width === 1366) {
        const csvWait = page.waitForEvent('download');
        await page.locator('#export-csv').click();
        const download = await csvWait;
        ensure(download.suggestedFilename().endsWith('.csv'), 'Exportacao CSV indisponivel');
        const csv = readFileSync(await download.path(), 'utf8');
        ensure(csv.includes(label), 'CSV nao contem ordem gerada');

        await page.locator('#search').fill('');
        const backup = [{id:901,client:'=2+2',device:'Computador de teste',service:'Entrada de backup validada',price:150,status:'Aberta',date:'2026-10-27'}];
        page.once('dialog', dialog => dialog.accept());
        await page.locator('#import').setInputFiles({name:'backup-teste.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
        await page.locator('#orders tr').filter({hasText:'=2+2'}).waitFor({state:'visible'});
        ensure(await page.locator('#orders tr').filter({hasText:'=2+2'}).count() === 1, 'Importacao JSON nao funcionou');
        await page.reload({waitUntil:'domcontentloaded'});
        ensure(await page.locator('#orders tr').filter({hasText:'=2+2'}).count() === 1, 'Backup nao persistiu');
        const downloadWait = page.waitForEvent('download');
        await page.locator('#export-csv').click();
        const safeDownload = await downloadWait;
        const csvText = readFileSync(await safeDownload.path(), 'utf8');
        ensure(csvText.includes("'=2+2"), 'CSV nao neutraliza prefixo de formula');
        const invalid = [{id:902,client:'',device:'X',service:'Y',price:1,status:'Aberta',date:'2026-10-27'}];
        await page.locator('#import').setInputFiles({name:'backup-invalido.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalid))});
        await page.waitForFunction(() => document.querySelector('#alert')?.textContent?.includes('incompatível'));
        ensure((await page.locator('#alert').innerText()).includes('incompatível'), 'Backup invalido nao rejeitado');
        ensure(await page.locator('#orders tr').filter({hasText:'=2+2'}).count() === 1, 'Backup invalido sobrescreveu dados');
        await screenshot(page, width, 'importacao');
      } else {
        page.once('dialog', dialog => dialog.accept());
        await row.getByRole('button', {name:'Excluir'}).click();
        ensure(await page.locator('#orders tr').filter({hasText:label}).count() === 0, 'CRUD: excluir em ' + width);
        await page.reload({waitUntil:'domcontentloaded'});
        ensure(await page.locator('#orders tr').filter({hasText:label}).count() === 0, 'Exclusao nao persistiu');
      }
      await assertNoOverflow(page, width, 'final');
      await page.locator('.skip').focus();
      const focused = await page.locator('.skip').evaluate(el =>
        document.activeElement === el && getComputedStyle(el).outlineStyle !== 'none');
      ensure(focused, 'Link de pular conteudo sem foco visivel');
      ensure(errors.length === 0, errors.join('; '));
      results.push({width,checks:['responsive','create','edit','status','persist','focus','console','http',...(width===1366?['csv','import','formula-protection','invalid-backup']:['delete'])],status:'PASS'});
      console.log('PASS '+width+'px');
    } catch(error) {
      results.push({width,status:'FAIL',error:error.message,errors});
      throw error;
    } finally {
      await page.close();
    }
  }
}
run().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{
  writeFileSync(join(OUT,'qa-report.json'),JSON.stringify({generatedAt:new Date().toISOString(),results},null,2));
  await browser?.close();server.kill();
});
