import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';

mkdirSync('screenshots', { recursive: true });
const base = process.env.OFFICE_URL || 'http://127.0.0.1:4174/Office-Ordem/';
const browser = await chromium.launch();
const sizes = [
  { width: 360, height: 740 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 }
];
let checks = 0;
try {
  for (const size of sizes) {
    const context = await browser.newContext({ viewport: size, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    const response = await page.goto(base, { waitUntil: 'load' });
    assert.equal(response?.status(), 200);
    await page.getByRole('heading', { name: 'Ordens de serviço' }).waitFor();
    assert.equal(await page.locator('#stat-total').innerText(), '3');
    assert.equal(await page.locator('html').evaluate(el => el.scrollWidth <= window.innerWidth + 1), true, 'sem overflow na janela');
    await page.screenshot({ path: 'screenshots/home-' + size.width + '.png', fullPage: true });
    checks += 3;

    await page.getByRole('button', { name: /Nova ordem/ }).click();
    await page.locator('#title').fill('Teste fictício da auditoria');
    await page.locator('#owner').fill('Equipe QA');
    await page.locator('#status').selectOption('andamento');
    await page.getByRole('button', { name: 'Salvar ordem' }).click();
    assert.equal(await page.locator('#stat-total').innerText(), '4');
    await page.locator('#search').fill('Teste fictício');
    assert.equal(await page.locator('tbody tr').count(), 1);
    await page.locator('tbody button[data-action="edit"]').click();
    await page.locator('#title').fill('Teste QA atualizado');
    await page.getByRole('button', { name: 'Salvar ordem' }).click();
    assert.equal(await page.locator('tbody .order-title').innerText(), 'Teste QA atualizado');
    await page.screenshot({ path: 'screenshots/filtrada-' + size.width + '.png', fullPage: true });
    checks += 3;

    page.once('dialog', dialog => dialog.accept());
    await page.locator('tbody button[data-action="delete"]').click();
    assert.equal(await page.locator('#stat-total').innerText(), '3');
    await page.reload();
    assert.equal(await page.locator('#stat-total').innerText(), '3', 'localStorage persiste recarregando');
    assert.equal(await page.locator('html').evaluate(el => el.scrollWidth <= window.innerWidth + 1), true);
    assert.deepEqual(errors, [], 'sem erros JavaScript');
    checks += 4;
    await context.close();
  }
  console.log('Office Ordem: ' + checks + ' verificações OK em ' + sizes.length + ' resoluções; ' + (sizes.length * 2) + ' capturas.');
} finally {
  await browser.close();
}
