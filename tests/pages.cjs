const { chromium } = require('playwright')
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const origin = 'http://127.0.0.1:8733/'
const screens = path.join(process.cwd(), 'screenshots')
fs.mkdirSync(screens, { recursive: true })
const server = spawn('python3', ['-m', 'http.server', '8733', '--bind', '127.0.0.1', '--directory', 'site'], { stdio: 'ignore' })

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)) }
async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try {
      const response = await fetch(origin)
      if (response.ok) return
    } catch { /* espera servidor */ }
    await sleep(250)
  }
  throw new Error('Servidor de teste nao iniciou')
}

async function run() {
  const results = []
  const errors = []
  let browser
  try {
    await waitForServer()
    browser = await chromium.launch()
    for (const width of [390, 768, 1366, 1600]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
      page.on('pageerror', (error) => errors.push(width + ': JavaScript ' + error.message))
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(width + ': console ' + message.text())
      })
      const response = await page.goto(origin, { waitUntil: 'domcontentloaded' })
      if (!response || response.status() !== 200) throw new Error('Falha HTTP na largura ' + width)
      const heading = await page.locator('h1').innerText()
      if (!heading.includes('Suas ordens')) throw new Error('Titulo ausente em ' + width)
      await page.screenshot({ path: path.join(screens, 'home-' + width + '.png'), fullPage: true })

      await page.locator('#new').click()
      await page.locator('#client').fill('Teste ficticio ' + width)
      await page.locator('#device').fill('Notebook')
      await page.locator('#service').fill('Diagnostico local')
      await page.locator('#price').fill('120')
      await page.getByRole('button', { name: 'Salvar ordem' }).click()
      if (!await page.getByText('Teste ficticio ' + width).count()) throw new Error('Falha ao criar OS ' + width)

      await page.reload()
      await page.locator('#search').fill('Teste ficticio ' + width)
      if (!await page.getByText('Teste ficticio ' + width).count()) throw new Error('Persistencia local falhou ' + width)
      await page.getByRole('button', { name: 'Editar' }).first().click()
      await page.locator('#service').fill('Reparo validado')
      await page.getByRole('button', { name: 'Salvar ordem' }).click()
      if (!await page.getByText('Reparo validado').count()) throw new Error('Edicao falhou ' + width)
      await page.screenshot({ path: path.join(screens, 'crud-' + width + '.png'), fullPage: true })

      page.once('dialog', (dialog) => dialog.accept())
      await page.getByRole('button', { name: 'Excluir' }).first().click()
      if (await page.getByText('Teste ficticio ' + width).count()) throw new Error('Exclusao falhou ' + width)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      if (overflow > 2) throw new Error('Overflow horizontal em ' + width + ': ' + overflow)
      const focusStyle = await page.locator('#new').evaluate((el) => {
        el.focus()
        return getComputedStyle(el).outlineStyle
      })
      if (focusStyle === 'none') errors.push(width + ': foco do botao nao visivel')
      results.push({ width, create: true, edit: true, delete: true, localStorage: true, overflow })
      await page.close()
    }
  } finally {
    await browser?.close()
    server.kill()
  }
  const report = { scenarios: results.length, results, errors }
  fs.writeFileSync(path.join(screens, 'relatorio.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  if (errors.length) process.exitCode = 1
}
run().catch((error) => { console.error(error); server.kill(); process.exitCode = 1 })
