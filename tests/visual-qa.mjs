import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { setTimeout as delay } from 'node:timers/promises'

const address = 'http://127.0.0.1:8765/'
const viewports = [
  { width: 320, height: 700 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1366, height: 768 },
  { width: 1600, height: 900 }
]
mkdirSync('visual-qa', { recursive: true })
const server = spawn('python3', ['-m', 'http.server', '8765', '--bind', '127.0.0.1', '--directory', 'docs'], { stdio: 'ignore' })
let browser
const report = []

async function ready() {
  for (let n = 0; n < 50; n++) {
    if (server.exitCode !== null) throw Error('Servidor local encerrou inesperadamente')
    try { const response = await fetch(address); if (response.ok) return } catch {}
    await delay(500)
  }
  throw Error('Servidor local não abriu em 25 segundos')
}

async function main() {
  await ready()
  browser = await chromium.launch({ headless: true })
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport, reducedMotion: 'reduce', acceptDownloads: true })
    const errors = []
    page.on('pageerror', err => errors.push('JS: ' + err.message))
    page.on('console', m => { if (m.type() === 'error') errors.push('Console: ' + m.text()) })
    page.on('response', r => { if (r.status() >= 400 && r.url().startsWith(address)) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
    try {
      await page.goto(address, { waitUntil: 'domcontentloaded' })
      await page.locator('#statTotal').waitFor({ state: 'visible' })
      if (await page.locator('#ordersBody tr').count() !== 4) errors.push('4 exemplos não carregados')
      await page.screenshot({ path: `visual-qa/${viewport.width}x${viewport.height}-home.png`, fullPage: true, animations: 'disabled' })
      await page.locator('#newOrderHero').click()
      if (!(await page.locator('#orderDialog').evaluate(el => el.open))) errors.push('Modal de cadastro não abriu')
      await page.screenshot({ path: `visual-qa/${viewport.width}x${viewport.height}-cadastro.png`, fullPage: true, animations: 'disabled' })
      await page.locator('#client').fill('Cliente Teste')
      await page.locator('#service').fill('Ajuste de leitor')
      await page.locator('#orderForm button[type="submit"]').click()
      if (await page.locator('#statTotal').textContent() !== '5') errors.push('Contagem não atualizada após cadastro')
      await page.locator('#search').fill('Ajuste de leitor')
      if (await page.locator('#ordersBody tr').count() !== 1) errors.push('Busca não filtrou corretamente')
      const state = page.getByRole('combobox', { name: 'Alterar status da OS 1005' })
      await state.selectOption('andamento')
      if (await page.locator('#statProgress').textContent() !== '2') errors.push('Mudança de status não refletiu indicadores')
      await page.reload({ waitUntil: 'domcontentloaded' })
      if (await page.locator('#statTotal').textContent() !== '5') errors.push('Dados não persistiram no localStorage')
      const downloadPromise = page.waitForEvent('download')
      await page.locator('#exportOrders').click()
      const download = await downloadPromise
      const downloaded = JSON.parse(readFileSync(await download.path(), 'utf8'))
      if (downloaded.type !== 'office-ordem-offline-demo' || downloaded.orders.length !== 5) errors.push('Exportação JSON inválida')
      const layout = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        windowWidth: innerWidth,
        main: !!document.querySelector('main'),
        focusTargets: document.querySelectorAll('button, input, select, a').length
      }))
      if (layout.width > layout.windowWidth + 2) errors.push(`Overflow horizontal ${layout.width} > ${layout.windowWidth}`)
      if (!layout.main || layout.focusTargets < 8) errors.push('Estrutura de navegação incompleta')
      report.push({viewport, passed:errors.length===0, errors, layout, screenshots:2})
      console.log(`${viewport.width}x${viewport.height}: ${errors.length ? 'FAIL ' + errors.join('; ') : 'PASS'}`)
    } finally { await page.close() }
  }
  writeFileSync('visual-qa/diagnostics.json', JSON.stringify(report, null, 2))
  const markdown = ['# Office Ordem — Browser QA', '', '| Resolução | Resultado | Erros |', '|---|---|---|',
    ...report.map(r => `| ${r.viewport.width}×${r.viewport.height} | ${r.passed ? 'PASS' : 'FAIL'} | ${r.errors.length} |`),
    '', 'As capturas e diagnostics.json estão neste artefato. Testes cobrem cadastro, busca, status, persistência e exportação.'].join('\n')
  writeFileSync('visual-qa/report.md', markdown)
  if (process.env.GITHUB_STEP_SUMMARY) (await import('node:fs')).appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown)
  if (report.some(r => !r.passed)) process.exitCode = 1
}
main().catch(error => {
  console.error(error)
  writeFileSync('visual-qa/failure.txt', String(error.stack || error))
  process.exitCode = 1
}).finally(async () => {
  if (browser) await browser.close()
  server.kill()
})
