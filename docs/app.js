'use strict'

// Offline-only demonstration. Never sends user input to a server.
const KEY = 'office-ordem-demo-v1'
const STATUS = { aberta: 'Em aberto', andamento: 'Em andamento', concluida: 'Concluída' }
const PRIORITY = { alta: 'Alta', normal: 'Normal', baixa: 'Baixa' }
const EXAMPLES = [
  { id: 1001, client: 'Cliente Exemplo A', service: 'Revisão de equipamento', priority: 'normal', status: 'aberta', notes: 'Registro fictício de demonstração.' },
  { id: 1002, client: 'Cliente Exemplo B', service: 'Instalação de software', priority: 'alta', status: 'andamento', notes: 'Registro fictício de demonstração.' },
  { id: 1003, client: 'Cliente Exemplo C', service: 'Configuração de impressora', priority: 'baixa', status: 'concluida', notes: 'Registro fictício de demonstração.' },
  { id: 1004, client: 'Cliente Exemplo D', service: 'Manutenção preventiva', priority: 'normal', status: 'aberta', notes: 'Registro fictício de demonstração.' }
]
const $ = (selector) => document.querySelector(selector)
const cloneExamples = () => EXAMPLES.map(item => ({ ...item }))
const trim = (value, max) => String(value ?? '').trim().slice(0, max)
const valid = (record) => record && typeof record === 'object' &&
  Number.isSafeInteger(record.id) && record.id > 0 &&
  typeof record.client === 'string' && trim(record.client, 70).length > 0 &&
  typeof record.service === 'string' && trim(record.service, 90).length > 0 &&
  Object.hasOwn(STATUS, record.status) && Object.hasOwn(PRIORITY, record.priority)
function normalizeRecord(record) {
  return { id: record.id, client: trim(record.client, 70), service: trim(record.service, 90),
    status: record.status, priority: record.priority, notes: trim(record.notes, 300) }
}
function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return cloneExamples()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length > 200 || !parsed.every(valid)) throw new Error('invalid data')
    const ids = parsed.map(item => item.id)
    if (new Set(ids).size !== ids.length) throw new Error('duplicate ids')
    return parsed.map(normalizeRecord)
  } catch { return cloneExamples() }
}
let orders = load()
let toastTimer
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(orders)); return true }
  catch { notify('Sem acesso ao armazenamento: alterações duram somente esta sessão.'); return false }
}
function notify(message) {
  const node = $('#notification')
  clearTimeout(toastTimer)
  node.textContent = message
  node.classList.add('visible')
  toastTimer = setTimeout(() => node.classList.remove('visible'), 3700)
}
function element(tag, classes, value) {
  const result = document.createElement(tag)
  if (classes) result.className = classes
  if (value !== undefined) result.textContent = value
  return result
}
function cell(row, content) { const td = document.createElement('td'); td.append(content); row.append(td); return td }
function option(value, label) { const el = document.createElement('option'); el.value = value; el.textContent = label; return el }
function changeStatus(id, status) {
  if (!Object.hasOwn(STATUS, status)) return
  const record = orders.find(item => item.id === id)
  if (!record) return
  record.status = status
  persist()
  render()
  notify('Status atualizado com sucesso.')
}
function removeOrder(id) {
  const record = orders.find(item => item.id === id)
  if (!record || !window.confirm('Excluir esta ordem de serviço?')) return
  orders = orders.filter(item => item.id !== id)
  persist()
  render()
  notify('Ordem excluída deste navegador.')
}
function renderRow(record) {
  const tr = document.createElement('tr')
  const title = element('div', 'order-title', record.service)
  const number = element('span', 'order-id', 'OS #' + String(record.id))
  const name = element('span', '', record.client)
  const urgency = element('span', 'badge ' + (record.priority === 'alta' ? 'high' : record.priority === 'baixa' ? 'low' : 'normal'), PRIORITY[record.priority])
  const statusClass = record.status === 'andamento' ? 'progress' : record.status === 'concluida' ? 'done' : 'open'
  const state = element('span', 'badge ' + statusClass, STATUS[record.status])
  const titleCell = document.createElement('span')
  titleCell.append(title, number)
  cell(tr, titleCell)
  cell(tr, name)
  cell(tr, urgency)
  cell(tr, state)
  const actions = element('div', 'row-actions')
  const selector = element('select')
  selector.setAttribute('aria-label', 'Alterar status da OS ' + record.id)
  for (const [key, value] of Object.entries(STATUS)) selector.append(option(key, value))
  selector.value = record.status
  selector.addEventListener('change', () => changeStatus(record.id, selector.value))
  const remove = element('button', '', '×')
  remove.type = 'button'
  remove.setAttribute('aria-label', 'Excluir OS ' + record.id)
  remove.title = 'Excluir ordem'
  remove.addEventListener('click', () => removeOrder(record.id))
  actions.append(selector, remove)
  cell(tr, actions)
  return tr
}
function normalText(text) { return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() }
function render() {
  $('#statTotal').textContent = String(orders.length)
  $('#statOpen').textContent = String(orders.filter(r => r.status === 'aberta').length)
  $('#statProgress').textContent = String(orders.filter(r => r.status === 'andamento').length)
  $('#statDone').textContent = String(orders.filter(r => r.status === 'concluida').length)
  const query = normalText($('#search').value.trim())
  const status = $('#filterStatus').value
  const filtered = orders.filter(item =>
    (status === 'all' || item.status === status) &&
    (!query || normalText(item.client + ' ' + item.service + ' ' + item.id).includes(query)))
  $('#ordersBody').replaceChildren(...filtered.map(renderRow))
  $('#emptyState').hidden = filtered.length !== 0
  $('.table-scroll').hidden = filtered.length === 0
  $('#resultCount').textContent = filtered.length + (filtered.length === 1 ? ' ordem exibida' : ' ordens exibidas')
}
function openDialog() {
  $('#formError').hidden = true
  $('#orderForm').reset()
  const dialog = $('#orderDialog')
  if (!dialog.open) dialog.showModal()
  $('#client').focus()
}
function closeDialog() { $('#orderDialog').close() }
$('#newOrder').addEventListener('click', openDialog)
$('#newOrderHero').addEventListener('click', openDialog)
$('#closeDialog').addEventListener('click', closeDialog)
$('#cancelDialog').addEventListener('click', closeDialog)
$('#orderDialog').addEventListener('click', event => {
  if (event.target === $('#orderDialog')) closeDialog()
})
$('#orderForm').addEventListener('submit', event => {
  event.preventDefault()
  const client = trim($('#client').value, 70)
  const service = trim($('#service').value, 90)
  if (!client || !service) {
    $('#formError').hidden = false
    ;(!client ? $('#client') : $('#service')).focus()
    return
  }
  if (orders.length >= 200) { notify('Limite de 200 registros locais atingido.'); return }
  const id = Math.max(1000, ...orders.map(item => item.id)) + 1
  orders.unshift({ id, client, service, priority: $('#priority').value, status: 'aberta', notes: trim($('#notes').value, 300) })
  persist()
  $('#filterStatus').value = 'all'
  $('#search').value = ''
  render()
  closeDialog()
  notify('Nova ordem cadastrada neste navegador.')
})
$('#search').addEventListener('input', render)
$('#filterStatus').addEventListener('change', render)
$('#clearFilters').addEventListener('click', () => { $('#search').value = ''; $('#filterStatus').value = 'all'; render() })
$('#resetDemo').addEventListener('click', () => {
  if (!window.confirm('Substituir suas ordens pelos exemplos fictícios? Exporte um JSON antes de continuar, caso queira uma cópia.')) return
  orders = cloneExamples()
  persist()
  render()
  notify('Exemplos de demonstração restaurados.')
})
$('#exportOrders').addEventListener('click', () => {
  const data = { type: 'office-ordem-offline-demo', version: 1, exportedAt: new Date().toISOString(), orders }
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
  const a = element('a')
  a.href = url
  a.download = 'office-ordem-demo.json'
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  notify('Cópia JSON exportada.')
})
render()
